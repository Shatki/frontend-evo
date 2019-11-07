import React from 'react';
import { Layout, LayoutPanel } from 'rc-easyui';
import { Draggable, Droppable } from 'rc-easyui';

import Header from "../header"
import ItemTree from "../item-tree";
import ItemList from "../item-list";
import ItemDetail from "../item-detail";
import './dashboard.css'


export default class Dashboard extends React.Component {
    state = {
        };

    constructor(props) {
        super(props);
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
                        <ItemDetail/>
                    </LayoutPanel>
                </Layout>
            </div>
        );
    }
}