import React, { Component } from 'react';

import './item-tree.css'
import { Tree } from 'rc-easyui';

export default class ItemTree extends Component {
    constructor(props){
        super(props);
        this.state = {
            menuData: [],
        };
    }

    renderNode = ({ node }) => {
        return (
            <span tabIndex="0">
            {node.text}
            </span>
        )
    };

    render() {
        const { treeData } = this.props;
        return (
            <Tree render = { this.renderNode }
                animate
                dblclickToEdit
                data={ treeData }/>
        )
    }
}
