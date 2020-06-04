import React from 'react';
import { Layout, LayoutPanel } from 'rc-easyui';
import Header from "../header"
import ItemTree from "../item-tree";
import ItemList from "../item-list";
import ItemDetail from "../item-detail";
import EvotorService from "../../services/evotor-service";
import LoadingView from "../loading-view";
import { deleteRow, moveNode } from "../../services/nodes-service";
import ErrorBoundry from "../error-boundry";
import ItemDialog from "../Item-dialog";

export default class Dashboard extends React.Component {
    evotorService = new EvotorService();

    constructor(props) {
        super(props);
        this.state = {
            data: null,
            loading: true,
            store: {
                "name": "Магазин 'XXI BEK'",
                "uuid":  "20180507-447F-40C1-8081-52D4B03CD7AB"},
            itemMatrix: [
                //{"nameField": "uuid", "valueField": null, "titleField": "UUID", "groupField": "Основные", "editorField": "text"},
                {"nameField": "name", "valueField": null, "titleField": "Наименование", "groupField": "Основные",
                    "editorField": "text", "rules": ["required",]},
                {"nameField": "code", "valueField": null, "titleField": "Код", "groupField": "Основные",
                    "editorField": "text", "rules": ["unique", "required", "digital", "positive"] },
                {"nameField": "articleNumber", "valueField": null, "titleField": "Артикул", "groupField": "Основные",
                    "editorField": "text", "rules": ["nullable",], "condition": { "group": false }},
                {"nameField": "barCodes", "valueField": null, "titleField": "Штрихкоды", "groupField": "Коды",
                    "editorField": "combo", "dataField": null, "edit": true, "rules": ["nullable"], "condition": { "group": false }},

                {"nameField": "price", "valueField": null, "titleField": "Цена продажи", "groupField": "Цены",
                    "editorField": "text", "rules": ["required", "float", "precision2",], "condition": { "group": false }},
                {"nameField": "costPrice", "valueField": null, "titleField": "Цена закупки", "groupField": "Цены",
                    "editorField": "text", "rules": ["required", "float", "precision2"], "condition": { "group": false }},

                {"nameField": "quantity", "valueField": null, "titleField": "Остаток", "groupField": "Склад",
                    "editorField": "text", "rules": ["required", "float", "precision3"], "condition": { "group": false }},

                {"nameField": "measureName", "valueField": null, "titleField": "Единицы", "groupField": "Цены",
                    "editorField": "combo", "dataField": "measureTypes", "rules": ["required",], "condition": { "group": false }},
                {"nameField": "tax", "valueField": null, "titleField": "Ставка НДС", "groupField": "Цены",
                    "editorField": "combo", "dataField": "taxTypes", "rules": ["required",] },
                {"nameField": "allowToSell", "valueField": null, "titleField": "Запрет продажи", "groupField": "Склад",
                    "editorField": "switch", "rules": ["required",], "condition": { "group": false }},
                {"nameField": "description", "valueField": null, "titleField": "Описание", "groupField": "Основные",
                    "editorField": "text", "rules": ["nullable",], "condition": { "group": false }},

                {"nameField": "type", "valueField": null, "titleField": "Вид номенклатуры", "groupField": "Основные",
                    "editorField": "combo", "dataField": "productTypes", "rules": ["required",] },

                {"nameField": "alcoCodes", "valueField": null, "titleField": "Алкокод", "groupField": "Коды",
                    "editorField": "combo", "dataField": null, "edit": true, "rules": ["nullable", "digital", "length19"],
                    "condition": { "type": ["ALCOHOL_MARKED", "ALCOHOL_NOT_MARKED"] }},
                {"nameField": "alcoholProductKindCode", "valueField": null, "titleField": "Код вида продукции", "groupField": "ЕГАИС",
                    "editorField": "text", "rules": ["positive", "digital"],
                    "condition": { "type": ["ALCOHOL_MARKED", "ALCOHOL_NOT_MARKED"] }},
                {"nameField": "alcoholByVolume", "valueField": null, "titleField": "Крепкость", "groupField": "ЕГАИС",
                    "editorField": "text", "rules": ["positive", "float", "precision2"],
                    "condition": { "type": ["ALCOHOL_MARKED", "ALCOHOL_NOT_MARKED"] }},
                {"nameField": "tareVolume", "valueField": null, "titleField": "Объем тары", "groupField": "ЕГАИС",
                    "editorField": "text","rules": ["positive", "float", "precision2"],
                    "condition": { "type": ["ALCOHOL_MARKED", "ALCOHOL_NOT_MARKED"] }},

                //{"nameField": "group", "valueField": null, "titleField": "Группа", "groupField": "Основные",
                //    "editorField": "switch", "rules": ["required",] },
                {"nameField": "parentUuid", "valueField": null, "titleField": "Группа товаров", "groupField": "Основные",
                    "editorField": "tree", "dataField": null, "rules": ["nullable",] },
            ],                          // шаблон данных с настройками для преобразователя

            // Language titles
            propertyPanelTitle: "Карточка товара",
            treePanelTitle: "Группы товаров",

            constants: {
                productTypes: [
                    {value: "NORMAL", text: "обычный"},
                    {value: "ALCOHOL_MARKED", text: "маркированный алкоголь"},
                    {value: "ALCOHOL_NOT_MARKED", text: "немаркированный алкоголь"},
                    {value: "TOBACCO_MARKED", text: "маркированный табак"},
                    {value: "SHOES_MARKED", text: "маркированная обувь"},
                    {value: "MEDICINE_MARKED", text: "маркированные лекарства"},
                    {value: "SERVICE", text: "услуга"},
                ],
                measureTypes: [
                    {value: null, text: "Без единиц"},
                    {value: "шт", text: "шт"},
                    {value: "кг", text: "кг"},
                    {value: "л", text: "л"},
                    {value: "м", text: "м"},
                    {value: "км", text: "км"},
                    {value: "м2", text: "м2"},
                    {value: "м3", text: "м3"},
                    {value: "компл", text: "компл"},
                    {value: "упак", text: "упак"},
                    {value: "ед", text: "ед"},
                    {value: "дроб", text: "дроб"}
                ],
                taxTypes: [
                    {value: "NO_VAT", text: "Без НДС"},
                    {value: "VAT_10)", text: "НДС 10%"},
                    {value: "VAT_20", text: "НДС 20%"},
                    {value: "VAT_0", text: "НДС 0%"},
                    {value: "VAT_20_120", text: "НДС 20/120"},
                    {value: "VAT_10_110", text: "НДС 10/110"},
                ],
            },

            itemTreeData: null,                         // Сырые данные для  ItemTree
            itemListData: null,                         // Сырые данные для  ItemList
            itemDetailData: undefined,                  // Сырые данные для  ItemDetail

            nodeView: null,                             //  Отображаемая Нода в ItemList выбранная в ItemTree
            collapsedDetail: true,

            dlgTitle: "Подтверждение удаления групп с дочерними элементами",
            dlgText: "Вы уверены?",
            closed: true,

            // Drag'n'Drop
            isover: false,
            dragItems: null,

            // Redo/Undo
            undo: [],                                   //  Массив для восстановления предыдущего состояния данных
            redo: [],                                   //  Массив для восстановления последующего состояния данных
        };
        this.restoreIndex =  0;                              //  Индекс повторения
        // Данные дня обновления с подтверждением
        this.itemDataUpdateConfirm = [];
        // Данные для удаления без подтверждения
        this.itemDataUpdate = [];
        // Массив штришкодов
        this.barCodes = null;
        this.validateRules= {
            /* Проверяет то, чтобы значение было уникально */
            "unique": {
                "validator": (value) => {
                    // todo: захардкодим "Code", потом сделать универсально, для любого поля
                    return this.checkUnique(value, "code");
                },
                message: 'Значение должно быть уникальным'
            },
            /* Проверяет то, чтобы значение обязательно было введено */
            "required": {
                "validator": (value) => {
                    //console.log("required validation", value);
                    //if(Array.isArray(value)) return true; // Todo доделать!!!
                    return null != value && ("boolean" == typeof value ? value : String(value).trim().length > 0);
                },
                message: 'Поле является обязательным'
            },
            /* Проверяет то, чтобы значение не могло быть пустым (не null) */
            "nullable": {
                "validator": (value) => {
                    //console.log("nullable validation", value);
                    //if(Array.isArray(value)) return true; // Todo доделать!!!
                    return null === value || ("boolean" == typeof value ? value : String(value).trim().length > 0);
                },
                message: 'Созданное поле не может быть пустым'
            },
            /* Проверяет то, чтобы значение было числом */
            "digital": {
                "validator": (value) => {
                    //console.log("digital validation", value);
                    return /^\d+$/.test(value);
                },
                message: 'Значение может состоять только из цифр'
            },
            /* Проверяет то, чтобы значение числом с плавающей точкой */
            "float": {
                "validator": (value) => {
                    //console.log("float validation", value);
                    return /^\d*\.?\d+$/.test(value);
                },
                message: 'Значение должно быть десятичным числом'
            },
            /* Проверяет то, чтобы значение было положительным числом */
            "positive": {
                "validator": (value) => {
                    //console.log("positive validation", value);
                    //if(Array.isArray(value)) return true; // Todo доделать!!!
                    return parseInt(value, 10) > 0;
                },
                message: 'Значение не может быть отрицательным',
            },
            /* Проверяет то, если число не целое, то точность до двух знаков */
            "precision2": {
                "validator": (value) => {
                    const parts = String(value).split('.');
                    //console.log("precision validation", value);
                    //if(Array.isArray(value)) return true; // Todo доделать!!!
                    if (parts.length === 2) return parts[1].length === 1 || parts[1].length === 2;
                    else return true
                },
                message: 'Точность числа только до двух знаков',
            },
            /* Проверяет то, если число не целое, то точность до трех знаков */
            "precision3": {
                "validator": (value) => {
                    const parts = String(value).split('.');
                    //console.log("precision validation", value);
                    //if(Array.isArray(value)) return true; // Todo доделать!!!
                    if (parts.length === 2) return parts[1].length === 3;
                    else return true
                },
                message: 'Точность числа только до трех знаков',
            },
            /* Проверяет то, чтобы длина значения была 19 */
            "length19": {
                "validator": (value) => {
                    //console.log("lenght19 validation", value);
                    return value.length === 19;
                },
                message: 'Длина алкокода должна быть 19',
            },

        };

        this.keyboardEventListener = null;
        this.menu = null;
        this.notificator = props.notificator;

        this.contextMenu = {
            treeMenu: [
                { key: "create", text: "Создать", disabled: false, iconCls: "icon-evotor-folder-add" },
                { key: "rename", text: "Переименовать", disabled: false, iconCls: "icon-evotor-folder-edit" },
                { key: "open", text: "Открыть", disabled: false, iconCls: "icon-evotor-folder-open" },
                { key: "delete", text: "Удалить", disabled: false, iconCls: "icon-evotor-folder-delete" },
                { key: "cloud", text: "Облако", disabled: false, iconCls: "icon-evotor-upload-to-the-cloud",
                    submenu: [
                        { key: "upload_all", text:"Выгрузить все", disabled: false, iconCls: "icon-save" },
                        { key: "upload_this", text:"Выгрузить группу", disabled: false },
                        { key: "download_all", text:"Загрузить все", disabled: false },
                        { key: "download_this", text:"Загрузить группу", disabled: false },
                    ]
                },
                { key: "close", text: "Закрыть", disabled: false },
            ],
            listGroupMenu: [
                { key: "create", text: "Создать", disabled: false, iconCls: "icon-evotor-document-add" },
                { key: "open", text: "Открыть", disabled: false, iconCls: "icon-evotor-folder-open" },
                { key: "remove", text: "Удалить", disabled: false, iconCls: "icon-evotor-remove" },
                { key: "paste_sep", separator: true },
                { key: "paste", text: "Вставить", disabled: false, iconCls: "icon-evotor-document-insert" },
                { key: "select_sep", separator: true },
                { key: "select", text: "Выделить все", disabled: false, iconCls: "icon-evotor-select" },
                { key: "unselect", text: "Очистить", disabled: false, iconCls: "icon-evotor-unselect" },
                { key: "end_sep", separator: true },
                { key: "close", text: "Закрыть", disabled: false },
            ],
            listItemMenu: [
                { key: "create", text: "Создать", disabled: false, iconCls: "icon-evotor-document-add" },
                { key: "edit", text: "Править", disabled: false, iconCls: "icon-evotor-document-edit"},
                { key: "remove", text: "Удалить", disabled: false, iconCls: "icon-evotor-remove" },
                { key: "copy_paste_sep", separator: true },
                { key: "copy", text: "Копировать", disabled: false, iconCls: "icon-evotor-document-copy" },
                { key: "paste", text: "Вставить", disabled: false, iconCls: "icon-evotor-document-insert" },
                { key: "select_sep", separator: true },
                { key: "select", text: "Выделить все", disabled: false, iconCls: "icon-evotor-select" },
                { key: "unselect", text: "Очистить", disabled: false, iconCls: "icon-evotor-unselect" },
                { key: "end_sep", separator: true },
                { key: "close", text: "Закрыть", disabled: false },
            ],
            itemMenu: [
                { key: "edit", text: "Редактировать", disabled: false, iconCls: "icon-evotor-property-edit" },
                { key: "save", text: "Сохранить", disabled: false, iconCls: "icon-evotor-save" },
                { key: "close", text: "Закрыть", disabled: false },
            ],
        };
    };
    /* ----------------- Lifecycle methods -------------------------------------------- */
    componentDidMount() {
        document.addEventListener("keydown", this.handleKeyboardEvent);
        this.loadData();
    }

