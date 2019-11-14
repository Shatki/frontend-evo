import React, { Component } from 'react';
import { DataGrid, GridColumn, NumberBox, ComboBox} from 'rc-easyui';
import { ContextMenu } from "../context-menu/context-menu";
import './item-list.css';
import Spinner from "../spinner";



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
        //this.onDataLoaded()
    }

    renderRow(row) {
        // Придаем стиль nodes строкам
        if (row.group) {
            //console.log(row.name);
            // background: "#b8eecf", fontSize: "14px",
            return { fontWeight: "bold" };
        }
        return null;
    }

    onDataLoaded = (data) => {
        this.setState({
            data,
            loading: false
        })
    };

    onDblClick({ row }){
        console.log(row.name);
    }

    handleCellContextMenu = ({ row, column, originalEvent }) =>{
        originalEvent.preventDefault();
        console.log(row.name);
        this.props.menuRef.current.showContextMenu(originalEvent.pageX, originalEvent.pageY)
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
            <div>
                <DataGrid
                    style={{ height: 'calc(100vh - 60px)' }}
                    filterable
                    rowCss={this.renderRow}
                    data={ this.props.listData }
                    columnMoving
                    onCellDblClick = { this.onDblClick }
                    columnResizing
                    selectionMode ='multiple'
                    selection={ this.state.selection }
                    onSelectionChange={ this.props.onListSelectionChange }
                    onCellContextMenu={ this.handleCellContextMenu.bind(this)}
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
                <ContextMenu menuRef = { this.props.menuRef } menu = { [] }/>
            </div>
        );
    }

}