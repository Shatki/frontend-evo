import React, { Component } from 'react'
import { Dialog, DataGrid, GridColumn, LinkButton, TextBox, Tooltip } from 'rc-easyui'
import './item-detail.css'

export default class CodeEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: null,                             // Редактируемые данные у редактора кодов
            rules: null,
            filterRules: [],
            //reducer: null,                          // Строка для сравнения состояния свойства data

            old: null,                              // Значение data до изменения, для отката
            editing: false,                         // Маркер состояния редактирования кода
            //adding: null,                         // Маркер состояния добавления нового кода или id добавленного
            editingCell: null,                      // Значение ячейки с редактируемым кодом
            selection: null,                        // Выделенная ячейка с кодом

            comboDlgAction: null,                   // Команда на выполнение
            comboDlgTitle: "Редактирование кодов",
            comboDlgCancelTitle: "Отмена",
            comboDlgAddTitle: "Добавить",
            comboDlgRemoveTitle: "Удалить",
            comboDlgSaveTitle: "Сохранить",
        };
        this.setKeyboardEventsListener = props.setKeyboardEventsListener;
        // Менеджер диалога редактирования Combo кодов(CloseDlg/SaveData)
        this.comboDlgManager = props.comboDlgManager;
        // Доступ к закрытию и сохранению данных в стейт
        this.comboDlgEndEdit = props.comboDlgEndEdit;
    }

    /* ----------------- Lifecycle methods -------------------------------------------- */
    componentDidMount() {
        this.updateData();
    }

    componentDidUpdate(prevProps, prevState) {
        if(prevProps.comboDlgClosed !== this.props.comboDlgClosed)
            this.updateData();
            if(!this.props.comboDlgClosed) this.setKeyboardEventsListener(this.componentKeyboardEvents);
    }

    /* ----------------- Data operations ---------------------------------------------- */
    updateData = () =>{
        const { comboData, rules } = this.props;
        //const reducer = data.reduce((res, el) => res + el.value, "");
        if(Array.isArray(comboData)){
            this.setState({
                data: comboData.map((item)=>{ return{ value: item.value }}),
                //reducer,
                rules,
            })
        }
    };

    backupData = (state) =>{
        return state.data.map(
            (i) => {
                if(i.id === state.oldId)
                    i.value = state.oldCode;
                return i
            }
        );
    };

    /* ----------------- Keyboard event functions ------------------------------------- */
    componentKeyboardEvents = (e) =>{
        /*
        *  This argument contains a handful of properties:
        *  "key"
        *  Every key we press on your keyboard has a number associated with it.
        *  This read-only property returns that number.
        *  "code"
        *  This property only exists on event arguments returned by the keypress event, and it contains the ASCII
        *  code for whatever character key you pressed.
        *  "ctrlKey", "altKey", "shiftKey"
        *  These three properties return a true if the Ctrl key, Alt key, or Shift key are pressed.
        *  "metaKey"
        *  The metaKey property is similar to the ctrlKey, altKey, and shiftKey properties in that it returns
        *  a true if the Meta key is pressed. The Meta key is the Windows key on Windows
        *  keyboards and the Command key on Apple keyboards.
        * */
        console.log("Code Editor Keyboard Listener");
        if(e.key === 'Enter' && e.code === 'Enter' && e.ctrlKey === false)
            this.handleComboDlgKeyEnter();
        if(e.key === 'Escape' && e.code === 'Escape' && e.ctrlKey === false)
            this.handleComboDlgKeyEscape();
    };

    // Enter => Start/End Edit
    handleComboDlgKeyEnter = () => {
        this.setState((state)=> {
            // Если мы в режиме редактирования
            if (state.editing) {
                const cell = state.editingCell;
                const duplicates = state.data.filter(
                    (row) => row.value === cell.value
                );
                if (duplicates.length > 1) {
                    console.log("Duplicate: ", state.data);
                } else {
                    this.comboDlg.endEdit();                // Todo: setState?
                    return {
                        editing: !state.editing,
                        editingCell: null,
                        oldId: null,                        // Clear a backup after confirm
                        oldCode: null,                      // Clear a backup after confirm
                        //adding: null,
                    }
                }
            }else{
                // Мы не в режиме редактирования => Начинаем редактирвоание
                const { selection : row } = state;
                if(row){
                    // Todo: не дает фокус редактирования
                    this.comboDlg.beginEdit(row, "value");  // Todo: setState?
                    return {
                        editing: !state.editing,
                        editingCell: state.data[row.id - 1],
                        oldId: row.id,                      //  make a backup
                        oldCode: row.value                  //  make a backup
                    };
                }
            }
        });
    };

    // Escape => Cancel Edit
    handleComboDlgKeyEscape = (props) => {
        this.setState((state) => {
            if(state.editing){
                this.comboDlg.cancelEdit();
                return{
                    data: this.backupData(state),
                    editing: !state.editing,
                    editingCell: null,
                    oldId: null,        // Clear a backup after cancel
                    oldCode: null,      // Clear a backup after cancel
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
                    editingCell: state.data[row.id - 1],
                    oldId: row.id,      //  make a backup
                    oldCode: row.value   //  make a backup
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
                const backupData = state.data.map(
                    (i) => {
                        if(i.id === state.oldId)
                            i.value = state.oldCode;
                        return i
                    }
                );
                this.comboDlg.cancelEdit();
                return{
                    data: backupData,
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

   /* ----------------- Методы обработки событий реакции элементов -------------------- */
    handleClickAddCode = () =>{
        // Добавляем код *
        // Делаем Selection *
        // Включаем его редактирование
        this.setState((state) => {
            console.log(state.data);
            const zeros = state.data.filter((i)=>i.value === "0");
            console.log(zeros);
            if(!state.editing && zeros.length === 0){
                // Разрешение на добавление
                // this.comboDlg.beginEdit(state.data[0], "code"); // Не работает
                const { data } = state;
                const row = { value: "0", id: 0 };
                const newData = [ row, ...data ]; // Make a new data
                return{
                    data: newData,
                    selection: row,
                };
            }
        });
    };

    handleClickRemoveCode = () => {
        console.log('remove', this.state.selection);
        this.setState((state) => {
            const { data, selection } = state;
            if(!state.editing){
                // Почему-то теряет контекст
                //this.comboDlg.cancelEdit();
                return{
                    data: data.filter(i=>i.id !== selection.id ),
                    // editingCell: null,
                    selection: null,
                }
            }
        });
    };

    handleComboDlgClose = () => {
        this.comboDlgManager();
        this.setState((state) => {
            if(state.editing){
                // Почему-то теряет контекст
                //this.comboDlg.cancelEdit();
                return{
                    data: this.backupData(state),
                    editing: !state.editing,
                    editingCell: null,
                    oldId: null,        // Clear a backup after cancel
                    oldCode: null,      // Clear a backup after cancel
                    selection: null,
                }
            }
        });
    };

    handleComboDlgSave = () => {
        // Сохраняем данные и передаем их в ItemDetail
        const { data } = this.state;
        this.comboDlgManager(data);
        this.setState((state) => {
            if(state.editing){
                return{
                    //data:,
                    editing: !state.editing,
                    editingCell: null,
                    oldId: null,        // Clear a backup after cancel
                    oldCode: null,      // Clear a backup after cancel
                    selection: null,
                }
            }
        });
    };

    /* ----------------- Render методы отображения компонента ------------------------- */
    renderTextBoxEditor = ({ row, error }) =>{
        return(
            <Tooltip content={ error } tracking>
                <TextBox
                    onFocus = { console.log("focus editor", error) }
                    value={ row.value }/>
            </Tooltip>
        )
    };

    render(){
        const { data, rules, filterRules, comboDlgTitle,
            comboDlgSaveTitle, comboDlgCancelTitle, selection } = this.state;
        // Передадим в родителя обработчик клавиатурных событий
        return(
                <Dialog
                    modal
                    draggable
                    title= { comboDlgTitle }
                    closed = { this.props.comboDlgClosed }
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
                            filterRules={ filterRules }
                            dblclickToEdit
                            virtualScroll
                            selectionMode = "single"
                            editMode = "row"
                            showHeader = { false }
                            idField = "id"
                            selection = { selection }
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
                                field="value"
                                title="Коды"
                                editor={ this.renderTextBoxEditor }
                                align="center"/>
                        </DataGrid>
                    </div>
                    <div className="dialog-button">
                        <LinkButton
                            style={{ width: 80 }}
                            onClick={ this.handleComboDlgSave }>
                            { comboDlgSaveTitle }
                        </LinkButton>
                        <LinkButton
                            style={{ width: 80 }}
                            onClick={ this.handleComboDlgClose }>
                            { comboDlgCancelTitle }
                        </LinkButton>

                    </div>
                </Dialog>
        )
    };
}