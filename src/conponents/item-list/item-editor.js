import React, { Component } from 'react';
import { NumberBox, ComboBox, Form, Dialog, TextBox, Label, LinkButton } from 'rc-easyui';


export default class ItemEditor extends Component {
    constructor(props) {
        super(props);

        this.state = {
            data: null,
            closed: true,
            title: null,
            model: {},                                              // Объект для редактирования диалогом
            rules: {},
            errors: null,
        };
        this.form = null;
        this.getRules = props.getRules;
        this.measureTypes = props.measureTypes;
    }

    componentDidMount() {
        this.updateData();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevProps.model !== this.props.model)
            this.updateData();
    }

    updateData = () => {
        const { closed, title, model } = this.props;
        const rules = model === undefined ? {} : this.getRules(model.rules);
        this.setState({
            closed,
            model,
            title,
            rules,
        })
    };

    onDlgBtnClose = () =>{
        console.log("dialog close");
        this.setState({ closed: true });
    };

    onDlgBtnSave = () => {
        console.log("onDlgBtnSave");
        this.form.validate(() => {
            if (this.form.valid()) {
                console.log("onDlgBtnSave.validate");
                let row = Object.assign({}, this.state.editingRow, this.state.model);
                let data = this.state.data.slice();
                let index = data.indexOf(this.state.editingRow);
                data.splice(index, 1, row);
                this.setState({
                    data: data,
                    closed: true
                })
            }
        })
    };

    onValidate = (errors) =>{
        this.setState({ errors })
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

    render() {
        const { closed, title, rules, model } = this.state;
        if(model === undefined ) return null;

        return (
            <Dialog
                modal
                draggable
                title={ title }
                closed={ closed }
                onClose={ this.onDlgBtnClose }
            >
                <div className="f-full" style={{ padding: '20px 50px' }}>
                    <Form className="f-full"
                          ref={ ref => this.form = ref }
                          model={ model }
                          rules={ rules }
                          onValidate={ this.onValidate }
                    >
                        <div style={{ marginBottom: 10 }}>
                            <Label htmlFor="name">Наименование:</Label>
                            <TextBox
                                inputId="name"
                                name="name"
                                value={ model.name }
                                style={{ width: 450 }}/>
                            <div className="error">{ this.getError('name') }</div>
                        </div>
                        <div style={{ marginBottom: 10 }}>
                            <Label
                                htmlFor="measure">Единица:</Label>
                            <ComboBox
                                inputId="measureName"
                                name="measureName"
                                data={ this.measureTypes.filter(e=>e.value !== null) }
                                value={ model.measureName }
                                style={{ width: 450 }}/>
                            <div className="error">{ this.getError('measureName') }</div>
                        </div>
                        <div style={{ marginBottom: 10 }}>
                            <Label htmlFor="price">Цена продажи:</Label>
                            <NumberBox
                                inputId="price"
                                name="price"
                                value={ model.price }
                                precision={2}
                                style={{ width: 450 }}/>
                        </div>
                        <div style={{ marginBottom: 10 }}>
                            <Label htmlFor="costPrice">Цена закупки:</Label>
                            <NumberBox
                                inputId="costPrice"
                                name="costPrice"
                                value={ model.costPrice }
                                precision={2}
                                style={{ width: 450 }}
                            />
                        </div>
                    </Form>
                </div>
                <div className="dialog-button">
                    <LinkButton style={{ width: 80 }} onClick={ this.onDlgBtnSave }>Сохранить</LinkButton>
                    <LinkButton style={{ width: 80 }} onClick={ this.onDlgBtnClose }>Закрыть</LinkButton>
                </div>
            </Dialog>
        )
    }
};
