import React, { Component } from 'react'
import { DataGrid, GridColumn } from 'rc-easyui'
import { NumberBox, TextBox } from  'rc-easyui'

import './item-detail.css'

export default class ItemDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: this.renderData()
        }
    };

    jsonData = [
        {
            "uuid": "01ba18b6-8707-5f47-3d9c-4db058054cb2",
            "code": "6",
            "barCodes": [
                "2000000000060"
            ],
            "alcoCodes": [
                "0000000000000000001"
            ],
            "name": "Сидр",
            "price": 123.12,
            "quantity": 12,
            "costPrice": 100.123,
            "measureName": "шт",
            "tax": "VAT_18",
            "allowToSell": true,
            "description": "Вкусный яблочный сидр.",
            "articleNumber": "сид123",
            "parentUuid": "1ddea16b-971b-dee5-3798-1b29a7aa2e27",
            "group": false,
            "type": "ALCOHOL_NOT_MARKED",
            "alcoholByVolume": 5.45,
            "alcoholProductKindCode": 123,
            "tareVolume": 0.57
        }
    ];

    itemProps = [
        //{"nameField": "uuid", "valueField": "", "titleField": "UUID", "groupField": "Основные", "editorField": "text"},
        {"nameField": "code", "valueField": "", "titleField": "Код", "groupField": "Основные", "editorField": "number"},
        {"nameField": "barCodes", "valueField": "", "titleField": "Штрихкоды", "groupField": "Коды", "editorField": "text" },
        {"nameField": "name", "valueField": "", "titleField": "Наименование", "groupField": "Основные", "editorField": "text" },
        {"nameField": "price", "valueField": "", "titleField": "Цена продажи", "groupField": "Цены", "editorField": "number", "precision": 2},
        {"nameField": "quantity", "valueField": "", "titleField": "Остаток", "groupField": "Цены", "editorField": "text" },
        {"nameField": "costPrice", "valueField": "", "titleField": "Цена закупки", "groupField": "Цены", "editorField": "number", "precision": 2},
        {"nameField": "measureName", "valueField": "", "titleField": "Единицы", "groupField": "Цены", "editorField": "text"},
        {"nameField": "tax", "valueField": "", "titleField": "Ставка НДС", "groupField": "Цены", "editorField": "text"},
        {"nameField": "allowToSell", "valueField": "", "titleField": "Запрет продажи", "groupField": "Цены", "editorField": "switch"},
        {"nameField": "description", "valueField": "", "titleField": "Описание", "groupField": "Основные", "editorField": "text"},
        {"nameField": "articleNumber", "valueField": "", "titleField": "Артикул", "groupField": "Основные", "editorField": "text"},
        {"nameField": "type", "valueField": "", "titleField": "Вид номенклатуры", "groupField": "Основные", "editorField": "text"},

        {"nameField": "alcoCodes", "valueField": "", "titleField": "Алко код", "groupField": "Коды", "editorField": "text"},
        {"nameField": "alcoholProductKindCode", "valueField": "", "titleField": "Код вида продукции", "groupField": "ЕГАИС", "editorField": "number"},
        {"nameField": "alcoholByVolume", "valueField": "", "titleField": "Крепкость", "groupField": "ЕГАИС", "editorField": "number", "precision": 2},
        {"nameField": "tareVolume", "valueField": "", "titleField": "Объем тары", "groupField": "ЕГАИС", "editorField": "number", "precision": 2},

        {"nameField": "group", "valueField": "", "titleField": "Группа", "groupField": "Основные", "editorField": "switch"},
        {"nameField": "parentUuid", "valueField": "", "titleField": "Группа товаров", "groupField": "Основные", "editorField": "text"},

    ];

    renderGroup({ value, rows }) {
        return (
            <span style={{fontWeight:'bold'}}>{value} - <span style={{color:'red'}}>{rows.length}</span> свойств(а)
      </span>
        )
    }

    renderData() {
        // Преобразование для групповых свойств
        const data = this.jsonData[0];

        return this.itemProps.map((property) => {
            property.valueField = data[property.nameField];
            return property;
        })
    }

    dynamicEditor({ row }){
        if (row.editorField === "number")
            return(<NumberBox value={row.valueField} precision={row.precision}/>);
        else if (row.editorField === "text")
            return(<TextBox value={row.valueField} placeholder={row.titleField}/>)

    }

    render() {
        return (
            <div>
                <DataGrid data={ this.state.data }
                          //columnResizing
                          clickToEdit
                          selectionMode="row"
                          editMode="row"
                          //groupField="groupField"
                          //renderGroup={ this.renderGroup }
                          style={{ height: 600 }}>
                    <GridColumn field="rn" align="center" width="20px"
                                cellCss="datagrid-td-rownumber"
                                //render={({rowIndex}) => (
                                //    <span>{rowIndex+1}</span>
                                //)}
                    />
                    <GridColumn field="titleField" title="Имя поля"/>
                    <GridColumn field="valueField" title="Параметр"
                                editable
                                //editor={ this.dynamicEditor }
                    />
                </DataGrid>
            </div>
        );
    }
}