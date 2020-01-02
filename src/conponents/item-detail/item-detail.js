import React, { Component } from 'react'
import { ComboBox, DataGrid, Dialog, GridColumn, LinkButton, NumberBox, SwitchButton, TextBox, Tooltip } from 'rc-easyui'
import ContextMenu from '../context-menu'
import ErrorBoundry from '../error-boundry'

import './item-detail.css'

export default class ItemDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            itemProps: [
                //{"nameField": "uuid", "valueField": "", "titleField": "UUID", "groupField": "Основные", "editorField": "text"},
                {"nameField": "name", "valueField": "", "titleField": "Наименование", "groupField": "Основные", "editorField": "text" },
                {"nameField": "code", "valueField": "", "titleField": "Код", "groupField": "Основные", "editorField": "number" },
                {"nameField": "articleNumber", "valueField": "", "titleField": "Артикул", "groupField": "Основные", "editorField": "text" },
                {"nameField": "barCodes", "valueField": [], "titleField": "Штрихкоды", "groupField": "Коды", "editorField": "combo_add", "rules": ["required", "digital", "length[12]"] },

                {"nameField": "price", "valueField": "", "titleField": "Цена продажи", "groupField": "Цены", "editorField": "number", "precision": 2 },
                {"nameField": "costPrice", "valueField": "", "titleField": "Цена закупки", "groupField": "Цены", "editorField": "number", "precision": 2 },
                {"nameField": "quantity", "valueField": "", "titleField": "Остаток", "groupField": "Склад", "editorField": "number" },
                {"nameField": "measureName", "valueField": this.props.measureTypes, "titleField": "Единицы", "groupField": "Цены", "editorField": "combo"},
                {"nameField": "tax", "valueField": this.props.taxTypes, "titleField": "Ставка НДС", "groupField": "Цены", "editorField": "combo" },
                {"nameField": "allowToSell", "valueField": "", "titleField": "Запрет продажи", "groupField": "Склад", "editorField": "switch" },
                {"nameField": "description", "valueField": "", "titleField": "Описание", "groupField": "Основные", "editorField": "text" },

                {"nameField": "type", "valueField": this.props.productTypes, "titleField": "Вид номенклатуры", "groupField": "Основные", "editorField": "combo" },

                {"nameField": "alcoCodes", "valueField": [], "titleField": "Алко код", "groupField": "Коды", "editorField": "combo_add", "rules": ["required", "digital", "length[19]"] },
                {"nameField": "alcoholProductKindCode", "valueField": "", "titleField": "Код вида продукции", "groupField": "ЕГАИС", "editorField": "number" },
                {"nameField": "alcoholByVolume", "valueField": "", "titleField": "Крепкость", "groupField": "ЕГАИС", "editorField": "number", "precision": 2 },
                {"nameField": "tareVolume", "valueField": "", "titleField": "Объем тары", "groupField": "ЕГАИС", "editorField": "number", "precision": 2 },

                {"nameField": "group", "valueField": "", "titleField": "Группа", "groupField": "Основные", "editorField": "switch" },
                {"nameField": "parentUuid", "valueField": "", "titleField": "Группа товаров", "groupField": "Основные", "editorField": "text" },
            ],
            validateRules: {
                "required": {
                    "validator": (value, param) =>{
                        return (value.length > 0);
                    },
                    message: 'Поле не может быть пустым'
                },
                "digital": {
                    "validator": (value, param) =>{
                        return (value.match(/^\d+$/));
                    },
                    message: 'Код может состоять только из цифр'
                },
                "length": {
                    "validator": (value, param) => {
                        return value.length === parseInt(param[0], 10);
                    },
                    message: 'Длина кода должна быть {0}'
                },
            },
            itemData : [],
            data: [],
            errors: null,

            codesData: null,        // Редактируемые данные у редактора кодов
            old: null,              // Значение codesData до изменения, для отката
            editing: false,         // Маркер состояния редактирования кода
            //adding: null,           // Маркер состояния добавления нового кода или id добавленного
            editingCell: null,      // Значение ячейки с редактируемым кодом
            selection: null,        // Выделенная ячейка с кодом

            comboDlgAction: null,   //  Команда на выполнение
            comboDlgTitle: "Редактирование кодов",
            comboDlgCancelTitle: "Отмена",
            comboDlgAddTitle: "Добавить",
            comboDlgRemoveTitle: "Удалить",
            comboDlgSaveTitle: "Сохранить",
            comboDlgClosed: true
        };
    }

    updateData = () => {
        const { itemData } = this.props;
        // Преобразование для групповых свойств
        // Todo: тут кривой временный код
        return this.state.itemProps.map((property) => {
            if(itemData !== null){
                // Todo: доработать: Если данных нет null или [], то пробуем взять их из data
                if (property["editorField"] !== "combo")
                    property.valueField = itemData[property.nameField];
                //console.log(property);
            }
            return property;
        })
    };

    getRules = (rules) =>{
        const { validateRules } =this.state;
        /* Правила валидации поля Код
        * /[0-9]/ - [один] символ входящий в диапазон 0-9 в [любом] месте строки
        * /^[0-9]$/ - строка состоящая из [одного] символа входящего в диапазон 0-9
        * /^\d+$/ - строка состоящая из [одного или более] символа входящего в диапазон 0-9(\d)
        * */
        if (rules === undefined) return [];
        return rules.map((rule)=>{
            
            return rule
        });
    };

    /* ----------------- Обработка событий ItemDetail --------------------------------- */
    handleClickComboValueChange = (row) => {
        this.setState({
            codesData: row.valueField.map((item)=>{ return { code: item } }),
            rules: this.getRules(row.rules),
            comboDlgClosed: false
        });
        this.detail.endEdit();
        // Передадим в родителя обработчик клавиатурных событий
        this.props.setKeyboardEventsListener(this.handleKeyboardEvents);
    };

    handleItemContextMenu = ({ row, column, originalEvent }) => {
        originalEvent.preventDefault();
        console.log(row.nameField);
        this.menu.showContextMenu(originalEvent.pageX, originalEvent.pageY)
    };

    handleItemClick = (value) => {
        console.log(value);
    };


    /* ----------------- Keyboard event functions ------------------------------------- */
    handleKeyboardEvents = (e) =>{
        /*
        *  This argument contains a handful of properties:
        *  "keyCode"
        *  Every key we press on your keyboard has a number associated with it.
        *  This read-only property returns that number.
        *  "charCode"
        *  This property only exists on event arguments returned by the keypress event, and it contains the ASCII
        *  code for whatever character key you pressed.
        *  "ctrlKey", "altKey", "shiftKey"
        *  These three properties return a true if the Ctrl key, Alt key, or Shift key are pressed.
        *  "metaKey"
        *  The metaKey property is similar to the ctrlKey, altKey, and shiftKey properties in that it returns
        *  a true if the Meta key is pressed. The Meta key is the Windows key on Windows
        *  keyboards and the Command key on Apple keyboards.
        * */

        if(e.key === 'Enter' && e.code === 'Enter' && e.ctrlKey === false)
            this.handleComboDlgKeyEnter();
        if(e.key === 'Escape' && e.code === 'Escape' && e.ctrlKey === false)
            this.handleComboDlgKeyEscape();
    };

    // Enter => End Edit
    handleComboDlgKeyEnter = () => {
           this.setState((state)=> {
            // Если мы в режиме редактирования
            if (state.editing) {
                const cell = state.editingCell;
                const duplicates = state.codesData.filter(
                    (row) => row.code === cell.code
                );
                if (duplicates.length > 1) {
                    console.log("Duplicate: ", state.codesData);
                } else {
                    this.comboDlg.endEdit();
                    return {
                        editing: !state.editing,
                        editingCell: null,
                        oldId: null,    // Clear a backup after confirm
                        oldCode: null,  // Clear a backup after confirm
                        //adding: null,
                    }
                }
            }else{
                // Мы не в режиме редактирования => Начинаем редактирвоание
                const { selection : row } = state;
                if(row){
                    this.comboDlg.beginEdit(row, "code"); // Todo: не дает фокус редактирования
                    return {
                        editing: !state.editing,
                        editingCell: state.codesData[row.id - 1],
                        oldId: row.id,      //  make a backup
                        oldCode: row.code   //  make a backup
                    };
                }
            }
           });
    };

    // Escape
    handleComboDlgKeyEscape = (row) => {
        this.setState((state) => {
            if(state.editing){
                const backupData = state.codesData.map(
                    (i) => {
                        if(i.id === state.oldId)
                            i.code = state.oldCode;
                        return i
                    }
                );
                this.comboDlg.cancelEdit();
                return{
                    codesData: backupData,
                    editing: !state.editing,
                    editingCell: null,
                    oldId: null,        // Clear a backup after cancel
                    oldCode: null,      // Clear a backup after cancel
                    //adding: null
                }
            }
        });
    };

    /* ----------------- Обработка событий ComboDlg ----------------------------------- */
    handleComboDlgRowDblClick = (row) => {
        this.setState((state) => {
            if(!state.editing)
                return{
                    editing: !state.editing,
                    editingCell: state.codesData[row.id - 1],
                    oldId: row.id,      //  make a backup
                    oldCode: row.code   //  make a backup
                }
        });
    };

    handleComboDlgRowClick = (row) => {
        // console.log(this.state.selection, row);
        // Прерывание редактирования
        this.setState((state) => {
            if(!state.editing){
                this.comboDlg.selectRow(row);
            }else if(state.selection !== row){
                const backupData = state.codesData.map(
                    (i) => {
                        if(i.id === state.oldId)
                            i.code = state.oldCode;
                        return i
                    }
                );
                this.comboDlg.cancelEdit();
                return{
                    codesData: backupData,
                    editing: !state.editing,
                    editingCell: null,
                    oldId: null,        // Clear a backup after cancel
                    oldCode: null,      // Clear a backup after cancel
                    selection: row      // Можно не делать
                    //adding: null
                }
            }
        });
    };

    handleComboDlgSelectionsChange = (selection) =>{
      this.setState({
          selection
      })
    };

    // ------  Методы для редактирования кодов -------
    handleClickAddCode = () =>{
        // Добавляем код *
        // Делаем Selection *
        // Включаем его редактирование
        this.setState((state) => {
            const zeros = state.codesData.filter((i)=>i.code === "0");
            console.log(state.codesData, zeros);
            if(!state.editing && zeros.length === 0){
                // Разрешение на добавление
                // this.comboDlg.beginEdit(state.codesData[0], "code"); // Не работает
                const { codesData } = state;
                const row = { code: "0", id: 0 };
                const newData = [ row, ...codesData ]; // Make a new codesData
                return{
                    codesData: newData,
                    selection: row,
                };
            }
        });
    };

    handleClickRemoveCode = () => {

    };

    handleComboDlgClose = () => {
        this.setState({ comboDlgClosed: true })
    };

    renderTextBoxEditor = ({ row, error }) =>{
        return(
            <Tooltip content={ error } tracking>
                <TextBox
                    onFocus = { console.log("focus editor", this.state.rules) }
                    //ref = { ref=>ref.focus() }
                    value={ row.code }/>
            </Tooltip>
        )
    };

    renderComboDlg = () => {
        const {
            comboDlgTitle, comboDlgClosed, codesData: data,
            comboDlgSaveTitle, comboDlgCancelTitle, rules } = this.state;
        return(
            <Dialog
                modal
                draggable
                title= { comboDlgTitle }
                closed = { comboDlgClosed }
                style={{ width: 210 }}
                onClose={ this.handleComboDlgClose }
            >
                <div className="dialog-toolbar">
                    <LinkButton
                        onClick ={ this.handleClickAddCode }
                        iconCls="icon-add" plain/>
                    <LinkButton
                        onClick ={ this.handleClickRemoveCode }
                        iconCls="icon-remove" plain/>
                </div>
                <div className="f-full">
                    <DataGrid
                        ref={ ref => this.comboDlg = ref }
                        dblclickToEdit
                        virtualScroll
                        selectionMode = "single"
                        editMode = "row"
                        showHeader = { false }
                        idField = "id"
                        selection = { this.state.selection }
                        onRowClick = { this.handleComboDlgRowClick }
                        onRowDblClick = { this.handleComboDlgRowDblClick }
                        onSelectionChange = { this.handleComboDlgSelectionsChange }
                        style={{ height: 160 }}
                        data={ data }>
                        <GridColumn field="rn" align="center" width="25px"
                                    cellCss="datagrid-td-rownumber"
                                    render={({ row, rowIndex }) => {
                                        row.id = rowIndex + 1;
                                        return(
                                            <span>{ rowIndex+1 }</span>
                                        )}
                                    }
                        />
                        <GridColumn
                            editable
                            editRules={ rules }
                            validateRules = { this.getRules() }
                            onValidate={(errors) => this.setState({ errors: errors })}
                            field="code"
                            title="Коды"
                            editor={ this.renderTextBoxEditor }
                            align="center"/>
                    </DataGrid>
                </div>
                <div className="dialog-button">
                    <LinkButton
                        style={{ width: 80 }}>
                        { comboDlgSaveTitle }
                    </LinkButton>
                    <LinkButton
                        style={{ width: 80 }}
                        onClick={() =>{
                            this.setState({
                                comboDlgClosed: true
                            })}
                        }>
                        { comboDlgCancelTitle }
                    </LinkButton>

                </div>
            </Dialog>
        )
    };

    renderEditor = ({ row }) =>{
        if (row.editorField === "number")
            return(<NumberBox value={ row.valueField } precision={ row.precision }/>);
        else if (row.editorField === "text")
            return(<TextBox value={ row.valueField } placeholder={ row.titleField }/>);
        else if (row.editorField === "switch")
            return(<SwitchButton value={ row.valueField }/>);
        else if (row.editorField === "combo")
            return(<ComboBox data={ row.valueField } value={ row.valueField }
                //onChange={(value) => this.setState({ value: value })}
            />);
        else if (row.editorField === "combo_add"){
            const comboData = row.valueField.map((code)=>{ return { value: code, text: code} });
            return(<ComboBox
                data={ comboData }
                value={ row.valueField[0] }
                editable={ false }
                //onChange={(value) => { this.editComboValues(row, value) }}
                addonRight={() => (
                    <span
                        className="textbox-icon icon-evotor-edit"
                        title="Править коды"
                        onClick = { ()=>this.handleClickComboValueChange(row) }>
                        </span>
                )}
            />);
        }
    };

    renderView = ({ row }) => {
        if (row.editorField === "text")
            return(<div>{ row.valueField }</div>);
        else if (row.editorField === "number")
            return(<div>{ row.valueField }</div>);
        else if (row.editorField === "switch")
            return(<SwitchButton value={row.valueField}/>);
        else if (row.editorField === "combo") {
            let combo = row.valueField.find(item => (item.value === row.valueField));
            if (combo === undefined)
            // Todo: Ошибка в данных. нужна валидация
                combo = row.valueField[0];
            return(<div>{ combo.text }</div>);
        }
        else if (row.editorField === "combo_add") {
            if(row.valueField !== undefined && row.valueField.length > 0){
                return(<div>{ row.valueField[0] }</div>);
            }
            else{
                return(<div/>);
            }
        }
    };

    renderGroup = ({ value, rows }) =>{
        return (
            <span style={{ fontWeight:'bold'}}>{value} - <span style={{ color:'red' }}>{ rows.length }</span> свойств(а)
      </span>
        )
    };

    renderContextMenu = (menu) => {
        return(
            <ContextMenu
                menu = { menu }
                menuRef = { (ref)=>this.menu=ref }
                handleItemClick = { this.handleContextMenuClick }
            />
        )
    };

    render() {
        return(
            <ErrorBoundry>
                <DataGrid
                    ref = { detail=>this.detail=detail }
                    data={ this.updateData() }
                    columnResizing
                    dblclickToEdit
                    expanderWidth ={ 20 }
                    selectionMode="row"
                    editMode="row"
                    groupField="groupField"
                    renderGroup={ this.renderGroup }
                    onCellContextMenu={ this.handleItemContextMenu }>

                    <GridColumn width={ 25 }/>
                    <GridColumn field="titleField" title="Имя поля" width="40%"/>
                    <GridColumn field="valueField" title="Параметр" width="60%"
                                editable
                                editor={ this.renderEditor }
                                render={ this.renderView }
                    />
                </DataGrid>
                { this.renderContextMenu(this.props.contextMenu) }
                { this.renderComboDlg() }
            </ErrorBoundry>
        )

    }
}
