import React from "react";
import './shared/components.css';

/*
display description of filters and actions to take, if any

filter argument must have a category, desc, optional fixit element
maybe tooltip in the future
*/
export default function ConditionBox({filter = null}) {

    console.log(`ConditionBox: filter: ${filter ? filter.caption : ""}`)

    if (!filter) return <div className={`condition-box`}>
        <div className={"category-row"}>
            <div className={"cond-data"}>Showing All Items</div>
        </div>
        <div className={"fixit-row"}>
            <div className={"cond-data"}>Click on Actionable or another filter to explore.</div>
        </div>
    </div>

    return <>
        <div className={`condition-box`}>
            <div className={"category-row"}>
                <div className={"cond-category"}>{filter.category}</div>
                <div className={"cond-data"}>{filter.desc}</div>
            </div>
            {!!filter.fixit
            ? <div className={"fixit-row"}>
                <div className={"cond-category"}>To Fix</div>
                <div className={"cond-data"}>{filter.fixit}</div>
            </div>
            : <div className={"fixit-row"}>
                <div className={"cond-category"}>&nbsp;</div>
                <div className={"cond-data"}>&nbsp;</div>
            </div>
            }
        </div>
    </>
}
