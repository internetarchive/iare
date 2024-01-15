import React from "react";

export default function Checkbox ( { label, value, onChange, className='', tooltipId=null, tooltipContent=null }) {
    return <label className={`${className} ${tooltipContent ? "tooltip-active" : ''}`}
        data-tooltip-id={tooltipId}
        data-tooltip-html={tooltipContent}
    ><input
        type="checkbox"
        checked={value}
        onChange={onChange}
    />{label}</label>
}
