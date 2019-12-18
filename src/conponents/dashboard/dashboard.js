import React from 'react';
import { Layout, LayoutPanel } from 'rc-easyui';
import { ContextMenuProvider } from "../context-menu";
import Header from "../header"
import ItemTree from "../item-tree";
import ItemList from "../item-list";
import ItemDetail from "../item-detail";
import EvotorService from "../../services/evotor-service";

import './dashboard.css'
import LoadingView from "../loading-view";

import { addRootNode, moveNode, displayTreeData, transformTreeData } from "../../algorithms/node-services";

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
                    {value: null, text: "Любые"},
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

            listData: [],
            treeData: [],

            displayTreeData: [],
            displayListData: [],
            itemData: [
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
                    "tax": "VAT_20",
                    "allowToSell": true,
                    "description": "Вкусный яблочный сидр.",
                    "articleNumber": "сид123",
                    "parentUuid": "1ddea16b-971b-dee5-3798-1b29a7aa2e27",
                    "group": false,
                    "type": "ALCOHOL_NOT_MARKED",
                    "alcoholByVolume": 5.45,
                    "alcoholProductKindCode": 123,
                    "tareVolume": 0.57
                },
            ],

            treeSelection: null, // target node
            nodeView: null, // view node
            //listSelection: [],
            itemSelection: null,

            collapsedWest: false,
            collapsedEast: true,
            // Drag'n'Drop
            isover: false,
            dragItems: null,
        };
        this.menu = null;
        this.contextMenu ={
            treeMenuRef: React.createRef(),
            listMenuRef: React.createRef(),
            itemMenuRef: React.createRef(),
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

    loadData = (store_id = 0) =>{
        this.evotorService
            .getAllProducts(store_id)
            .then(this.onDataLoaded);
    };

    updateListData = (treeData, listData, nodeView) => {
        // Обновление данных в ListItem
        this.setState({
            listData: listData,
            listSelection: [],
            displayListData: this.displayListData(treeData, listData, nodeView === null ? null : nodeView.uuid),
        });
    };

    updateTreeData = (treeData, nodeRoot = null) => {
        // Обновление данных в ListItem
        const { store } = this.state;
        const children = displayTreeData(treeData, nodeRoot);
        this.setState({
            treeData: treeData,
            displayTreeData: addRootNode(children, store.name),
            treeSelection: [],
        });
    };

    onDataLoaded = (data) =>{
        // первоначальное заполнение данных
        const treeData = data.filter(item => item.group === true);
        const listData = data.filter(item => item.group === false);
        this.updateTreeData(treeData);
        this.updateListData(treeData, listData, null);
        this.setState({
            loading: false,
        });
    };

    handleDataOperations = (data, operations) =>{
        // Через эту функцию проходят все операции по изменению данных
    };

    componentDidMount() {
        document.addEventListener("keydown", this.onKeyDown);
        this.loadData();
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.onKeyDown);
    }

    // Todo Undo/Redo event + other
    onKeyDown = e => console.log(e);

    // ***** Context Menu ***************************************************************************
    handleTreeSelectionChange = (node) =>{
        //console.log(node);
        this.setState({
            treeSelection: node,
        });
    };

    // ItemTree => Open Node
    handleTreeNodeSelectView = (node) =>{
        // Просмотр выбранной ноды в ListItem
        const { treeData, listData } = this.state;
        this.setState({
            nodeView: node,
            displayListData: this.displayListData(treeData, listData, node.uuid)
        });
    };

    // ***** Data Update ****************************************************************************
    displayListData = (treeData, listData, nodeUuid) => {
        /* Преобразование данных из Стейта в данные плагина для отображения в ListItem */
        // Сначала выбираем каталоги нужного node, затем добавляем items
        let data =  treeData.filter(item => item.parentUuid === nodeUuid);
        return data
        // Передаем в ItemList только наименование и код nodes
            .map((item)=>{
                return{
                    code: item.code,
                    uuid: item.uuid,
                    parentUuid: item.parentUuid,
                    name: item.name,
                    group: true
                }
            })
            // Приcоединяем items и передаем
            .concat(listData.filter(item => item.parentUuid === nodeUuid));
    };

    handleKeyDown = (event) =>{
        console.log("Key down event", event);
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
                moveNode(treeData, node, dragItem)
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
        const treeNode = treeData.find(item=>item.uuid===node.uuid);
        treeNode.nodeState = nodeState;
        this.setState({ treeData })
    };

    // ***** ItemList events ************************************************************************
    // ItemList => DblClick open
    handleListRowSelection = (row) => {
        const node = transformTreeData(row);
        this.handleTreeNodeSelectView(node)
    };

    render() {
        if(this.state.loading)
            return(<LoadingView/>);
        return (
            <ContextMenuProvider value = { this.contextMenu }>
                <Layout
                    style={{ width: '100%', height: '100%' }}
                    onKeyDown={ this.handleKeyDown }>
                    <LayoutPanel
                        region="north"
                        style={{ height: 60 }}>
                        <Header/>
                    </LayoutPanel>

                    <LayoutPanel
                        region="west"
                        title="Группы товаров"
                        collapsible
                        collapsed = { this.state.collapsedWest }
                        expander
                        split
                        style={{ minWidth: 150, maxWidth: 400 }}>
                        <ItemTree
                            treeData = { this.state.displayTreeData }
                            onDrop = { this.handleDropListItem }
                            onTreeSelectionChange = { this.handleTreeSelectionChange }
                            onTreeNodeSelection = { this.handleTreeNodeSelectView }
                            onChangeNodeState = { this.handleChangeNodeState }
                        />
                    </LayoutPanel>

                    <LayoutPanel
                        region="center">
                        <ItemList
                            { ...this.state.constants }
                            listData = { this.state.displayListData }
                            onDrag = { this.handleDragListItem }
                            onListRowSelection = { this.handleListRowSelection }
                            //node = { this.state.treeSelection }
                            //handleListSelectionChange = { this.handleListSelectionChange }
                        />

                    </LayoutPanel>

                    <LayoutPanel
                        title="Свойства"
                        collapsible
                        collapsed ={ this.state.collapsedEast}
                        //expand = { this.handleExpandEast.bind(this) }
                        expander
                        region="east"
                        split
                        style={{ minWidth: 200, maxWidth: 400 }}>
                        <ItemDetail
                            { ...this.state.constants }
                            itemData = { this.state.itemData }
                        />
                    </LayoutPanel>
                </Layout>
            </ContextMenuProvider>
        );
    }
}