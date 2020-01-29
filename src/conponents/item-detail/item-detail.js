import React, { Component } from 'react'
import { ComboBox, DataGrid, GridColumn, SwitchButton, TextBox, Tooltip, ComboTree } from 'rc-easyui'
import ContextMenu from '../context-menu'
import ErrorBoundry from '../error-boundry'
import CodeEditor from "./item-code-editor";
import { getNodeByUuid } from "../../services/nodes-service";
import './item-detail.css'

export default class ItemDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],                           // преобразованные, рабочие данные
            processedTreeData: null,            // Данные для tree

            //itemData : null,                  // не обработанные данные, которые прининяли и будем отдавать
            parent: null,                       // Нода родитель, постоянная ссылка
            rules: null,
            errors: null,
            editing: false,                     // Маркер редактирования ItemDetail props
            collapsed: props.collapsed,         // Состояние "свёрнутости" панели
            selection: null,                    // Выделенная ячейка с значением
            comboData: null,                    // Данные для редактирования кодов
            comboDlgClosed: true,
            comboDlgEditRow: null               // редактируемая строка свойств через редактор кодов
        };
        this.constants = props.constants;

        this.cellErrorMessage = "Ошибка данных";

        // Сохраним сеттер keyboard events listener для передачи другим компонентам
        this.setKeyboardEventsListener = props.setKeyboardEventsListener;
        this.getRules = props.getRules;
    }

    /* ----------------- Lifecycle methods -------------------------------------------- */
    componentDidMount() {
        this.updateData();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        console.log("componentDidUpdate ItemDetail", this.state.data);
        if(prevProps.data !== this.props.data ||
            prevProps.collapsed !== this.props.collapsed) {
            console.log("componentDidUpdate update successful");
            this.updateData();
        }
    }

    /* ----------------- Data operations ---------------------------------------------- */

    updateData = () => {
        const { data, parent, processedTreeData, collapsed } = this.props;
        //console.log("updateData ItemDetail", data, parent);
        // Установим Keyboard Events Listener
        // Todo Где лучше их ставить ????????????????
        this.setKeyboardEventsListener(this.componentKeyboardEvents);
        if(data){
            this.setState({
                data,                       // рабочие данные
                parent,
                processedTreeData,
                collapsed,
            })
        }
    };

    getCodes = arr => arr.map((code)=>{ return{ value:code.value, text:code.value }});

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
    comboDlgManager = (arr) => {
        this.setState((state)=>{
            // Todo: Почему-то так и не меняет отображение кода после редактирования
            if(!state.comboDlgClosed){
                // Восстановим реактор клавиатуры
                this.setKeyboardEventsListener(this.componentKeyboardEvents);
                // console.log("Save data=>", this.state.comboDlgEditRow, this.state.comboData, data);
                if(Array.isArray(arr) && state.comboDlgEditRow){
                    //let dataFieldObject = {};
                    // Для itemData чтобы потом отдать изменения
                    //dataFieldObject[state.comboDlgEditRow.nameField] = arr.map((code)=>code.value);
                    const dataField = arr.map((code)=>{ return{ value:code.value, text:code.value }});
                    //const itemData = Object.assign(state.itemData, dataFieldObject );
                    const comboDlgEditRow = Object.assign(state.comboDlgEditRow,
                        { dataField },
                        { valueField: dataField[0].text });
                    const data = state.data.map((row)=>{
                        if(row.nameField===state.comboDlgEditRow.nameField) return comboDlgEditRow;
                        else return row;
                    });

                    //console.log("updated data=>", data, comboDlgEditRow);
                    return{
                        comboDlgClosed: true,
                        data,
                        //itemData,
                        comboDlgEditRow
                    };
                } else return{
                    comboDlgClosed: true
                };
            }
        });
        // Закрываем диалог редактирования
        this.detail.endEdit();
    };

    handleClickComboDlgEditor = (row) => {
        this.setState((state)=>{
            //console.log('Combo dlg Editor=>', row);
            if(state.comboDlgClosed){
                return{
                    comboData: row.dataField,
                    comboDlgEditRow: row,
                    comboDlgClosed: !state.comboDlgClosed
                }
            }
        });
    };

    /* ----------------- Обработка событий ItemDetail --------------------------------- */
    handleItemContextMenu = ({ row, column, originalEvent }) => {
        originalEvent.preventDefault();
        console.log(row.nameField);
        this.menu.showContextMenu(originalEvent.pageX, originalEvent.pageY)
    };

    handleEndEdit = ({ row, originalValue, errors } ) =>{
        console.log("EndEdit=>", row, originalValue, errors );
    };

    handleItemClick = (value) => {
        console.log(value, this.state.data);
    };

    handleItemDetailRowClick =(row)=>{
        //console.log("Click->", row, this);
    };

    handleItemDetailRowDblClick =(row)=>{
        // Установка правил валидации
        this.setState({
            rules: this.getRules(row.rules)
        });
        //console.log("DblClick->", row);
    };

    handleComboTreeChange = (value) => {
        /*
            Реакция смены значения группы в ItemDetail

            value => Значение поля <ComboTree/> valueField = "uuid"
         */
        const { processedTreeData } = this.state;
        const parent = getNodeByUuid(processedTreeData, value);
        console.log("Меняем ноду =>", value, parent);
        this.setState({
            parent
        })
    };

    /* ----------------- Render методы отображения компонента ------------------------- */
    renderEditor = ({ row, error }) =>{
        // Todo: Доделать
        if (row.editorField === "text")
            return( <Tooltip content={ error } tracking>
                <TextBox value={ row.valueField } placeholder={ row.titleField }/>
            </Tooltip>);
        else if (row.editorField === "switch")
            return(<SwitchButton value={ row.valueField }/>);
        else if(row.editorField === "tree"){
            const { processedTreeData } = this.state;
            const parent = getNodeByUuid(processedTreeData, row.valueField);
            console.log("renderTree=>", parent);
            return(
                <ComboTree
                    animate
                    placeholder="Выберите группу"
                    valueField = "uuid"
                    textField = "text"
                    data={ processedTreeData }
                    value={ parent }
                    onChange={ this.handleComboTreeChange }/>
                    );
        }
        else if (row.editorField === "combo"){
            // const dataRow =
            const data = Array.isArray(row.dataField) ? row.dataField : this.constants[row.dataField] || null;
            if(data && row.dataField){
                const value = row.valueField === null ?
                    data[0] : data.find(item => (item.value === row.valueField));
                const addEditor = row.edit ? () => (<span
                    className="textbox-icon icon-evotor-edit"
                    title="Править коды"
                    onClick = { ()=>this.handleClickComboDlgEditor(row) }>
                    </span>) : null;

                return(<ComboBox
                    data={ data }
                    value={ value }
                    editable={ false }
                    //onChange={(value) => { this.editComboValues(row, value) }}
                    addonRight={ addEditor }
                />);

            }
        }
    };

    renderView = ({ value, row }) => {
        console.log("render view Node=>", row.nameField, value);
        if (row.editorField === "text")
            return(<div>{ row.valueField }</div>);
        else if(row.editorField === "number")
            return(<div>{ row.valueField }</div>);
        else if(row.editorField === "switch")
            return(<SwitchButton value={row.valueField}/>);
        else if(row.editorField === "tree"){
            const { processedTreeData } = this.state;
            const node = getNodeByUuid(processedTreeData, row.valueField);
            //console.log("Render View getNode=>", node, 'row.valuefield=>',row.valueField);
            if(node) return(<div>{ node.text }</div>);}
        else if(row.editorField === "combo"){
            const dataField = Array.isArray(row.dataField) ? row.dataField : this.constants[row.dataField] || null;
            //console.log("renderView=>combo=>dataField=>", dataField, row.valueField);
            if(row.valueField===null && Array.isArray(dataField))
                return(<div>{ dataField[0].text }</div>);
            if(row.valueField !== null && Array.isArray(dataField)){
                const value = dataField.find(item => (item.value === row.valueField));
                if (value !== undefined) return(<div>{ value.text }</div>);
            }
        }
        // Ошибка
        return(<div className="error">{ this.cellErrorMessage }</div>);
    };

    renderGroup = ({ value, rows }) =>{
        return (
            <span style={{ fontWeight:'bold'}}>{value} - <span style={{ color:'red' }}>{ rows.length }</span> свойств(а)
      </span>
        )
    };

    renderContextMenu = () => {
        return(
            <ContextMenu
                menu = { this.props.contextMenu }
                menuRef = { (ref)=>this.menu=ref }
                handleItemClick = { this.handleContextMenuClick }
            />
        )
    };

    render() {
        const { data, rules, comboData, comboDlgClosed, collapsed } = this.state;
        //console.log("itemDetail render collapsed=>", collapsed);
        if( collapsed ) return null;

        return(
            <ErrorBoundry>
                <DataGrid
                    ref = { detail=>this.detail=detail }
                    data = { data }
                    //idField = "nameField"
                    columnResizing
                    idField = "valueField"
                    dblclickToEdit
                    expanderWidth = { 20 }
                    selectionMode = "row"
                    editMode = "row"
                    groupField = "groupField"
                    renderGroup={ this.renderGroup }
                    onCellContextMenu={ this.handleItemContextMenu }
                    onRowClick = { this.handleItemDetailRowClick }
                    onRowDblClick = { this.handleItemDetailRowDblClick }
                    onEditEnd = { this.handleEndEdit }
                    //onEditValidate = { this.handleEditValidate }
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
                    comboData = { comboData }
                    rules = { rules }
                    comboDlgClosed = { comboDlgClosed }
                    comboDlgManager = { this.comboDlgManager }
                    setKeyboardEventsListener = { this.setKeyboardEventsListener }
                />
                { this.renderContextMenu() }
            </ErrorBoundry>
        )
    }
}
