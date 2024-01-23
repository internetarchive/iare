import React from "react";
import './css/components.css';

// TODO: add tooltipID? add onAction? or is all this covered in contents?
export default function ControlBox({
                            caption = null,
                            className = null,
                            children
                       }) {
    return <>
        <div className={`control-box ${className ? `${className}` : ''}`}>
            {caption && <div className={"control-box-caption"}>{caption}</div>}
            <div className={"control-box-contents"}>{children}</div>
        </div>
    </>
}
