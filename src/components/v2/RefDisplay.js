import React, { useState } from 'react';
import RefFlock from "./RefFlock";
import RefOverview from "./RefOverview";
import {REF_FILTER_DEFS, REF_FILTER_TYPES} from "./filters/refFilterMaps";
import './refs.css';

export default function RefDisplay ({ pageData, options } ) {

    const [refFilter, setRefFilter] = useState( null ); // filter to pass in to RefFlock
    const [curFilterName, setCurFilterName] = useState( '' ); // to hilite selected filter button

    // result is an object: { context: <context>, action: <action name>, value: <param value> }
    //
    // context lets us know which filter set clicked filter def is from
    //
    const handleAction = (result) => {
        const {action, value, context} = result;
        console.log (`RefDisplay::handleAction: action=${action}, value=${value}, context=${context}`);

        // context should tell us which filter set to engage

        // action is setFilter and value is filter key name
        if (action === "setFilter") {
            const f = context === "set-0" // TODO: this is stupidly hard coded for now
                ? REF_FILTER_TYPES[value]
                : REF_FILTER_DEFS[value]
            ;

            // hilite chosen button
            setCurFilterName(value)

            // and activate filter
            setRefFilter(f)
        }
    }

    // TODO: may want to set this in useEffect[pageData]
    const refArray = !pageData || !pageData.dehydrated_references
        ? []
        : pageData.dehydrated_references

    const refSummary = {
        filterSets: [ REF_FILTER_TYPES, REF_FILTER_DEFS ],
    }

    return <div className={"ref-display section-box"}>

        <h3>References</h3>

        <RefOverview refArray={refArray}
                     summary={refSummary}
                     onAction={handleAction}
                     curFilterName={curFilterName}
        />

        <RefFlock refArray={refArray} refFilterDef={refFilter} />

    </div>
}
