import React, { Component } from 'react'
import ErrorView from "../error-view";
import './error-boundry.css'


export default class ErrorBoundry extends Component{
    state = {
        hasError: false
    };

    componentDidCatch(error, errorInfo) {
        console.log(errorInfo.componentStack);
        this.setState({
            hasError: true
        })
    }

    render() {
        if (this.state.hasError) {
            return <ErrorView/>
        }else{
            return this.props.children
        }


    }
}
