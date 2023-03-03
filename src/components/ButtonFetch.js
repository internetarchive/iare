import React from "react";
import GlobalVars from "./GlobalVars";

/*
    expected props:
        buttonKey
        onCLick
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

    return <button onClick={handleClick} className={"file-shortcut"}>
        <span>{buttonObj.label}</span>
    </button>
}

