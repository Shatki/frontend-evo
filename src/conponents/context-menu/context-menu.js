import React, { Component } from "react";
import { Menu, MenuItem, SubMenu } from 'rc-easyui';

export default class ContextMenu extends Component {
    renderMenu = (data) =>{
        return data.map((item)=>{
            const { submenu, ...itemProps } = item;
            if(submenu !== undefined){
                return(
                    <MenuItem { ...itemProps }>
                        <SubMenu>
                            { this.renderMenu(submenu) }
                        </SubMenu>
                    </MenuItem>
                )
            } else
                return (<MenuItem {...itemProps }/>)
        });
    };

    render() {
        const { menu, handleItemClick } = this.props;

        return (
            <Menu ref={ this.props.menuRef }
                  onItemClick={ handleItemClick }>
                { this.renderMenu(menu) }
            </Menu>
        )
    }
};