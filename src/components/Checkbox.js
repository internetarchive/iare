import React from "react";

export default function Checkbox ( { label, value, onChange, className='' }) {
    return <label className={className}><input
        type="checkbox"
        checked={value}
        onChange={onChange}
    />{label}</label>
}
