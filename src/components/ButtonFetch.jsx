import React from "react";
/*
    expected props:
        buttonDef       a {label, value} object
        onCLick         <button>.value as a parameter value
        className
*/
export default function ButtonFetch( {buttonDef, onClick, className=''}) {

    // catch case where button is ill-defined
    const buttonObj = buttonDef ? buttonDef : {
            label : "Unknown",
            value : ""
        };

    const handleClick = buttonObj
        ? () => {onClick(buttonObj.value)}
        : () => {};

    return <button onClick={handleClick} className={className ? className : "button-fetch"}>
        <span>{buttonObj.label}</span>
    </button>
}

