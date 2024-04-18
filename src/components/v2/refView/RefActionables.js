import React from "react";
import {ACTIONABLE_FILTER_MAP} from "../../../constants/actionableMap";
import RefSectionHeader from "./RefSectionHeader";

/*
shows actionables for this reference
 */
export default function RefActionables({ actionables, onAction }) {

    if (actionables?.length) return <>
        <div className="ref-view-section yes-action">

            <RefSectionHeader leftPart={<h3>Actionable Items</h3>} >
            </RefSectionHeader>

            <div className={"ref-view-actionable-caption"}>This citation has some things that can be fixed.</div>

            <div className ="ref-view-actionables">
                {actionables.map( (action, i) => {
                    const myAction = ACTIONABLE_FILTER_MAP[action]
                    if (!myAction) return null
                    return <div className={"ref-view-actionable"} key={i}>

                        <div className={"action-desc"}><span className={"inline-heading"} >Condition:</span> {myAction.desc}</div>

                        {myAction.symptom && <div className={"action-symptom"}>
                            <span className={"inline-heading"} >Symptom:&nbsp;</span>
                            {myAction.symptom}
                        </div>}

                        <div className={"action-fixit"}>
                            <span className={"inline-heading"} >To Fix:&nbsp;</span>
                            {myAction.fixit}
                        </div>


                    </div>
                })}
            </div>
        </div>
    </>

    // else return <div className="ref-view-actionables no-action">
    //     <h3>No Actionable items for this reference.</h3>
    // </div>
    else return null

}

