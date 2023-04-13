import React from "react";

/*
    expected props:
        key
        caption
        isPressed
        setFilter

        useDesc     boolean; show descriptive text or not

        upon click, the "name" param gets sent "up"

 */
export default function FilterButton(props) {
    return <button
        type="button"
        className={"btn toggle-btn " + (props.isPressed ? "btn-pressed" : "")}
        aria-pressed={props.isPressed}
        onClick={() => props.onClick(props.name)}

        // tooltip attributes
        data-tooltip-id="my-filter-tooltip"
        data-tooltip-content={props.desc}
    >
        <span>{props.caption}{(props.count || props.count === 0) ? <span className={"lolite"}> [{props.count}]</span> : ''}</span>
        {props.useDesc ? <><br/><span className={"btn-description"}>{props.desc}</span></> : null}
    </button>;

}
