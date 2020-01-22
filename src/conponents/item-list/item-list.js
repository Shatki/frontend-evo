import React, { Component } from 'react';
import { DataGrid, GridColumn, NumberBox, ComboBox } from 'rc-easyui';
import { Draggable } from 'rc-easyui';
import { Form, Dialog, TextBox, Label, LinkButton } from 'rc-easyui';
import ContextMenu from "../context-menu";
import './item-list.css';
import ErrorBoundry from "../error-boundry";



export default class ItemList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data: [],
            nodeView: props.nodeView,
            operators: ["nofilter", "equal", "notequal", "less", "greater"],
            allChecked: false,
            rowClicked: false,
            selection: [],
            drag: [],

            editingRow: null,
            model: {},
            rules: {
                'code': 'required',
                'name': ['required', 'length[1,100]'],
                'measureName': ['required']
            },
            errors: {},
            title: '',
            closed: true,
            collapsed: props.collapsed,
        };
        this.listContextMenuFunction = [
            { key: "Создать", function: this.handleListRowCreate },
            { key: "Изменить", function: this.handleRowDblClick },
            { key: "Открыть", function: this.handleRowDblClick },   // для row.group === true
            { key: "Копировать", function: this.handleListRowCopy },
            { key: "Вставить", function: this.handleListRowPaste },
            { key: "Дублировать", function: this.handleListRowDublicate },
            { key: "Удалить", function: this.handleListRowDelete },
            { key: "Закрыть", function: this.handleContextMenuClose },
        ]
        this.onListNodeSelection = props.onListNodeSelection;
        this.onListItemSelection = props.onListItemSelection;

        // Сохраним сеттер keyboard events listener для передачи другим компонентам
        this.setKeyboardEventsListener = props.setKeyboardEventsListener;
    }

    /* ----------------- Lifecycle methods -------------------------------------------- */
    componentDidMount() {
        this.updateData();
    }

    componentDidUpdate(prevProps, prevState) {
        if(prevProps.data !== this.props.data)
            this.updateData();
    }

    /* ----------------- Data operations ---------------------------------------------- */
    updateData = () => {
        const { data, nodeView } = this.props;
        this.setState({
            data,
            nodeView,
            loading: false
        })
    };

    getError = (name) => {
        const { errors } = this.state;
        if (!errors){
            return null;
        }
        return errors[name] && errors[name].length
            ? errors[name][0]
            : null;
    };
    /* ----------------- Keyboard event functions ------------------------------------- */



    /* ----------------- Обработка событий ItemList ----------------------------------- */
    handleRowDblClick = (row) =>{
        const { collapsed } = this.props;
        this.changeSelections([row]);  // ???? Нужно ли??
        // реакция на двойной клик
        if(row.group){
            this.onListNodeSelection(row);
        }else{
            this.onListItemSelection(row);
            if(collapsed)
                // Редактирование в модальном режиме
                this.editRow(row);
        }
    };

    handleRowDragStart = (event, row) => {
        //  Либо выделенные элементы либо один, что выбран
        const items = this.state.selection.length > 0 ? this.state.selection: [row];
        this.props.onDrag(items);
    };

    changeSelections = (selection=[]) => {
        // Основная функция изменения выделений строк в ItemList
        // Сохраним в стейт
        this.setState({
            selection: selection,
        });
    };

    handleCellContextMenu = ({ row, column, originalEvent }) =>{
        originalEvent.preventDefault();
        // При контекстном меню отменим выделения
        this.changeSelections([row]);
        this.menu.showContextMenu(originalEvent.pageX, originalEvent.pageY);
    };

    handleSelectionChange = (selection) => {
        // Вызываем для сохранения стейта в Дашбоард
        if (this.state.editingNode !== null) this.list.cancelEdit();
        this.changeSelections(selection)
    };

    handleContextMenuClick = (value) =>{
        this.listContextMenuFunction
            .find(m => m.key === value)
            // выбираем [0] т.к e ItemList selections это массив
            .function(this.state.selection[0]);
    };

    handleContextMenuClose = (row) =>{
        this.list.cancelEdit();
    };

    // ItemList => Close menu
    handleListRowCreate = (row) =>{
        console.log("Создаем новый row ", row);
    };

    handleListRowDelete = (row) =>{
        ///////
        this.setState({
            data: this.state.data.filter(item => item.uuid !== row.uuid)
        });
        //console.log("Удляем row ", row);
    };

    handleListRowCopy = (row) =>{
        console.log("Копируем row", row);
    };

    handleListRowPaste = (row) =>{
        console.log("Вставляем скопированный row", row);
    };

    handleListRowDublicate = (row) =>{
        console.log("Дублируем row", row);
    };

    /* ----------------- Обработка формы редактирования ------------------------------- */
    editRow = (row) => {
        this.setState({
            editingRow: row,
            model: Object.assign({}, row),
            title: 'Редактирование товара',
            closed: false
        });
    };

    saveRow = () => {
        this.form.validate(() => {
            if (this.form.valid()) {
                let row = Object.assign({}, this.state.editingRow, this.state.model);
                let data = this.state.data.slice();
                let index = data.indexOf(this.state.editingRow);
                data.splice(index, 1, row);
                this.setState({
                    data: data,
                    closed: true
                })
            }
        })
    };

    dialogBtnClose = () => {
       this.setState({ closed: true });
    };

    /* ----------------- Render методы отображения компонента ------------------------- */
    renderColumn = ({ value, row }) => {
        const proxy = () => {
            const target = this.state.selection.length > 0 ? this.state.selection : [row] ;
            const items = target.map((item)=>{
                return(
                    <div key = { item.uuid } className="datagrid-moving-proxy">
                        { item.name }
                    </div>
                )
            });

            return (
                <div >
                    { items }
                </div>
            )
        };

        return (
            <Draggable
                revert
                deltaX={ -5 }
                deltaY={ -5 }
                edge={ 5 }
                proxy={ proxy }
                onDragStart={(event) => this.handleRowDragStart(event, row)}
                // Отмена выделений после перетаскивания
                onDragEnd = { this.changeSelections([]) }>
                <div>
                    { row.name }
                </div>
            </Draggable>
        )
    };

    renderDialog = () => {
        const row = this.state.model;
        const { title, closed, rules } = this.state;
        return (
            <Dialog
                modal
                draggable
                title={ title }
                closed={ closed }
                onClose={() => this.setState({ closed: true })}>
                <div className="f-full" style={{ padding: '20px 50px' }}>
                    <Form className="f-full"
                          ref={ ref => this.form = ref }
                          model={ row }
                          rules={ rules }
                          onValidate={ (errors) => this.setState({ errors: errors }) }
                    >
                        <div style={{ marginBottom: 10 }}>
                            <Label htmlFor="name">Наименование:</Label>
                            <TextBox
                                inputId="name"
                                name="name"
                                value={ row.name }
                                style={{ width: 450 }}/>
                            <div className="error">{ this.getError('name') }</div>
                        </div>
                        <div style={{ marginBottom: 10 }}>
                            <Label
                                htmlFor="measure">Единица:</Label>
                            <ComboBox
                                inputId="measureName"
                                name="measureName"
                                data={ this.props.measureTypes.filter(e=>e.value!==null) }
                                value={ row.measureName }
                                style={{ width: 450 }}/>
                            <div className="error">{ this.getError('measureName') }</div>
                        </div>
                        <div style={{ marginBottom: 10 }}>
                            <Label htmlFor="price">Цена продажи:</Label>
                            <NumberBox
                                inputId="price"
                                name="price"
                                value={ row.price }
                                precision={2}
                                style={{ width: 450 }}/>
                        </div>
                        <div style={{ marginBottom: 10 }}>
                            <Label htmlFor="costPrice">Цена закупки:</Label>
                            <NumberBox
                                inputId="costPrice"
                                name="costPrice"
                                value={ row.costPrice }
                                precision={2}
                                style={{ width: 450 }}
                            />
                        </div>
                    </Form>
                </div>
                <div className="dialog-button">
                    <LinkButton style={{ width: 80 }} onClick={ () => this.saveRow() }>Сохранить</LinkButton>
                    <LinkButton style={{ width: 80 }} onClick={ () => this.dialogBtnClose() }>Закрыть</LinkButton>
                </div>
            </Dialog>
        )
    };

    renderRowStyle = (row) => {
        // Придаем стиль nodes строкам
        if (row.group) {
            //console.log(row.name);
            // background: "#b8eecf", fontSize: "14px",
            return { fontWeight: "bold" };
        }
        return null;
    };

    renderContextMenu = () => {
        return(
            <ContextMenu
                menu = { this.props.contextMenu }
                menuRef = { (ref)=>this.menu=ref }
                handleItemClick = { this.handleContextMenuClick }
            />
        )
    };

    render() {
        const { data } = this.state;

        const numberBoxFilter = () => {
            return (<NumberBox/>)
        };

        const comboBoxFilter = () =>{
            return(<ComboBox
                data={ this.props.measureTypes }
                editable={ false }
                inputStyle={{ textAlign: 'center' }}
            />);
        };

        //console.log("props=>", this.props.nodeView, "state=>",this.state.nodeView);

        return (
            <ErrorBoundry>
                <DataGrid
                    ref = { list=>this.list=list }
                    data = { data }
                    //renderItem = { this.renderRow }
                    style = {{ height: 'calc(100vh - 60px)' }}
                    filterable
                    columnMoving
                    columnResizing
                    editMode = "row"
                    selectionMode ='multiple'
                    selection={ this.state.selection }
                    rowCss = { this.renderRowStyle }
                    onRowDblClick = { this.handleRowDblClick }
                    onSelectionChange = { this.handleSelectionChange }
                    onRowContextMenu = { this.handleCellContextMenu }>
                    <GridColumn
                        //render = { this.renderColumn }
                        field="code" title="Код" width="10%"/>
                    <GridColumn
                        render = { this.renderColumn }
                        field="name"
                        title="Наименование"
                        width="50%"/>
                    <GridColumn field="price" title="Цена продаж" width="10%" align="right"
                                filterOperators={ this.state.operators }
                                filter={ numberBoxFilter }
                    />
                    <GridColumn field="quantity" title="Остаток" align="right" width="10%"
                                filterOperators={ this.state.operators }
                                filter={ numberBoxFilter }
                    />
                    <GridColumn field="description" title="Описание" width="10%"/>
                    <GridColumn field="measureName" title="Единицы" width="10%" align="center"
                                filter={ comboBoxFilter }
                    />
                </DataGrid>
                { this.renderContextMenu() }
                { this.renderDialog() }
            </ErrorBoundry>
        )
    }
}
