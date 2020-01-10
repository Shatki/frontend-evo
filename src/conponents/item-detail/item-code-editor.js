import React, { Component } from 'react'
import { Dialog, DataGrid, GridColumn, LinkButton, TextBox, Tooltip } from 'rc-easyui'
import './item-detail.css'

export default class CodeEditor extends Component {

    constructor(props) {
        super(props);
        this.state = {
            data: [],

            codesData: [],                          // Редактируемые данные у редактора кодов
            old: null,                              // Значение codesData до изменения, для отката
            editing: false,                         // Маркер состояния редактирования кода
            //adding: null,                         // Маркер состояния добавления нового кода или id добавленного
            editingCell: null,                      // Значение ячейки с редактируемым кодом
            selection: null,                        // Выделенная ячейка с кодом

            comboDlgAction: null,                   //  Команда на выполнение
            comboDlgTitle: "Редактирование кодов",
            comboDlgCancelTitle: "Отмена",
            comboDlgAddTitle: "Добавить",
            comboDlgRemoveTitle: "Удалить",
            comboDlgSaveTitle: "Сохранить",
        };
    }

    /* ----------------- Data operations ---------------------------------------------- */
    backupData = (state) =>{
        return state.codesData.map(
            (i) => {
                if(i.id === state.oldId)
                    i.code = state.oldCode;
                return i
            }
        );
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
        console.log("Code Editor Keyboard Listener");
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
    handleComboDlgKeyEscape = (props) => {
        this.setState((state) => {
            if(state.editing){
                this.comboDlg.cancelEdit();
                return{
                    codesData: this.backupData(state),
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
        console.log('remove', this.state.selection);
        this.setState((state) => {
            const { codesData, selection} = state;
            if(!state.editing){
                // Почему-то теряет контекст
                //this.comboDlg.cancelEdit();
                return{
                    codesData: codesData.filter(i=>i.id !== selection.id ),
                    // editingCell: null,
                    selection: null,
                }
            }
        });
    };

    handleComboDlgClose = () => {
        this.setState((state) => {
            if(state.editing){
                // Почему-то теряет контекст
                //this.comboDlg.cancelEdit();
                return{
                    codesData: this.backupData(state),
                    editing: !state.editing,
                    editingCell: null,
                    oldId: null,        // Clear a backup after cancel
                    oldCode: null,      // Clear a backup after cancel
                    comboDlgClosed: true,
                    selection: null,
                }
            }
        });
        this.setKeyboardEventsListener(this.prevKeyboardListener);
        this.comboDlgView(false);
    };

    renderTextBoxEditor = ({ row, error }) =>{
        return(
            <Tooltip content={ error } tracking>
                <TextBox
                    onFocus = { console.log("focus editor", error) }
                    value={ row.code }/>
            </Tooltip>
        )
    };

    render(){
        const { comboDlgTitle, comboDlgSaveTitle, comboDlgCancelTitle, selection } = this.state;
        const { data, rules, comboDlgView,
            comboDlgClosed, setKeyboardEventsListener, prevKeyboardListener } = this.props;

        // Захватим предыдущий прослушиватель и сеттер
        this.prevKeyboardListener = prevKeyboardListener;
        this.setKeyboardEventsListener = setKeyboardEventsListener;
        // Передадим в родителя обработчик клавиатурных событий
        if(!comboDlgClosed)
            this.setKeyboardEventsListener(this.componentKeyboardEvents);

        this.comboDlgView = comboDlgView;

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
                            onClick={ this.handleComboDlgClose }>
                            { comboDlgCancelTitle }
                        </LinkButton>

                    </div>
                </Dialog>
        )
    };
}