    componentDidUpdate( prevProps, prevState, snapshot) {
        //console.log("ComponentDidUpdate Dashboard (itemTreeData/processedTreeData)=>", this.state.itemTreeData, this.state.processedTreeData);
    }

    componentWillUnmount() {
        document.removeEventListener("keydown", this.handleKeyboardEvent);
    }

    /* ----------------- Data operations ---------------------------------------------- */
    loadData = (store_id = 0) =>{
        this.evotorService
            .getAllProducts(store_id)
            .then(this.updateData);
    };

    sortData = (data) => {
      return data.sort((a, b)=>{
          const nameA=a.name.toLowerCase(), nameB=b.name.toLowerCase();
          if (nameA < nameB) return -1; //сортируем строки по возрастанию
          if (nameA > nameB) return 1;
          return 0 // Никакой сортировки
      })
    };

    updateData = (data) =>{
        // первоначальное заполнение данных
        const sortData = this.sortData(data);
        const itemTreeData = sortData
            .filter(item => item.group === true)
            .map(itemTree=>Object.assign({}, itemTree, { state: 'closed' }));
        const itemListData = sortData
            .filter(item => item.group === false)
            .map((itemList)=>Object.assign({}, itemList));
        // Todo: Вообще в будующем сделать чтоб подхватывался последний редактируемый объект
        this.setState({
            data,
            itemTreeData,
            itemListData,
            // itemDetailData,
            loading: false,
        });
    };

