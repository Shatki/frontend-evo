/*
    Тут чисто JS
    Функции для работы с Нодами
    Структура данных для easyui должны быть вида:
        [
            { node 1 },
            { node 2 },
                ...
            { node x }
        ]

    Каждая Нода это объект вида:
       {
            uuid: node_uuid,
            text: node_name,
            iconCls: "icon-node",
            state: 'closed',
            children: []
         }

    У каждой ноды свойство children это массив дочерних нод

*/

export const addRootNode = (children, text) => {
        return([
            {
                uuid: null,
                text,
                state: 'opened',
                iconCls: "icon-evotor-folder-user",
                children
            }
        ]);
    };

export const transformTreeData = (data, parentUuid=null) => {
        // Возвращает коренной список, parentUuid = null
        // Алгоритм преобразования данных в объект для listTree
        const dataFilter = data.filter(item => parentUuid === item.parentUuid);
        // alert(children.toSource());
        if (dataFilter.length > 0){
            // Выбираем элементы имеющие children
            return  dataFilter.map((child)=>{
                let children = transformTreeData(data, child.uuid);
                if (children.length > 0){
                    // Родительский узел
                    return{
                        uuid: child.uuid,
                        text: child.name,
                        iconCls: "icon-evotor-folder-sub",
                        state: 'closed',
                        children
                    };
                }
                else{
                    // Конечный узел
                    return{
                        uuid: child.uuid,
                        text: child.name,
                        iconCls: "icon-evotor-folder",
                    };
                }
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