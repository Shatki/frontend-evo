import React, { Component } from 'react';
import EvotorService from '../../services/evotor-service'
import { DataGrid, GridColumn, NumberBox, ComboBox} from 'rc-easyui';
import './item-list.css';

export default class ItemList extends Component {
    evotorService = new EvotorService();

    state = {
        operators: ["nofilter", "equal", "notequal", "less", "greater"],
        status: [
            { value: null, text: "All" },
            { value: "P", text: "P" },
            { value: "N", text: "N" }
        ],
        data: [
            {"code":"FI-SW-01","name":"Koi","unitcost":10.00,"status":"P","listprice":36.50,"attr":"Large","itemid":"EST-1"},
            {"code":"K9-DL-01","name":"Dalmation","unitcost":12.00,"status":"P","listprice":18.50,"attr":"Spotted Adult Female","itemid":"EST-10"},
            {"code":"RP-SN-01","name":"Rattlesnake","unitcost":12.00,"status":"P","listprice":38.50,"attr":"Venomless","itemid":"EST-11"},
            {"code":"RP-SN-01","name":"Rattlesnake","unitcost":12.00,"status":"P","listprice":26.50,"attr":"Rattleless","itemid":"EST-12"},
            {"code":"RP-LI-02","name":"Iguana","unitcost":12.00,"status":"P","listprice":35.50,"attr":"Green Adult","itemid":"EST-13"},
            {"code":"FL-DSH-01","name":"Manx","unitcost":12.00,"status":"P","listprice":158.50,"attr":"Tailless","itemid":"EST-14"},
            {"code":"FL-DSH-01","name":"Manx","unitcost":12.00,"status":"P","listprice":83.50,"attr":"With tail","itemid":"EST-15"},
            {"code":"FL-DLH-02","name":"Persian","unitcost":12.00,"status":"P","listprice":23.50,"attr":"Adult Female","itemid":"EST-16"},
            {"code":"FL-DLH-02","name":"Persian","unitcost":12.00,"status":"P","listprice":89.50,"attr":"Adult Male","itemid":"EST-17"},
            {"code":"AV-CB-01","name":"Amazon Parrot","unitcost":92.00,"status":"P","listprice":63.50,"attr":"Adult Male","itemid":"EST-18"}
        ]
    };

    constructor(props) {
        super(props);
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
        return selection.map(function (row) { return row.itemid }).join(",");

    }

    render() {
        return (
            <div>
                <DataGrid filterable data={this.state.data} columnMoving style={{height:550}}
                          columnResizing
                          selectionMode='multiple'
                          selection={this.state.selection}
                          onSelectionChange={(selection) => this.setState({ selection: selection })}>
                    <GridColumn field="itemid" title="Артикул"/>
                    <GridColumn field="name" title="Наименование"/>
                    <GridColumn field="listprice" title="Цена" align="right"
                                filterOperators={this.state.operators}
                                filter={() => <NumberBox/>}
                    />
                    <GridColumn field="unitcost" title="Остаток" align="right"
                                filterOperators={this.state.operators}
                                filter={() => <NumberBox/>}
                    />
                    <GridColumn field="attr" title="Атрибут" width="30%"/>
                    <GridColumn field="status" title="Единицы" align="center"
                                filter={() => (
                                    <ComboBox
                                        data={this.state.status}
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