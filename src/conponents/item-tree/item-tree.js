import React, { Component, ReactFragment } from 'react';

import './item-tree.css'
import { Tree } from 'rc-easyui';
import { ContextMenu } from "../context-menu/context-menu";





export default class ItemTree extends Component {
    constructor(props){
        super(props);
        console.log(props);
        //this.menuRef = props.menuRef;
        this.state = {
            menu: [
                { id: 1, text: "Создать", disabled: false },
                { id: 2, text: "Открыть", disabled: false },
                { id: 3, text: "Печатать", disabled: true },
                { id: 4, text: "Закрыть", disabled: false },
            ],
        }
    }


    renderNode = ({ node }) => {
        return (
            <span tabIndex="0">
            {node.text}
            </span>
        )
    };

    handleNodeContextMenu = ({ node, originalEvent }) => {
        originalEvent.preventDefault();
        console.log(node.text);
        this.props.menuRef.current.showContextMenu(originalEvent.pageX, originalEvent.pageY)
    };

    render() {
        return (
            <React.Fragment>
                <Tree render = { this.renderNode }
                      animate
                      onNodeDblClick = { this.props.onTreeNodeSelection }
                      onSelectionChange = { this.props.onTreeSelectionChange }
                      data={ this.props.treeData }
                      onNodeContextMenu={ this.handleNodeContextMenu.bind(this)}
                />
                <ContextMenu menuRef={ this.props.menuRef } menu={ this.state.menu }/>
            </React.Fragment>
        )
    }
}
