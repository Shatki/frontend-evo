import React, { Component } from 'react'
import { DataGrid, GridColumn, Dialog, LinkButton } from 'rc-easyui'
import { NumberBox, TextBox, SwitchButton, ComboBox } from  'rc-easyui'
import ContextMenu from "../context-menu";
import ErrorBoundry from "../error-boundry";
import './item-detail.css'

export default class ItemDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            itemProps: [
                //{"nameField": "uuid", "valueField": "", "titleField": "UUID", "groupField": "Основные", "editorField": "text"},
                {"nameField": "name", "valueField": "", "titleField": "Наименование", "groupField": "Основные", "editorField": "text" },
                {"nameField": "code", "valueField": "", "titleField": "Код", "groupField": "Основные", "editorField": "number" },
                {"nameField": "articleNumber", "valueField": "", "titleField": "Артикул", "groupField": "Основные", "editorField": "text" },
                {"nameField": "barCodes", "valueField": [], "titleField": "Штрихкоды", "groupField": "Коды", "editorField": "combo_add" },

                {"nameField": "price", "valueField": "", "titleField": "Цена продажи", "groupField": "Цены", "editorField": "number", "precision": 2 },
                {"nameField": "costPrice", "valueField": "", "titleField": "Цена закупки", "groupField": "Цены", "editorField": "number", "precision": 2 },
                {"nameField": "quantity", "valueField": "", "titleField": "Остаток", "groupField": "Склад", "editorField": "number" },
                {"nameField": "measureName", "valueField": this.props.measureTypes, "titleField": "Единицы", "groupField": "Цены", "editorField": "combo"},
                {"nameField": "tax", "valueField": this.props.taxTypes, "titleField": "Ставка НДС", "groupField": "Цены", "editorField": "combo" },
                {"nameField": "allowToSell", "valueField": "", "titleField": "Запрет продажи", "groupField": "Склад", "editorField": "switch" },
                {"nameField": "description", "valueField": "", "titleField": "Описание", "groupField": "Основные", "editorField": "text" },

                {"nameField": "type", "valueField": this.props.productTypes, "titleField": "Вид номенклатуры", "groupField": "Основные", "editorField": "combo" },

                {"nameField": "alcoCodes", "valueField": [], "titleField": "Алко код", "groupField": "Коды", "editorField": "combo_add" },
                {"nameField": "alcoholProductKindCode", "valueField": "", "titleField": "Код вида продукции", "groupField": "ЕГАИС", "editorField": "number" },
                {"nameField": "alcoholByVolume", "valueField": "", "titleField": "Крепкость", "groupField": "ЕГАИС", "editorField": "number", "precision": 2 },
                {"nameField": "tareVolume", "valueField": "", "titleField": "Объем тары", "groupField": "ЕГАИС", "editorField": "number", "precision": 2 },

                {"nameField": "group", "valueField": "", "titleField": "Группа", "groupField": "Основные", "editorField": "switch" },
                {"nameField": "parentUuid", "valueField": "", "titleField": "Группа товаров", "groupField": "Основные", "editorField": "text" },
            ],
            itemData : [],
            data: [],
            editingRow: null,
            comboDlgTitle: "Редактирование кодов",
            comboDlgClosed: true
        };
    }

    editComboValues = (row, value) => {
        console.log(row, value);
        //this.setState({ itemProps.valueField: value })}
    };

    handleClickComboValueChange = (row) => {
        //this.setState();
        console.log(row);
    };

    updateData = () => {
        const { itemData } = this.props;
        // Преобразование для групповых свойств
        // Todo: тут кривой временный код
        return this.state.itemProps.map((property) => {
            if(itemData !== null){
                // Todo: доработать: Если данных нет null или [], то пробуем взять их из data
                if (property["editorField"] !== "combo")
                    property.valueField = itemData[property.nameField];
                //console.log(property);
            }
            return property;
        })
    };

    handleItemContextMenu = ({ row, column, originalEvent }) => {
        originalEvent.preventDefault();
        console.log(row.nameField);
        this.menu.showContextMenu(originalEvent.pageX, originalEvent.pageY)
    };

    handleItemClick = (value) => {
        console.log(value);
    };

    renderComboEditDialog = () => {
        const { comboDlgTitle, comboDlgClosed } = this.state;
        return(
            <Dialog
                title= { comboDlgTitle }
                closed = { comboDlgClosed }
                style={{ width: 400, height: 200 }}
                bodyCls="f-column"
                modal
                onClose={() => this.setState({ comboDlgClosed: true })}
                ref={ref => this.dlg = ref}
            >
                <div className="dialog-toolbar">
                    <LinkButton iconCls="icon-edit" plain>Edit</LinkButton>
                    <LinkButton iconCls="icon-help" plain>Help</LinkButton>
                </div>
                <div className="f-full">
                    <p style={{ textAlign: 'center', margin: '20px 0', fontSize: '16px' }}>The Dialog Content.</p>


                </div>
                <div className="dialog-button">
                    <LinkButton style={{ width: 80 }}>Сохранить</LinkButton>
                    <LinkButton
                        onClose={() => this.setState({ comboDlgClosed: true })}
                        style={{ width: 80 }}>Отмена</LinkButton>
                </div>
            </Dialog>
        )
    };

    renderView = ({ row }) => {
        if (row.editorField === "text")
            return(<div>{ row.valueField }</div>);
        else if (row.editorField === "number")
            return(<div>{ row.valueField }</div>);
        else if (row.editorField === "switch")
            return(<SwitchButton value={row.valueField}/>);
        else if (row.editorField === "combo") {
                let combo = row.valueField.find(item => (item.value === row.valueField));
                if (combo === undefined)
                // Todo: Ошибка в данных. нужна валидация
                    combo = row.valueField[0];
                return(<div>{ combo.text }</div>);
        }
        else if (row.editorField === "combo_add") {
                if(row.valueField !== undefined && row.valueField.length > 0){
                    return(<div>{ row.valueField[0] }</div>);
                }
                else{
                    return(<div/>);
                }
        }
    };

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
            return(<SwitchButton value={ row.valueField }/>);
        else if (row.editorField === "combo")
            return(<ComboBox data={ row.valueField } value={ row.valueField }
                //onChange={(value) => this.setState({ value: value })}
            />);
        else if (row.editorField === "combo_add"){
            const comboData = row.valueField.map((code)=>{ return { value: code, text: code} });
            return(<ComboBox
                data={ comboData }
                value={ row.valueField[0] }
                editable={ false }
                //onChange={(value) => { this.editComboValues(row, value) }}
                addonRight={() => (
                        <span
                            className="textbox-icon icon-evotor-edit"
                            title="Править коды"
                            onClick = { ()=>this.handleClickComboValueChange(row) }>
                        </span>
                )}
            />);
        }
    };

    renderContextMenu = (menu) => {
        return(
            <ContextMenu
                menu = { menu }
                menuRef = { (ref)=>this.menu=ref }
                handleItemClick = { this.handleContextMenuClick }
            />
        )
    };

    render() {
        return(
            <ErrorBoundry>
                <DataGrid
                    data={ this.updateData() }
                    columnResizing
                    clickToEdit
                    expanderWidth ={ 20 }
                    selectionMode="row"
                    editMode="row"
                    groupField="groupField"
                    renderGroup={ this.renderGroup }
                    onCellContextMenu={ this.handleItemContextMenu }>

                    <GridColumn width={ 20 }/>
                    <GridColumn field="titleField" title="Имя поля" width="40%"/>
                    <GridColumn field="valueField" title="Параметр" width="60%"
                                editable
                                editor={ this.renderEditor }
                                render={ this.renderView }
                    />
                </DataGrid>
                { this.renderContextMenu(this.props.contextMenu) }
                { this.renderComboEditDialog() }
            </ErrorBoundry>
        )

    }
}