    updateItemData = (data, viewNotification = true, restore = false) =>{
        /* Обновление основного хранилища информации товаров и групп
        *  в state: itemTreeData и itemListData
        *
        *  Обязательно!!! наличие в row признака group
        *  Выполняются действия(удалить/добавить/изменить)
        *  в зависимости от полученного row:
        *       1 Если row.code === undefined тогда удаляем item
        *       2 Иначе если row.uuid существует, тогда заменяем item, на отредактированный
        *       3 Но Если же row.uuid не найден в данных, значит создаем новый item
        *           При добалении нового item, code вычисляем новый.
        */
        const { itemTreeData, itemListData, itemDetailData, redo, undo } = this.state;
        console.log("DashBoard updateItemData data/notification", data, viewNotification);

        const arr = Array.isArray(data) ? data : [data];
        const fullNotification = arr.length < 7;
        console.log("DashBoard updateItemData arr/fullNotification=>", arr, fullNotification);

        let listData = [].concat(itemListData);
        let treeData = [].concat(itemTreeData);
        let deltaCut = 0;
        let deltaUpdate = 0;
        let deltaCreate = 0;
        let undoArr = [];

        arr.forEach((row, index)=>{
            const group = row.group;
            let itemData = group ? treeData : listData;
            const total = itemData.length;
            if(row.code === undefined){
                itemData = itemData.filter((el)=>{
                    if(el.uuid === row.uuid){
                        if(!restore) undoArr.push(el);  //   Undo
                        return false;
                    }
                    return true
                }); // Удаляем item
                console.log("Dashboard updateItemData delete row/idx length/total=>", row, itemData.length, total);
                if(itemData.length === total - 1){
                    deltaCut = deltaCut + 1;
                    // notification
                    if(fullNotification && viewNotification && !restore)
                        group ?
                            this.notificator.show("Группа товаров: '" + row.name + "' успешно удалена", { type:"success" }):
                            this.notificator.show("Товар '" + row.name + "' успешно удален", { type:"success" });
                } else
                if(fullNotification && viewNotification && !restore)
                    group ?
                        this.notificator.show("Группа " + row.name + " не удалена", { type:"info" }):
                        this.notificator.show("Ошибка удаления товара: " + row.name, { type:"error" });
            }else{
                const idx = itemData.findIndex(el=>el.uuid===row.uuid);
                if(idx !== -1) {
                    deltaUpdate = deltaUpdate + 1;
                    if(!restore) undoArr.push(itemData[idx]);   //  Undo changed
                    itemData[idx] = Object.assign({}, itemData[idx], row); // Заменяем
                    console.log("Dashboard updateItemData rename/update row/idx=>", itemData[idx], idx);
                    if(fullNotification && viewNotification && !restore)
                        group ?
                            this.notificator.show("Группа товаров '" + row.name + "' изменена", { type:"success" }):
                            this.notificator.show("Товар '" + row.name + "' изменен", { type:"success" });
                } else {
                    const code  = restore ? {} : { code: this.getNewCode() };  // Поправка на сохранение code при восстановлении
                    itemData.push(Object.assign({}, row, code));      // Создаем новый товар
                    console.log("Dashboard updateItemData create/add row/idx=>", itemData[itemData.length-1], idx);
                    if(!restore) undoArr.push(Object.assign({}, row, { code: undefined }));   //  Undo created
                    if(itemData.length === total + 1) {
                        deltaCreate = deltaCreate + 1;
                        if(fullNotification && viewNotification && !restore)
                            group ?
                                this.notificator.show("Группа товаров '" + row.name + "' успешно создана", { type:"success" }):
                                this.notificator.show("Товар '" + row.name + "' успешно создан", { type:"success" });
                    } else
                    if(fullNotification && viewNotification && !restore)
                        group ?
                            this.notificator.show("Ошибка создания группы: " + row.name, { type:"error" }):
                            this.notificator.show("Ошибка создания товара: " + row.name, { type:"error" });

                }
            }
            group ? treeData = itemData : listData = itemData;
            console.log("delta cut/update/create=>", deltaCut, deltaUpdate, deltaCreate);
            // ***** Сохраняем состояние для Redo\Undo


        });
        //console.log("delta total cut/update/create=>", deltaCut, deltaUpdate, deltaCreate);
        // Вывод информации в обычном режиме
        if(viewNotification && !fullNotification && !restore) {
            const cut = deltaCut > 0 ? "Удалено: " + deltaCut + ".": "" ;
            const create = deltaCreate > 0 ? "Создано: " + deltaCreate + ".": "" ;
            const update = deltaUpdate > 0 ? "Обновлено: " + deltaUpdate + ".": "" ;
            this.notificator.show("Обработано "+ arr.length + " элемент(а/ов). " +  create + update + cut, { type:"success" });
        }
        const itemData = itemDetailData ?
            listData.find(i=>i.uuid===itemDetailData.uuid) : undefined;
        //console.log("itemUpdate=>", itemDetailData, itemData);

        // Для сохранения состаяния:
        if(!restore) {
            const redoData = [ ...redo.slice(0, this.restoreIndex), arr];
            const undoData = [ ...undo.slice(0, this.restoreIndex), undoArr ];
            this.restoreIndex = this.restoreIndex + 1;
            //console.log("<=Update redoUndoData redo/undo/restoreIndex=>", redoData, undoData, this.restoreIndex);
            this.setState({
                itemListData: this.sortData(listData),
                itemTreeData: this.sortData(treeData),
                itemDetailData: itemData,
                undo: undoData,
                redo: redoData,
            });
        }else{
            //console.log("<=Restore redoUndoData restoreIndex=>", this.restoreIndex);
            this.setState({
                itemListData: this.sortData(listData),
                itemTreeData: this.sortData(treeData),
                itemDetailData: itemData,
            });
        }
    };

