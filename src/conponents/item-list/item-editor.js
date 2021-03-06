import React, { Component } from 'react';
import { ComboBox, Form, TextBox, Label } from 'rc-easyui';
import ItemDialog from "../Item-dialog";


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
                console.log("onDlgBtnSave updateData/model=>", model);
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
    renderDlgFormContent = () =>{
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

    render() {
        const { closed, title, model, rules } = this.state;
        if(model === undefined || closed ) return null;

        return(
            <ItemDialog
                closed={ closed }
                title={ title }
                textConfirm = 'Сохранить'
                textCancel = 'Отмена'
                onClose={ this.onDlgBtnClose }
                onConfirm = { this.onDlgBtnSave }
            >
                <div className="f-full" style={{ padding: '20px 50px' }}>
                    <Form className="f-full"
                          ref={ ref => this.form = ref }
                          model={ model }
                          rules={ rules }
                          tooltipPosition = "down"
                          onValidate={ this.onValidate }>
                        { this.renderDlgFormContent() }
                    </Form>
                </div>

            </ItemDialog>
        );
    }
};
