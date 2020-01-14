/*
    Тут чисто JS
    Функции для работы с Нодами

    dataTree => линейный массив, в каждом элементе есть parentUuid указывающий uuid родителя:
    uuid = null только у коренного элемента

        [
            { node 1, parentUuid: null },
            { node 2, parentUuid: node1 },
                ...
            { node x, parentUuid: mode1 }
        ]

    displayTreeData => трансформированный массив нод в древовидную структуру.
    Каждая Нода это объект вида:
       {
            uuid: node_uuid,
            text: node_name,
            iconCls: "icon-node",
            state: 'open',
            children: [
                {   uuid: node_uuid,
                    text: node_name,
                    iconCls: "icon-node",
                    state: 'closed',
                    children: [...]
                    },
                {   uuid: node_uuid,
                    text: node_name,
                    iconCls: "icon-node",
                    state: 'closed',
                    children: [...]
                    }

            ]
         }
    У каждой ноды свойство children это массив дочерних нод
*/

export const addRootNode = (children, text) => {
    return([
        {
            uuid: null,
            text,
            state: 'open',
            iconCls: "icon-evotor-folder-user",
            children
        }
    ]);
};

export const transformTreeData = (row, children=[]) =>{
    // Конвертирует row в node
    if (children.length > 0){
        // Родительский узел
        return{
            uuid: row.uuid,
            text: row.name,
            iconCls: "icon-evotor-folder-sub",
            state: row.nodeState || 'closed',
            children
        };
    }
    else{
        // Конечный узел
        return{
            uuid: row.uuid,
            text: row.name,
            iconCls: "icon-evotor-folder",
        };
    }
};


export const displayTreeData = (data, parentUuid=null) => {
    // Возвращает коренной список, parentUuid = null
    // Алгоритм преобразования данных в объект для treeItem
    const dataFilter = data.filter(item => parentUuid === item.parentUuid);
    // alert(children.toSource());
    if (dataFilter.length > 0){
        // Выбираем элементы имеющие children
        return  dataFilter.map((child)=>{
            let children = displayTreeData(data, child.uuid);
            return transformTreeData(child, children)
        });
    } else {
        return [];
    }
};

export const createNode = (data, node) =>{
    // Todo Переделать по фенШую React:
    //  вернем новый элемент и новый массив для изменения через setState
    // а пока тупое изменение входящих данных
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
    return newNode
};


export const deleteNode = (data, node) =>{
    // Функция удаления узла из объекта:
    // возвращает новый массив, но без узла node
    return data.filter((item)=>{
        if(item.children !== undefined){
            item.children = deleteNode(item.children, node);
        }
        return item.uuid !== node.uuid
    })
};

export const moveNode = (data, node, movingNode) =>{
    /*  Функция виртуального перемещения ноды => на самом деле изменение parentUuid

        Замечание: Все операции проходят над dataTree, а не над обработанной transformTreeData
        dataTree => линейный массив, не обработанный для хранения данных
        displayTreeData = древовидный массив объектов, рабочий для отображения
        Запрет на перемещение "в себя" или в свои "дочерние" ноды
        node(dataTree) => Parent
        movingNode(dataTree) => Child
    */
    //console.log("--------------------------");
    //console.log("node=>", node);
    //console.log("movingNode=>", movingNode);

    if(node === undefined){
        //console.log("Перемещаю в корень", Object.assign(movingNode, { parentUuid: null }));
        return Object.assign(movingNode, { parentUuid: null });
    }else if ( node.uuid !== movingNode.uuid ) {
        // найдем родительскую ноду у целевой node
        const parentNode = data.find( (item)=>{ return item.uuid === node.parentUuid } );
        // если возможно перемещение в родительскую целевой, то можно и в целевую
        if( moveNode(data, parentNode, movingNode) !== null ){
            // Если возможно такое перемещение то
            //console.log("Перемещаю в ", node.name);
            return Object.assign(movingNode, { parentUuid: node.uuid });
        }
    }
    //console.log("Отмена перемещения");
    return null;
};

export const getNodeByUuid = (data, uuid) =>{
    /*  Функция возвращает искомую Ноду по uuid или null

        Замечание: Все операции проходят над displayTreeData(transformTreeData)
        Выполняется по рекурсивному принципу

        displayTreeData => древовидный массив объектов, рабочий для отображения

        data => древовидный массив
        uuid => итентификатор новы в формате uuid v4
    */
    let foundNode = null;
    data.forEach((node)=>{
        if(foundNode) return null;
        //console.log("Ищем ноду=>", node);
        if(node.uuid === uuid) foundNode = node;
        else if(node.children !== undefined) foundNode = getNodeByUuid(node.children, uuid);
    });
    return foundNode
};