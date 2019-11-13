import React from 'react';
import { Menu, MenuItem, SubMenu } from 'rc-easyui';
import './context-menu.css'

export default class ContextMenu extends React.Component {
    // onContextMenu={this.handleContextMenu.bind(this)}
    render() {
        return (
            <Menu>
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
    }
}
