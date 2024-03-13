import React from "react";
import './shared/components.css';

/*
filter argument may have a caption, desc
maybe tooltip in the future
*/
export default function FilterConditionBox({filter = null}) {

    console.log(`FilterConditionBox: filter: ${filter ? filter.caption : ""}`)

    return <>
        <div className={`filter-condition-box`}>
            <div className={"condition-label"}>Condition:</div>
            <div className={"condition-caption"}>{!filter
                ? "Showing All Items"
                : filter.caption
            }</div>
        </div>
    </>
}
