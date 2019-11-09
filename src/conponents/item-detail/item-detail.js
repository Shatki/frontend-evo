import React, { Component } from 'react'
import { DataGrid, GridColumn } from 'rc-easyui'
import { NumberBox, TextBox, SwitchButton, ComboBox } from  'rc-easyui'

import './item-detail.css'

export default class ItemDetail extends Component {
    constructor(props) {
        super(props);
        let itemProps = [
                //{"nameField": "uuid", "valueField": "", "titleField": "UUID", "groupField": "Основные", "editorField": "text"},
                {"nameField": "code", "valueField": "", "titleField": "Код", "groupField": "Основные", "editorField": "number"},
                {"nameField": "barCodes", "valueField": "", "titleField": "Штрихкоды", "groupField": "Коды", "editorField": "text"},
                {"nameField": "name", "valueField": "", "titleField": "Наименование", "groupField": "Основные", "editorField": "text" },
                {"nameField": "price", "valueField": "", "titleField": "Цена продажи", "groupField": "Цены", "editorField": "number", "precision": 2},
                {"nameField": "quantity", "valueField": "", "titleField": "Остаток", "groupField": "Цены", "editorField": "number" },
                {"nameField": "costPrice", "valueField": "", "titleField": "Цена закупки", "groupField": "Цены", "editorField": "number", "precision": 2},
                {"nameField": "measureName", "valueField": "", "titleField": "Единицы", "groupField": "Цены", "editorField": "combo", "comboValues": this.props.measureTypes},
                {"nameField": "tax", "valueField": "", "titleField": "Ставка НДС", "groupField": "Цены", "editorField": "combo", "comboValues": this.props.taxTypes},
                {"nameField": "allowToSell", "valueField": "", "titleField": "Запрет продажи", "groupField": "Цены", "editorField": "switch"},
                {"nameField": "description", "valueField": "", "titleField": "Описание", "groupField": "Основные", "editorField": "text"},
                {"nameField": "articleNumber", "valueField": "", "titleField": "Артикул", "groupField": "Основные", "editorField": "text"},
                {"nameField": "type", "valueField": "", "titleField": "Вид номенклатуры", "groupField": "Основные", "editorField": "combo", "comboValues": this.props.productTypes},

                {"nameField": "alcoCodes", "valueField": "", "titleField": "Алко код", "groupField": "Коды", "editorField": "text"},
                {"nameField": "alcoholProductKindCode", "valueField": "", "titleField": "Код вида продукции", "groupField": "ЕГАИС", "editorField": "number"},
                {"nameField": "alcoholByVolume", "valueField": "", "titleField": "Крепкость", "groupField": "ЕГАИС", "editorField": "number", "precision": 2},
                {"nameField": "tareVolume", "valueField": "", "titleField": "Объем тары", "groupField": "ЕГАИС", "editorField": "number", "precision": 2},

                {"nameField": "group", "valueField": "", "titleField": "Группа", "groupField": "Основные", "editorField": "switch"},
                {"nameField": "parentUuid", "valueField": "", "titleField": "Группа товаров", "groupField": "Основные", "editorField": "text"},

            ];
        this.state = {

            itemData : [],
            data: []
        };
    }

    renderGroup({ value, rows }) {
        return (
            <span style={{ fontWeight:'bold' }}>{value} - <span style={{ color:'red' }}>{ rows.length }</span> свойств(а)
      </span>
        )
    }

    renderData() {
        const { itemData } = this.props;
        // Преобразование для групповых свойств
        // Todo: тут кривой временный код
        console.log(itemData[0]);

        return this.itemProps.map((property) => {
            property.valueField = itemData[0][property.nameField];
            return property;
        })
    }

    renderEditor({ row }){
        if (row.editorField === "number")
            return(<NumberBox value={ row.valueField } precision={ row.precision }/>);
        else if (row.editorField === "text")
            return(<TextBox value={ row.valueField } placeholder={ row.titleField }/>);
        else if (row.editorField === "switch")
            return(<SwitchButton value={row.valueField}/>);
        else if (row.editorField === "combo")
            return(<ComboBox data={ row.comboValues } value={ row.valueField }
                //onChange={(value) => this.setState({ value: value })}
            />);

    }

    renderView({ row }) {
        if (row.editorField === "text")
            return(<div>{ row.valueField }</div>);
        else if (row.editorField === "number")
            return(<div>{ row.valueField }</div>);
        else if (row.editorField === "switch")
            return(<SwitchButton value={row.valueField}/>);
        else if (row.editorField === "combo") {
            let tax = row.comboValues.find(item => (item.value === row.valueField));
            if (tax === undefined)
                // Todo: Ошибка в данных. нужна валидация
                tax = row.comboValues[0];
            return(<div>{ tax.text }</div>);
        }
    }

    componentDidMount() {
        this.setState({
            data: this.renderData()
        })
    }

    render() {
        const { taxTypes, productTypes } = this.props;
        const { data } = this.state.data;

        return (
            <div>
                <DataGrid data={ data }
                          columnResizing
                          clickToEdit
                          selectionMode="row"
                          editMode="row"
                          groupField="groupField"
                          renderGroup={ this.renderGroup }
                          style={{ height: 600 }}>
                    <GridColumn field="rn" align="center" width="20px"
                                cellCss="datagrid-td-rownumber"
                        //
                        // render={({rowIndex}) => (
                        //    <span>{rowIndex+1}</span>
                        //)}
                    />
                    <GridColumn field="titleField" title="Имя поля"/>
                    <GridColumn field="valueField" title="Параметр"
                                editable
                                editor={ this.renderEditor }
                                render={ this.renderView }
                    />
                </DataGrid>
            </div>
        );
    }
}