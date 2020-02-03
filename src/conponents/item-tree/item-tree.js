import React, { Component } from 'react';
import { Tree, Droppable } from 'rc-easyui';
import ContextMenu from "../context-menu";
import ErrorView from "../error-view";
import {
    deleteNode,
    createNode,
    processingTreeData,
    addRootNode,
    transformNodeToRow
} from "../../services/nodes-service";
import ErrorBoundry from "../error-boundry";
import './item-tree.css'


export default class ItemTree extends Component {
    constructor(props){
        super(props);
        this.state = {
            data: [],

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
        ];
        this.updateItemData = props.updateItemData;
        this.onTreeNodeSelectView = props.onTreeNodeSelectView;
        this.onTreeSelectionChange = props.onTreeSelectionChange;
        this.onChangeNodeState = props.onChangeNodeState;

        // Сохраним сеттер keyboard events listener для передачи другим компонентам
        this.setKeyboardEventsListener = props.setKeyboardEventsListener;
    }

    /* ----------------- Lifecycle methods -------------------------------------------- */
    componentDidMount() {
        this.updateData();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
    if(prevProps.itemTreeData !== this.props.itemTreeData)
            this.updateData();
    }

    /* ----------------- Data operations ---------------------------------------------- */
    updateData = () => {
        const { itemTreeData } = this.props;
        const { root } = this.state;
        // parentUuid === null так как Tree видно полное дерево
        const children = processingTreeData(itemTreeData, null);
        console.log("ItemTree Обновление itemTreeData/children=>", itemTreeData, children);
        const data = addRootNode(children, root);
        this.setState({ data });
    };

    /* ----------------- Keyboard event functions ------------------------------------- */
    componentKeyboardEvents = (e) =>{
        /*
        *  This argument contains a handful of properties:
        *  "keyCode"
        *  Every key we press on your keyboard has a number associated with it.
        *  This read-only property returns that number.
        *  "charCode"
        *  This property only exists on event arguments returned by the keypress event, and it contains the ASCII
        *  code for whatever character key you pressed.
        *  "ctrlKey", "altKey", "shiftKey"
        *  These three properties return a true if the Ctrl key, Alt key, or Shift key are pressed.
        *  "metaKey"
        *  The metaKey property is similar to the ctrlKey, altKey, and shiftKey properties in that it returns
        *  a true if the Meta key is pressed. The Meta key is the Windows key on Windows
        *  keyboards and the Command key on Apple keyboards.
        * */
        console.log("ItemTree Keyboard Listener");
        if(e.key === 'Enter' && e.code === 'Enter' && e.ctrlKey === false)
            this.handleItemTreeKeyEnter();
        if(e.key === 'Escape' && e.code === 'Escape' && e.ctrlKey === false)
            this.handleItemTreeKeyEscape();
    };

    handleItemTreeKeyEnter = () =>{
        this.tree.endEdit();
        console.log("ItemTree Enter Key selection=>", this.state.selection);
    };

    handleItemTreeKeyEscape = () =>{
        this.tree.cancelEdit();
        console.log("ItemTree Escape Key");
    };
    /* ----------------- Обработка событий ItemList ----------------------------------- */
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

    // ItemTree => Create new node
    handleTreeNodeCreate = (node) =>{
        // Todo Каждое действие отправляется на сервер для Redo/Undo
        console.log("Create node| node=> ", node);
        const { data } = this.state;
        const newNode = createNode(data, node);
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

    // ItemTree => Create new node ---------------------------------
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
        this.onTreeNodeSelectView(node)
    };

    handleSelectionChange = (selection) => {
        // При изменении выделений, меняем фокус клавиатуры
        this.setKeyboardEventsListener(this.componentKeyboardEvents);
        // Вызываем для сохранения стейта в Дашбоард
        if (this.state.editingNode !== null) this.tree.cancelEdit();
        this.setState({ selection })
    };

    handleEditBegin = ({ node, originalValue }) =>{
        this.setState({
            editingNode: node
        })
    };

    handleEditEnd = ({ node, originalValue }) =>{
        //
        const row = transformNodeToRow(node);
        this.updateItemData(row);
        console.log("itemTree handleEditEnd node=>", row);

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
        if (node.uuid !== null) this.onChangeNodeState(node, "open")
    };

    handleNodeCollapse = (node) => {
        // Сохраним state="closed" у ноды в dataTree
        if (node.uuid !== null) this.onChangeNodeState(node, "closed")
    };

    /* ----------------- Render методы отображения компонента ------------------------- */
    renderContextMenu = () => {
        return(
            <ContextMenu
                menu = { this.props.contextMenu }
                menuRef = { (ref)=>this.menu=ref }
                handleItemClick = { this.handleContextMenuClick }
            />
        )
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

    render() {
        console.log("ItemTree render--->>>");
        const { data, selection, hasError } = this.state;
        if(hasError)
            return (<ErrorView/>);
        return (
            <ErrorBoundry>
                <Tree
                    style = {{ height: "100%" }}
                    ref = { tree=>this.tree=tree }
                    render = { this.renderNode }
                    animate
                    data = { data }
                    selection = { selection }
                    onNodeDblClick = { this.handleNodeDblClick }
                    onNodeExpand = { this.handleNodeExpand }
                    onNodeCollapse = { this.handleNodeCollapse }
                    onSelectionChange = { this.handleSelectionChange }
                    onNodeContextMenu = { this.handleNodeContextMenu }
                    onEditBegin = { this.handleEditBegin }
                    onEditEnd = { this.handleEditEnd }
                    onEditCancel = { this.handleEditCancel }
                />
                { this.renderContextMenu() }
            </ErrorBoundry>
        )
    }
}
