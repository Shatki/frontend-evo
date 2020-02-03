import React from 'react';
import { Layout, LayoutPanel } from 'rc-easyui';
import Header from "../header"
import ItemTree from "../item-tree";
import ItemList from "../item-list";
import ItemDetail from "../item-detail";
import EvotorService from "../../services/evotor-service";
import LoadingView from "../loading-view";
import { moveNode, transformNodeToRow } from "../../services/nodes-service";

import './dashboard.css'

export default class Dashboard extends React.Component {
    evotorService = new EvotorService();

    constructor(props) {
        super(props);
        this.state = {
            data: null,
            loading: true,
            store: {
                "name": "Магазин 'XXI BEK'",
                "uuid":  "20180507-447F-40C1-8081-52D4B03CD7AB"},
            itemMatrix: [
                //{"nameField": "uuid", "valueField": null, "titleField": "UUID", "groupField": "Основные", "editorField": "text"},
                {"nameField": "name", "valueField": null, "titleField": "Наименование", "groupField": "Основные",
                    "editorField": "text", "rules": ["required",]},
                {"nameField": "code", "valueField": null, "titleField": "Код", "groupField": "Основные",
                    "editorField": "text", "rules": ["required", "digital", "positive"] },
                {"nameField": "articleNumber", "valueField": null, "titleField": "Артикул", "groupField": "Основные",
                    "editorField": "text", "rules": ["nullable",] },
                {"nameField": "barCodes", "valueField": null, "titleField": "Штрихкоды", "groupField": "Коды",
                    "editorField": "combo", "dataField": null, "edit": true, "rules": ["nullable"] },

                {"nameField": "price", "valueField": null, "titleField": "Цена продажи", "groupField": "Цены",
                    "editorField": "text", "rules": ["required", "float", "precision2",] },
                {"nameField": "costPrice", "valueField": null, "titleField": "Цена закупки", "groupField": "Цены",
                    "editorField": "text", "rules": ["required", "float", "precision2"] },

                {"nameField": "quantity", "valueField": null, "titleField": "Остаток", "groupField": "Склад",
                    "editorField": "text", "rules": ["required", "float", "precision3"] },

                {"nameField": "measureName", "valueField": null, "titleField": "Единицы", "groupField": "Цены",
                    "editorField": "combo", "dataField": "measureTypes", "rules": ["required",]},
                {"nameField": "tax", "valueField": null, "titleField": "Ставка НДС", "groupField": "Цены",
                    "editorField": "combo", "dataField": "taxTypes", "rules": ["required",] },
                {"nameField": "allowToSell", "valueField": null, "titleField": "Запрет продажи", "groupField": "Склад",
                    "editorField": "switch", "rules": ["required",] },
                {"nameField": "description", "valueField": null, "titleField": "Описание", "groupField": "Основные",
                    "editorField": "text", "rules": ["nullable",] },

                {"nameField": "type", "valueField": null, "titleField": "Вид номенклатуры", "groupField": "Основные",
                    "editorField": "combo", "dataField": "productTypes", "rules": ["required",] },

                {"nameField": "alcoCodes", "valueField": null, "titleField": "Алкокод", "groupField": "Коды",
                    "editorField": "combo", "dataField": null, "edit": true, "rules": ["nullable", "digital", "length19"] },
                {"nameField": "alcoholProductKindCode", "valueField": null, "titleField": "Код вида продукции", "groupField": "ЕГАИС",
                    "editorField": "text", "rules": ["positive", "digital"] },
                {"nameField": "alcoholByVolume", "valueField": null, "titleField": "Крепкость", "groupField": "ЕГАИС",
                    "editorField": "text", "rules": ["positive", "float", "precision2"] },
                {"nameField": "tareVolume", "valueField": null, "titleField": "Объем тары", "groupField": "ЕГАИС",
                    "editorField": "text","rules": ["positive", "float", "precision2"] },

                //{"nameField": "group", "valueField": null, "titleField": "Группа", "groupField": "Основные",
                //    "editorField": "switch", "rules": ["required",] },
                {"nameField": "parentUuid", "valueField": null, "titleField": "Группа товаров", "groupField": "Основные",
                    "editorField": "tree", "dataField": null, "rules": ["nullable",] },
            ],                          // шаблон данных с настройками для преобразователя

            // Language titles
            propertyPanelTitle: "Карточка товара",
            treePanelTitle: "Группы товаров",

            constants: {
                productTypes: [
                    {value: "NORMAL", text: "обычный"},
                    {value: "ALCOHOL_MARKED", text: "маркированный алкоголь"},
                    {value: "ALCOHOL_NOT_MARKED", text: "немаркированный алкоголь"},
                    {value: "TOBACCO_MARKED", text: "маркированный табак"},
                    {value: "SHOES_MARKED", text: "маркированная обувь"},
                    {value: "MEDICINE_MARKED", text: "маркированные лекарства"},
                    {value: "SERVICE", text: "услуга"},
                ],
                measureTypes: [
                    {value: null, text: "Без единиц"},
                    {value: "шт", text: "шт"},
                    {value: "кг", text: "кг"},
                    {value: "л", text: "л"},
                    {value: "м", text: "м"},
                    {value: "км", text: "км"},
                    {value: "м2", text: "м2"},
                    {value: "м3", text: "м3"},
                    {value: "компл", text: "компл"},
                    {value: "упак", text: "упак"},
                    {value: "ед", text: "ед"},
                    {value: "дроб", text: "дроб"}
                ],
                taxTypes: [
                    {value: "NO_VAT", text: "Без НДС"},
                    {value: "VAT_10)", text: "НДС 10%"},
                    {value: "VAT_20", text: "НДС 20%"},
                    {value: "VAT_0", text: "НДС 0%"},
                    {value: "VAT_20_120", text: "НДС 20/120"},
                    {value: "VAT_10_110", text: "НДС 10/110"},
                ],
            },

            itemTreeData: null,                         // Сырые данные для  ItemTree
            itemListData: null,                         // Сырые данные для  ItemList
            itemDetailData: {
                "uuid": "01ba18b6-8707-5f47-3d9c-4db058054cb2",
                "code": "6",
                "barCodes": [
                    "200000000060",
                    "200000000061",
                    "200000000062",
                ],
                "alcoCodes": [
                    "0000000000000000001",
                    "0000000000000000002",
                    "0000000000000000003",
                    "0000000000000000004"
                ],
                "name": "Сидр",
                "price": 123.12,
                "quantity": 12,
                "costPrice": 100.123,
                "measureName": "шт",
                "tax": "VAT_20",
                "allowToSell": true,
                "description": "Вкусный яблочный сидр.",
                //"articleNumber": "сид123",
                "parentUuid": "e12a2d7b-d3b7-4d4d-8e81-b581f652b9e8",
                "group": false,
                "type": "ALCOHOL_NOT_MARKED",
                "alcoholByVolume": 5.45,
                "alcoholProductKindCode": 123,
                "tareVolume": 0.57
            },        // Сырые данные для  ItemDetail

            nodeView: null,                             //  Отображаемая Нода в ItemList выбранная в ItemTree
            collapsedDetail: true,

            // Drag'n'Drop
            isover: false,
            dragItems: null,
        };
        // Массив штришкодов
        this.barCodes = null;
        this.validateRules= {
            //const n = value ? String(value).trim().length : 0;
            //return value.length === parseInt(param[0], 10);
            /* Проверяет то, чтобы значение обязательно было введено */
            "required": {
                "validator": (value) => {
                    console.log("required validation", value);
                    //if(Array.isArray(value)) return true; // Todo доделать!!!
                    return null != value && ("boolean" == typeof value ? value : String(value).trim().length > 0);
                },
                message: 'Поле является обязательным'
            },
            /* Проверяет то, чтобы значение не могло быть пустым (не null) */
            "nullable": {
                "validator": (value) => {
                    console.log("nullable validation", value);
                    //if(Array.isArray(value)) return true; // Todo доделать!!!
                    return null === value || ("boolean" == typeof value ? value : String(value).trim().length > 0);
                },
                message: 'Созданное поле не может быть пустым'
            },
            /* Проверяет то, чтобы значение было числом */
            "digital": {
                "validator": (value) => {
                    //console.log("digital validation", value);

                    return /^\d+$/.test(value);
                },
                message: 'Значение может состоять только из цифр'
            },
            /* Проверяет то, чтобы значение числом с плавающей точкой */
            "float": {
                "validator": (value) => {
                    console.log("float validation", value);
                    return /^\d*\.?\d+$/.test(value);
                },
                message: 'Значение должно быть десятичным числом'
            },
            /* Проверяет то, чтобы значение было положительным числом */
            "positive": {
                "validator": (value) => {
                    console.log("positive validation", value);
                    //if(Array.isArray(value)) return true; // Todo доделать!!!
                    return parseInt(value, 10) > 0;
                },
                message: 'Значение не может быть отрицательным',
            },
            /* Проверяет то, если число не целое, то точность до двух знаков */
            "precision2": {
                "validator": (value) => {
                    const parts = String(value).split('.');
                    console.log("precision validation", value);
                    //if(Array.isArray(value)) return true; // Todo доделать!!!
                    if (parts.length === 2) return parts[1].length === 1 || parts[1].length === 2;
                    else return true
                },
                message: 'Точность числа только до двух знаков',
            },
            /* Проверяет то, если число не целое, то точность до трех знаков */
            "precision3": {
                "validator": (value) => {
                    const parts = String(value).split('.');
                    console.log("precision validation", value);
                    //if(Array.isArray(value)) return true; // Todo доделать!!!
                    if (parts.length === 2) return parts[1].length === 3;
                    else return true
                },
                message: 'Точность числа только до трех знаков',
            },
            /* Проверяет то, чтобы длина значения была 19 */
            "length19": {
                "validator": (value) => {
                    console.log("lenght19 validation", value);
                    return value.length === 19;
                },
                message: 'Длина алкокода должна быть 19',
            },

        };

        this.keyboardEventListener = null;             
        this.menu = null;
        this.notificator = props.notificator;

        this.contextMenu = {
            treeMenu: [
                { key: "create", text: "Создать", disabled: false, iconCls: "icon-evotor-folder-add" },
                { key: "rename", text: "Переименовать", disabled: false, iconCls: "icon-evotor-folder-edit" },
                { key: "open", text: "Открыть", disabled: false, iconCls: "icon-evotor-folder-open" },
                { key: "delete", text: "Удалить", disabled: false, iconCls: "icon-evotor-folder-delete" },
                { key: "upload", text: "Выгрузить", disabled: true, iconCls: "icon-evotor-upload-to-the-cloud" },
                { key: "submenu", text: "Субменю", disabled: false,
                    submenu: [
                        { key: "save", text:"Сохранить", disabled: false, iconCls: "icon-save" },
                        { key: "menu1", text:"Меню1", disabled: false },
                        { key: "menu2", text:"Меню2", disabled: false },
                    ]
                },
                { key: "close", text: "Закрыть", disabled: false },
            ],
            listMenu: [
                { key: "create", text: "Создать", disabled: false },
                { key: "open", text: "Открыть", disabled: false },
                { key: "edit", text: "Изменить", disabled: false },
                { key: "main_sep", separator: true },
                { key: "copy", text: "Копировать", disabled: false },
                { key: "paste", text: "Вставить", disabled: false },
                //{ key: "duplicate", text: "Дублировать", disabled: false },  // disabled
                { key: "delete", text: "Удалить", disabled: false, iconCls: "icon-evotor-folder-delete" },
                { key: "close_sep", separator: true },
                { key: "close", text: "Закрыть", disabled: false },
            ],
            itemMenu: [
                { key: "create", text: "Создать", disabled: false, submenu: [
                        { key: "save", text:"Сохранить", disabled: false, iconCls: "icon-save" },
                        { key: "menu1", text:"Меню1", disabled: false },
                        { key: "menu2", text:"Меню1", disabled: false },
                    ]  },
                { key: "print", text: "Печатать", disabled: true, iconCls: "icon-print" },
                { key: "close", text: "Закрыть", disabled: false },
            ],
        };
    };
    /* ----------------- Lifecycle methods -------------------------------------------- */
    componentDidMount() {
        document.addEventListener("keydown", this.handleKeyboardEvent);
        this.loadData();
    }

