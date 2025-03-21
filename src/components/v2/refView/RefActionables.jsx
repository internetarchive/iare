import React from "react";
import {ACTIONABLE_FILTER_MAP} from "../../../constants/actionableMap.jsx";
import RefSectionHeader from "./RefSectionHeader.jsx";
import { useTranslation } from 'react-i18next';

/*
shows actionables for this reference
 */
export default function RefActionables({ actionables, onAction }) {

    const { t, i18n } = useTranslation();

    if (actionables?.length) return <>
        <div className="ref-view-section section-actionables">

            <RefSectionHeader leftPart={<h3>{t('actionable_items')}<span className={"header-small"}>{t("things that can be fixed for this citation")}</span></h3>} >
            </RefSectionHeader>

            <div className ="ref-view-actionables">

                {/*<div className={"ref-view-actionable-caption"}></div>*/}

                {actionables.map( (action, i) => {
                    const myAction = ACTIONABLE_FILTER_MAP[action]
                    if (!myAction) return null
                    return <div className={"ref-view-actionable"} key={i}>

                        <div className={"action-cond"}><span className={"inline-heading"} >Condition:</span> {myAction.desc}</div>

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

    // NB Return nothing, rather than a message saying there are no actionables
            // else return <div className="ref-view-actionables no-action">
            //     <h3>No Actionable items for this reference.</h3>
            // </div>
    else return null

}

