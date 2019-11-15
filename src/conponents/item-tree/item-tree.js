import React, { Component, ReactFragment } from 'react';

import './item-tree.css'
import { Tree } from 'rc-easyui';
import { ContextMenu } from "../context-menu/context-menu";


export default class ItemTree extends Component {
    constructor(props){
        super(props);
        console.log(props);
        this.state = {
            menu: [
                {   menuItem: { key: "create", text: "Создать", disabled: false } },
                {   menuItem: { key: "open", text: "Открыть", disabled: false} },
                {   menuItem: { key: "print", text: "Печатать", disabled: true, iconCls: "icon-print" } },
                {   menuItem: { key: "submenu", text: "Субменю", disabled: false},
                    subMenu: [
                        { menuItem: { key: "save", text:"Сохранить", disabled: false, iconCls: "icon-save" } },
                        { menuItem: { key: "menu1", text:"Меню1", disabled: false } },
                        { menuItem: { key: "menu2", text:"Меню1", disabled: false } },
                    ]
                },
                {   menuItem: { key: "close", text: "Закрыть", disabled: false } },
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
