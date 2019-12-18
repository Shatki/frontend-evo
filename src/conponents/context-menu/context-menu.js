import React, { Component } from "react";
import { Menu, MenuItem, SubMenu, MenuSep } from 'rc-easyui';

export default class ContextMenu extends Component {
    renderMenu = (data) =>{
        return data.map((item)=>{
            const { submenu, separator, ...itemProps } = item;
            if(submenu !== undefined){
                return(
                    <MenuItem { ...itemProps }>
                        <SubMenu>
                            { this.renderMenu(submenu) }
                        </SubMenu>
                    </MenuItem>
                )
            } if (separator === true){
                return (<MenuSep {...itemProps }/>)
            } else
                return (<MenuItem {...itemProps }/>)
        });
    };

    render() {
        const { menu, handleItemClick } = this.props;

        return (
            <Menu
                //ref = { menuRef }
                ref = { this.props.menuRef }
                onItemClick={ handleItemClick }
            >
                { this.renderMenu(menu) }
            </Menu>
        )
    }
};