    processingItemData = (data) =>{
        /* Обработка и подготовка данных для обновления в updateItemData
        *
        *  Обязательно!!! наличие в row признака group
        *  Выполняются действия(удалить/добавить/изменить)
        *  в зависимости от полученного row:
        *       1 Если row.code === undefined тогда удаляем item
        *       2 Иначе если row.uuid существует, тогда заменяем item, на отредактированный
        *       3 Но Если же row.uuid не найден в данных, значит создаем новый item
        *           При добалении нового item, code вычисляем новый.
        */

        if(!Array.isArray(data)) return this.updateItemData([data]);  // Преобразуем в массив
        console.log("DashBoard processingItemData arr=>", data);
        const { data: itemData } = this.state;

        // Отделим группы и товары
        // Обработка групп --------------------------------
        // Соберем все группы для обновления данных
        const treeDataUpdate = data.filter((i)=>i.group===true&&i.code!==undefined) || [];
        // Соберем все группы для удаления отдельно
        const treeDataCut = data.filter((i)=>i.group===true&&i.code===undefined) || [];
        // Обработка товаров -------------------------------
        const listDataUpdate = data.filter((i)=>i.group===false) || [];
        // Для групп, нужно вычислить все дочерние----------
        // Если нет дочерних то вернет только родителей, которых проверяем
        const itemDataCut = deleteRow(itemData, treeDataCut);

        // Выборка групп с детьми
        const hasChildren = treeDataCut
            .filter(tree=>itemData.find(item=>item.parentUuid===tree.uuid) !== undefined);
        // Выборка групп без детей
        const withoutChildren = treeDataCut
            .filter(tree=>hasChildren.find(item=>item.uuid===tree.uuid) === undefined);

        // А вот тут сначала запрос на удаление не пустых
        const closed = hasChildren.length === 0;
        const dlgText = 'Группа(ы): ' +
            hasChildren.reduce((str, row)=>row.name + ', ' + str, "") +
            'содержит элементы. Удалить не пустые группы?';

        console.log("itemDataCut/treeDataCut=>", itemDataCut, treeDataCut);
        if(itemDataCut.length === treeDataCut.length)
            this.updateItemData(data);
        else {
            console.log("itemDataCut=>", itemDataCut);
            // Todo: доработать удаление после диалога
            // Данные для удаления с подтверждением
            this.itemDataUpdateConfirm = [].concat(itemDataCut, treeDataUpdate, listDataUpdate);
            // Данные для удаления без подтверждения
            this.itemDataUpdate = [].concat(withoutChildren, treeDataUpdate, listDataUpdate);

            console.log("itemDataUpdateConfirm=>", this.itemDataUpdateConfirm);
            console.log("itemDataUpdate=>", this.itemDataUpdate);

            this.setState({
                closed,
                dlgText,
            });
        }
    };

