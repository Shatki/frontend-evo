import { Menu, MenuItem, SubMenu } from 'rc-easyui';
import React from "react";

export const ContextMenu = ({ menu, menuRef, handleItemClick }) => {
    const renderMenu = (data) =>{
        return data.map((item)=>{
            const { submenu, ...itemProps } = item;
            if(submenu !== undefined){
                return(
                    <MenuItem { ...itemProps }>
                        <SubMenu>
                            { renderMenu(submenu) }
                        </SubMenu>
                    </MenuItem>
                )
            } else
                return (<MenuItem {...itemProps }/>)
        });
    };

    return(
        <Menu ref={ menuRef }
              onItemClick={ handleItemClick.bind(this) }>
            { renderMenu(menu) }
        </Menu>
    )
};