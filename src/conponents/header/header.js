import React, { Component } from 'react'
import './header.css'


export default class Header extends Component {
    state = {
        store: 'Магазин "XXI BEK"'
    };

    render() {
        return(
            <h2>{ this.state.store }</h2>
        )
    }
}