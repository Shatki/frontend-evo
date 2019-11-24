import React, { Component } from 'react'
import './error-view.css'
import { GearsError } from "../gears";


export default class ErrorView extends Component {
    constructor(props){
        super(props);
        this.state = {
            loadingClass: true
        }
    }

    componentDidMount =() => {
        this.interval = setInterval(this.toggleClass, 1000);
    };

    componentWillUnmount = () => {
        clearInterval(this.interval);
    };

    toggleClass =() => {
        const currentState = this.state.loadingClass;
        this.setState({ loadingClass: !currentState });
        clearInterval(this.interval);
    };


    render() {
        return (
            <div className={ this.state.loadingClass ? 'loading': null }>
                <h1>500</h1>
                <h2>Что-то сломалось <b>:(</b></h2>
                <GearsError/>
            </div>
        )
    }
};
