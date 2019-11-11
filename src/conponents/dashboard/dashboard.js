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
            loading: true,
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
            treeData: [
                {
                    text: "Item1",
                    children: [
                        { text: "Item11" },
                        {
                            text: "Item12",
                            state: "closed",
                            children: [
                                { text: "Iteme121" },
                                { text: "Iteme122" },
                                { text: "Iteme123" }
                            ]
                        },
                        { text: "Item13" },
                        { text: "Item14" }
                    ]
                },
                { text: "Item2" }
            ],
            transformTreeData: [],
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

        };
        this.updateData();
    };

    transforTreeData = (data, parentUuid=null) => {
        // Возвращает коренной список, parentUuid = null
        // Алгоритм преобразования данных в объект для listTree
        const children = data.filter(item => parentUuid === item.parentUuid);
        // alert(children.toSource());
        if (children.length > 0){
            // Выбираем элементы имеющие children
            return  children.map((child)=>{
                //
                //console.log(child, child.parentUuid);
                return{
                    uuid: child.uuid,
                    text: child.name,
                    state: 'closed',
                    children: this.transforTreeData(data, child.uuid)
                };
            });
        } else {
            return [];
        }
    };

    onDataLoaded = (data) =>{
        const treeData = data.filter(item => item.group === true);
        this.setState({
            listData: data.filter(item => item.group === false),
            treeData: treeData,
            transformTreeData: this.transforTreeData(treeData, null),
            loading: false
        });
    };

    updateData(){
        const store_id = 0;
        this.evotorService
            .getAllProducts(store_id)
            .then(this.onDataLoaded);
    }

    render() {
        const { constants, itemData, transformTreeData, listData } = this.state;
        return (
            <div >

                <Layout style={{ width: '100%', height: '100%' }}>
                    <LayoutPanel region="north" style={{ height: 60 }}>
                        <Header/>
                    </LayoutPanel>

                    <LayoutPanel region="west" split style={{ minWidth: 150, maxWidth: 400 }}>
                        <ItemTree treeData = { transformTreeData }/>
                    </LayoutPanel>

                    <LayoutPanel region="center">
                        <ItemList { ...constants } data = { listData }/>
                    </LayoutPanel>
                    <LayoutPanel region="east" split style={{ minWidth: 200, maxWidth: 400 }}>
                        <ItemDetail { ...constants } itemData = { itemData } />
                    </LayoutPanel>
                </Layout>
            </div>
        );
    }
}