    getRules = (rules) => {
        /* Получение правила валидации
        * Коды:
        * /[0-9]/ - [один] символ входящий в диапазон 0-9 в [любом] месте строки
        * /^[0-9]$/ - строка состоящая из [одного] символа входящего в диапазон 0-9
        * /^\d+$/ - строка состоящая из [одного или более] символа входящего в диапазон 0-9(\d)
        *
        *  rules на входе это массив из itemProps
        */
        const allRules = this.validateRules;
        //console.log("validateRules=>", this.validateRules);
        if (rules === undefined) return {};
        let objectRules = {};
        rules.forEach(function (item) {
            if (item in allRules) objectRules[item] = allRules[item];
            else objectRules[item] = item
        });
        //console.log("get rules=>", objectRules);
        return objectRules;
    };

    getNewCode = () =>{
        // Вычисление свободного кода
        const { itemListData, itemTreeData } = this.state;
        const maxListCode = itemListData.reduce((max, current) =>
            max < Number(current.code) ? +Number(current.code) : max, 0);
        const maxTreeCode = itemTreeData.reduce((max, current) =>
            max < Number(current.code) ? +Number(current.code) : max, 0);
        return maxListCode > maxTreeCode ? String(maxListCode + 1): String(maxTreeCode + 1)
    };

