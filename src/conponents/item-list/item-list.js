import React, { Component } from 'react';
import { DataGrid, GridColumn, NumberBox, ComboBox} from 'rc-easyui';
import { Draggable, dropCls } from 'rc-easyui';
import ContextMenu, { ContextMenuConsumer } from "../context-menu";
import './item-list.css';



export default class ItemList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            operators: ["nofilter", "equal", "notequal", "less", "greater"],
            allChecked: false,
            rowClicked: false,
            data: [],
        };
        //this.updateItemList();
    }

    componentDidMount() {
        this.setState({
            data: this.props.data
        })
    }

    renderRowStyle =(row) =>{
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

    handleDblClick = ({ row }) =>{
        console.log(row.name);
    };

    handleCellContextMenu = ({ row, column, originalEvent }) =>{
        originalEvent.preventDefault();
        console.log(row.name);
        this.menu.showContextMenu(originalEvent.pageX, originalEvent.pageY)
    };

    handleSelectionChange = (node) => {
        // Вызываем для сохранения стейта в Дашбоард
        if (this.state.editingNode !== null) this.list.cancelEdit();

        this.props.handleListSelectionChange(node);
    };

    handleContextMenuClick = (value) =>{
        console.log(value);
    };

    renderItem = (row) => {
        console.log(row);
        return row
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
                                    //ref = {(list)=>{ this.list = list }}
                                    render = { this.renderItem }
                                    style={{ height: 'calc(100vh - 60px)' }}
                                    filterable
                                    rowCss={ this.renderRowStyle }
                                    data={ this.props.listData }
                                    columnMoving
                                    onCellDblClick = { this.handleDblClick }
                                    columnResizing
                                    selectionMode ='multiple'
                                    selection={ this.state.selection }
                                    onSelectionChange={ this.handleListSelectionChange }
                                    onCellContextMenu={ this.handleCellContextMenu }
                                >
                                        <GridColumn field="code" title="Код" width="10%"/>
                                        <GridColumn field="name" title="Наименование" width="50%"/>
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
