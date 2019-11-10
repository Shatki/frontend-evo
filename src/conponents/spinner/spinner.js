import React from 'react'
import './spinner.css'

const Spinner = (props) => {
    return(
        <div {...props } className="lds-css ng-scope">
            <div className="lds-ellipsis">
                <div>
                    <div></div>
                </div>
                <div>
                    <div></div>
                </div>
                <div>
                    <div></div>
                </div>
                <div>
                    <div></div>
                </div>
                <div>
                    <div></div>
                </div>
            </div>
        </div>
    )
};

export default Spinner;