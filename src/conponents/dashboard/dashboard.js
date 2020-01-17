import React from 'react';
import { Layout, LayoutPanel } from 'rc-easyui';
import Header from "../header"
import ItemTree from "../item-tree";
import ItemList from "../item-list";
import ItemDetail from "../item-detail";
import EvotorService from "../../services/evotor-service";
import LoadingView from "../loading-view";
import { addRootNode, moveNode, processingTreeData, processingListData, getNodeByUuid } from "../../algorithms/node-services";
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

            treeData: null,                     // Сырые данные для  ItemTree
            listData: null,                     // Сырые данные для  ItemList
            itemData: {
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

            processedTreeData: null,            // Обработанные данные для отображения в ItemTree
            processedListData: null,            // Обработанные данные для отображения в ItemList

            treeSelection: null,                //  Выделение в ItemTree
            //listSelection: [],                //  Выделение в ItemList
            itemSelection: null,                // ????Данные для отображения в ItemDetail

            nodeView: null,                     //  Отображаемая Нода в ItemList выбранная в ItemTree

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
    };
    /* ----------------- Lifecycle methods -------------------------------------------- */
    componentDidMount() {
        document.addEventListener("keydown", this.handleKeyboardEvent);
        this.loadData();
    }

    componentDidUpdate(prevProps, prevState) {
        //if(prevState.nodeView.uuid !== state.nodeView.uuid)
        //    this.updateListData()
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
        const { nodeView } = this.state;

        // первоначальное заполнение данных
        const treeData = data.filter(item => item.group === true);
        const listData = data.filter(item => item.group === false);

        this.updateTreeData(treeData);
        this.updateListData(treeData, listData, nodeView);
        this.setState({
            loading: false,
        });
    };

    updateListData = (treeData, listData, nodeView) => {
        const processedListData = processingListData(treeData, listData, nodeView === null ? null : nodeView.uuid);
        // Обновление данных в ListItem
        this.setState({
            listData,
            nodeView,
            processedListData,
            listSelection: null,
        });
    };

    updateTreeData = (treeData, nodeRoot = null) => {
        // Обновление данных в ListItem
        const { store } = this.state;
        const children = processingTreeData(treeData, nodeRoot);
        const processedTreeData = addRootNode(children, store.name);
        this.setState({
            treeData,
            processedTreeData,
            treeSelection: null,
        });
    };



    // ItemTree => Open Node
    handleTreeNodeSelectView = (node) =>{
        // Просмотр выбранной ноды в ListItem
        const { treeData, listData } = this.state;
        const processedListData = processingListData(treeData, listData, node.uuid);
        console.log("Выбрали ноду=>", node, processedListData);
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
        const { listData, treeData, nodeView } = this.state;
        for (let dragItem of this.state.dragItems){
            if (!dragItem.group){
                // Для товаров
                listData.find(item=>item.uuid === dragItem.uuid).parentUuid = node.uuid;
            }else{
                // Для групп запрет на перемещение "в себя" или в свои "дочерние" ноды
                const targetNode = treeData.find( (item)=>{ return item.uuid === node.uuid } );
                const dragNode = treeData.find( (item)=>{ return item.uuid === dragItem.uuid } );
                const movingNode = moveNode(treeData, targetNode, dragNode);
                if(movingNode !== null) {
                    this.setState({
                        treeData:  Object.assign(treeData, movingNode)
                    });
                }
            }
            //console.log("Drop ", item.name , " =>", node.text);
        }
        // Обновление ListItem и TreeItem
        this.updateListData(treeData, listData, nodeView);
        this.updateTreeData(treeData);
    };

    handleDragListItem = (items) =>{
        this.setState({
            dragItems: items
        })
    };

    handleChangeNodeState = (node, nodeState) => {
        const { treeData } = this.state;
        const findNode = treeData.find(item=>item.uuid===node.uuid);
        if(findNode){
            const treeNode = Object.assign(findNode, { nodeState });
            treeNode.nodeState = nodeState;
            this.setState({
                treeData: Object.assign(treeData, treeNode)
            })
        }
    };

    // ItemList => DblClick open
    handleListRowSelection = (row) => {
        const node = getNodeByUuid(this.state.processedTreeData, row.uuid);
        this.handleTreeNodeSelectView(node)
    };

    /* ----------------- Render методы отображения компонента ------------------------- */
    render() {
        const { constants,
            collapsedWest, collapsedEast, nodeView,
            processedTreeData, processedListData, itemData } = this.state;


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
                    expander
                    split
                    style={{ minWidth: 150, maxWidth: 400 }}>
                    <ItemTree
                        treeData = { processedTreeData }
                        onDrop = { this.handleDropListItem }
                        onTreeSelectionChange = { this.handleTreeSelectionChange }
                        onTreeNodeSelectView = { this.handleTreeNodeSelectView }
                        onChangeNodeState = { this.handleChangeNodeState }
                        contextMenu = { this.contextMenu.treeMenu }
                    />
                </LayoutPanel>

                <LayoutPanel
                    region="center">
                    <ItemList
                        { ...constants }
                        nodeView = { nodeView }
                        listData = { processedListData }
                        onDrag = { this.handleDragListItem }
                        onListRowSelection = { this.handleListRowSelection }
                        contextMenu = { this.contextMenu.listMenu }
                        collapsed = { collapsedEast }
                        //node = { this.state.treeSelection }
                        //handleListSelectionChange = { this.handleListSelectionChange }
                    />

                </LayoutPanel>

                <LayoutPanel
                    title = "Свойства"
                    collapsible
                    collapsed ={ collapsedEast }
                    //expand = { this.handleExpandEast }
                    expander
                    region = "east"
                    split
                    style = {{ minWidth: 200, maxWidth: 400 }}>
                    <ItemDetail
                        { ...constants }
                        itemData = { itemData }
                        treeData = { processedTreeData }
                        contextMenu = { this.contextMenu.itemMenu }
                        setKeyboardEventsListener = { this.setKeyboardEventsListener }
                    />
                </LayoutPanel>
            </Layout>
        );
    }
}