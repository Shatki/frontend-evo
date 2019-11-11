import React, { Component } from 'react';

import './item-tree.css'
import { Tree } from 'rc-easyui';

export default class ItemTree extends Component {
    constructor(props){
        super(props);
        this.state = {
            menuData: [
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
        };
    }


    render() {
        const { treeData } = this.props;
        return (
            <Tree
                animate
                dblclickToEdit
                data={ treeData }/>
        )
    }
}
