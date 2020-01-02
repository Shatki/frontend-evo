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

export  const moveNode = (data, node, movingNode) =>{
    /*  Функция виртуального перемещения ноды => на самом деле изменение parentUuid

        Замечание: Все операции проходят над dataTree, а не над обработанной transformTreeData
        dataTree => линейный массив, не обработанный для хранения данных
        displayTreeData = древовидный массив объектов, рабочий для отображения
        Запрет на перемещение "в себя" или в свои "дочерние" ноды

    */
    //console.log("node=>", node);
    //console.log("movingNode=>", movingNode);
    let checkStatus = true;
    if ( node.uuid !== null ){
        let testNode = { parentUuid: node.uuid };
        do {
            // Ищем родительскую ноду у целевой ноды.
            // Todo:  Что-то тут не то, итератора нет
            testNode = data.find( (item)=>{ return item.uuid === testNode.parentUuid } );
            //console.log("testNode=>", testNode);
            // Если целевая нода это перемещаемая нода, то отмена перемещения
            if( testNode.uuid === movingNode.uuid ) {
                console.log("Отмена перемещения");
                checkStatus = false
            }
        } while ( testNode.parentUuid !== null && checkStatus !== false );
    }
    if( checkStatus===true ) {
        console.log("Перемещаю");
        // Перемещаю
        data.find(item=>item.uuid === movingNode.uuid).parentUuid = node.uuid;
    }
};