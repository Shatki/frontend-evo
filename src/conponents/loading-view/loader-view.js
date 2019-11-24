import React from 'react'
import './loader-view.css'
import GearsLoading from "../gears";


export const LoadingView = () => {
    return (
        <div className="container">
                <GearsLoading/>
                <h1>Загрузка...</h1>
            </div>
        )
};

export default LoadingView