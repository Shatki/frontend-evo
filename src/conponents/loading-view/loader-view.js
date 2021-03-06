import React from 'react'
import './loader-view.css'
import GearsLoading from "../gears";


export const LoadingView = () => {
    return (
        <div className="container">
                <div className="loadingtext">Загрузка...</div>
                <GearsLoading/>
            </div>
        )
};

export default LoadingView