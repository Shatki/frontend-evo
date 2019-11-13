import React from 'react';
import { LocaleProvider } from 'rc-easyui';
import easyuiru from '../../locale/easyui-lang-ru';
import EvotorService from "../../services/evotor-service";
import Dashboard from "../dashboard";

import './app.css'

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            storeUuid: '20180507-447F-40C1-8081-52D4B03CD7AB',
            hasError: false,
            evotorService: new EvotorService()
        };
    };

    render() {
        return (
            <LocaleProvider local={ easyuiru }>
                <Dashboard/>
            </LocaleProvider>
        );
    }
}