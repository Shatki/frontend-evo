import React, { Component } from 'react';
import { Tree } from 'rc-easyui';
import ContextMenu, { ContextMenuConsumer } from "../context-menu";
import './item-tree.css'



export default class ItemTree extends Component {
    constructor(props){
        super(props);
        console.log(props);
        this.state = {
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
        this.menu_current.showContextMenu(originalEvent.pageX, originalEvent.pageY);
    };

    handleContextMenuClick = (value) => {
        console.log(this.menuFunc.key[value]);
        console.log(value);
    };

    render() {
        return (
            <ContextMenuConsumer>
                {
                    ({ treeMenuRef : menuRef, treeMenu: menu, treeMenuFunc: menuFunc }) =>{
                        this.menu_current = menuRef.current;
                        this.menuFunc = menuFunc;
                        return(
                            <>
                                <Tree
                                    render = { this.renderNode }
                                    animate
                                    onNodeDblClick = { this.props.handleTreeNodeSelection }
                                    onSelectionChange = { this.props.handleTreeSelectionChange }
                                    data={ this.props.treeData }
                                    onNodeContextMenu={ this.handleNodeContextMenu.bind(this)}
                                />
                                <ContextMenu
                                    menu={ menu }
                                    menuRef={ menuRef }
                                    handleItemClick = { this.handleContextMenuClick }
                                />
                            </>
                        )
                    }
                }
            </ContextMenuConsumer>
        )
    }
}
