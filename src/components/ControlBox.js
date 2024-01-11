import React from "react";
import './shared/components.css';

// TODO: add onHover for tooltip? onTooltip?
// TODO: add onAction? or is all this covered in contents?
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