    checkUnique = (value, field) =>{
        const { itemDetailData, itemListData, itemTreeData } = this.state;
        // Проверка на разрешение использования текущего значения
        if(itemDetailData[field] === value) return true;
        // Если индексы одинаковые  === undefined т.е не найдены
        return itemListData.find(item=>item[field]===value) === itemTreeData.find(item=>item[field]===value)
    };

    /* ----------------- Keyboard event functions ------------------------------------- */
    // Todo Undo/Redo event + other
    setKeyboardEventsListener = (listener) => {
        this.keyboardEventListener =  listener
    };

    handleKeyboardEvent = e => {
        // Первый вариант обработки клавиатуры
        console.log(e);
        if(this.keyboardEventListener !== null)
            this.keyboardEventListener(e)
    };

    handleUndoKeyboardEvent = () => {
        const { undo } = this.state;
        if( this.restoreIndex > 0){
            this.restoreIndex = this.restoreIndex - 1;
            const arr = undo[this.restoreIndex];
            // Вывод информации в режиме восстановления
            this.updateItemData(arr, true, true);

            //console.log("<--Undo arr/undo_length/restoreIndex-->", arr, undo.length, this.restoreIndex);
            this.notificator.show("Отмена последнего действия для " + arr.length + " элемент(а/ов). ", { type:"info" });
        }

        else this.notificator.show("Еще нет действий для отмены", { type:"error" });
    };

    handleRedoKeyboardEvent = () => {
        const { redo } = this.state;
        if(redo.length > this.restoreIndex){
            const arr = redo[this.restoreIndex];
            this.updateItemData(arr, true, true);
            this.restoreIndex = this.restoreIndex + 1;

            //console.log("<--Redo state/redo_length/restoreIndex-->", arr, redo.length, this.restoreIndex);
            this.notificator.show("Повторение последнего действия для " + arr.length + " элемент(а/ов). ", { type:"info" });
        }
        else this.notificator.show("Действий для повторения не найдено", { type:"error" });
    };

    /* ----------------- Обработка событий Dashboard ---------------------------------- */
    handleTreeSelectionChange = (node) =>{
        // Todo устаревший рудимент
        console.log("Dashboard.handleTreeSelectionChange node=>", node);
    };

    // ItemTree => Open Node
    handleTreeNodeSelectView = (node) =>{
        // Просмотр выбранной ноды в ListItem
        const { nodeView } = this.state;
        const nodeUuid = nodeView ? nodeView.uuid : null;
        console.log("Выбрали ноду=>", node);

        if(nodeUuid !== node.uuid) {
            this.setState({
                nodeView: node,
            });
        }
    };

