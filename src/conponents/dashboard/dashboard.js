import React from 'react';
import { Layout, LayoutPanel } from 'rc-easyui';
import Header from "../header"
import ItemTree from "../item-tree";
import ItemList from "../item-list";
import ItemDetail from "../item-detail";
import EvotorService from "../../services/evotor-service";
import LoadingView from "../loading-view";
import { addRootNode, moveNode, getNodeByRow,
    processingTreeData, processingListData, processingItemData } from "../../algorithms/node-services";
import './dashboard.css'


export default class Dashboard extends React.Component {
    evotorService = new EvotorService();

    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            store: {
                "name": "Магазин 'XXI BEK'",
                "uuid":  "20180507-447F-40C1-8081-52D4B03CD7AB"},
            constants: {
                productTypes: [
                    {value: "NORMAL", text: "обычный"},
                    {value: "ALCOHOL_MARKED", text: "маркированный алкоголь"},
                    {value: "ALCOHOL_NOT_MARKED", text: "немаркированный алкоголь"},
                    {value: "TOBACCO_MARKED", text: "маркированный табак"},
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

            itemTreeData: null,                     // Сырые данные для  ItemTree
            itemListData: null,                     // Сырые данные для  ItemList
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
            },      // Сырые данные для  ItemDetail

            itemMatrix: [
                //{"nameField": "uuid", "valueField": null, "titleField": "UUID", "groupField": "Основные", "editorField": "text"},
                {"nameField": "name", "valueField": null, "titleField": "Наименование", "groupField": "Основные",
                    "editorField": "text", "rules": ["required",]},
                {"nameField": "code", "valueField": null, "titleField": "Код", "groupField": "Основные",
                    "editorField": "text", "rules": ["required", "positive"] },
                {"nameField": "articleNumber", "valueField": null, "titleField": "Артикул", "groupField": "Основные",
                    "editorField": "text", "rules": ["nullable",] },
                {"nameField": "barCodes", "valueField": null, "titleField": "Штрихкоды", "groupField": "Коды",
                    "editorField": "combo", "dataField": null, "edit": true, "rules": ["nullable"] },

                {"nameField": "price", "valueField": null, "titleField": "Цена продажи", "groupField": "Цены",
                    "editorField": "text", "rules": ["required", "precision2",] },
                {"nameField": "costPrice", "valueField": null, "titleField": "Цена закупки", "groupField": "Цены",
                    "editorField": "text", "rules": ["required", "precision2"] },

                {"nameField": "quantity", "valueField": null, "titleField": "Остаток", "groupField": "Склад",
                    "editorField": "text", "rules": ["required", "precision3"] },

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
                    "editorField": "text", "rules": ["positive",] },
                {"nameField": "alcoholByVolume", "valueField": null, "titleField": "Крепкость", "groupField": "ЕГАИС",
                    "editorField": "text", "rules": ["positive", "precision2"] },
                {"nameField": "tareVolume", "valueField": null, "titleField": "Объем тары", "groupField": "ЕГАИС",
                    "editorField": "text","rules": ["positive", "precision2"] },

                {"nameField": "group", "valueField": null, "titleField": "Группа", "groupField": "Основные",
                    "editorField": "switch", "rules": ["required",] },
                {"nameField": "parentUuid", "valueField": null, "titleField": "Группа товаров", "groupField": "Основные",
                    "editorField": "tree", "dataField": null, "rules": ["nullable",] },
            ],                  // шаблон данных с настройками для преобразователя

            processedTreeData: [],            // Обработанные данные для отображения в ItemTree
            processedListData: [],            // Обработанные данные для отображения в ItemList
            processedItemData: [],            // Обработанные данные для отображения в ItemDetail

            treeSelection: null,                //  Выделение в ItemTree
            //listSelection: [],                //  Выделение в ItemList
            itemSelection: null,                // ????Данные для отображения в ItemDetail

            nodeView: null,                     //  Отображаемая Нода в ItemList выбранная в ItemTree
            parentDetailItem: null,

            collapsedWest: false,
            collapsedEast: true,

