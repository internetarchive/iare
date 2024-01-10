import React, { useState } from 'react';
import RefFlock from "./RefFlock";
import RefOverview from "./RefOverview";
import {REF_FILTER_DEFS, REF_FILTER_TYPES} from "../../constants/refFilterMaps";
import './refs.css';
import '../shared/components.css';

export default function RefDisplay ({ pageData, options } ) {

    const [refFilter, setRefFilter] = useState( null ); // filter to pass in to RefFlock
    const [selectedFilter, setSelectedFilter] = useState( [] ); // to hilite selected filter button

    // handleAction interprets an action passed "UP" from RefOverview, and,
    // essentially passes the action "down" to the RefFlock component by
    // setting the refFilter with setRefFilter.
    //
    // result is an object: { context: <context>, action: <action name>, value: <param value> }
    //
    // context lets us know which filter set the clicked filter is from
    //
    const handleAction = (result) => {
        console.log (`RefDisplay::handleAction: `, result);

        const {action, value, context} = result;

        if (action === "setRefFilter") {
            // value is filter key name, and context is which filter set to engage
            const f = context === "set-0" // TODO: this is stupidly hard coded for now
                ? REF_FILTER_TYPES[value]
                : REF_FILTER_DEFS[value]
            ;

            // selectedFilter helps indicate chosen filter
            setSelectedFilter([value, context])

            // refFilter activates filter in References flock
            setRefFilter(f)
        }

        // clear filter for references list
        if (action === "removeReferenceFilter") {
            setRefFilter(null)
            setSelectedFilter(null)
        }
    }

                // // TODO: may want to set this in useEffect[pageData]
                // const refArray = !pageData || !pageData.dehydrated_references
                //     ? []
                //     : pageData.dehydrated_references
    if (!pageData) return null;

    const refArray = (pageData.references)

    return <>
        <div className={"ref-display section-box"}>

            {false && <h3>References</h3>}

            <RefOverview refArray={refArray}
                         summary={
                            {
                                filterSets: [
                                    { context : "set-0", filterMap : REF_FILTER_TYPES },
                                    { context : "set-1", filterMap : REF_FILTER_DEFS},
                                ]
                            }
                         }
                         onAction={handleAction}
                         selectedFilter={selectedFilter}
                         pageData={pageData}
            />
        </div>

        <div className={"section-box"}>
            <h3>References List</h3>
            <RefFlock refArray={refArray} refFilter={refFilter} onAction={handleAction} />
        </div>

    </>
}