    componentDidUpdate( prevProps, prevState, snapshot) {
        //console.log("ComponentDidUpdate Dashboard (itemTreeData/processedTreeData)=>", this.state.itemTreeData, this.state.processedTreeData);
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.handleKeyboardEvent);
    }

    /* ----------------- Data operations ---------------------------------------------- */
    loadData = (store_id = 0) =>{
        this.evotorService
            .getAllProducts(store_id)
            .then(this.updateData);
    };

    updateData = (data) =>{
        // первоначальное заполнение данных
        const itemTreeData = data
            .filter(item => item.group === true)
            .map(itemTree=>Object.assign({}, itemTree, { state: 'closed' }));
        const itemListData = data
            .filter(item => item.group === false)
            .map((itemList)=>Object.assign({}, itemList));
        // Todo: Вообще в будующем сделать чтоб подхватывался последний редактируемый объект
        const itemDetailData = null;  // Проверим такой вариант
        this.setState({
            data,
            itemTreeData,
            itemListData,
            itemDetailData,
            loading: false,
        });
    };

    updateItemData = (row) =>{
        /* Обновление основного хранилища информации товаров и групп
        *
        *  Обязательно!!! наличие в row признака group
        *  Выполняются действия(удалить/добавить/изменить)
        *  в зависимости от полученного row:
        *       1 Если row.code === undefined тогда удаляем item
        *       2 Иначе если row.uuid существует, тогда заменяем item, на отредактированный
        *       3 Но Если же row.uuid не найден в данных, значит создаем новый item
        *           При добалении нового item, code вычисляем новый.
        */
        console.log("DashBoard updateItemData=>row", row);
        const group = row.group;
        const itemData = group ? this.state.itemTreeData : this.state.itemListData;

        if(row.code === undefined){
            // Удаляем item
            const newData = itemData.filter(el=>el.uuid!==row.uuid);
            // console.log("DashBoard delete row=>", row, newListData.length, itemListData.length);
            if(newData.length === itemData.length - 1){
                if(group){
                    this.notificator.show("Группа товаров " + row.name + " успешно удалена", { type:"success" });
                    this.setState({
                        itemTreeData: newData
                    })
                }else{
                    this.notificator.show("Товар " + row.name + " успешно удален", { type:"success" });
                    this.setState({
                        itemListData: newData
                    })
                }
            }else this.notificator.show("Ошибка удаления" + row.name, { type:"error" });
        }else {
            const idx = itemData.findIndex(el=>el.uuid===row.uuid);
            if(idx !== -1){
                //  Заменяем товар
                console.log("Dashboard замена row=>", row);
                if (group){
                    this.setState({
                        itemTreeData: itemData.map((item)=>{
                            if(item.uuid === row.uuid) return Object.assign({}, item, row);
                            return item; // Вернем тот же, чтоб избежать его повторного рендера
                        })
                    })
                }else{
                    this.setState({
                        itemListData: itemData.map((item)=>{
                            if(item.uuid === row.uuid) return Object.assign({}, item, row);
                            return item; // Вернем тот же, чтоб избежать его повторного рендера
                        })
                    })
                }
            } else {
                // Создаем новый товар
                console.log("Dashboard создание нового row=>", row);
                const newData = [].concat(itemData, Object.assign({},row, { code: this.getNewCode() }));
                //console.log("DashBoard create row=>", row, newListData);
                if(newData.length === itemData.length + 1){
                    if(group){
                        this.notificator.show("Группа товаров " + row.name + " успешно создана", { type:"success" });
                        this.setState({
                            itemTreeData: newData
                        })
                    }else{
                        this.notificator.show("Товар " + row.name + " успешно создан", { type:"success" });
                        this.setState({
                            itemListData: newData
                        })
                    }
                } else this.notificator.show("Ошибка создания " + row.name, { type:"error" });
            }
        }
    };

    handleDataOperations = (data, operations) =>{
        // Через эту функцию проходят все операции по изменению данных
    };

    getRules = (rules) => {
        /* Получение правила валидации
        * Коды:
        * /[0-9]/ - [один] символ входящий в диапазон 0-9 в [любом] месте строки
        * /^[0-9]$/ - строка состоящая из [одного] символа входящего в диапазон 0-9
        * /^\d+$/ - строка состоящая из [одного или более] символа входящего в диапазон 0-9(\d)
        *
        *  rules на входе это массив из itemProps
        */
        const allRules = this.validateRules;
        console.log("validateRules=>", this.validateRules);
        if (rules === undefined) return {};
        let objectRules = {};
        rules.forEach(function (item) {
            if (item in allRules) objectRules[item] = allRules[item];
            else objectRules[item] = item
        });
        console.log("get rules=>", objectRules);
        return objectRules;
    };

    getNewCode = () =>{
        // Вычисление свободного кода
        const { itemListData, itemTreeData } = this.state;
        const maxListCode = itemListData.reduce((max, current) =>
            max < Number(current.code) ? +Number(current.code) : max, 0);
        const maxTreeCode = itemTreeData.reduce((max, current) =>
            max < Number(current.code) ? +Number(current.code) : max, 0);
        return maxListCode > maxTreeCode ? String(maxListCode + 1): String(maxTreeCode + 1)
    };

    /* ----------------- Keyboard event functions ------------------------------------- */
    // Todo Undo/Redo event + other
    setKeyboardEventsListener = (listener) => {
        this.keyboardEventListener =  listener
    };

    handleKeyboardEvent = e => {
        // Первый вариант обработки клавиатуры
        console.log(e);
        if(this.keyboardEventListener !== null)
            this.keyboardEventListener(e)
    };

    /* ----------------- Обработка событий Dashboard ---------------------------------- */
    handleTreeSelectionChange = (node) =>{
        // Todo устаревший рудимент
        console.log("Dashboard.handleTreeSelectionChange node=>", node);
    };

    // ItemTree => Open Node
    handleTreeNodeSelectView = (node) =>{
        // Просмотр выбранной ноды в ListItem
        const { nodeView } = this.state;
        const nodeUuid = nodeView ? nodeView.uuid : null;
        console.log("Выбрали ноду=>", node);

        if(nodeUuid !== node.uuid) {
            this.setState({
                nodeView: node,
            });
        }
    };

    handleDropListItem = (node) => {
        // Todo Каждое действие отправляется на сервер для Redo/Undo
        // Тут делаем операции с даннымы
        const { itemListData, itemTreeData, dragItems } = this.state;
        const dragListData = dragItems.filter(item=>item.group===false);
        const dragListUuid = dragListData.map((item)=>item.uuid);
        const dragTreeData = dragItems.filter(item=>item.group===true);
        const dragTreeUuid = dragTreeData.map((item)=>item.uuid);
        const target = itemTreeData.find((item)=>{ return item.uuid === node.uuid });
        let counter = 0;

        //console.log("Перемещение в цель=>", target, node);
        if(dragListUuid.length>0){
            const newListData = itemListData.map((item)=>{
                if(dragListUuid.indexOf(item.uuid) !== -1) {
                    //console.log("=>>>>>>>>>>>>>>>>>>>Перемещение List=>", item);
                    item.parentUuid = node.uuid;
                    counter +=1;
                }
                return item
            });

            this.setState({
                itemListData: newListData,
            });
        }

        if(dragTreeUuid.length>0){
            console.log("setState itemTreeData:", itemTreeData );
            const newTreeData = itemTreeData.map((item)=>{
                console.log("itemTreeData item, dragTreeUuid:", item, dragTreeUuid);
                if(dragTreeUuid.indexOf(item.uuid) !== -1) {
                    const movingItem = moveNode(itemTreeData, target, item);
                    if(!movingItem) this.notificator.show("Невозможно перенести " + item.name, { type:"error" });
                    else counter +=1;
                    // Если пришло null то ноду перемещать нельзя
                    return movingItem || item;
                }
                return item
            });

            this.notificator.show("Переместили " + counter + " элементов в каталог " + target.name, { type:"success" });
            //console.log("setState newTreeData(processedTreeData):", newTreeData, processedTreeData);
            this.setState({
                itemTreeData: newTreeData,
            })
        }
    };

    handleDragListItem = (items) =>{
        this.setState({
            dragItems: items
        })
    };

    handleChangeNodeState = (node, state) => {
        // Todo Сильно тормозит, нужно что-то сделать
        const row = transformNodeToRow(node);
        this.updateItemData(Object.assign(row, { state }));
        console.log("changeNodeState node/state=>", node, state);
    };

    // ItemList => DblClick open
    handleListNodeSelection = (row) => {
        const { nodeView } = this.state;
        const isChangedUuid = nodeView ? row.uuid !== nodeView.uuid : nodeView === null;
        if(isChangedUuid){
            console.log("listNodeSelection=>", row);
            this.handleTreeNodeSelectView({ uuid: row.uuid })
        }
    };

    handleListItemSelection = (row) =>{
        const { itemDetailData } = this.state;
        const isChangedUuid = itemDetailData ? row.uuid !== itemDetailData.uuid : itemDetailData === null;
        console.log('ChangeNode row/nodeView/test=>', row, itemDetailData, isChangedUuid);
        if(isChangedUuid){
            //const parentNode = getNodeByRow(itemTreeData, row);
            //const processedDetailData = processingItemData(itemTreeData, row , itemMatrix);
            console.log("Редактируем item=>", row);
            this.setState({
                itemDetailData: row,
                //processedDetailData,
                //parentNode,
            })
        }
    };

    /* ----------------- Методы управления панелями ------------------------------- */
    handleCollapseEast = () =>{
        this.setState((state)=>{
            // console.log("CollapseEast", this.state.collapsedDetail);
            if(!state.collapsedDetail) return {
                collapsedDetail: !this.state.collapsedDetail,
            }
        })
    };

    handleExpandEast = () => {
        this.setState((state)=>{
            // console.log("ExpandEast", this.state.collapsedDetail);
            if(state.collapsedDetail) return {
                collapsedDetail: !this.state.collapsedDetail,
            }
        })
    };

    handleCollapseWest = () => {
        this.setState((state)=>{
            // console.log("CollapseWest", !this.state.collapsedDetail);
            if(state.collapsedDetail) return {
                collapsedDetail: !this.state.collapsedDetail,
            }
        })
    };

    handleExpandWest =() => {
        this.setState((state)=>{
            // console.log("ExpandWest", !this.state.collapsedDetail);
            if(!state.collapsedDetail) return {
                collapsedDetail: !this.state.collapsedDetail,
            }
        })
    };

    /* ----------------- Render методы отображения компонента ------------------------- */
    render() {
        const {
            constants, collapsedDetail, nodeView, itemMatrix,
            itemTreeData, itemListData, itemDetailData,
            propertyPanelTitle, treePanelTitle } = this.state;

        if(this.state.loading)
            return(<LoadingView/>);
        return (
            <Layout
                style={{ width: '100%', height: '100%' }}>
                <LayoutPanel
                    region="north"
                    style={{ height: 60 }}>
                    <Header/>
                </LayoutPanel>

                <LayoutPanel
                    region="west"
                    title={ treePanelTitle }
                    collapsible
                    collapsed = { !collapsedDetail }
                    onCollapse = { this.handleCollapseWest }
                    onExpand = { this.handleExpandWest }
                    expander
                    split
                    style={{ minWidth: 150, maxWidth: 400 }}>
                    <ItemTree
                        itemTreeData = { itemTreeData }
                        updateItemData = { this.updateItemData }
                        onDrop = { this.handleDropListItem }
                        //onTreeSelectionChange = { this.handleTreeSelectionChange }
                        onTreeNodeSelectView = { this.handleTreeNodeSelectView }
                        onChangeNodeState = { this.handleChangeNodeState }
                        contextMenu = { this.contextMenu.treeMenu }
                        setKeyboardEventsListener = { this.setKeyboardEventsListener }
                    />
                </LayoutPanel>

                <LayoutPanel
                    region="center">
                    <ItemList
                        itemListData = { itemListData }
                        itemTreeData = { itemTreeData }
                        itemMatrix = { itemMatrix }
                        nodeView = { nodeView }
                        constants = { constants }
                        collapsed = { collapsedDetail }
                        onDrag = { this.handleDragListItem }
                        updateItemData = { this.updateItemData }         //???
                        contextMenu = { this.contextMenu.listMenu }
                        onListNodeSelection = { this.handleListNodeSelection }
                        onListItemSelection = { this.handleListItemSelection }
                        notificator = { this.notificator }
                        //handleListSelectionChange = { this.handleListSelectionChange }
                        setKeyboardEventsListener = { this.setKeyboardEventsListener }
                        getRules = { this.getRules }
                    />

                </LayoutPanel>

                <LayoutPanel
                    region = "east"
                    title = { propertyPanelTitle }
                    collapsible
                    collapsed ={ collapsedDetail }
                    onCollapse = { this.handleCollapseEast }
                    onExpand = { this.handleExpandEast }
                    expander
                    split
                    style = {{ minWidth: 200, maxWidth: 400 }}
                    >
                    <ItemDetail
                        itemDetailData = { itemDetailData }
                        //itemListData = { itemListData }
                        itemTreeData = { itemTreeData }
                        itemMatrix = { itemMatrix }
                        //parent = { parentDetailItem }
                        collapsed = { collapsedDetail }
                        constants = { constants }
                        contextMenu = { this.contextMenu.itemMenu }
                        setKeyboardEventsListener = { this.setKeyboardEventsListener }
                        getRules = { this.getRules }
                    />
                </LayoutPanel>
            </Layout>
        );
    }
}