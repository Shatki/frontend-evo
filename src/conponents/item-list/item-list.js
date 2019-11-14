import React, { Component } from 'react';
import { DataGrid, GridColumn, NumberBox, ComboBox} from 'rc-easyui';
import { ContextMenu } from "./context-menu";
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

    handleCellContextMenu({ row, column, originalEvent }){
        originalEvent.preventDefault();
        this.props.menu.current.showContextMenu(originalEvent.pageX, originalEvent.pageY)
    }

    render() {
        const { onListSelectionChange, listData, measureTypes, menu } = this.props;
        return (
            <div>
                <DataGrid
                    style={{ height: 'calc(100vh - 60px)' }}
                    filterable
                    rowCss={this.renderRow}
                    data={ listData }
                    columnMoving
                    onCellDblClick = { this.onDblClick }
                    columnResizing
                    selectionMode ='multiple'
                    selection={ this.state.selection }
                    onSelectionChange={ onListSelectionChange }
                    onCellContextMenu={this.handleCellContextMenu.bind(this)}
                >
                    <GridColumn field="code" title="Код" width="10%"/>
                    <GridColumn field="name" title="Наименование" width="50%"/>
                    <GridColumn field="price" title="Цена продаж" width="10%" align="right"
                                filterOperators={ this.state.operators }
                                filter={() => <NumberBox/>}
                    />
                    <GridColumn field="quantity" title="Остаток" align="right" width="10%"
                                filterOperators={ this.state.operators }
                                filter={() => <NumberBox/>}
                    />
                    <GridColumn field="description" title="Описание" width="10%"/>
                    <GridColumn field="measureName" title="Единицы" width="10%" align="center"
                                filter={() => (
                                    <ComboBox
                                        data={ measureTypes }
                                        editable={ false }
                                        inputStyle={{ textAlign: 'center' }}
                                    />
                                )}
                    />
                </DataGrid>
                <ContextMenu menu = { menu }/>
            </div>
        );
    }

}