import React, { Component } from 'react';
import { Tree } from 'rc-easyui';
import ContextMenu from "../context-menu";
import './item-tree.css'



export default class ItemTree extends Component {
    constructor(props){
        super(props);
        console.log(props);
        this.state = {
            menu: [
                { key: "create", text: "Создать", disabled: false },
                { key: "open", text: "Открыть", disabled: false },
                { key: "print", text: "Печатать", disabled: true, iconCls: "icon-print"  },
                { key: "submenu", text: "Субменю", disabled: false,
                    submenu: [
                        { key: "save", text:"Сохранить", disabled: false, iconCls: "icon-save" },
                        { key: "menu1", text:"Меню1", disabled: false },
                        { key: "menu2", text:"Меню1", disabled: false },
                    ]
                },
                { key: "close", text: "Закрыть", disabled: false },
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
        this.props.menuRef.current.showContextMenu(originalEvent.pageX, originalEvent.pageY);
    };

    handleContextMenuClick = (value) => {
        console.log(value);
    };

    render() {
        return (
            <React.Fragment>
                <Tree
                    render = { this.renderNode }
                    animate
                    onNodeDblClick = { this.props.onTreeNodeSelection }
                    onSelectionChange = { this.props.onTreeSelectionChange }
                    data={ this.props.treeData }
                    onNodeContextMenu={ this.handleNodeContextMenu.bind(this)}
                />
                <ContextMenu
                    menu={ this.state.menu }
                    menuRef={ this.props.menuRef }
                    handleItemClick = { this.handleContextMenuClick }
                />
            </React.Fragment>
        )
    }
}
