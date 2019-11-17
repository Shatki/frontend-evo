import React, { Component } from 'react'
import { DataGrid, GridColumn } from 'rc-easyui'
import { NumberBox, TextBox, SwitchButton, ComboBox } from  'rc-easyui'
import ContextMenu from "../context-menu";
import './item-detail.css'
import { Menu, MenuItem, SubMenu } from 'rc-easyui';


export default class ItemDetail extends Component {

    constructor(props) {
        super(props);
        this.itemProps = [
            //{"nameField": "uuid", "valueField": "", "titleField": "UUID", "groupField": "Основные", "editorField": "text"},
            {"nameField": "name", "valueField": "", "titleField": "Наименование", "groupField": "Основные", "editorField": "text" },
            {"nameField": "code", "valueField": "", "titleField": "Код", "groupField": "Основные", "editorField": "number"},
            {"nameField": "articleNumber", "valueField": "", "titleField": "Артикул", "groupField": "Основные", "editorField": "text"},
            {"nameField": "barCodes", "valueField": "", "titleField": "Штрихкоды", "groupField": "Коды", "editorField": "text"},

            {"nameField": "price", "valueField": "", "titleField": "Цена продажи", "groupField": "Цены", "editorField": "number", "precision": 2},
            {"nameField": "costPrice", "valueField": "", "titleField": "Цена закупки", "groupField": "Цены", "editorField": "number", "precision": 2},
            {"nameField": "quantity", "valueField": "", "titleField": "Остаток", "groupField": "Склад", "editorField": "number" },
            {"nameField": "measureName", "valueField": "", "titleField": "Единицы", "groupField": "Цены", "editorField": "combo", "comboValues": this.props.measureTypes},
            {"nameField": "tax", "valueField": "", "titleField": "Ставка НДС", "groupField": "Цены", "editorField": "combo", "comboValues": this.props.taxTypes},
            {"nameField": "allowToSell", "valueField": "", "titleField": "Запрет продажи", "groupField": "Склад", "editorField": "switch"},
            {"nameField": "description", "valueField": "", "titleField": "Описание", "groupField": "Основные", "editorField": "text"},

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
            data: [],
            menu: [
                { key: "create", text: "Создать", disabled: false, submenu: [
                        { key: "save", text:"Сохранить", disabled: false, iconCls: "icon-save" },
                        { key: "menu1", text:"Меню1", disabled: false },
                        { key: "menu2", text:"Меню1", disabled: false },
                    ]  },
                { key: "print", text: "Печатать", disabled: true, iconCls: "icon-print" },
                { key: "close", text: "Закрыть", disabled: false },
            ],
        };
    }

    renderGroup = ({ value, rows }) =>{
        return (
            <span style={{ fontWeight:'bold'}}>{value} - <span style={{ color:'red' }}>{ rows.length }</span> свойств(а)
      </span>
        )
    };

    renderEditor = ({ row }) =>{
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

    };

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

    updateData() {
        const { itemData } = this.props;
        // Преобразование для групповых свойств
        // Todo: тут кривой временный код
        return this.itemProps.map((property) => {
            property.valueField = itemData[0][property.nameField];
            return property;
        })
    }

    componentDidMount() {
        //this.setState({
        //    data: this.updateData()
        //})
    }

    handleItemContextMenu({ row, column, originalEvent }) {
        originalEvent.preventDefault();
        console.log(row.nameField);
        this.props.menuRef.current.showContextMenu(originalEvent.pageX, originalEvent.pageY)
    }

    handleItemClick(value){
        console.log(value);
    }

    render() {
        return (
            <div >
                <DataGrid
                    data={ this.updateData() }
                    columnResizing
                    clickToEdit
                    expanderWidth ={ 20 }
                    selectionMode="row"
                    editMode="row"
                    groupField="groupField"
                    renderGroup={ this.renderGroup }
                    onCellContextMenu={this.handleItemContextMenu.bind(this)}>

                    <GridColumn width={ 20 }/>
                    <GridColumn field="titleField" title="Имя поля"/>
                    <GridColumn field="valueField" title="Параметр"
                                editable
                                editor={ this.renderEditor }
                                render={ this.renderView }
                    />
                </DataGrid>
                <ContextMenu
                    menuRef={ this.props.menuRef }
                    menu={ this.state.menu }
                    handleItemClick={ this.handleItemClick }/>
            </div>
        );
    }
}