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
import { v4 as uuidv4 } from 'uuid';

export const addRootNode = (children, text) => {
    return([
        {
            uuid: null,
            text: text || 'Корневой каталог',
            state: 'open',
            iconCls: "icon-evotor-folder-user",
            children
        }
    ]);
};

export const transformNodeToRow = (node) => {
    /*
    *   Конвертирование node в row
    *
    * */
    return {
        uuid: node.uuid,
        code: null,
        barCodes: [],
        alcoCodes: [],
        name: node.text,
        price: 0.00,
        quantity: 0.00,
        costPrice: 0.00,
        measureName: "шт",
        tax: "NO_VAT",
        allowToSell: true,
        description: null,
        articleNumber: null,
        parentUuid: node.parent !== undefined ? node.parent.uuid: null,
        group: true,
        type: "NORMAL",
    }
};

export const transformRowToNode = (row, children=[], stateData) =>{
    /*
    *   Конвертирование row в node
    *
    * */
    // Конвертирует row в node
    if (children.length > 0){
        const state = stateData ?
            stateData.findIndex(i=>i===row.uuid) !== -1 ? 'open': 'closed' : 'closed';
        // console.log('transform node=>', row.name, stateData);
        // Родительский узел
        return{
            uuid: row.uuid,
            text: row.name,
            iconCls: "icon-evotor-folder-sub",
            state,
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

export const processingTreeData = (treeData, nodeState, parentUuid=null) => {
    // Возвращает коренной список, parentUuid = null
    // Алгоритм преобразования данных в объект для treeItem
    const dataFilter = treeData.filter(item => parentUuid === item.parentUuid);
    //console.log("<------- processingTreeData=> (Выбираем все элемены выбранной ноды)parentUuid/dataFilter:", parentUuid, dataFilter);
    if (dataFilter.length > 0){
        // Выбираем элементы имеющие children
        return  dataFilter.map((child)=>{
            const children = processingTreeData(treeData, nodeState, child.uuid);
            return transformRowToNode(child, children, nodeState)
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

export const processingItemData = (itemData, matrix) => {
    if(!itemData || !matrix)
        return null;
    // Корректировка матрицы товара, под разные виды продукции
    const processedMatrix = matrix.filter((row, i, arr)=>{
        // Условия существования или видимости поля
        const condition = row.condition !== undefined ? row.condition : null;
        for (let prop in condition) {
            // тело цикла выполняется для каждого свойства объекта
            // const obj = arr.find(i=>i.nameField===prop);
            if(condition.hasOwnProperty(prop))
                if(Array.isArray(condition[prop])){
                    //console.log("Условия массив=>", prop, condition[prop], row.nameField, itemData[prop]);
                    return condition[prop].find(i=>i===itemData[prop]) !== undefined
                }else{
                    return itemData[prop] === condition[prop]
                    // console.log("Условия =>", prop, condition[prop], row.nameField, obj);
                }
        }
        // Если в матрице не прописано условие, тогда включаем в матрицу это значение
        return true;
    });

    return processedMatrix.map((property) => {
        // Если в свойстве пришел массив, то отправляем его в dataField
        // А valueField присваиваем первый элемент массива
        const data = itemData[property.nameField];
        const valueField = !Array.isArray(data) ? { "valueField": data }: { "valueField": data[0] };
        //console.log("processedItemData=> valueField", data);
        const dataField = Array.isArray(data) ?
            { "dataField": data.map((code)=>{ return { value: code, text: code } }) }: {};
        //console.log("processedItemData=> property/valueField/dataField/new", property, valueField, dataField);
        return Object.assign({}, property, valueField, dataField);

    });
};


export const createNode = (node) =>{
    // Возвращает новый row для itemTreeData
    return transformNodeToRow({
        uuid: uuidv4(),
        text: 'Новая группа',
        iconCls: "icon-evotor-folder",
        parentUuid: node.uuid
    });
    //console.log(newItemTree);
    /*
    if(node.children === undefined){
        node.children = [newNode]
    }else{
        node.children.push(newNode);
    }
     */
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

export const deleteRow = (itemData, data) =>{
    // Замечание: Все операции проходят над массивами класса itemTreeData или itemListData,
    // а не над обработанными типа processedTreeData
    // Функция собирает все дочерние row и возвращает эти данные в массиве:
    // data => это массив групп
    return data.reduce((arr, current)=>{
        //console.log('deleter=>', arr, current);
        const children = itemData.filter((item)=>current.uuid===item.parentUuid);
        if(children === undefined) return cutRow(current);
        return arr.concat(deleteRow(itemData, children), cutRow(current));
    }, []);
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
        //console.log("Перемещаю в корень");
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

export const cutRow = (row) =>{
    /*
    *   Подготовка row для удаления
    *   Так же поддерживается node в качестве аргумента
    */
    return { name: row.name, uuid: row.uuid, group: row.group, parentUuid: row.parentUuid }
};