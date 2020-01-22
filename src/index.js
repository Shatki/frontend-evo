import React from 'react'
import { render } from 'react-dom'
import { positions, transitions, Provider as AlertProvider } from 'react-alert'
import AlertTemplate from './conponents/react-alert-theme'
import App from './conponents/app';

// optional cofiguration
const options = {
    timeout: 5000,
    position: positions.BOTTOM_RIGHT,
    offset: '15px',                                     // the margin of each alert
    transition: transitions.SCALE,                      // the transition animation
};


const Root = () => (
    <AlertProvider template={ AlertTemplate } {...options }>
        <App/>
    </AlertProvider>
);

render(<Root/>, document.getElementById('root'));