    handleDropListItem = (node) => {
        // Todo Каждое действие отправляется на сервер для Redo/Undo
        // Тут делаем операции с даннымы
        const { itemListData, itemTreeData, dragItems } = this.state;
        const dragListData = dragItems.filter(item=>item.group===false);
        const dragListUuid = dragListData.map((item)=>item.uuid);
        const dragTreeData = dragItems.filter(item=>item.group===true);
        const dragTreeUuid = dragTreeData.map((item)=>item.uuid);
        const target = itemTreeData.find((item)=>{ return item.uuid === node.uuid });
        let counter = 0;

        //console.log("Перемещение в цель=>", target, node);
        if(dragListUuid.length>0){
            const newListData = itemListData.map((item)=>{
                if(dragListUuid.indexOf(item.uuid) !== -1) {
                    //console.log("=>>>>>>>>>>>>>>>>>>>Перемещение List=>", item);
                    item.parentUuid = node.uuid;
                    counter +=1;
                }
                return item
            });

            this.setState({
                itemListData: newListData,
            });
        }

        if(dragTreeUuid.length>0){
            console.log("setState itemTreeData:", itemTreeData );
            const newTreeData = itemTreeData.map((item)=>{
                console.log("itemTreeData item, dragTreeUuid:", item, dragTreeUuid);
                if(dragTreeUuid.indexOf(item.uuid) !== -1) {
                    const movingItem = moveNode(itemTreeData, target, item);
                    if(!movingItem) this.notificator.show("Невозможно перенести " + item.name, { type:"error" });
                    else counter +=1;
                    // Если пришло null то ноду перемещать нельзя
                    return movingItem || item;
                }
                return item
            });

            this.notificator.show("Переместили " + counter + " элементов в каталог " + target.name, { type:"success" });
            //console.log("setState newTreeData(processedTreeData):", newTreeData, processedTreeData);
            this.setState({
                itemTreeData: newTreeData,
            })
        }
    };

    handleDragListItem = (items) =>{
        this.setState({
            dragItems: items
        })
    };

    // ItemList => DblClick open
    handleListNodeSelection = (row) => {
        const { nodeView } = this.state;
        const isChangedUuid = nodeView ? row.uuid !== nodeView.uuid : nodeView === null;
        if(isChangedUuid){
            console.log("listNodeSelection=>", row);
            this.handleTreeNodeSelectView({ uuid: row.uuid })
        }
    };

    handleListItemSelection = (row) =>{
        const { itemDetailData } = this.state;
        console.log('handleListItemSelection: row/itemDetailData=>', row, itemDetailData);
        const isChangedUuid = itemDetailData ? row.uuid !== itemDetailData.uuid : itemDetailData === undefined;
        console.log('handleListItemSelection: test=>', isChangedUuid);
        if(isChangedUuid){
            //const parentNode = getNodeByRow(itemTreeData, row);
            //const processedDetailData = processingItemData(itemTreeData, row , itemMatrix);
            console.log("Редактируем item=>", row);
            this.setState({
                itemDetailData: row,
                //processedDetailData,
                //parentNode,
            })
        }
    };

    /* ----------------- Методы управления диалогами --------------------------------- */
    onDlgBtnDelCancel = () =>{
        this.updateItemData(this.itemDataUpdate);
        this.itemDataUpdateConfirm =[];
        this.itemDataUpdate =[];

        this.setState({
            closed: true
        })
    };

    onDlgBtnDelConfirm = () =>{
        /*
        *   Обработка для сбора информации о всех элементах, для удаления
        */
        console.log("onDlgBtnDelConfirm dialog ok");
        // Каскадное удаление, объединяем все в один массив
        /*
        const delGroup = deleteRow(itemTreeData, this.deletingNotEmptyGroup);
        const delItem = delGroup.reduce((arr, target)=>{
            //console.log('deleter=>', arr, current);
            const listData = itemListData
                .filter((listItem)=>target.uuid===listItem.parentUuid);
            if(listData === undefined) return arr;
            return arr.concat(listData
                .map(el=>{return { name: el.name, uuid: el.uuid, group: el.group }})
            );
        }, []);
        */
        this.updateItemData(this.itemDataUpdateConfirm);
        this.itemDataUpdateConfirm =[];
        this.itemDataUpdate =[];

        this.setState({
            closed: true
        })
    };

    /* ----------------- Методы управления панелями ---------------------------------- */
    handleCollapseEast = () =>{
        this.setState((state)=>{
            // console.log("CollapseEast", this.state.collapsedDetail);
            if(!state.collapsedDetail) return {
                collapsedDetail: !this.state.collapsedDetail,
            }
        })
    };

