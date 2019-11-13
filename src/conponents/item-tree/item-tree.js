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
        const { onTreeSelectionChange,
                onTreeNodeSelection,
                treeData } = this.props;
        return (
            <Tree render = { this.renderNode }
                animate
                onNodeDblClick = { onTreeNodeSelection }
                onSelectionChange = { onTreeSelectionChange }
                data={ treeData }/>
        )
    }
}
