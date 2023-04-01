import React from "react";
import GlobalVars from "./GlobalVars";

/*
relies on global; GlobalVars for the button for buttonKey key

    expected props:
        buttonKey
        onCLick         <button>.value as a parameter value
 */
export default function ButtonFetch( {buttonKey, onClick}) {
    const buttonObj = GlobalVars[buttonKey]
        ? GlobalVars[buttonKey]
        : {
            label : "Unknown Key '" + buttonKey + "'",
            value : ""
            };

    const handleClick = buttonObj
        ? () => {onClick(buttonObj.value)}
        : () => {};

    return <button onClick={handleClick} className={"name-shortcut"}>
        <span>{buttonObj.label}</span>
    </button>
}

