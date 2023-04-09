import React from "react";

/*
    expected props:
        key
        caption
        isPressed
        setFilter

        useDesc     boolean; show descriptive text or not
 */
export default function FilterButton(props) {
    return <button
        type="button"
        className={"btn toggle-btn " + (props.isPressed ? "btn-pressed" : "")}
        aria-pressed={props.isPressed}
        onClick={() => props.onClick(props.name)}
    >
        <span>{props.caption}{(props.count || props.count === 0) ? ` (${props.count})` : ''}</span>
        {props.useDesc ? <><br/><span className={"btn-description"}>{props.desc}</span></> : null}
    </button>;
}
