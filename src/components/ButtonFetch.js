import React from "react";
import ShortcutDefs from "../constants/ShortcutDefs";

/*
relies on global; ShortcutDefs for the button for buttonKey key

    expected props:
        buttonKey
        onCLick         <button>.value as a parameter value
        className
 */
export default function ButtonFetch( {buttonKey, onClick, className=''}) {
    const buttonObj = ShortcutDefs[buttonKey]
        ? ShortcutDefs[buttonKey]
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

