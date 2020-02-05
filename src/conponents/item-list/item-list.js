import React, { Component } from 'react';
import { DataGrid, GridColumn, NumberBox, ComboBox } from 'rc-easyui';
import { Draggable } from 'rc-easyui';
import ContextMenu from "../context-menu";
import './item-list.css';
import ErrorBoundry from "../error-boundry";
import ItemEditor from "./item-editor";
import { processingListData } from "../../services/nodes-service";



export default class ItemList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data: [],
            nodeView: null,       // открытый каталог для редактирования
            operators: [ "nofilter", "equal", "notequal", "less", "greater" ],
            allChecked: false,
            rowClicked: false,
            selection: [],
            drag: [],
            copied: null,

            editingRow: null,
            processedRow: null,

            titleEditItem: 'Редактирование товара',
            titleAddItem: 'Добавление товара',
            titleCreateItem: 'Создаем новый товар',

            errors: {},
            title: '',
            closed: true,
            collapsed: props.collapsed,
        };
        this.constants = props.constants;
        this.list = null;
        this.viewRows = [];
        this.viewRowsLength = 0;
        this.itemMatrix = props.itemMatrix;
        this.getRules = props.getRules;
        this.clearRow = {
            "barCodes": [],
            "alcoCodes": [],
            "name": null,
            "price": 0.00,
            "quantity": 0,
            "costPrice": 0.00,
            "measureName": props.constants.measureTypes[1],
            "tax": props.constants.taxTypes[0],
            "allowToSell": true,
            "description": null,
            "group": false,
            "type": null,
            "alcoholByVolume": null,
            "alcoholProductKindCode": null,
            "tareVolume": null
        };
        this.listContextMenuFunction = [
            { key: "Создать", function: this.handleListRowCreate },
            // Todo доработать для групп и товаров
            { key: "Открыть", function: this.handleRowDblClick },   // для row.group === true
            { key: "Копировать", function: this.handleListRowCopy },
            { key: "Вставить", function: this.handleListRowPaste },
            { key: "Выделить все", function: this.handleListSelectAll },
            { key: "Очистить", function: this.clearSelection },
            { key: "Вырезать", function: this.handleListRowCut },
            { key: "Закрыть", function: this.handleContextMenuClose },
        ];
        this.updateItemData = props.updateItemData;
        this.onListNodeSelection = props.onListNodeSelection;
        this.onListItemSelection = props.onListItemSelection;
        this.notificator = props.notificator;

        // Сохраним сеттер keyboard events listener для передачи другим компонентам
        this.setKeyboardEventsListener = props.setKeyboardEventsListener;
    }

    /* ----------------- Lifecycle methods -------------------------------------------- */
    componentDidMount() {
        this.updateData();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevProps.itemListData !== this.props.itemListData ||
            prevProps.itemTreeData !== this.props.itemTreeData ||
            prevProps.nodeView !== this.props.nodeView)
            this.updateData();
    }

    /* ----------------- Data operations ---------------------------------------------- */
    updateData = () => {
        const { itemTreeData, itemListData, nodeView } = this.props;
        const data = processingListData(itemTreeData, itemListData,
            nodeView === null ? null : nodeView.uuid);
        // Обновление данных в ListItem
        console.log("ItemList Обновление data--->");
        this.setState({
            data,
            nodeView,
            selection: [],
            loading: false
        });
    };

    setSelection = (selection) => {
      this.setState({ selection });
    };

    //  Нужен отдельный обнулитель
    clearSelection = () => {
        this.setState( { selection: [] });
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
        console.log("ItemList Keyboard Listener");
        if(e.key === 'Enter' && e.code === 'Enter' && e.ctrlKey === false)
            this.handleItemListKeyEnter();
        if(e.key === 'Escape' && e.code === 'Escape' && e.ctrlKey === false)
            this.handleItemListKeyEscape();
    };

    handleItemListKeyEnter = () =>{
        this.list.endEdit();
        console.log("ItemList Enter Key selection=>", this.state.selection);
    };

    handleItemListKeyEscape = () =>{
        this.list.cancelEdit();
        console.log("ItemList Escape Key");
    };


    /* ----------------- Обработка событий ItemList ----------------------------------- */
    handleRowDblClick = (row) =>{
        const { collapsed } = this.props;
        this.setSelection([row]);  // ???? Нужно ли??
        // реакция на двойной клик
        if(row.group){
            this.onListNodeSelection(row);
        }else{
            this.onListItemSelection(row);
            if(collapsed)
                // Редактирование в модальном режиме
                this.handleEditRow(row);
        }
    };

    handleRowDragStart = (event, row) => {
        //  Либо выделенные элементы либо один, что выбран
        const items = this.state.selection.length > 0 ? this.state.selection: [row];
        this.props.onDrag(items);
    };

    handleCellContextMenu = ({ row, column, originalEvent }) =>{
        originalEvent.preventDefault();
        // При контекстном меню отменим выделения - нет
        //this.changeSelection([row]);
        this.setState({ editingRow: row });
        this.menu.showContextMenu(originalEvent.pageX, originalEvent.pageY);
    };

    handleSelectionChange = (selection) => {
        // При изменении выделений, меняем фокус клавиатуры
        this.setKeyboardEventsListener(this.componentKeyboardEvents);
        // Вызываем для сохранения стейта в Дашбоард
        if (this.state.editingNode !== null) this.list.cancelEdit();
        this.setSelection(selection)
    };

    handleContextMenuClick = (value) => {
        const { editingRow } = this.state;
        const action = this.listContextMenuFunction.find(m => m.key === value);
        // выбираем [0] т.к e ItemList selections это массив
        if (action !== undefined) action.function(editingRow);
        else this.notificator.show("Данное действие не возможно выполнить", { type: "error" });
    };

    /* ----------------- Context Menu functions --------------------------------------- */
    handleContextMenuClose = (row) =>{
        this.list.cancelEdit();
    };

    handleEditRow = (row) => {
        const { titleEditItem } = this.state;
        this.setState({
            editingRow: row,
            model: Object.assign({}, row),
            title: titleEditItem,
            closed: false
        });
    };

    // ItemList => Close menu
    handleListRowCreate = (row) =>{
        const { titleCreateItem } = this.state;
        console.log("Создаем новый row ", row);
        const itemUuid = require('uuid/v4');
        const code = null;
        const parentUuid = row.parentUuid;
        this.setState({
            editingRow: row,
            model: Object.assign({}, this.clearRow, { uuid: itemUuid(), code, parentUuid }),
            title: titleCreateItem,
            closed: false
        });
    };

    handleListRowCut = (row) =>{
        console.log('selected: ', this.state.selection);
        // Удаляем row указывая только его uuid
        this.updateItemData({ name: row.name, uuid: row.uuid});
    };

    handleListRowCopy = (row) =>{
        this.notificator.show("Товар " + row.name + " скопирован в буфер", { type: "info" });
        this.setState({
            copied: row
        })
    };

    handleListRowPaste = (row) =>{
        const { copied, titleAddItem } = this.state;
        if(copied){
            const itemUuid = require('uuid/v4');
            const code = null;
            const parentUuid = row.parentUuid;
            this.setState({
                editingRow: row,
                model: Object.assign({}, copied, { uuid: itemUuid(), code, parentUuid }),
                title: titleAddItem,
                closed: false
            });
        } else this.notificator.show("Чтобы выполнить эту операцию, сначала скопируйте товар", { type: "info" });
    };

    handleListSelectAll = (row) =>{
        console.log("SelectAll=>", this.viewRows);
        this.setState({
            selection: this.viewRows
        })
    };
    /* ----------------- Обработка формы редактирования ------------------------------- */

    /* ----------------- Render методы отображения компонента ------------------------- */
    renderColumn = ({ value, row }) => {
        const proxy = () => {
            const target = this.state.selection.length > 0 ? this.state.selection : [row] ;
            const items = target.map((item)=>{
                return(
                    <div key = { item.uuid } className="datagrid-moving-proxy">
                        { item.name }
                    </div>
                )
            });

            return (
                <div >
                    { items }
                </div>
            )
        };

        return (
            <Draggable
                revert
                deltaX={ -5 }
                deltaY={ -5 }
                edge={ 5 }
                proxy={ proxy }
                onDragStart={(event) => this.handleRowDragStart(event, row)}
                // Отмена выделений после перетаскивания
                onDragEnd = { this.clearSelection }>
                <div>
                    { row.name }
                </div>
            </Draggable>
        )
    };

    renderRowStyle = (row) => {
        // Придаем стиль nodes строкам
        if (row.group) {
            //console.log(row.name);
            // background: "#b8eecf", fontSize: "14px",
            return { fontWeight: "bold" };
        }
        return null;
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

    renderCode = ({ value, row, rowIndex }) =>{
        // Используем этот метод для выделения отображаемых row после фильтрации
        if (rowIndex < this.viewRowsLength) this.viewRows = this.viewRows.slice(0, rowIndex + 1);
        //console.log("itemList renderCode--->>>", this.viewRows);
        this.viewRows[rowIndex] = row;
        this.viewRowsLength = rowIndex;
        return value
    };

    render() {
        const { data, selection, operators, title, model, closed } = this.state;
        const { measureTypes } = this.constants;

        console.log("itemList render--->>>");
        const numberBoxFilter = () => {
            return (<NumberBox/>)
        };

        const comboBoxFilter = () =>{
            return(<ComboBox
                data={ measureTypes }
                editable={ false }
                inputStyle={{ textAlign: 'center' }}
            />);
        };
        //console.log("props=>", this.props.nodeView, "state=>",this.state.nodeView);

        return (
            <ErrorBoundry>
                <DataGrid
                    ref = { list=>this.list=list }
                    data = { data }
                    selection={ selection }
                    style = {{ height: 'calc(100vh - 60px)' }}
                    filterable
                    //loading = { this.props.loading }
                    columnMoving
                    columnResizing
                    //renderDetail = { this.renderDetail }
                    editMode = "row"
                    selectionMode ='multiple'
                    rowCss = { this.renderRowStyle }
                    onRowDblClick = { this.handleRowDblClick }
                    onSelectionChange = { this.handleSelectionChange }
                    onRowContextMenu = { this.handleCellContextMenu }>
                    <GridColumn
                        render = { this.renderCode }
                        field="code" title="Код" width="10%"/>
                    <GridColumn
                        render = { this.renderColumn }
                        field="name"
                        title="Наименование"
                        width="50%"/>
                    <GridColumn field="price" title="Цена продаж" width="10%" align="right"
                                filterOperators={ operators }
                                filter={ numberBoxFilter }
                    />
                    <GridColumn field="quantity" title="Остаток" align="right" width="10%"
                                filterOperators={ operators }
                                filter={ numberBoxFilter }
                    />
                    <GridColumn field="description" title="Описание" width="10%"/>
                    <GridColumn field="measureName" title="Единицы" width="10%" align="center"
                                filter={ comboBoxFilter }
                    />
                </DataGrid>
                <ItemEditor
                    title = { title }
                    model = { model }
                    closed = { closed }
                    saveRow = { this.saveRow }
                    updateItemData = { this.updateItemData }
                    itemMatrix = { this.itemMatrix }
                    constants = { this.constants }
                    getRules = { this.getRules }
                />
                { this.renderContextMenu() }
            </ErrorBoundry>
        )
    }
}
