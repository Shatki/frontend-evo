import React, { Component } from 'react';
import { Tree } from 'rc-easyui';
import ContextMenu, { ContextMenuConsumer } from "../context-menu";
import ErrorView from "../error-view";
import { deleteNode, createNode } from "../../algorithms/node-services";

import './item-tree.css'


export default class ItemTree extends Component {
    constructor(props){
        super(props);
        //this.handleContextMenuClick.bind(this);
        //this.handleNodeContextMenu.bind(this);
        //this.handleSelectionChange.bind(this);
        this.state = {
            data: props.data,
            hasError: false,
            selection: null,
            editingNode: null,
        };
        this.treeContextMenuFunction = [
            { key: "Создать", function: this.handleTreeNodeCreate },
            { key: "Переименовать", function: this.handleTreeNodeRename },
            { key: "Открыть", function: this.handleNodeDblClick },
            { key: "Удалить", function: this.handleTreeNodeDelete },
            { key: "Закрыть", function: this.handleContextMenuClose },
        ]
    }

    componentDidMount() {
        this.setState({
            data: this.props.data
        })
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
        // Todo Каждое действие отправляется на сервер для Redo/Undo
        const newNode = createNode(this.state.data, node);
        // Включаем редактор Ноды
        this.tree.selectNode(newNode);
        this.tree.beginEdit(newNode);
    };

    // ItemTree => Rename node
    handleTreeNodeRename = (node) =>{
        // Todo Каждое действие отправляется на сервер для Redo/Undo
        // Включаем редактор Ноды
        this.tree.selectNode(node);
        this.tree.beginEdit(node);
    };

    // ItemTree => Create new node
    handleTreeNodeDelete = (node) =>{
        // Todo Каждое действие отправляется на сервер для Redo/Undo
        this.setState({
            data: deleteNode(this.state.data, node)
        })
    };

    // ItemTree => Close menu
    handleContextMenuClose = (node) =>{
        this.tree.cancelEdit();
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

    handleNodeDblClick = (node) =>{
        // Вызываем головную функцию из Дашбоарда
        this.props.handleTreeNodeSelection(node)
    };

    handleSelectionChange = (node) => {
        // Вызываем для сохранения стейта в Дашбоард
        if (this.state.editingNode !== null) this.tree.cancelEdit();

        this.props.handleTreeSelectionChange(node);
    };

    handleEditBegin = ({ node, originalValue }) =>{
        this.setState({
            editingNode: node
        })
    };

    handleEditEnd = ({ node, originalValue }) =>{
        this.setState({
            editingNode: null
        })
    };

    handleEditCancel = ({ node, originalValue }) =>{
        this.setState({
            editingNode: null
        })
    };


    render() {
        if(this.state.hasError)
            return (<ErrorView/>);
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
                                    onNodeDblClick = { this.handleNodeDblClick }
                                    onSelectionChange = { this.handleSelectionChange }
                                    data={ this.state.data }
                                    onNodeContextMenu={ this.handleNodeContextMenu }
                                    onEditBegin = { this.handleEditBegin }
                                    onEditEnd = { this.handleEditEnd }
                                    onEditCancel = { this.handleEditCancel }
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
