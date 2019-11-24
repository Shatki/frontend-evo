import React from 'react'
import  { GearOne, GearTwo, GearTree }  from "./gears-error";
import './gears.css'

const GearsError = () => {
    return(
        <div className="gears">
            <GearOne className="gear">
                <div className="bar"/>
                <div className="bar"/>
                <div className="bar"/>
            </GearOne>
            <GearTwo className="gear">
                <div className="bar"/>
                <div className="bar"/>
                <div className="bar"/>
            </GearTwo>
            <GearTree className="gear">
                <div className="bar"/>
                <div className="bar"/>
                <div className="bar"/>
            </GearTree>
        </div>
    )
};

export default GearsError;