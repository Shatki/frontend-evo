import React, { Component } from 'react'
import './header.css'


export default class Header extends Component {
    constructor(props) {
        super(props);
        this.state = {
            store: 'Магазин "XXI BEK"'
        };
    }

    render() {
        return(
            <div style={{ ...this.props }}>
                <h2>{ this.state.store }</h2>
            </div>
        )
    }
}