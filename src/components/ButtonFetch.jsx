import React from "react";
import {ShortcutDefs} from "../constants/shortcutDefs.jsx";

/*
relies on global; ShortcutDefs for the button for buttonKey key

    expected props:
        buttonKey
        onCLick         <button>.value as a parameter value
        className
 */
export default function ButtonFetch( {buttonKeyDef, onClick, className=''}) {

    console.log (`button key def is: ${buttonKeyDef}`)
    // catch case where button is ill-defined
    const buttonObj = buttonKeyDef in ShortcutDefs
        ? ShortcutDefs[buttonKeyDef]
        : {
            label : "Unknown",
            value : ""
        }
    //
    // // catch case where button is ill-defined
    // const buttonObj = buttonKeyDef ? buttonKeyDef : {
    //         label : "Unknown",
    //         value : ""
    //     };


    const handleClick = buttonObj
        ? () => {onClick(buttonObj.value)}
        : () => {};

    return <button onClick={handleClick} className={className ? className : "button-fetch"}>
        <span>{buttonObj.label}</span>
    </button>
}

