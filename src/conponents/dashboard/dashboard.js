import React from 'react';
import { Layout, LayoutPanel } from 'rc-easyui';
import { Draggable, Droppable } from 'rc-easyui';

import Header from "../header"
import ItemTree from "../item-tree";
import ItemList from "../item-list";
import ItemDetail from "../item-detail";
import './dashboard.css'

import '../../themes/custome/style.css'
import '../../themes/react.css'
import '../../themes/icon.css'
import EvotorService from "../../services/evotor-service";


export default class Dashboard extends React.Component {
    evotorService = new EvotorService();

    constructor(props) {
        super(props);
        this.state = {
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
            listMenuRef: React.createRef(),
            treeMenuRef: React.createRef(),
        };
        this.updateData();
    };

    addRootTreeData = (treeData) => {
        return([
            {
                uuid: null,
                text: "Магазин 'XXI BEK'",
                state: 'opened',
                children: this.transformTreeData(treeData, null),
            }
        ]);
    };

    onListSelectionChange = (selection) =>{
        // console.log(selection);
        this.setState({
            listSelection: selection
        });
    };

    onTreeNodeSelection = (node) =>{
        const { treeData, listData } = this.state;
        this.setState({
            treeSelection: node,
            displayListData: this.displayListData(treeData, listData, node.uuid)
        });
    };

    onTreeSelectionChange = (node) =>{
        this.setState({
            treeSelection: node,
        });
    };

    transformTreeData = (data, parentUuid=null) => {
        // Возвращает коренной список, parentUuid = null
        // Алгоритм преобразования данных в объект для listTree
        const children = data.filter(item => parentUuid === item.parentUuid);
        // alert(children.toSource());
        if (children.length > 0){
            // Выбираем элементы имеющие children
            return  children.map((child)=>{
                let transformTreeData = this.transformTreeData(data, child.uuid);
                if (transformTreeData.length > 0){
                    // Родительский узел
                    return{
                        uuid: child.uuid,
                        text: child.name,
                        state: 'closed',
                        children: transformTreeData
                    };
                }
                else{
                    // Конечный узел
                    return{
                        uuid: child.uuid,
                        text: child.name,
                    };
                }
            });
        } else {
            return [];
        }
    };

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
        this.setState({
            listData: listData,
            treeData: treeData,
            transformTreeData: this.addRootTreeData(treeData),
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

    render() {
        return (
            <Layout style={{ width: '100%', height: '100%' }}>
                <LayoutPanel region="north" style={{ height: 60 }}>
                    <Header/>
                </LayoutPanel>

                <LayoutPanel region="west" split style={{ minWidth: 150, maxWidth: 400 }}>
                    <ItemTree
                        treeData = { this.state.transformTreeData }
                        menuRef = { this.state.treeMenuRef }
                        onTreeSelectionChange = { this.onTreeSelectionChange }
                        onTreeNodeSelection = { this.onTreeNodeSelection }
                    />
                </LayoutPanel>

                <LayoutPanel region="center">
                    <ItemList
                        { ...this.state.constants }
                        node = { this.state.treeSelection }
                        menuRef = { this.state.listMenuRef }
                        listData = { this.state.displayListData }
                        onListSelectionChange = { this.onListSelectionChange }
                    />
                </LayoutPanel>

                <LayoutPanel region="east" split style={{ minWidth: 200, maxWidth: 400 }}>
                    <ItemDetail
                        { ...this.state.constants }
                        itemData = { this.state.itemData }
                    />
                </LayoutPanel>
            </Layout>
        );
    }
}