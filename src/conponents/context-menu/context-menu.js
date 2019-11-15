import { Menu, MenuItem, SubMenu } from 'rc-easyui';
import React from "react";



export const ContextMenu = ({ menuRef, menu }) => {
    // onContextMenu={this.handleContextMenu.bind(this)}
    //item.disabled===true ? 'disabled': ''

    const renderMenu =(menu) =>{
        return menu.map((item)=>{
            if(item.hasOwnProperty('subMenu')){
                console.log(item.subMenu.text);
                return(
                    <React.Fragment>
                        <MenuItem {...item.menuItem }>
                            <SubMenu>
                                { renderMenu(item.subMenu) }
                            </SubMenu>)
                        </MenuItem>
                    </React.Fragment>
                )
            } else
                return (<MenuItem {...item.menuItem }/>)
        })
    };

    //const elements = menu.map((item) => {
    //    return (<MenuItem {...item }/>)
    //});

    return (
        <Menu ref={ menuRef }>
            { renderMenu(menu) }
        </Menu>
    );
};


/*
        <Menu ref={ref => this.menu = ref}>
          <MenuItem text="New"></MenuItem>
          <MenuItem text="Open">
            <SubMenu>
              <MenuItem text="Word"></MenuItem>
              <MenuItem text="Excel"></MenuItem>
              <MenuItem text="PowerPoint"></MenuItem>
            </SubMenu>
          </MenuItem>
          <MenuItem text="Save" iconCls="icon-save"></MenuItem>
          <MenuItem text="Print" iconCls="icon-print" disabled></MenuItem>
          <MenuItem text="Exit"></MenuItem>
        </Menu>
 */