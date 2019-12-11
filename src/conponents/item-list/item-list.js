import React, { Component } from 'react';
import { DataGrid, GridColumn, NumberBox, ComboBox} from 'rc-easyui';
import { Draggable, dropCls, dragCls } from 'rc-easyui';
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
        };
        //this.updateItemList();
    }

    componentDidMount() {
        this.setState({
            data: this.props.data
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
        console.log(selection);
        // Вызываем для сохранения стейта в Дашбоард
        if (this.state.editingNode !== null) this.list.cancelEdit();

        // Сохраним в стейт
        this.setState({
            selection: selection
        });

        this.props.handleListSelectionChange(selection);
    };

    handleContextMenuClick = (value) =>{
        console.log(value);
    };

    renderColumn = ({ value, row, rowIndex }) => {
        // style={{ width: '200px', height: '200px', border: '1px solid #ccc' }}
        const item = (proxy) => {
            if (!proxy){
                return (
                    <div >
                        { row.name }
                    </div>
                );
            }else {
                const { selection } = this.state;
                let items = row.name;

                if(selection && selection.length > 1 ) {
                    items = this.state.selection.map((item)=>{
                        return(
                            <div key = { item.uuid } style={{ border: '1px solid #ccc', backgroundColor: "#aaa" }}>
                                { item.name }
                            </div>
                        )
                    });
                }
                return (
                    <div>
                        { items }
                    </div>
                )
            }
        };

        return (
            <Draggable revert proxy={() => item(true)}>
                { item() }
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
                                        <GridColumn field="code" title="Код" width="10%"/>
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
