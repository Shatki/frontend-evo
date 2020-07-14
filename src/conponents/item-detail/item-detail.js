import React, { Component } from 'react'
import { ComboBox, DataGrid, GridColumn, SwitchButton, TextBox, Tooltip, ComboTree } from 'rc-easyui'
import ContextMenu from '../context-menu'
import ErrorBoundry from '../error-boundry'
import CodeEditor from "./item-code-editor";
import { addRootNode, getNodeByRow, getNodeByUuid,
    processingItemData, processingTreeData } from "../../services/nodes-service";
import './item-detail.css'
import noItem from './hiclipart6.png'

export default class ItemDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],                           // преобразованные, рабочие данные
            processedTreeData: null,            // Данные для tree

            parent: null,                       // Нода родитель, постоянная ссылка
            rules: null,
            filterRules: [],
            errors: null,
            editing: false,                     // Маркер редактирования ItemDetail props
            focus: null,                    // Выделенная ячейка с значением
            comboData: null,                    // Данные для редактирования кодов
            comboDlgClosed: true,
            comboDlgEditRow: null               // редактируемая строка свойств через редактор кодов
        };
        this.itemContextMenuFunction = [
            { key: "Редактировать", function: this.itemDetailPropEdit },
            //{ key: "Сохранить", function: this.handleItemDetailSave },
        ];
        this.constants = props.constants;

        this.cellErrorMessage = "Ошибка данных";

        // Сохраним сеттер keyboard events listener для передачи другим компонентам
        this.updateItemData = props.updateItemData;
        this.notificator = props.notificator;
        this.setKeyboardEventsListener = props.setKeyboardEventsListener;
        this.getRules = props.getRules;
        this.itemMatrix = props.itemMatrix;
    }

    /* ----------------- Lifecycle methods -------------------------------------------- */
    componentDidMount() {
        this.updateData();
        this.updateTreeData();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        console.log("ItemDetail componentDidUpdate", prevProps.itemDetailData, this.props.itemDetailData);
        if(prevProps.itemTreeData !== this.props.itemTreeData) this.updateTreeData();
        if(prevProps.itemDetailData !== this.props.itemDetailData) this.updateData();
    }

    /* ----------------- Data operations ---------------------------------------------- */

    updateData = () => {
        const { itemDetailData, itemMatrix } = this.props;
        //console.log("updateData ItemDetail", data, parent);
        // itemData это объект класса row
        const data = itemDetailData ? processingItemData(itemDetailData, itemMatrix) : undefined;
        console.log("---------------ItemDetail--->updateData ItemDetailData data/parent=>", data);
        this.setState({
            data,                       // рабочие данные
        })

    };

    updateTreeData = () =>{
        const { itemDetailData, itemTreeData } = this.props;
        const children = processingTreeData(itemTreeData, null, null);
        const processedTreeData = addRootNode(children);
        // row не может быть null
        const parent = getNodeByRow(itemTreeData, itemDetailData);
        console.log("ItemDetail--->updateTreeData processedTreeDat/parent=>", processedTreeData, parent);
        this.setState({
            processedTreeData, parent
        })
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
        console.log("ItemDetail Keyboard Listener");
        if(e.key === 'Enter' && e.code === 'Enter' && e.ctrlKey === false)
            this.handleItemDetailKeyEnter();
        if(e.key === 'Escape' && e.code === 'Escape' && e.ctrlKey === false)
            this.handleItemDetailKeyEscape();
    };

    handleItemDetailKeyEnter = () =>{
        const { editing, focus } = this.state;
        if (!editing) this.detail.beginEdit(focus, "valueField");
        else this.detail.endEdit();
        console.log("ItemDetail Enter Key editing/focus=>", editing, focus);
    };

    handleItemDetailKeyEscape = () =>{
        const { editing, focus } = this.state;
        this.detail.cancelEdit();
        console.log("ItemDetail Escape Key editing/focus=>", editing, focus);
    };

    /* ----------------- Combo Code Editor Dialog ------------------------------------- */
    // Метод для управления видимостью диалога редактирования кодов
    comboDlgManager = (arr) => {
        this.setState((state)=>{
            // Todo: Почему-то так и не меняет отображение кода после редактирования
            // Вроде исправили
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
        this.menu.showContextMenu(originalEvent.pageX, originalEvent.pageY);
        this.setState({
            focus: row
        });
    };

    handleEditEnd = ({ row, originalValue, errors }) =>{
        console.log("itemDetail Обновление row/было=>", row, originalValue);
        // todo: Добавить проверку на объект row & originalValue

        if(row.valueField !==originalValue.valueField) {
            const { itemDetailData } = this.props;
            console.log("EndEdit row/originalValue/errors=>", row, originalValue, errors );
            const updateData = Object.assign({}, itemDetailData);
            updateData[row.nameField] = row.valueField;
            console.log("itemDetail Обновление item=>", updateData);
            this.updateItemData(updateData);

            this.setState({
                editing: false,
                itemDetailData: updateData
            });
        }
    };

    handleEditBegin = ({ row, originalValue, errors })=>{
        // Запрет на редактирование switch
        if(row.editorField === "switch") this.detail.cancelEdit();
        this.setState({
            editing: true,
        });
    };

    handleEditCancel = ({ row, originalValue, errors }) =>{
        this.setState({
            editing: false,
        });
        //console.log("CancelEdit=>", row, originalValue, errors );
    };

    handleItemClick = (value) => {
        // Todo доработать расположение listener'a
        this.setKeyboardEventsListener(this.componentKeyboardEvents);
        console.log("handleItemClick value/data=>",value, this.state.data);
    };

    handleItemDetailRowClick =(row)=>{
        this.setKeyboardEventsListener(this.componentKeyboardEvents);
        console.log("Click->", row, this);
        this.setState({
            focus: row,
            rules: this.getRules(row.rules)
        });
    };

    handleItemDetailRowDblClick =(row)=>{
        // Установка правил валидации
        console.log("handleItemDetailRowDblClick row=>", row);
    };

    handleComboTreeChange = (value) => {
        /*
            Реакция смены значения группы в ItemDetail

            value => Значение поля <ComboTree/> valueField = "uuid"
         */
        const { processedTreeData } = this.state;
        console.log("handleComboTreeChange Меняем ноду =>", value);
        const parent = getNodeByUuid(processedTreeData, value);
        this.setState({
            parent
        })
    };

    handleContextMenuClick = (value) => {
        const { focus } = this.state;
        const action = this.itemContextMenuFunction.find(m => m.key === value);
        // выбираем [0] т.к e ItemList selections это массив
        if (action !== undefined) action.function(focus);
        else this.notificator.show("Данное действие не возможно выполнить", { type: "error" });
    };

    itemDetailPropEdit = (row)=>{
        console.log("itemDetailPropEdit=>", row);
        this.detail.beginEdit(row);
        this.setState({
            focus: row,
            rules: this.getRules(row.rules)
        });
    };

    /* ----------------- Render методы отображения компонента ------------------------- */
    renderEditor = ({ row, error }) =>{
        console.log("render editor row/error=>", row, error);
        // Todo: Доделать
        if (row.editorField === "text")
            return( <Tooltip content={ error } tracking>
                <TextBox value={ row.valueField } placeholder={ row.titleField }/>
            </Tooltip>);
        else if (row.editorField === "switch")
            return (<SwitchButton value={ row.valueField }/>);
        else if(row.editorField === "tree"){
            console.log("renderTree=>");
            const { processedTreeData } = this.state;
            return(
                <ComboTree
                    animate
                    placeholder="Выберите группу"
                    valueField = "uuid"
                    textField = "text"
                    data={ processedTreeData }
                    value={ row.valueField }
                    onChange={ this.handleComboTreeChange }
                />);
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
        console.log("render view row/value=>", row, value);
        if (row.editorField === "text")
            return(<div>{ row.valueField }</div>);
        else if(row.editorField === "number")
            return(<div>{ row.valueField }</div>);
        else if(row.editorField === "switch")
            return(<SwitchButton value={ row.valueField }/>);
        else if(row.editorField === "tree"){
            const { processedTreeData } = this.state;
            const node = getNodeByUuid(processedTreeData, row.valueField);
            //console.log("Render View getNode=>", node, 'row.valueField=>',row.valueField);
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
        // Ошибка, но их быть не должно если правильно настроема матрица товаров
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
                menu = { this.props.contextMenu.itemMenu }
                menuRef = { (ref)=>this.menu=ref }
                handleItemClick = { this.handleContextMenuClick }
            />
        )
    };

    render() {
        const { data, rules, filterRules, comboData, comboDlgClosed } = this.state;
        const { collapsed } = this.props;
        if( collapsed ) return null;
        if(!data) return <img width="100%" alt="item" src={ noItem }/>;

        console.log("itemDetail render--->>> data:", data);
        return(
            <ErrorBoundry key = "item-detail">
                <DataGrid
                    style = {{ height: "100%" }}
                    ref = { detail=>this.detail=detail }
                    data = { data }
                    filterRules={ filterRules }
                    idField = "nameField"
                    columnResizing
                    dblclickToEdit
                    expanderWidth = { 20 }
                    selectionMode = "row"
                    editMode = "row"
                    groupField = "groupField"
                    renderGroup={ this.renderGroup }
                    onCellContextMenu={ this.handleItemContextMenu }
                    onRowClick = { this.handleItemDetailRowClick }
                    onRowDblClick = { this.handleItemDetailRowDblClick }
                    onEditEnd = { this.handleEditEnd }
                    onEditBegin = { this.handleEditBegin }
                    onEditCancel = { this.handleEditCancel }
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
                    itemMatrix = { this.itemMatrix }
                    setKeyboardEventsListener = { this.setKeyboardEventsListener }
                />
                { this.renderContextMenu() }
            </ErrorBoundry>
        )
    }
}