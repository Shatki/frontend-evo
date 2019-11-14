import { Menu, MenuItem, SubMenu } from 'rc-easyui';
import React from "react";

export const ContextMenu = ({ menu }) => {
        // onContextMenu={this.handleContextMenu.bind(this)}
        return (
            <Menu ref={ menu }>
                <MenuItem text="New"/>
                <MenuItem text="Open">
                    <SubMenu>
                        <MenuItem text="Word"/>
                        <MenuItem text="Excel"/>
                        <MenuItem text="PowerPoint"/>
                    </SubMenu>
                </MenuItem>
                <MenuItem text="Save" iconCls="icon-save"/>
                <MenuItem text="Print" iconCls="icon-print" disabled/>
                <MenuItem text="Exit"/>
            </Menu>
        );
    };