    handleExpandEast = () => {
        this.setState((state)=>{
            // console.log("ExpandEast", this.state.collapsedDetail);
            if(state.collapsedDetail) return {
                collapsedDetail: !this.state.collapsedDetail,
            }
        })
    };

    handleCollapseWest = () => {
        this.setState((state)=>{
            // console.log("CollapseWest", !this.state.collapsedDetail);
            if(state.collapsedDetail) return {
                collapsedDetail: !this.state.collapsedDetail,
            }
        })
    };

    handleExpandWest =() => {
        this.setState((state)=>{
            // console.log("ExpandWest", !this.state.collapsedDetail);
            if(!state.collapsedDetail) return {
                collapsedDetail: !this.state.collapsedDetail,
            }
        })
    };

    /* ----------------- Render методы отображения компонента ------------------------- */
    render() {
        const {
            constants, collapsedDetail, nodeView, itemMatrix,
            itemTreeData, itemListData, itemDetailData, loading,
            propertyPanelTitle, treePanelTitle,
            closed, dlgTitle, dlgText } = this.state;

        if(loading)
            return(<LoadingView/>);
        return (
            <ErrorBoundry>
                <Layout
                    style={{ width: '100%', height: '100%' }}>
                    <LayoutPanel
                        region="north"
                        style={{ height: 60 }}>
                        <Header/>
                    </LayoutPanel>

                    <LayoutPanel
                        region="west"
                        title={ treePanelTitle }
                        collapsible
                        collapsed = { !collapsedDetail }
                        onCollapse = { this.handleCollapseWest }
                        onExpand = { this.handleExpandWest }
                        expander
                        split
                        style={{ minWidth: 150, maxWidth: 400 }}>
                        <ItemTree
                            itemTreeData = { itemTreeData }
                            updateItemData = { this.updateItemData }
                            onDrop = { this.handleDropListItem }
                            //onTreeSelectionChange = { this.handleTreeSelectionChange }
                            onTreeNodeSelectView = { this.handleTreeNodeSelectView }
                            contextMenu = { this.contextMenu }
                            setKeyboardEventsListener = { this.setKeyboardEventsListener }
                            notificator = { this.notificator }
                        />
                    </LayoutPanel>

                    <LayoutPanel
                        region="center">
                        <ItemList
                            itemListData = { itemListData }
                            itemTreeData = { itemTreeData }
                            itemMatrix = { itemMatrix }
                            nodeView = { nodeView }
                            constants = { constants }
                            collapsed = { collapsedDetail }
                            onDrag = { this.handleDragListItem }
                            updateItemData = { this.updateItemData }         //???
                            processingItemData = { this.processingItemData }         //???
                            contextMenu = { this.contextMenu }
                            onListNodeSelection = { this.handleListNodeSelection }
                            onListItemSelection = { this.handleListItemSelection }

                            //handleListSelectionChange = { this.handleListSelectionChange }
                            notificator = { this.notificator }
                            setKeyboardEventsListener = { this.setKeyboardEventsListener }
                            getRules = { this.getRules }
                            redo = { this.handleRedoKeyboardEvent }
                            undo = { this.handleUndoKeyboardEvent }
                        />

                    </LayoutPanel>

                    <LayoutPanel
                        region = "east"
                        title = { propertyPanelTitle }
                        collapsible
                        collapsed ={ collapsedDetail }
                        onCollapse = { this.handleCollapseEast }
                        onExpand = { this.handleExpandEast }
                        expander
                        split
                        style = {{ minWidth: 200, maxWidth: 400 }}
                    >
                        <ItemDetail
                            itemDetailData = { itemDetailData }
                            //itemListData = { itemListData }
                            itemTreeData = { itemTreeData }
                            itemMatrix = { itemMatrix }
                            //parent = { parentDetailItem }
                            updateItemData = { this.updateItemData }
                            collapsed = { collapsedDetail }
                            constants = { constants }
                            contextMenu = { this.contextMenu }
                            setKeyboardEventsListener = { this.setKeyboardEventsListener }
                            getRules = { this.getRules }
                            notificator = { this.notificator }
                        />
                    </LayoutPanel>
                </Layout>
                <ItemDialog
                    closed={ closed }
                    style={{ width:'400px', height:'200px' }}
                    title = { dlgTitle }
                    onConfirm = { this.onDlgBtnDelConfirm }
                    onClose = { this.onDlgBtnDelCancel }>
                    <p style={{ textAlign:'center', margin:'40px 20px', fontSize:'15px', maxWidth: '600px' }}>
                        { dlgText }
                    </p>
                </ItemDialog>
            </ErrorBoundry>
        );
    }
}