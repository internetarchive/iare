import React from "react";

export default function ChoiceFetch( {choices=null, selectedChoice='', options={}, onChange}) {
    /* must take in description of choices
    returns value associated with choice (should this return choice key?)
    - could this be a filter itself?
    default selection is choice whose property key matches selectedChoice
    */

    console.log("rendering ChoiceFetch")

    const choiceElements =  Object.keys(choices).map(choice => {
        return <div className={"choice-fetch-item"} key={choice} >
            <label>
                <input
                    type="radio"
                    value={choices[choice].value}
                    checked={selectedChoice === choice}
                    onChange={onChange}
                /> {choices[choice].caption}
            </label>
        </div>
    })

    const classes = "choice-fetch-items" + (options.className ? ' ' + options.className : '')
    return <div className={classes}>{options.caption} {choiceElements}</div>
}
