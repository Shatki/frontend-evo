import React from 'react';
import { LocaleProvider } from 'rc-easyui';
import easyuiru from 'rc-easyui/dist/locale/easyui-lang-ru';
import EvotorService from "../../services/evotor-service";
import Dashboard from "../dashboard";

import './app.css'

export default class App extends React.Component {
    state = {
        storeUuid: '20180507-447F-40C1-8081-52D4B03CD7AB',
        hasError: false,
        evotorService: new EvotorService()
    };

    constructor(props) {
        super(props);
    };

    render() {
        return (
            <LocaleProvider local={ easyuiru }>
                <Dashboard/>
            </LocaleProvider>
        );
    }
}