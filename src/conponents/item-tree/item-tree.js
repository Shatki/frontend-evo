import React, { Component } from 'react';
import { Tree, Droppable } from 'rc-easyui';
import ContextMenu from "../context-menu";
import ErrorView from "../error-view";
import { deleteNode, createNode } from "../../algorithms/node-services";
import ErrorBoundry from "../error-boundry";
import './item-tree.css'



export default class ItemTree extends Component {
    constructor(props){
        super(props);
        //this.handleContextMenuClick.bind(this);
        //this.handleNodeContextMenu.bind(this);
        //this.handleSelectionChange.bind(this);
        this.state = {
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

    handleNodeDragOver = (node) => {
        this.tree.selectNode(node);
        console.log("Drag over =>", node.text);
    };

    handleNodeDragLeave = (node) => {
        console.log("Drag leave =>", node.text);
    };

    handleNodeDrop = (node) => {
        this.props.onDrop(node);
        //console.log("Drop =>", node.text);
    };

    renderNode = ({ node }) => {
        return (
            <Droppable
                onDragOver={ () => this.handleNodeDragOver(node) }
                onDragLeave={ () => this.handleNodeDragLeave(node) }
                onDrop={ () => this.handleNodeDrop(node) }
            >
                <div tabIndex="0">
                    {node.text}
                </div>
            </Droppable>
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

    changeSelections = (selection=null) => {
        // Основная функция изменения выделений строк в ItemTree
        this.setState({
            selection: selection,
        });
    };

    handleNodeContextMenu = ({ node, originalEvent }) => {
        originalEvent.preventDefault();
        // Выделим ноду
        this.changeSelections(node);
        // Выберем ноду
        this.tree.selectNode(node);
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
        this.props.onTreeNodeSelection(node)
    };

    handleSelectionChange = (node) => {
        // Вызываем для сохранения стейта в Дашбоард
        if (this.state.editingNode !== null) this.tree.cancelEdit();

        this.props.onTreeSelectionChange(node);
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

    handleNodeExpand = (node) => {
        // Сохраним state="opened" у ноды в dataTree
        if (node.uuid !== null) this.props.onChangeNodeState(node, "open")
    };

    handleNodeCollapse = (node) => {
        // Сохраним state="closed" у ноды в dataTree
        if (node.uuid !== null) this.props.onChangeNodeState(node, "closed")
    };

    renderContextMenu = (menu) => {
        return(
            <ContextMenu
                menu = { menu }
                menuRef = { (ref)=>this.menu=ref }
                handleItemClick = { this.handleContextMenuClick }
            />
        )
    };

    render() {
        if(this.state.hasError)
            return (<ErrorView/>);
        return (
            <ErrorBoundry>
                <Tree
                    ref = { tree=>this.tree=tree }
                    render = { this.renderNode }
                    animate
                    onNodeDblClick = { this.handleNodeDblClick }
                    onNodeExpand = { this.handleNodeExpand }
                    onNodeCollapse = { this.handleNodeCollapse }
                    onSelectionChange = { this.handleSelectionChange }
                    data = { this.props.treeData }
                    onNodeContextMenu = { this.handleNodeContextMenu }
                    onEditBegin = { this.handleEditBegin }
                    onEditEnd = { this.handleEditEnd }
                    onEditCancel = { this.handleEditCancel }
                />
                { this.renderContextMenu(this.props.contextMenu) }
            </ErrorBoundry>
        )
    }
}
