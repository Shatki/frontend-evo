import React, { Component } from 'react';
import { DataGrid, GridColumn, NumberBox, ComboBox} from 'rc-easyui';
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

    onDblClick({ row }){
        console.log(row.name);
    }

    onDataLoaded = (data) => {
        this.setState({
            data,
            loading: false
        })
    };

    render() {
        const { onListSelectionChange, listData, measureTypes } = this.props;

        return (
            <div>
                <DataGrid
                        style={{ height: 'calc(100vh - 60px)' }}
                        filterable
                        data={ listData }
                        columnMoving
                        onCellDblClick = { this.onDblClick }
                        columnResizing
                        selectionMode ='multiple'
                        selection={ this.state.selection }
                        onSelectionChange={ onListSelectionChange }>
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
            </div>
        );
    }

}