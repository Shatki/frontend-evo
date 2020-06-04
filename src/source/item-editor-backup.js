import React, { Component } from 'react';
import { ComboBox, Form, Dialog, TextBox, Label, LinkButton } from 'rc-easyui';


export default class ItemEditor extends Component {
    constructor(props) {
        super(props);

        this.state = {
            editorFields: [ "name", "measureName", "price", "costPrice", "tax" ],      // default
            data: null,
            itemListData: null,
            closed: true,
            title: null,
            model: {},                                                          // Объект для редактирования диалогом
            rules: {},
            errors: null,
        };
        this.form = null;
        this.updateItemData = props.updateItemData;
        this.constants = props.constants;
        this.getRules = props.getRules;
        this.itemMatrix = props.itemMatrix;
        //this.measureTypes = props.measureTypes;
    }
    /* ----------------- Lifecycle methods -------------------------------------------- */
    componentDidMount() {
        this.updateData();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevProps.model !== this.props.model)
            this.updateData();
    }

    /* ----------------- Data operations ---------------------------------------------- */
    updateData = () => {
        const { editorFields } = this.state;
        const { closed, title, model, itemMatrix } = this.props;
        const rules = model === undefined ? {} :
            editorFields.reduce((rulesObject, field) => {
                const row = itemMatrix.find(el=>el.nameField===field);
                rulesObject[field] = this.getRules(row.rules);
                return rulesObject;
            }, {});
        this.setState({
            closed,
            model,
            title,
            rules,
        })
    };

    getError = (name) => {
        const { errors } = this.state;
        if (!errors){
            return null;
        }
        return errors[name] && errors[name].length
            ? errors[name][0]
            : null;
    };

    /* ----------------- Обработка событий ItemEditor --------------------------------- */
    onDlgBtnClose = () =>{
        console.log("dialog close");
        this.setState({ closed: true });
    };

    onDlgBtnSave = () => {
        console.log("onDlgBtnSave");
        this.form.validate(() => {
            if (this.form.valid()) {
                const { model } = this.state;
                this.updateItemData(model);
                this.setState({
                    closed: true
                })
            }
        })
    };

    onValidate = (errors) =>{
        this.setState({ errors })
    };

    /* ----------------- Render методы отображения компонента ------------------------- */
    renderForm = () =>{
        const { model, editorFields } = this.state;
        if(model){
            return editorFields.map((field)=>{
                // Найдем настройки поля из itemMatrix
                const fieldSet = this.itemMatrix.find(item=>item.nameField === field);
                //console.log("fieldSet field/fieldSet=>",field, fieldSet);
                const dataSet = typeof fieldSet.dataField === "string" ?
                    this.constants[fieldSet.dataField].filter(e=>e.value !== null) : null;
                //console.log("fieldSet editorField/dataSet=>", fieldSet.editorField, dataSet);
                const propsSet = {
                    inputId: field,
                    name: field,
                    rules: fieldSet.rules, // В формах валидация работает по-другому
                    value: model[field],
                    style: { width: 450 },
                    data: dataSet

                };

                return (
                    <div key = { field } style={{ marginBottom: 10 }}>
                        <Label htmlFor={ field }>{ fieldSet.titleField }</Label>
                        { fieldSet.editorField === "combo" ?
                            (<ComboBox { ...propsSet}/>) :
                            (<TextBox { ...propsSet}/>) }
                        <div className="error">{ this.getError(field) }</div>
                    </div>
                );
            })
        }
    };

    updateItemDataLite = (row) =>{
        /* Обновление основного хранилища информации товаров и групп
        *
        *  Обязательно!!! наличие в row признака group
        *  Выполняются действия(удалить/добавить/изменить)
        *  в зависимости от полученного row:
        *       1 Если row.code === undefined тогда удаляем item
        *       2 Иначе если row.uuid существует, тогда заменяем item, на отредактированный
        *       3 Но Если же row.uuid не найден в данных, значит создаем новый item
        *           При добалении нового item, code вычисляем новый.
        */
        console.log("DashBoard updateItemData=>row", row);
        const group = row.group;
        const itemData = group ? this.state.itemTreeData : this.state.itemListData;

        if(row.code === undefined){
            // Удаляем item
            const newData = itemData.filter(el=>el.uuid!==row.uuid);
            // console.log("DashBoard delete row=>", row, newListData.length, itemListData.length);
            if(newData.length === itemData.length - 1){
                if(group){
                    this.notificator.show("Группа товаров " + row.name + " успешно удалена", { type:"success" });
                    this.setState({
                        itemTreeData: newData
                    })
                }else{
                    this.notificator.show("Товар " + row.name + " успешно удален", { type:"success" });
                    this.setState({
                        itemListData: newData
                    })
                }
            }else this.notificator.show("Ошибка удаления " + row.name, { type:"error" });
        }else {
            const idx = itemData.findIndex(el=>el.uuid===row.uuid);
            if(idx !== -1){
                //  Заменяем товар
                console.log("Dashboard замена row=>", row);
                if (group){
                    this.setState({
                        itemTreeData: itemData.map((item)=>{
                            if(item.uuid === row.uuid) return Object.assign({}, item, row);
                            return item; // Вернем тот же, чтоб избежать его повторного рендера
                        })
                    })
                }else{
                    this.setState({
                        itemListData: itemData.map((item)=>{
                            if(item.uuid === row.uuid) return Object.assign({}, item, row);
                            return item; // Вернем тот же, чтоб избежать его повторного рендера
                        })
                    })
                }
            } else {
                // Создаем новый товар
                // console.log("Dashboard создание нового row=>", row);
                const newData = [].concat(itemData, Object.assign({},row, { code: this.getNewCode() }));
                //console.log("DashBoard create row=>", row, newListData);
                if(newData.length === itemData.length + 1){
                    if(group){
                        this.notificator.show("Группа товаров " + row.name + " успешно создана", { type:"success" });
                        this.setState({
                            itemTreeData: newData
                        })
                    }else{
                        this.notificator.show("Товар " + row.name + " успешно создан", { type:"success" });
                        this.setState({
                            itemListData: newData
                        })
                    }
                } else this.notificator.show("Ошибка создания " + row.name, { type:"error" });
            }
        }
    };

    render() {
        const { closed, title, rules, model } = this.state;
        if(model === undefined || closed ) return null;

        return(
            <Dialog
                key = "editor"
                modal
                draggable
                title={ title }
                closed={ closed }
                onClose={ this.onDlgBtnClose }>
                <div className="f-full" style={{ padding: '20px 50px' }}>
                    <Form className="f-full"
                          ref={ ref => this.form = ref }
                          model={ model }
                          rules={ rules }
                          tooltipPosition = "down"
                          onValidate={ this.onValidate }
                    >
                        { this.renderForm() }
                    </Form>
                </div>
                <div className="dialog-button">
                    <LinkButton style={{ width: 80 }} onClick={ this.onDlgBtnSave }>Сохранить</LinkButton>
                    <LinkButton style={{ width: 80 }} onClick={ this.onDlgBtnClose }>Закрыть</LinkButton>
                </div>
            </Dialog>
        );
    }
};
