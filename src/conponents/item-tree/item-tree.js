import React, { Component } from 'react';
import { Tree, Droppable } from 'rc-easyui';
import ContextMenu from "../context-menu";
import {
    createNode,
    processingTreeData,
    addRootNode,
    transformNodeToRow,
    cutRow,
    getNodeByUuid,
} from "../../services/nodes-service";
import ErrorBoundry from "../error-boundry";
import './item-tree.css'


export default class ItemTree extends Component {
    constructor(props){
        super(props);
        this.state = {
            data: [],
            nodeState: [],                              // Массив uuid хранения состояния открытых нод

            hasError: false,
            selection: null,
            editingNode: null,

            // Если эти значения не null, во время обновления стейта активируутся
            // редактирование и выделение этой ноды
            autoEditingUuid: null,
        };
        this.treeContextMenuFunction = [
            { key: "Создать", function: this.handleTreeNodeCreate },
            { key: "Переименовать", function: this.handleTreeNodeRename },
            { key: "Открыть", function: this.handleNodeDblClick },
            { key: "Удалить", function: this.handleTreeNodeCut },
            { key: "Закрыть", function: this.handleContextMenuClose },
        ];
        this.updateItemData = props.updateItemData;
        this.onTreeNodeSelectView = props.onTreeNodeSelectView;
        this.onTreeSelectionChange = props.onTreeSelectionChange;
        this.notificator = props.notificator;

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
    // Эта штука для включения редактирования новой добавленной ноды
    if(prevState.autoEditingUuid) this.tree.beginEdit(this.state.selection);
    }

    /* ----------------- Data operations ---------------------------------------------- */
    updateData = () => {
        const { itemTreeData } = this.props;
        const { nodeState, root, autoEditingUuid } = this.state;

        // parentUuid === null так как Tree видно полное дерево
        const children = processingTreeData(itemTreeData, nodeState, null);
        console.log("ItemTree Обновление data--->");
        const data = addRootNode(children, root);
        // Выделяем и редактируем новую ноду
        const selection = autoEditingUuid ? getNodeByUuid(data, autoEditingUuid): null;

        this.setState({
            data,
            selection,
            autoEditingUuid: null,
        });
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
        console.log("Create node | node=> ", node);
        const rowNode = createNode(node);
        this.updateItemData(rowNode);
        // Включаем редактор Ноды
        this.setState({
           autoEditingUuid: rowNode.uuid,
        });
        //this.tree.selectNode(target);
        //this.tree.beginEdit(target);
    };

    // ItemTree => Rename node
    handleTreeNodeRename = (node) =>{
        // Включаем редактор Ноды
        this.tree.selectNode(node);
        this.tree.beginEdit(node);
    };

    // ItemTree => Create new node ---------------------------------
    handleTreeNodeCut = (node) =>{
        this.updateItemData(cutRow(node));
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
        const { selection } = this.state;
        const action = this.treeContextMenuFunction.find(m => m.key === value);
        // выбираем [0] т.к e ItemList selections это массив
        if (action !== undefined) action.function(selection);
        else this.notificator.show("Данное действие не возможно выполнить", { type: "error" });
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
        // Обновление или создание ноды
        if(node.text !== originalValue){
            const row = transformNodeToRow(node);
            this.updateItemData(row);
            console.log("itemTree handleEditEnd node=>", row);
        }
        this.setState({
            editingNode: null
        })
    };

    handleEditCancel = () =>{
        this.setState({
            editingNode: null
        })
    };

    handleChangeNodeState = (node, state) => {
        /*  Todo Устарела. Сильно тормозит, нужно что-то сделать
            open - true
         */
        //const row = transformNodeToRow(node);
        //this.updateItemData(Object.assign(row, { state }));
        //const idx = nodeState.findIndex(el=>el.uuid===node.uuid);
        console.log("changeNodeState node/state=>", node, state);
    };

    handleNodeExpand = (node) => {
        const { nodeState } = this.state;
        // Добавим в nodeState uuid ноды, так как она открыта
        if (node.uuid !== null)
            this.setState({ nodeState: [node.uuid].concat(nodeState) });
        console.log('----NodeExpand state=>', nodeState);
    };

    handleNodeCollapse = (node) => {
        const { nodeState } = this.state;
        // Удалим из nodeState uuid ноды, так как она закрыта
        if (node.uuid !== null)
            this.setState( { nodeState: nodeState.filter(uuid=>uuid!==node.uuid)});
        //console.log('----NodeCollapse state=>', nodeState);
    };

    /* ----------------- Render методы отображения компонента ------------------------- */
    renderContextMenu = () => {
        return(
            <ContextMenu
                menu = { this.props.contextMenu.treeMenu }
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
        const { data, selection } = this.state;
        return (
            <ErrorBoundry key = "item-tree">
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