            // Drag'n'Drop
            isover: false,
            dragItems: null,
        };
        // Массив штришкодов
        this.barCodes = null;

        this.keyboardEventListener = null;  // Пробное V2
        this.menu = null;

        this.contextMenu ={
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
                { key: "duplicate", text: "Дублировать", disabled: false },
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
        this.testNode = {
            alcoCodes: null,
            alcoholByVolume: null,
            alcoholProductKindCode: null,
            allowToSell: null,
            articleNumber: null,
            barCodes: null,
            code: "700",
            costPrice: null,
            description: null,
            group: true,
            hasVariants: false,
            measureName: "шт",
            name: "Кабели",
            parentUuid: "0d4aaf2a-fb90-404e-b84b-64c48ac116db",
            price: null,
            quantity: null,
            tareVolume: null,
            tax: null,
            type: null,
            uuid: "2818bd03-bc5f-445c-9964-cf42db512c5e",
        };

        this.targetNode = {
            alcoCodes: null,
            alcoholByVolume: null,
            alcoholProductKindCode: null,
            allowToSell: null,
            articleNumber: null,
            barCodes: null,
            code: "606",
            costPrice: null,
            description: null,
            group: true,
            hasVariants: false,
            measureName: "шт",
            name: "Программное обеспечение",
            parentUuid: null,
            price: null,
            quantity: null,
            tareVolume: null,
            tax: null,
            type: null,
            uuid: "bc2c289d-d71b-4021-9df1-bdf11b0b0ca5",
        };

    };
    /* ----------------- Lifecycle methods -------------------------------------------- */
    componentDidMount() {
        document.addEventListener("keydown", this.handleKeyboardEvent);
        this.loadData();
    }

    componentDidUpdate(prevProps, prevState) {
        console.log("ComponentDidUpdate Dashboard =>", this.state.itemTreeData);
        if(prevState.itemListData !== this.state.itemListData || prevState.itemTreeData !== this.state.itemTreeData)
            this.updateListData();
        if(prevState.itemDetailData !== this.state.itemDetailData || prevState.itemListData !== this.state.itemListData)
            this.updateDetailData();
        if(prevState.itemTreeData !== this.state.itemTreeData)
            this.updateTreeData();
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
        const itemTreeData = data.filter(item => item.group === true);
        const itemListData = data.filter(item => item.group === false);
        // Todo: Вообще в будующем сделать чтоб подхватывался последний редактируемый объект
        const itemDetailData = null;  // Проверим такой вариант
        this.setState({
            itemTreeData,
            itemListData,
            itemDetailData,
            loading: false,
        });
        //this.updateTreeData(itemTreeData);
        //this.updateListData(itemTreeData, itemListData, nodeView);
        //this.updateItemData(itemTreeData, itemDetailData);
    };

    updateTreeData = () => {
        // Обновление данных в ListItem
        const { itemTreeData, nodeView, store } = this.state;
        const children = processingTreeData(itemTreeData, nodeView);
        const processedTreeData = addRootNode(children, store.name);
        console.log("Обновление itemTreeData/processedTreeData=>", itemTreeData, processedTreeData);
        this.setState({
            processedTreeData,
            treeSelection: null,
        });
    };

    updateListData = () => {
        const { itemTreeData, itemListData, nodeView } = this.state;
        const processedListData = processingListData(itemTreeData, itemListData, nodeView === null ? null : nodeView.uuid);
        // Обновление данных в ListItem
        console.log("Обновление itemListData=>", processedListData);
        this.setState({
            processedListData,
            listSelection: null,
        });
    };

    updateDetailData = () => {
        const { itemDetailData, itemTreeData, itemMatrix } = this.state;
        // itemData это объект класса row
        const processedItemData = processingItemData(itemTreeData, itemDetailData, itemMatrix);
        // row не может быть null
        const parentDetailItem = getNodeByRow(itemTreeData, itemDetailData);
        console.log("Обновление ItemDetailData=>", processedItemData);
        this.setState({
            processedItemData,
            parentDetailItem,
        })

    };


    // ItemTree => Open Node
    handleTreeNodeSelectView = (node) =>{
        // Просмотр выбранной ноды в ListItem
        const { itemTreeData, itemListData } = this.state;
        const processedListData = processingListData(itemTreeData, itemListData, node.uuid);
        //console.log("Выбрали ноду=>", node, processedListData);
        this.setState({
            nodeView: node,
            processedListData,
        });
    };

    handleDataOperations = (data, operations) =>{
        // Через эту функцию проходят все операции по изменению данных
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
        //console.log(node);
        this.setState({
            treeSelection: node,
        });
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

        console.log("Перемещение в цель=>", target, node);
        if(dragListUuid.length>0){
            const newListData = itemListData.map((item)=>{
                if(dragListUuid.indexOf(item.uuid) !== -1) {
                    console.log("=>>>>>>>>>>>>>>>>>>>Перемещение List=>", item);
                    item.parentUuid = node.uuid;
                }
                return item
            });

            this.setState({
                itemListData: newListData,
            });
        }

        if(dragTreeUuid.length>0){
            console.log("setState itemTreeData:", itemTreeData);
            const newTreeData = itemTreeData.map((item)=>{
                console.log("itemTreeData:", item, dragTreeUuid);
                if(dragTreeUuid.indexOf(item.uuid) !== -1) {
                    const movingItem = moveNode(itemTreeData, target, item);
                    console.log("=>>>>>>>>>>>>>>>>>>>Перемещение Tree=>", movingItem, movingItem || item);
                    // Если пришло null то ноду перемещать нельзя
                    return movingItem || item;
                }
                return item
            });

            console.log("setState newTreeData:", itemTreeData, newTreeData);
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

    handleChangeNodeState = (node, nodeState) => {
        // Todo Сильно тормозит, нужно что-то сделать
        //moveNode(this.state.itemTreeData, node, this.testNode);
        /*
        const { itemTreeData: treeData } = this.state;

        //treeNode.nodeState = nodeState;
        const itemTreeData = treeData.map((row)=>{
            if(row.uuid === node.uuid) return Object.assign(row, { nodeState });
            else return row
        });

        //console.log("changeNodeState=>", treeData);
        this.setState({
            itemTreeData,
        })
        */
    };

    // ItemList => DblClick open
    handleListNodeSelection = (row) => {
        const { processedTreeData } = this.state;
        const node = getNodeByRow(processedTreeData, row);
        console.log("listNodeSelection=>", row, node);
        this.handleTreeNodeSelectView(node)
    };

    handleListItemSelection = (row) =>{
        const { itemTreeData, itemMatrix } = this.state;
        const parentItem = getNodeByRow(itemTreeData, row);
        const processedItemData = processingItemData(itemTreeData, row, itemMatrix);
        console.log("Редактируем item=>", row);
        this.setState({
            itemDetailData: row,
            processedItemData,
            parentItem,
        })
    };

    /* ----------------- Методы управления панелями ------------------------------- */
    handleCollapseEast = () =>{
        this.setState((state)=>{
            // console.log("CollapseEast", this.state.collapsedEast);
            if(!state.collapsedEast) return {
                collapsedEast: !this.state.collapsedEast,
                collapsedWest: !this.state.collapsedWest,
            }
        })
    };

    handleExpandEast = () => {
        this.setState((state)=>{
            // console.log("ExpandEast", this.state.collapsedEast);
            if(state.collapsedEast) return {
                collapsedEast: !this.state.collapsedEast,
                collapsedWest: !this.state.collapsedWest,
            }
        })
    };

    handleCollapseWest = () => {
        this.setState((state)=>{
            // console.log("CollapseWest", this.state.collapsedWest);
            if(!state.collapsedWest) return {
                collapsedWest: !this.state.collapsedWest,
                collapsedEast: !this.state.collapsedEast,
            }
        })
    };

    handleExpandWest =() => {
        this.setState((state)=>{
            // console.log("ExpandWest", this.state.collapsedWest);
            if(state.collapsedWest) return {
                collapsedWest: !this.state.collapsedWest,
                collapsedEast: !this.state.collapsedEast,
            }
        })
    };

    /* ----------------- Render методы отображения компонента ------------------------- */
    render() {
        const { constants,
            collapsedWest, collapsedEast, nodeView, parentDetailItem,
            processedTreeData, processedListData, processedItemData } = this.state;


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
                    title="Группы товаров"
                    collapsible
                    collapsed = { collapsedWest }
                    onCollapse = { this.handleCollapseWest }
                    onExpand = { this.handleExpandWest }
                    expander
                    split
                    style={{ minWidth: 150, maxWidth: 400 }}>
                    <ItemTree
                        data = { processedTreeData }
                        onDrop = { this.handleDropListItem }
                        onTreeSelectionChange = { this.handleTreeSelectionChange }
                        onTreeNodeSelectView = { this.handleTreeNodeSelectView }
                        onChangeNodeState = { this.handleChangeNodeState }
                        contextMenu = { this.contextMenu.treeMenu }
                        setKeyboardEventsListener = { this.setKeyboardEventsListener }
                    />
                </LayoutPanel>

                <LayoutPanel
                    region="center">
                    <ItemList
                        { ...constants }
                        nodeView = { nodeView }
                        data = { processedListData }
                        collapsed = { collapsedEast }
                        onDrag = { this.handleDragListItem }
                        contextMenu = { this.contextMenu.listMenu }
                        onListNodeSelection = { this.handleListNodeSelection }
                        onListItemSelection = { this.handleListItemSelection }
                        //node = { this.state.treeSelection }
                        //handleListSelectionChange = { this.handleListSelectionChange }
                        setKeyboardEventsListener = { this.setKeyboardEventsListener }
                    />

                </LayoutPanel>

                <LayoutPanel
                    region = "east"
                    title = "Свойства"
                    collapsible
                    collapsed ={ collapsedEast }
                    onCollapse = { this.handleCollapseEast }
                    onExpand = { this.handleExpandEast }
                    expander
                    split
                    style = {{ minWidth: 200, maxWidth: 400 }}>
                    <ItemDetail
                        { ...constants }
                        data = { processedItemData }
                        parent = { parentDetailItem }
                        processedTreeData = { processedTreeData }
                        contextMenu = { this.contextMenu.itemMenu }
                        setKeyboardEventsListener = { this.setKeyboardEventsListener }
                    />
                </LayoutPanel>
            </Layout>
        );
    }
}