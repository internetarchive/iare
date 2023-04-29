import React from "react";
import ButtonDefs from "./ButtonDefs";

/*
relies on global; ButtonDefs for the button for buttonKey key

    expected props:
        buttonKey
        onCLick         <button>.value as a parameter value
        className
 */
export default function ButtonFetch( {buttonKey, onClick, className=''}) {
    const buttonObj = ButtonDefs[buttonKey]
        ? ButtonDefs[buttonKey]
        : {
            label : "Unknown Key '" + buttonKey + "'",
            value : ""
            };

    const handleClick = buttonObj
        ? () => {onClick(buttonObj.value)}
        : () => {};

    return <button onClick={handleClick} className={className ? className : "button-fetch"}>
        <span>{buttonObj.label}</span>
    </button>
}

