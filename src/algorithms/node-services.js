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
            children: [
                {   uuid: node_uuid,
                    text: node_name,
                    iconCls: "icon-node",
                    state: 'closed',
                    children: []
                    },
                {   uuid: node_uuid,
                    text: node_name,
                    iconCls: "icon-node",
                    state: 'closed',
                    children: []
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

export  const moveNode = (data, node, movingNode) =>{
    // Функция виртуального перемещения ноды => на самом деле изменение parentUuid
    // Запрет на перемещение "в себя" или в свои "дочерние" ноды
    // Возвращает 3 состояния:
    // true - перемещение разрешено
    //    (в случае, если дошли до Root(checkNode.parentUuid === null)
    //    и не обнаружили что movingNode.uuid === checkNode.uuid)
    // false - перемещение запрещено
    // node - требуется дополнительная проверка родительской ноды
    // Идея рекурсии: Пробуем переместить в родителя целевой ноды, и если это возможно и притом целевая
    // нода и перемещаемая не одно и тоже, то перемещение возможно, что и осуществляем.
    

    // Поиск родительской ноды в данных (data) у ноды (node)
    const checkNode = data.find(item => item.uuid === node.parentUuid);

    // Если дошли до root node значит разрешаем перемещать
    if (checkNode.parentUuid === null) {
        movingNode.parentUuid = node.uuid;
        return true;
    }else{
        const testMove = moveNode(data, checkNode, movingNode);
        if (testMove === true){

        }

        // Если movingNode не перемещается "в себя"
        if (movingNode.uuid !== node.uuid) {
            return
        }else{
            return false
        }
    }
};

/*
    if (movingNode.uuid !== node.uuid){
        //  Нужно проверить всю иерархию
        data.find(item=>item.uuid === movingNode.uuid).parentUuid = node.uuid;
    }

data.find(item=>item.uuid === movingNode.uuid).parentUuid = node.uuid;
 */