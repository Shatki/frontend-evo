import React, { Component } from 'react';
import { DataGrid, GridColumn, NumberBox, ComboBox } from 'rc-easyui';
import { Draggable } from 'rc-easyui';
import ContextMenu from "../context-menu";
import './item-list.css';
import ErrorBoundry from "../error-boundry";
import ItemEditor from "./item-editor";



export default class ItemList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data: [],
            nodeView: props.nodeView,       // открытый каталог для редактирования
            operators: [ "nofilter", "equal", "notequal", "less", "greater" ],
            allChecked: false,
            rowClicked: false,
            selection: [],
            drag: [],

            editingRow: null,
            processedRow: null,

            errors: {},
            title: '',
            closed: true,
            collapsed: props.collapsed,
        };
        this.constants = props.constants;
        this.list = null;
        this.itemMatrix = props.itemMatrix;
        this.getRules = props.getRules;
        this.clearRow = {
            "barCodes": [],
            "alcoCodes": [],
            "name": null,
            "price": 0.00,
            "quantity": 0,
            "costPrice": 0.00,
            "measureName": "шт",
            "tax": null,
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
            { key: "Изменить", function: this.handleRowDblClick },
            { key: "Открыть", function: this.handleRowDblClick },   // для row.group === true
            { key: "Копировать", function: this.handleListRowCopy },
            { key: "Вставить", function: this.handleListRowPaste },
            { key: "Дублировать", function: this.handleListRowDublicate },
            { key: "Удалить", function: this.handleListRowDelete },
            { key: "Закрыть", function: this.handleContextMenuClose },
        ];
        this.onListNodeSelection = props.onListNodeSelection;
        this.onListItemSelection = props.onListItemSelection;

        // Сохраним сеттер keyboard events listener для передачи другим компонентам
        this.setKeyboardEventsListener = props.setKeyboardEventsListener;
    }

    /* ----------------- Lifecycle methods -------------------------------------------- */
    componentDidMount() {
        this.updateData();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevProps.data !== this.props.data)
            this.updateData();
    }

    /* ----------------- Data operations ---------------------------------------------- */
    updateData = () => {
        const { data, nodeView } = this.props;
        this.setState({
            data,
            nodeView,
            loading: false
        })
    };

    /* ----------------- Keyboard event functions ------------------------------------- */



    /* ----------------- Обработка событий ItemList ----------------------------------- */
    handleRowDblClick = (row) =>{
        const { collapsed } = this.props;
        this.changeSelections([row]);  // ???? Нужно ли??
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

    changeSelections = (selection) => {
        // Основная функция изменения выделений строк в ItemList
        // Сохраним в стейт
        this.setState({ selection });
    };

    handleCellContextMenu = ({ row, column, originalEvent }) =>{
        originalEvent.preventDefault();
        // При контекстном меню отменим выделения
        this.changeSelections([row]);
        this.menu.showContextMenu(originalEvent.pageX, originalEvent.pageY);
    };

    handleSelectionChange = (selection) => {
        // Вызываем для сохранения стейта в Дашбоард
        if (this.state.editingNode !== null) this.list.cancelEdit();
        this.changeSelections(selection)
    };

    handleContextMenuClick = (value) =>{
        this.listContextMenuFunction
            .find(m => m.key === value)
            // выбираем [0] т.к e ItemList selections это массив
            .function(this.state.selection[0]);
    };

    /* ----------------- Context Menu functions --------------------------------------- */
    handleContextMenuClose = (row) =>{
        this.list.cancelEdit();
    };

    handleEditRow = (row) => {
        this.setState({
            editingRow: row,
            model: Object.assign({}, row),
            title: 'Редактирование товара',
            closed: false
        });
    };

    // ItemList => Close menu
    handleListRowCreate = (row) =>{
        console.log("Создаем новый row ", row);
        const itemUuid = require('uuid/v4');
        const code = "";
        const parentUuid = row.parentUuid;
        this.setState({
            editingRow: row,
            model: Object.assign({}, this.clearRow, { uuid: itemUuid(), code, parentUuid }),
            title: 'Создаем новый товар',
            closed: false
        });
    };

    handleListRowDelete = (row) =>{
        ///////
        this.setState({
            data: this.state.data.filter(item => item.uuid !== row.uuid)
        });
        //console.log("Удляем row ", row);
    };

    handleListRowCopy = (row) =>{
        console.log("Копируем row", row);
    };

    handleListRowPaste = (row) =>{
        console.log("Вставляем скопированный row", row);
    };

    handleListRowDublicate = (row) =>{
        console.log("Дублируем row", row);
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
                onDragEnd = { this.changeSelections([]) }>
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

    render() {
        const { data, selection, operators, title, model, closed } = this.state;
        const { measureTypes } = this.constants;

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
                    style = {{ height: 'calc(100vh - 60px)' }}
                    //renderItem = { this.renderRow }
                    filterable
                    columnMoving
                    columnResizing
                    editMode = "row"
                    selectionMode ='multiple'
                    selection={ selection }
                    rowCss = { this.renderRowStyle }
                    onRowDblClick = { this.handleRowDblClick }
                    onSelectionChange = { this.handleSelectionChange }
                    onRowContextMenu = { this.handleCellContextMenu }>
                    <GridColumn
                        //render = { this.renderColumn }
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
                    itemMatrix = { this.itemMatrix }
                    constants = { this.constants }
                    getRules = { this.getRules }

                />
                { this.renderContextMenu() }
            </ErrorBoundry>
        )
    }
}
