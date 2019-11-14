import { Menu, MenuItem, SubMenu } from 'rc-easyui';
import React from "react";

export const ContextMenu = ({ menuRef, menu }) => {
    // onContextMenu={this.handleContextMenu.bind(this)}

    const elements = menu.map((item) => {
            return (
                <MenuItem text={item.text}/>
            )
        });

    return (
                <Menu ref={ menuRef }>
                    { elements }
            </Menu>
        );
    };