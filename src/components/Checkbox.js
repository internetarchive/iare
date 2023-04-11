import React from "react";

export default function Checkbox ( { label, value, onChange, className='' }) {
    return <label><input className={className}
        type="checkbox"
        checked={value}
        onChange={onChange}
    />{label}</label>;
}
