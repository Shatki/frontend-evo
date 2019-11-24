import React, { Component } from 'react';
import { Tree } from 'rc-easyui';
import ContextMenu, { ContextMenuConsumer } from "../context-menu";
import ErrorView from "../error-view";
import './item-tree.css'


export default class ItemTree extends Component {
    constructor(props){
        super(props);
        this.handleContextMenuClick.bind(this);
        this.handleNodeContextMenu.bind(this);
        this.state = {
            data: props.data,
            hasError: false,
            selection: null
        };
        this.treeContextMenuFunction = [
            { key: "Создать", function: this.handleTreeNodeCreate },
            { key: "Открыть", function: this.props.handleTreeNodeSelection },
            { key: "Удалить", function: this.handleTreeNodeDelete },
            { key: "Закрыть", function: this.handleContextMenuClose },
        ]
    }

    componentDidMount() {
        this.setState({
            data: this.props.data
        })
    }

    componentDidCatch(error, errorInfo) {
        console.log(errorInfo.componentStack);
        this.setState({
            hasError: true
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

    // ItemTree => Create new node
    handleTreeNodeDelete = (node) =>{
        // Todo Удаляем сервере через redo undo, пока без
        if(node.children === undefined){
            //Если у ноды есть дети, удаляем рекурсивно

            node.children = []
        }else{
            node.children.pop(node);
        }
        // Включаем редактор Ноды
        //this.tree.selectNode(newNode);
        //this.tree.beginEdit(newNode);
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

    render() {
        if(this.state.hasError)
            return (<ErrorView/>);
        console.log(this.state.data);
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
                                    data={ this.state.data }
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
