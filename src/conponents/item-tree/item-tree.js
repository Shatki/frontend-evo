import React, { Component } from 'react';

import './item-tree.css'
import { Tree } from 'rc-easyui';

export default class ItemTree extends Component {
    renderNode = ({ node }) => {
        return (
            <span tabIndex="0">
            {node.text}
            </span>
        )
    };

    render() {
        const { onTreeSelectionChange, treeData } = this.props;
        return (
            <Tree render = { this.renderNode }
                animate
                dblclickToEdit
                onSelectionChange = { onTreeSelectionChange }
                data={ treeData }/>
        )
    }
}
