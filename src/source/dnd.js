import React from 'react';
import { DataGrid, GridColumn, Draggable, Droppable, domHelper } from 'rc-easyui';

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: this.getData(),
            dragScope: null
        }
    }
    getData() {
        return [
            { "code": "FI-SW-01", "name": "Koi", "unitcost": 10.00, "status": "P", "listprice": 36.50, "attr": "Large", "itemid": "EST-1" },
            { "code": "K9-DL-01", "name": "Dalmation", "unitcost": 12.00, "status": "P", "listprice": 18.50, "attr": "Spotted Adult Female", "itemid": "EST-10" },
            { "code": "RP-SN-01", "name": "Rattlesnake", "unitcost": 12.00, "status": "P", "listprice": 38.50, "attr": "Venomless", "itemid": "EST-11" },
            { "code": "RP-SN-01", "name": "Rattlesnake", "unitcost": 12.00, "status": "P", "listprice": 26.50, "attr": "Rattleless", "itemid": "EST-12" },
            { "code": "RP-LI-02", "name": "Iguana", "unitcost": 12.00, "status": "P", "listprice": 35.50, "attr": "Green Adult", "itemid": "EST-13" },
            { "code": "FL-DSH-01", "name": "Manx", "unitcost": 12.00, "status": "P", "listprice": 158.50, "attr": "Tailless", "itemid": "EST-14" },
            { "code": "FL-DSH-01", "name": "Manx", "unitcost": 12.00, "status": "P", "listprice": 83.50, "attr": "With tail", "itemid": "EST-15" },
            { "code": "FL-DLH-02", "name": "Persian", "unitcost": 12.00, "status": "P", "listprice": 23.50, "attr": "Adult Female", "itemid": "EST-16" },
            { "code": "FL-DLH-02", "name": "Persian", "unitcost": 12.00, "status": "P", "listprice": 89.50, "attr": "Adult Male", "itemid": "EST-17" },
            { "code": "AV-CB-01", "name": "Amazon Parrot", "unitcost": 92.00, "status": "P", "listprice": 63.50, "attr": "Adult Male", "itemid": "EST-18" }
        ]
    }

    handleRowDragStart = (event, row) => {
        this.setState({
            dragScope: {
                row: row,
                event: event
            }
        });
    };

    handleRowDragOver = (row) => {
        const scope = this.state.dragScope;
        if (!scope) {
            return;
        }
        if (scope.row !== row) {
            const el = scope.event.currDroppable.el;
            const tr = domHelper.closest(el, '.datagrid-row');
            const offset = domHelper.offset(el);
            const centerTop = offset.top + domHelper.outerHeight(el) / 2;
            domHelper.removeClass(tr, 'datagrid-row-top');
            domHelper.removeClass(tr, 'datagrid-row-bottom');
            if (scope.event.top < centerTop) {
                domHelper.addClass(tr, 'datagrid-row-top')
            } else {
                domHelper.addClass(tr, 'datagrid-row-bottom')
            }
        }
    };

    handleRowDragLeave = (row) => {
        const scope = this.state.dragScope;
        const el = scope.event.currDroppable.el;
        const tr = domHelper.closest(el, '.datagrid-row');
        domHelper.removeClass(tr, 'datagrid-row-top');
        domHelper.removeClass(tr, 'datagrid-row-bottom')
    };

    handleRowDrop = (row) => {
        const scope = this.state.dragScope;
        const el = scope.event.currDroppable.el;
        const tr = domHelper.closest(el, '.datagrid-row');
        const data = this.state.data.slice();
        const fromIndex = data.indexOf(scope.row);
        data.splice(fromIndex, 1);
        const toIndex = data.indexOf(row);
        if (domHelper.hasClass(tr, 'datagrid-row-top')) {
            if (toIndex === 0) {
                data.unshift(scope.row);
            } else {
                data.splice(toIndex, 0, scope.row);
            }
        } else {
            if (toIndex === data.length - 1) {
                data.push(scope.row)
            } else {
                data.splice(toIndex + 1, 0, scope.row)
            }
        }
        domHelper.removeClass(tr, 'datagrid-row-top');
        domHelper.removeClass(tr, 'datagrid-row-bottom');
        this.setState({ data: data })
    };

    dndCol = (field, row) => {
        const proxy = () => {
            return (
                <div className="datagrid-moving-proxy">{row[field]}</div>
            )
        };
        return (
            <Draggable
                revert
                proxy={proxy}
                proxyWrap={<div></div>}
                deltaX={-5}
                deltaY={-5}
                edge={5}
                onDragStart={(event) => this.handleRowDragStart(event, row)}
            >
                <Droppable
                    onDragOver={() => this.handleRowDragOver(row)}
                    onDragLeave={() => this.handleRowDragLeave(row)}
                    onDrop={() => this.handleRowDrop(row)}
                >
                    <div>{row[field]}</div>
                </Droppable>
            </Draggable>
        )
    };

    render() {
        return (
            <div>
                <DataGrid data={this.state.data} style={{ height: 250 }}>
                    <GridColumn field="itemid" title="Item ID" cellCss="dnd"
                        render={({ row }) => this.dndCol('itemid', row)}
                    />
                    <GridColumn field="name" title="Name" cellCss="dnd"
                        render={({ row }) => this.dndCol('name', row)}
                    />
                    <GridColumn field="listprice" title="List Price" align="right"></GridColumn>
                    <GridColumn field="unitcost" title="Unit Cost" align="right"></GridColumn>
                    <GridColumn field="status" title="Status" align="center"></GridColumn>
                </DataGrid>
            </div>
        );
    }
}

export default App;