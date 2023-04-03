import React from "react";

export default function Checkbox ( { label, value, onChange }) {
    return <label><input
        type="checkbox"
        checked={value}
        onChange={onChange}
    />{label}</label>;
}
