/*
    Тут чисто JS
    Библиотека функций для работы с данными

    itemDataTree, itemDataList => линейные массивы, состоящие из row,
            в каждом row есть parentUuid указывающий uuid родителя:
    uuid = null только у коренного элемента

        [
            { row 1, uuid: uuid_v4, parentUuid: null },
            { row 2, uuid: uuid_v4, parentUuid: node1.uuid },
                ...
            { row x, uuid: uuid_v4, parentUuid: mode1.uuid }
        ]

    processingTreeData => трансформированный массив в древовидную структуру.
    Каждая элемент структуры это ноды вида:
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
    /*
    *   Конвертирование row в node
    *
    * */
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

export const processingTreeData = (treeData, parentUuid=null) => {
    // Возвращает коренной список, parentUuid = null
    // Алгоритм преобразования данных в объект для treeItem
    const dataFilter = treeData.filter(item => parentUuid === item.parentUuid);
    //console.log("<------- processingTreeData=> (Выбираем все элемены выбранной ноды)parentUuid/dataFilter:", parentUuid, dataFilter);
    if (dataFilter.length > 0){
        // Выбираем элементы имеющие children
        return  dataFilter.map((child)=>{
            const children = processingTreeData(treeData, child.uuid);
            return transformTreeData(child, children)
        });
    } else {
        return [];
    }
};

export const processingListData = (treeData, listData, nodeUuid) => {
    /* Преобразование данных из Стейта в данные плагина для отображения в ListItem */
    // Сначала выбираем каталоги нужного node, затем добавляем items
    const tree =  treeData.filter(item => item.parentUuid === nodeUuid).map((item)=>{
        // Передаем в ItemList только наименование и код групп
        return{
            code: item.code,
            uuid: item.uuid,
            parentUuid: item.parentUuid,
            name: item.name,
            group: true
        }

    });
    //console.log("Приcоединяем items и передаем", tree, listData);

    // Приcоединяем items и передаем
    return tree.concat(listData.filter(item => item.parentUuid === nodeUuid));
};

export const processingItemData = (treeData, itemData, matrix) => {
    console.log("processingItemData=>", itemData);
    if(!itemData || !matrix)
        return null;
    else
        return matrix.map((property) => {
            // Если в свойстве пришел массив, то отправляем его в dataField
            if(Array.isArray(itemData[property.nameField]))
                property.dataField = itemData[property.nameField]
                    .map((code)=>{ return { value: code, text: code } });
            else property.valueField = itemData[property.nameField];
            //console.log(property);
            //if(property.nameField === "parentUuid") property.dataField = treeData;
            return property;
        });
};


export const createNode = (treeData, node) =>{
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


export const deleteNode = (treeData, node) =>{
    // Функция удаления узла из объекта:
    // возвращает новый массив, но без узла node
    return treeData.filter((item)=>{
        if(item.children !== undefined){
            item.children = deleteNode(item.children, node);
        }
        return item.uuid !== node.uuid
    })
};

export const moveNode = (treeData, node, movingNode) =>{
    /*  Функция виртуального перемещения ноды => на самом деле изменение parentUuid

        Замечание: Все операции проходят над itemTreeData, а не над обработанной processedTreeData
        itemTreeData => линейный массив, не обработанный для хранения данных
        processedTreeData = древовидный массив объектов, рабочий для отображения

        Запрет на перемещение "в себя" или в свои "дочерние" ноды
        node(treeData) => Parent
        movingNode(treeData) => Child
    */
    //console.log("--------------------------");
    //console.log("node=>", node);
    //console.log("movingNode=>", movingNode);

    if(node === undefined){
        console.log("Перемещаю в корень", Object.assign({}, movingNode, { parentUuid: null }));
        return Object.assign({}, movingNode, { parentUuid: null });
    }else if ( node.uuid !== movingNode.uuid ) {
        // найдем родительскую ноду у целевой node
        const parentNode = treeData.find( (item)=>{ return item.uuid === node.parentUuid } );
        // если возможно перемещение в родительскую целевой, то можно и в целевую
        if( moveNode(treeData, parentNode, movingNode) !== null ){
            // Если возможно такое перемещение то
            console.log("Перемещаю в ", node.name);
            return Object.assign({}, movingNode, { parentUuid: node.uuid });
        }
    }
    console.log("Отмена перемещения");
    return null;
};

export const getNodeByUuid = (treeData, uuid) =>{
    /*  Функция возвращает искомую Ноду по uuid или null

        Замечание:
        *   Все операции проходят над processedTreeData
            Выполняется по рекурсивному принципу

            processedTreeData => древовидный массив объектов, рабочий для отображения

        treeData => древовидный массив
        uuid => итентификатор ноды в формате uuid v4
    */
    let foundNode = null;
    treeData.forEach((node)=>{
        if(foundNode) return null;
        //console.log("Ищем ноду=>", node);
        if(node.uuid === uuid) foundNode = node;
        else if(node.children !== undefined) foundNode = getNodeByUuid(node.children, uuid);
    });
    return foundNode
};

export const getNodeByRow = (treeData, row) =>{
    /*  Функция возвращает искомую Ноду по uuid или null

        Замечания:
        *   Все операции проходят над processedTreeData
            Выполняется по рекурсивному принципу
        *   Если получили row === null и возвращаем null

        processedTreeData => древовидный массив объектов, рабочий для отображения

        treeData => древовидный массив
        row => объект, строка линейного массива itemListData
    */
    let foundNode = null;
    //console.log('ищем=>', row);
    if (row){
        treeData.forEach((node)=>{
            if(foundNode) return null;
            //console.log("Ищем ноду=>", node);
            if(node.uuid === row.uuid) foundNode = node;
            else if(node.children !== undefined)
                foundNode = getNodeByRow(node.children, row);
        });
    }
    //console.log('нашли=>', foundNode);
    return foundNode
};