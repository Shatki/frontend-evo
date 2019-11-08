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



export default class Dashboard extends React.Component {
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
                    {value: null, text: "Нет"},
                    {value: "шт", text: "шт"},
                    {value: "уп", text: "уп"}
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
            itemDetail: [
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
                        "tax": "VAT_18",
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
        }
    };

    render() {
        return (
            <div>
                <Header/>
                <Layout style={{ width: '100%', height: 600 }}>
                    <LayoutPanel region="west" split style={{ minWidth: 150, maxWidth: 300 }}>
                        <ItemTree/>
                    </LayoutPanel>
                    <ItemList/>
                    <LayoutPanel region="east" split style={{ minWidth: 200, maxWidth: 400 }}>
                        <ItemDetail {...this.state.constants } itemData = { this.state.itemDetail } />
                    </LayoutPanel>
                </Layout>
            </div>
        );
    }
}