import React, { Component } from 'react';
import { Dialog, LinkButton, ButtonGroup } from 'rc-easyui';
import './item-dialog.css'


export default class ItemDialog extends Component {
    constructor(props) {
        super(props);

        this.state = {
            closed: true,
            title: null,
        };
    }
    /* ----------------- Lifecycle methods -------------------------------------------- */
    componentDidMount() {
        this.updateData();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevProps.closed !== this.props.closed)
            this.updateData();
    }

    /* ----------------- State operations --------------------------------------------- */
    updateData = () => {
        const { closed, title } = this.props;
        this.setState({
            closed,
            title,
        })
    };

    /* ----------------- Render методы отображения компонента ------------------------- */
    renderDlgHeader = () => {
        const { title } = this.props;
        return <div key={ title }>{ title }</div>
    };

    renderDlgFooter = () => {
        const { textConfirm, textCancel, onConfirm, onClose } =this.props;
        return (
            <div>
                <ButtonGroup style={{ width: '100%', height: '50px' }}>
                    <LinkButton key = "ok"
                        className="f-full btn" plain
                        onClick={ onConfirm }>
                        { textConfirm ? textConfirm : 'Да' }
                    </LinkButton>
                    <LinkButton key = "close"
                        className="f-full btn" plain
                        onClick={ onClose }>
                        { textCancel ? textCancel : 'Нет' }
                    </LinkButton>
                </ButtonGroup>
            </div>
        )
    };

    render() {
        const { closed, style } = this.state;
        const { onClose, children } = this.props;
        if(closed) return null;

        return(
            <Dialog
                modal
                style={ style }
                draggable
                closed={ closed }
                className="dlg"
                headerCls="dlg-header"
                footerCls="dlg-footer"
                borderType="none"
                header = { this.renderDlgHeader }
                footer={ this.renderDlgFooter }
                onClose={ onClose }>
                { children }
            </Dialog>
        );
    }
};
