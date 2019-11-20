import React, { Component } from 'react';
import { Tree } from 'rc-easyui';
import ContextMenu, { ContextMenuConsumer } from "../context-menu";
import './item-tree.css'



export default class ItemTree extends Component {
    constructor(props){
        super(props);
        this.handleContextMenuClick.bind(this);
        this.state = {
            selection: null
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
        this.tree.selectNode(node);
        this.setState({
            selection: node
        });
        //console.log(node.text);
        this.menu.showContextMenu(originalEvent.pageX, originalEvent.pageY);
    };

    handleContextMenuClick = (value) => {
        this.menuFunc.find(m => m.key === value).func(this.state.selection);

    };

    render() {
        return (
            <ContextMenuConsumer>
                {
                    ({ treeMenu: menu, treeMenuFunc: menuFunc }) =>{
                        this.menuFunc = menuFunc;
                        this.menu = this.props.menuRef.current;
                        return(
                            <>
                                <Tree
                                    ref = {(tree)=>{this.tree = tree}}
                                    render = { this.renderNode }
                                    animate
                                    onNodeDblClick = { this.props.handleTreeNodeSelection }
                                    onSelectionChange = { this.props.handleTreeSelectionChange }
                                    data={ this.props.treeData }
                                    onNodeContextMenu={ this.handleNodeContextMenu}
                                />
                                <ContextMenu
                                    menu={ menu }
                                    menuRef = { this.props.menuRef }
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
