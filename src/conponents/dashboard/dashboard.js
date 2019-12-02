import React from 'react';
import { Layout, LayoutPanel } from 'rc-easyui';
import { Draggable, Droppable } from 'rc-easyui';
import { ContextMenuProvider } from "../context-menu";

import Header from "../header"
import ItemTree from "../item-tree";
import ItemList from "../item-list";
import ItemDetail from "../item-detail";
import EvotorService from "../../services/evotor-service";

import './dashboard.css'
import LoadingView from "../loading-view";
import ErrorBoundry from "../error-boundry";

import { addRootNode, transformTreeData } from "../../algorithms/node-services";

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
            transformTreeData: [],
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
            treeSelection: null,
            listSelection: [],
            itemSelection: null,
            collapsedWest: false,
            collapsedEast: true,
        };
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
                        { key: "menu2", text:"Меню1", disabled: false },
                    ]
                },
                { key: "close", text: "Закрыть", disabled: false },
            ],
            listMenu: [
                { key: "create", text: "Создать", disabled: false },
                { key: "open", text: "Открыть", disabled: false },
                { key: "print", text: "Печатать", disabled: true, iconCls: "icon-print" },
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



    componentDidUpdate(prevProps, prevState, snapshot) {
    }

    componentDidMount() {
        document.addEventListener("keydown", this.onKeyDown);
        this.updateData();
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.onKeyDown);
    }

    // Todo Undo/Redo event + other
    onKeyDown = e => console.log(e);

    handleDragStart(item) {
        this.setState({ dragItem: item })
    }

    // ***** Context Menu ***************************************************************************
    handleTreeSelectionChange = (node) =>{
        console.log(node);
        this.setState({
            treeSelection: node,
        });
    };

    // ItemTree => Open Node
    handleTreeNodeSelection = (node) =>{
        const { treeData, listData } = this.state;
        this.setState({
            treeSelection: node,
            displayListData: this.displayListData(treeData, listData, node.uuid)
        });
    };

    onListSelectionChange = (selection) =>{
        // console.log(selection);
        this.setState({
            listSelection: selection
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
                    name: item.name,
                    group: true
                }
            })
            // Приcоединяем items и передаем
            .concat(listData.filter(item => item.parentUuid === nodeUuid));
    };

    onDataLoaded = (data) =>{
        // первоначальное заполнение данных
        const treeData = data.filter(item => item.group === true);
        const listData = data.filter(item => item.group === false);
        const children = transformTreeData(treeData, null);
        this.setState({
            listData: listData,
            treeData: treeData,
            transformTreeData: addRootNode(children, this.state.store.name),
            displayListData: this.displayListData(treeData, listData, null),
            loading: false,
            menu: null
        });
    };

    updateData(){
        const store_id = 0;
        this.evotorService
            .getAllProducts(store_id)
            .then(this.onDataLoaded);
    }

    handleKeyDown =(event) =>{
      console.log("Key down event", event);
    };

    render() {
        if(this.state.loading)
            return(<LoadingView/>);
        return (
            <ContextMenuProvider value = { this.contextMenu }>
                <Layout style={{ width: '100%', height: '100%' }}
                        onKeyDown={ this.handleKeyDown }>
                    <LayoutPanel
                        region="north"
                        style={{ height: 60 }}>
                        <Header/>
                    </LayoutPanel>

                    <LayoutPanel
                        title="Группы товаров"
                        collapsible
                        collapsed = { this.state.collapsedWest}
                        expander
                        region="west"
                        split
                        style={{ minWidth: 150, maxWidth: 400 }}>
                        <ErrorBoundry>
                            <Droppable onDrop={this.handleDrop.bind(this)}>
                                <ItemTree
                                    data = { this.state.transformTreeData }
                                    menuRef = { this.contextMenu.treeMenuRef }
                                    handleTreeSelectionChange = { this.handleTreeSelectionChange }
                                    handleTreeNodeSelection = { this.handleTreeNodeSelection }
                                />
                            </Droppable>
                        </ErrorBoundry>
                    </LayoutPanel>

                    <LayoutPanel region="center">
                        <Draggable>
                            <ItemList
                                { ...this.state.constants }
                                node = { this.state.treeSelection }
                                listData = { this.state.displayListData }
                                onListSelectionChange = { this.onListSelectionChange }
                            />
                        </Draggable>
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