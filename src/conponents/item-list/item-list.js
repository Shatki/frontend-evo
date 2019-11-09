import React, { Component } from 'react';
import EvotorService from '../../services/evotor-service'
import { DataGrid, GridColumn, NumberBox, ComboBox} from 'rc-easyui';
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
    }

    handleRowCheck(row, checked) {
        let data = this.state.data.slice();
        let index = this.state.data.indexOf(row);
        data.splice(index, 1, Object.assign({}, row, { selected: checked }));
        let checkedRows = data.filter(row => row.selected);
        this.setState({
            allChecked: data.length === checkedRows.length,
            rowClicked: true,
            data: data
        }, () => {
            this.setState({ rowClicked: false })
        });
    }

    handleAllCheck(checked) {
        if (this.state.rowClicked) {
            return;
        }
        let data = this.state.data.map(row => {
            return Object.assign({}, row, { selected: checked })
        });
        this.setState({
            allChecked: checked,
            data: data
        })
    }

    selectionInfo() {
        const { selection } = this.state;
        if (!selection) {
            return null;
        }
        return selection.map(function (row) { return row.code }).join(",");

    }

    onDblClick({ row }){
        console.log(row.name);
    }

    render() {
        const { data, measureTypes } = this.props;

        return (
            <div>
                <DataGrid filterable data={ data } columnMoving style={{ height:550 }}
                          onCellDblClick = { this.onDblClick }
                          columnResizing
                          selectionMode='multiple'
                          selection={this.state.selection}
                          onSelectionChange={(selection) => this.setState({ selection: selection })}>
                    <GridColumn field="code" title="Код" width="10%"/>
                    <GridColumn field="name" title="Наименование" width="50%"/>
                    <GridColumn field="price" title="Цена продаж" width="10%" align="right"
                                filterOperators={this.state.operators}
                                filter={() => <NumberBox/>}
                    />
                    <GridColumn field="quantity" title="Остаток" align="right" width="10%"
                                filterOperators={this.state.operators}
                                filter={() => <NumberBox/>}
                    />
                    <GridColumn field="description" title="Описание" width="10%"/>
                    <GridColumn field="measureName" title="Единицы" width="10%" align="center"
                                filter={() => (
                                    <ComboBox
                                        data={ measureTypes }
                                        editable={false}
                                        inputStyle={{ textAlign: 'center' }}
                                    />
                                )}
                    />
                </DataGrid>
                <p>You selected: {this.selectionInfo()}</p>
            </div>
        );
    }

}