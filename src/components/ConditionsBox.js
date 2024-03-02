import React from "react";
import ConditionBox from "./ConditionBox";
import './shared/components.css';
import {IARE_ACTIONS} from "../constants/iareActions";

/* display description of conditions (filters and actions), if any */
export default function ConditionsBox({conditions = null, onAction, caption="Conditions"}) {

    // ensure conditions is an array
    const myConditions = conditions
        ? ( Array.isArray(conditions) ? conditions : [conditions] )
        : null

    // add the "Remove All" button
    const buttonRemove = myConditions?.length
        ? <button onClick={() => onAction({action: IARE_ACTIONS.REMOVE_ALL_FILTERS.key})}
                  className={'utility-button small-button inline-conditions'}
        ><span>Remove Conditions</span></button>
        : null

    return <div className={`conditions-box`}>
        <h3 className={"conditions-box-caption"}>Conditions{buttonRemove}</h3>
        <div className={"condition-box-contents"}>
            {myConditions?.length
                ? myConditions.map( (f, i) => {
                    return <ConditionBox filter={f} key={i}/>
                })
                : <ConditionBox filter={null}/>
            }
        </div>
    </div>
}
