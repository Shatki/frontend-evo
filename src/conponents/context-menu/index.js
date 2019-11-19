import React from 'react'
import ContextMenu from "./context-menu";


const {
    Provider: ContextMenuProvider,
    Consumer: ContextMenuConsumer
} = React.createContext();

export{
    ContextMenuProvider,
    ContextMenuConsumer
};


export default ContextMenu