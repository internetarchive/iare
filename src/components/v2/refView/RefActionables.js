import React from "react";
import {ACTIONABLE_FILTER_MAP} from "../../../constants/actionableMap";

/*
shows actionables for this reference
 */
export default function RefActionables({ actionables, onAction }) {

    // const actionDisplay = 1 || actions
    //     ? actions
    //     : "No actionable items found for this reference."
    //
    // const message = <>
    //     <div style={{fontStyle:"italic",color:"red"}}>Actionable assignment is not yet implemented.</div>
    //         {actionDisplay}
    //         <div style={{fontStyle:"normal",color:"black"}}
    //         >If this were working, there would be instructions here on what to fix in the wikitext..
    //     </div>
    // </>
    if (actionables?.length) return <>
        <div className="ref-view-actionables yes-action">
            <h3 className={"action-section-label"}>Actionable</h3>
            {actionables.map( (action, i) => {
                const myAction = ACTIONABLE_FILTER_MAP[action]
                if (!myAction) return null
                return <div className={"ref-actionable"} key={i}>
                    <div className={"action-fixit"}>
                        <div style={{fontWeight: "bold"}}>To Fix:&nbsp;</div>
                        {myAction.fixit}
                    </div>

                    <div className={"action-desc"}><span style={{fontWeight: "bold"}}>Condition:</span> {myAction.desc}</div>

                </div>
            })}
        </div>
    </>

    else return <div className="ref-view-actionables no-action">
        <h3>No Actionable items for this reference.</h3>
    </div>

}

