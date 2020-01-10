import React, { Component } from 'react'
import { ComboBox, DataGrid, GridColumn, NumberBox, SwitchButton, TextBox, Tooltip } from 'rc-easyui'
import ContextMenu from '../context-menu'
import ErrorBoundry from '../error-boundry'

import './item-detail.css'
import CodeEditor from "./item-code-editor";

export default class ItemDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            itemProps: [
                //{"nameField": "uuid", "valueField": null, "titleField": "UUID", "groupField": "Основные", "editorField": "text"},
                {"nameField": "name", "valueField": null, "titleField": "Наименование", "groupField": "Основные",
                    "editorField": "text", "rules": ["required",] },
                {"nameField": "code", "valueField": null, "titleField": "Код", "groupField": "Основные",
                    "editorField": "number", "rules": ["required",] },
                {"nameField": "articleNumber", "valueField": null, "titleField": "Артикул", "groupField": "Основные",
                    "editorField": "text", "rules": ["nullable",] },
                {"nameField": "barCodes", "valueField": null, "titleField": "Штрихкоды", "groupField": "Коды",
                    "editorField": "combo", "rules": ["required", "digital", "length13"] },

                {"nameField": "price", "valueField": null, "titleField": "Цена продажи", "groupField": "Цены",
                    "editorField": "number", "precision": 2, "rules": ["required",] },
                {"nameField": "costPrice", "valueField": null, "titleField": "Цена закупки", "groupField": "Цены",
                    "editorField": "number", "precision": 2, "rules": ["required",] },
                {"nameField": "quantity", "valueField": null, "titleField": "Остаток", "groupField": "Склад",
                    "editorField": "number", "rules": ["required",] },
                {"nameField": "measureName", "valueField": null, "titleField": "Единицы", "groupField": "Цены",
                    "editorField": "combo", "dataField": this.props.measureTypes, "rules": ["required",]},
                {"nameField": "tax", "valueField": null, "titleField": "Ставка НДС", "groupField": "Цены",
                    "editorField": "combo", "dataField": this.props.taxTypes, "rules": ["required",] },
                {"nameField": "allowToSell", "valueField": null, "titleField": "Запрет продажи", "groupField": "Склад",
                    "editorField": "switch", "rules": ["required",] },
                {"nameField": "description", "valueField": null, "titleField": "Описание", "groupField": "Основные",
                    "editorField": "text", "rules": ["nullable",] },

                {"nameField": "type", "valueField": null, "titleField": "Вид номенклатуры", "groupField": "Основные",
                    "editorField": "combo", "dataField": this.props.productTypes, "rules": ["required",] },

                {"nameField": "alcoCodes", "valueField": null, "titleField": "Алкокод", "groupField": "Коды",
                    "editorField": "combo", "rules": ["required", "digital", "length19"] },
                {"nameField": "alcoholProductKindCode", "valueField": null, "titleField": "Код вида продукции", "groupField": "ЕГАИС",
                    "editorField": "number" },
                {"nameField": "alcoholByVolume", "valueField": null, "titleField": "Крепкость", "groupField": "ЕГАИС",
                    "editorField": "number", "precision": 2 },
                {"nameField": "tareVolume", "valueField": null, "titleField": "Объем тары", "groupField": "ЕГАИС",
                    "editorField": "number", "precision": 2 },

                {"nameField": "group", "valueField": null, "titleField": "Группа", "groupField": "Основные",
                    "editorField": "switch", "rules": ["required",] },
                {"nameField": "parentUuid", "valueField": null, "titleField": "Группа товаров", "groupField": "Основные",
                    "editorField": "text", "rules": ["nullable",] },
            ],

            rules: [],
            itemData : [],
            data: [],
            errors: null,
            editing: false,         // Маркер редактирования ItemDetail props
            selection: null,        // Выделенная ячейка с значением

            codesData: null,        // Редактируемые данные у редактора кодов, если редактируем через него
            comboDlgClosed: true
        };
        this.validateRules= {
                "required": {
                    "validator": (value) => {
                        return null != value && ("boolean" == typeof value ? value : String(value).trim().length > 0);
                    },
                    message: 'Поле не может быть пустым'
                },
                "nullable": {
                    "validator": (value) => {
                        return null === value && ("boolean" == typeof value ? value : String(value).trim().length > 0);
                    },
                    message: 'Поле может быть только null'
                },
                "digital": {
                    "validator": (value) => {
                        return /^\d+$/.test(value);
                    },
                    message: 'Код может состоять только из цифр'
                },
                "length13": {
                    "validator": (value) => {
                        return value.length === 13;
                    },
                    message: 'Длина штрих кода должна быть 13',
                },
                "length19": {
                    "validator": (value) => {
                        //const n = value ? String(value).trim().length : 0;
                        //return value.length === parseInt(param[0], 10);
                        return value.length === 19;
                    },
                    message: 'Длина алкокода должна быть 19',
                },
            };
        this.cellErrorMessage = "Ошибка данных";
    }

    updateData = () => {
        const { itemData } = this.props;
        // Преобразование для групповых свойств
        // Todo: тут кривой временный код
        return this.state.itemProps.map((property) => {
            if(itemData !== null){
                // Todo: доработать: Если данных нет null или [], то пробуем взять их из data
                //if (property["editorField"] !== "combo")
                property.valueField = itemData[property.nameField];
                //console.log(property);
            }else{
                console.log("itemData = null=>")
            }
            return property;
        })
    };

    getRules = (rules) => {
        /* Получение правила валидации
        * Коды:
        * /[0-9]/ - [один] символ входящий в диапазон 0-9 в [любом] месте строки
        * /^[0-9]$/ - строка состоящая из [одного] символа входящего в диапазон 0-9
        * /^\d+$/ - строка состоящая из [одного или более] символа входящего в диапазон 0-9(\d)
        *
        *  rules на входе это массив из itemProps
        */
        const _rules = this.validateRules;
        console.log("validateRules=>", _rules);
        if (rules === undefined) return [];
        let objectRules = {};
        rules.forEach(function (item) {
            if (item in _rules) objectRules[item] = _rules[item];
            else objectRules[item] = item
        });
        console.log("get rules=>", objectRules);
        return objectRules;
    };

    /* ----------------- Keyboard event functions ------------------------------------- */
    componentKeyboardEvents = (e) =>{
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
        console.log("Item Detail Keyboard Listener");
        if(e.key === 'Enter' && e.code === 'Enter' && e.ctrlKey === false)
            this.handleItemDetailKeyEnter();
        if(e.key === 'Escape' && e.code === 'Escape' && e.ctrlKey === false)
            this.handleItemDetailKeyEscape();
    };

    handleItemDetailKeyEnter = () =>{
        this.detail.endEdit();
        console.log("Item Detail Enter Key");
    };

    handleItemDetailKeyEscape = () =>{
        this.detail.cancelEdit();
        console.log("Item Detail Escape Key");
    };

    /* ----------------- Combo Code Editor Dialog ------------------------------------- */
    // Метод для управления видимостью диалога редактирования кодов
    comboDlgView = (status) => {
        if(status===undefined) return !this.state.comboDlgClosed;
        this.setState({
            comboDlgClosed: !status
        });
        return !status;
    };

    /* ----------------- Обработка событий ItemDetail --------------------------------- */
    handleClickComboValueChange = (row) => {
        //this.comboDlgView(false);
        this.setState((state)=>{
            if(state.comboDlgClosed){
                return{
                    codesData: row.valueField.map((item)=>{ return { code: item } }) ,
                    comboDlgClosed: !state.comboDlgClosed
                }
            }
        });
        this.detail.endEdit();
    };

    handleItemContextMenu = ({ row, column, originalEvent }) => {
        originalEvent.preventDefault();
        console.log(row.nameField);
        this.menu.showContextMenu(originalEvent.pageX, originalEvent.pageY)
    };

    handleItemClick = (value) => {
        console.log(value);
    };

    handleItemDetailRowClick =(row)=>{
        console.log("Click->", row, this);
    };

    handleItemDetailRowDblClick =(row)=>{
        // Установка правил валидации
        this.setState({
            rules: this.getRules(row.rules)
        });
        console.log("DblClick->", row);
    };

    renderEditor = ({ row, error }) =>{
         // Todo: Доделать
        if (row.editorField === "number")
            return(<NumberBox value={ row.valueField } precision={ row.precision }/>);
        else if (row.editorField === "text")
            return(
                <Tooltip content={ error } tracking>
                    <TextBox value={ row.valueField } placeholder={ row.titleField }/>
                </Tooltip>
                );
        else if (row.editorField === "switch")
            return(<SwitchButton value={ row.valueField }/>);
        else if (row.editorField === "combo")
            if(row.dataField===undefined && Array.isArray(row.valueField)){
                const data = row.dataField === undefined ?
                    row.valueField.map((code)=>{ return { value: code, text: code} }): row.dataField;
                const value = row.dataField === undefined ? row.valueField[0] :
                    row.dataField.find(item => (item.value === row.valueField));
                const addonEditor = row.dataField === undefined ? () => (
                    <span
                        className="textbox-icon icon-evotor-edit"
                        title="Править коды"
                        onClick = { ()=>this.handleClickComboValueChange(row) }>
                </span>) : null;
                return(<ComboBox
                    data={ data }
                    value={ value }
                    editable={ false }
                    //onChange={(value) => { this.editComboValues(row, value) }}
                    addonRight={ addonEditor }
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
            if(row.dataField===undefined && Array.isArray(row.valueField))
                return(<div>{ row.valueField[0] }</div>);
            if(row.valueField !== null && Array.isArray(row.dataField)){
                const value = row.dataField.find(item => (item.value === row.valueField));
                if (value !== undefined) return(<div>{ value.text }</div>);
            }
            // Ошибка
            return(<div className="error">{ this.cellErrorMessage }</div>);
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
        const { codesData, comboDlgClosed, rules } = this.state;
        const { setKeyboardEventsListener } = this.props;
        // Сохраним сеттер keyboard events listener для передачи другим компонентам
        this.setKeyboardEventsListener = setKeyboardEventsListener;
        this.setKeyboardEventsListener(this.componentKeyboardEvents);

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
                    onCellContextMenu={ this.handleItemContextMenu }
                    onRowClick = { this.handleItemDetailRowClick }
                    onRowDblClick = { this.handleItemDetailRowDblClick }
                    >
                    <GridColumn width={ 25 }/>
                    <GridColumn field="titleField" title="Имя поля" width="40%"/>
                    <GridColumn field="valueField" title="Параметр" width="60%"
                                editable
                                editRules={ rules }
                                editor={ this.renderEditor }
                                render={ this.renderView }
                    />
                </DataGrid>
                <CodeEditor
                    data = { codesData }
                    rules = { rules }
                    comboDlgClosed = { comboDlgClosed }
                    comboDlgView = { this.comboDlgView }
                    setKeyboardEventsListener = { setKeyboardEventsListener }
                    prevKeyboardListener = { this.componentKeyboardEvents }
                />
                { this.renderContextMenu(this.props.contextMenu) }
            </ErrorBoundry>
        )
    }
}
