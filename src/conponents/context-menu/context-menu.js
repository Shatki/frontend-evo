import { Menu, MenuItem, SubMenu } from 'rc-easyui';
import React from "react";

export const ContextMenu = ({ menu, menuRef, handleItemClick }) =>  {
    const renderMenu = (menu) =>{
        const items = menu.map((item)=>{
            if(item.subMenu !== undefined){
                return(
                    <MenuItem { ...item.menuItem }>
                        <SubMenu>
                            { renderMenu(item.subMenu) }
                        </SubMenu>
                    </MenuItem>
                )
            } else
                return (<MenuItem {...item.menuItem }/>)
        });
        return(
            <React.Fragment>
                { items }
            </React.Fragment>
        )
    };

    return (
        <Menu
            onItemClick={ handleItemClick.bind(this) }
            ref={ menuRef }>
            { renderMenu(menu) }
        </Menu>
    );
};