import React from 'react';
import { DataGrid, GridColumn, NumberBox, SwitchButton } from 'rc-easyui';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: this.getData()
    }
  }
  getData() {
    return [
      {
        code: "FI-SW-01",
        name: "Koi",
        unitcost: 10.0,
        status: true,
        listprice: 36.5,
        attr: "Large",
        itemid: "EST-1"
      },
      {
        code: "K9-DL-01",
        name: "Dalmation",
        unitcost: 12.0,
        status: true,
        listprice: 18.5,
        attr: "Spotted Adult Female",
        itemid: "EST-10"
      },
      {
        code: "RP-SN-01",
        name: "Rattlesnake",
        unitcost: 12.0,
        status: true,
        listprice: 38.5,
        attr: "Venomless",
        itemid: "EST-11"
      },
      {
        code: "RP-SN-01",
        name: "Rattlesnake",
        unitcost: 12.0,
        status: true,
        listprice: 26.5,
        attr: "Rattleless",
        itemid: "EST-12"
      },
      {
        code: "RP-LI-02",
        name: "Iguana",
        unitcost: 12.0,
        status: true,
        listprice: 35.5,
        attr: "Green Adult",
        itemid: "EST-13"
      },
      {
        code: "FL-DSH-01",
        name: "Manx",
        unitcost: 12.0,
        status: true,
        listprice: 158.5,
        attr: "Tailless",
        itemid: "EST-14"
      },
      {
        code: "FL-DSH-01",
        name: "Manx",
        unitcost: 12.0,
        status: true,
        listprice: 83.5,
        attr: "With tail",
        itemid: "EST-15"
      },
      {
        code: "FL-DLH-02",
        name: "Persian",
        unitcost: 12.0,
        status: true,
        listprice: 23.5,
        attr: "Adult Female",
        itemid: "EST-16"
      },
      {
        code: "FL-DLH-02",
        name: "Persian",
        unitcost: 12.0,
        status: true,
        listprice: 89.5,
        attr: "Adult Male",
        itemid: "EST-17"
      },
      {
        code: "AV-CB-01",
        name: "Amazon Parrot",
        unitcost: 92.0,
        status: true,
        listprice: 63.5,
        attr: "Adult Male",
        itemid: "EST-18"
      }
    ]
  }
  render() {
    return (
      <div>
        <h2>Cell Editing</h2>
        <DataGrid
          style={{ height: 250 }}
          data={this.state.data}
          clickToEdit
          selectionMode="cell"
          editMode="cell"
        >
          <GridColumn field="itemid" title="Item ID" editable></GridColumn>
          <GridColumn field="name" title="Name" editable></GridColumn>
          <GridColumn field="listprice" title="List Price" align="right"
            editable
            editor={({ row }) => (
              <NumberBox value={row.listprice} precision={1}></NumberBox>
            )}
          />
          <GridColumn field="unitcost" title="Unit Cost" align="right"
            editable
            editor={({ row }) => (
              <NumberBox value={row.unitcost}></NumberBox>
            )}
          />
          <GridColumn field="attr" title="Attribute" width="30%" editable></GridColumn>
          <GridColumn field="status" title="Status" align="center"
            editable
            editor={({ row }) => (
              <SwitchButton value={row.status}></SwitchButton>
            )}
            render={({ row }) => (
              <span>{String(row.status)}</span>
            )}
          />
        </DataGrid>
      </div>
    );
  }
}

export default App;