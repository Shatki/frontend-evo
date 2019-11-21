import React, { Component } from 'react';
import { Tree } from 'rc-easyui';
import ContextMenu, { ContextMenuConsumer } from "../context-menu";
import './item-tree.css'



export default class ItemTree extends Component {
    constructor(props){
        super(props);
        this.handleContextMenuClick.bind(this);
        this.handleNodeContextMenu.bind(this);
        this.state = {
            selection: null
        };
        this.treeContextMenuFunction = [
            { key: "Создать", function: this.handleTreeNodeCreate },
            { key: "Открыть", function: this.props.handleTreeNodeSelection },
        ]
    }

    renderNode = ({ node }) => {
        return (
            <span tabIndex="0">
            {node.text}
            </span>
        )
    };

    // ItemTree => Create new node
    handleTreeNodeCreate = (node) =>{
        // Todo Вообще товар создаем на сервере, пока без
        const itemUuid = require('uuid/v4');
        const newNode = {
            uuid: itemUuid(),
            text: 'Новая папка',
            iconCls: "icon-evotor-folder",
        };
        //console.log(newItemTree);
        if(node.children === undefined){

            node.children = [newNode]
        }else{
            node.children.push(newNode);
        }
        // Включаем редактор Ноды
        this.tree.selectNode(newNode);
        this.tree.beginEdit(newNode);
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
        this.treeContextMenuFunction
            .find(m => m.key === value)
            .function(this.state.selection);
    };

    render() {
        return (
            <ContextMenuConsumer>
                {
                    ({ treeMenu: menu }) =>{
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
