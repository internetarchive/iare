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

// default function to render button, if not passed FilterFunction props.onRender
const defaultRenderFunc = (props) => {
    return <>
        <span>{props.caption}{
            (props.count || props.count === 0)
                ? <span className={"lolite"}> [{props.count}]</span> : ''}
        </span>
        {props.useDesc ? <><br/><span className={"btn-description"}>{props.desc}</span></> : null}
    </>
}
export default function FilterButton(props) {
    return <button
        type="button"
        className={`btn toggle-btn${props.isPressed ? " btn-pressed" : ""}`}
        aria-pressed={props.isPressed}
        onClick={() => props.onClick(props.name)}

        // tooltip attributes
        data-tooltip-id={props.tooltipId}
        data-tooltip-html={props.tooltip}
    >
        {props.onRender ? props.onRender(props) : defaultRenderFunc(props)}

    </button>;

}
