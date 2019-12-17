import React, { Component } from 'react';
import { DataGrid, GridColumn, NumberBox, ComboBox} from 'rc-easyui';
import { Draggable } from 'rc-easyui';
import ContextMenu, { ContextMenuConsumer } from "../context-menu";
import './item-list.css';



export default class ItemList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            operators: ["nofilter", "equal", "notequal", "less", "greater"],
            allChecked: false,
            rowClicked: false,
            selection: [],
            drag: []
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
        ]
    }

    renderRowStyle = (row) =>{
        // Придаем стиль nodes строкам
        if (row.group) {
            //console.log(row.name);
            // background: "#b8eecf", fontSize: "14px",
            return { fontWeight: "bold" };
        }
        return null;
    };

    onDataLoaded = (data) => {
        this.setState({
            data,
            loading: false
        })
    };

    handleRowDblClick = (row) =>{
        // реакция на двойной клик
        console.log("Редактируем=>", row);
        if(row.group){
            this.props.onListRowSelection(row);
        }else{
            console.log("Редактируем=>", row.name);
        }
    };

    changeSelections = (selection=[]) => {
        // Основная функция изменения выделений строк в ItemList
        // Сохраним в стейт
        this.setState({
            selection: selection,
        });
    };

    handleCellContextMenu = ({ row, column, originalEvent }) =>{
        originalEvent.preventDefault();
        // При контекстном меню отменим выделения
        this.changeSelections([row]);
        this.menu.showContextMenu(originalEvent.pageX, originalEvent.pageY);
    };

    // ItemList => Close menu
    handleContextMenuClose = (row) =>{
        this.list.cancelEdit();
    };

    handleListRowCreate = (row) =>{
        console.log("Создаем новый row ", row);
    };

    handleListRowDelete = (row) =>{
        console.log("Удляем row ", row);
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

    handleRowDragStart = (event, row) => {
        //  Либо выделенные элементы либо один, что выбран
        const items = this.state.selection.length > 0 ? this.state.selection: [row];
        this.props.onDrag(items);
    };

    renderColumn = ({ value, row, rowIndex }) => {
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

    render() {
        const numberBoxFilter = () =>{
            return (<NumberBox/>)
        };

        const comboBoxFilter = () =>{
            return(<ComboBox
                data={ this.props.measureTypes }
                editable={ false }
                inputStyle={{ textAlign: 'center' }}
            />);
        };

        return (
            <ContextMenuConsumer>
                {
                    ({ listMenuRef: menuRef, listMenu: menu })=>{
                        this.menu = menuRef.current;
                        return (
                            <>
                                <DataGrid
                                    ref = {(list)=>{ this.list = list }}
                                    //renderItem = { this.renderRow }
                                    style={{ height: 'calc(100vh - 60px)' }}
                                    filterable
                                    rowCss={ this.renderRowStyle }
                                    data={ this.props.listData }
                                    editMode = "row"
                                    columnMoving
                                    onCellDblClick = { this.handleRowDblClick }
                                    columnResizing
                                    selectionMode ='multiple'
                                    selection={ this.state.selection }
                                    onSelectionChange={ this.handleSelectionChange }
                                    onCellContextMenu={ this.handleCellContextMenu }
                                >
                                        <GridColumn
                                            //render = { this.renderColumn }
                                            field="code" title="Код" width="10%"/>
                                        <GridColumn
                                            render = { this.renderColumn }
                                            field="name"
                                            title="Наименование"
                                            width="50%"/>
                                        <GridColumn field="price" title="Цена продаж" width="10%" align="right"
                                                    filterOperators={ this.state.operators }
                                                    filter={ numberBoxFilter }
                                        />
                                        <GridColumn field="quantity" title="Остаток" align="right" width="10%"
                                                    filterOperators={ this.state.operators }
                                                    filter={ numberBoxFilter }
                                        />
                                        <GridColumn field="description" title="Описание" width="10%"/>
                                        <GridColumn field="measureName" title="Единицы" width="10%" align="center"
                                                    filter={ comboBoxFilter }
                                        />
                                </DataGrid>
                                <ContextMenu
                                    menu = { menu }
                                    menuRef = { menuRef }
                                    handleItemClick = { this.handleContextMenuClick }/>
                            </>
                        );
                    }
                }
            </ContextMenuConsumer>

        );




    }
}
