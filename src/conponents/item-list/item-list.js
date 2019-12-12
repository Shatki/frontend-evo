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
            selection: null,
            data: [],
            drag: []
        };
        //this.updateItemList();
    }

    componentDidMount() {
        this.setState({
            data: this.props.data,
            selection: null
        })
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

    handleDblClick = ({ row }) =>{
        console.log(row.name);
    };

    handleCellContextMenu = ({ row, column, originalEvent }) =>{
        originalEvent.preventDefault();
        console.log(row.name);
        this.menu.showContextMenu(originalEvent.pageX, originalEvent.pageY)
    };

    handleSelectionChange = (selection) => {
        // Вызываем для сохранения стейта в Дашбоард
        if (this.state.editingNode !== null) this.list.cancelEdit();

        // Сохраним в стейт
        this.setState({
            selection: selection
        });
    };

    handleContextMenuClick = (value) =>{
        console.log(value);
    };

    handleRowDragStart = (event, row) => {
        //  Либо выделенные элементы либо один, что выбран
        const items = this.state.selection.length > 0 ? this.state.selection: [row];
        this.props.onDrag(items);
    };

    renderColumn = ({ value, row, rowIndex }) => {
        // style={{ width: '200px', height: '200px', border: '1px solid #ccc' }}
        const proxy = () => {
            const { selection } = this.state;
            let items = row.name;

            if(selection && selection.length > 1 ) {
                items = this.state.selection.map((item)=>{
                    return(
                        <div key = { item.uuid } className="datagrid-moving-proxy">
                            { item.name }
                        </div>
                    )
                });
            }
            return (
                <div className="datagrid-moving-proxy">
                    { items }
                </div>
            )
        };

        return (
            <Draggable
                revert
                proxyWrap={ <div></div> }
                deltaX={ -5 }
                deltaY={ -5 }
                edge={ 5 }
                proxy={ proxy }
                onDragStart={(event) => this.handleRowDragStart(event, row)}
                // Отмена выделений после перетаскивания
                onDragEnd = { this.setState({ selection: [] }) }>
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
                                    columnMoving
                                    onCellDblClick = { this.handleDblClick }
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
