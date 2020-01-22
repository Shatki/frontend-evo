import React from 'react';
import { LocaleProvider } from 'rc-easyui';
import ru from '../../locale/easyui-lang-ru';
import Dashboard from "../dashboard";

import '../../themes/custom/style.css'
import '../../themes/react.css'
import '../../themes/icon.css'
import '../../themes/custom/evotor-icons.css'
import './app.css'


export const App = ({ alert }) => {
    return(
        <LocaleProvider local={ ru }>
                <Dashboard notificator = { alert } />
        </LocaleProvider>
    )
};
