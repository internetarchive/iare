import React, {useCallback, useState} from 'react';
import './grokDisplay.css';
import '../../../../css/components.css';
import {ConfigContext} from "../../../../../contexts/ConfigContext.jsx";
import GrokFlock from "../../GrokFlock.jsx";
import GrokFilterPanel from "./GrokFilterPanel.jsx";
import {ACTIONS_IARE} from "../../../../../constants/actionsIare.jsx";
import {ARCHIVE_STATUS_MAP} from "../../../../../constants/archiveStatusMap.jsx";


/*
assumes pageData.urlArray and pageData.urlDict
 */
export default function GrokDisplay ({ pageData, options, tooltipId = null } ) {

    const [flockFilters, setFlockFilters] = useState( null ); // keyed object of url filters to pass in to UrlFlock
    // TODO: implement UrlFilter custom objects
    const [currentFilterState, setCurrentFilterState] = useState({})  // aggregate state of filter boxes
    const [selectedUrl, setSelectedUrl] = useState(''); // currently selected url in url list

    const availableFilters = {
        archive_status: { key: "archive_status" },
    }

    let myConfig = React.useContext(ConfigContext);
    myConfig = myConfig ? myConfig : {} // prevents "undefined.<param>" errors

    const setFilterState = (whichFilter, value) => {
        setCurrentFilterState(prevState => {
            const newState = prevState
            Object.keys(prevState).forEach( state => {
                newState[state] = null
            })
            if (whichFilter?.key) newState[whichFilter.key] = value
            return newState
        })
    }

    const getFilterArchiveStatus = (archiveStatus) => {

        const statusCaption = ARCHIVE_STATUS_MAP[archiveStatus]?.key || null
        if (statusCaption === null) {
            return null  // null means "all" filter
        }

        const filterFunction = ARCHIVE_STATUS_MAP[archiveStatus]?.filterFunction
        if (!filterFunction) return null  // if no filter function then show all

        // return synthetic filter object for archive_status
        return {
            "archive_status": {
                desc: `URLs that have Archive Status of "${statusCaption}"`,
                caption: <span>{`Contains Archive Status "${statusCaption}"`}</span>,
                filterFunction: filterFunction
            }
        }
    }

    
    const handleAction = useCallback( result => {
        // handles callback functionality when something "down below" (like a url row) gets clicked

        const {action, value} = result;
        console.log (`GrokDisplay: handleAction: action=${action}, value=${value}`);


        if (0) {
            // allows for easy addition of "else if"
        }

        else if (action ===
            ACTIONS_IARE.REMOVE_ALL_FILTERS.key
        ) {
            // clear filters (or, show all) for URL
            setFlockFilters(null)
            setSelectedUrl(null)
            setFilterState(null)
        }

        else if (action === ACTIONS_IARE.SET_ARCHIVE_STATUS_FILTER.key
        ) {
            // value is "archived" or "no archive"
            // alert(`handling action: ${action}, value: ${value}`)
            setFlockFilters(getFilterArchiveStatus(value))
            setFilterState(availableFilters.archive_status, value)
        }

    else {
            console.log(`Action "${action}" not supported.`)
            alert(`Action "${action}" not supported.`)
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    return <>
        <div className={"section-box grok-display"}>

            <h3>Grokipedia Citation URLs <span style={{
                display: "none",
                fontSize: '50%',
                fontStyle: "italic",
                color: "red"}}>all urls from Citations</span></h3>

            <div className={"url-display-body"} style={{display: "flex", height:'100%'}}>

                <div className={"grok-filter-panel-column"}>
                    <GrokFilterPanel pageData={pageData}
                                    options={{}}
                                    onAction={handleAction}
                                    currentState={currentFilterState}
                                    tooltipId={"url-display-tooltip"}/>
                </div>

                <div className={"flock-display-contents"}>
                    <GrokFlock urlDict={pageData.urlDict}
                               urlArray={pageData.urlArray}
                               urlFilters={flockFilters}
                               onAction={handleAction}
                               selectedUrl={selectedUrl}
                               fetchMethod={myConfig.urlStatusMethod}
                               tooltipId={"url-display-tooltip"} />
                </div>
            </div>

        </div>

    </>
}
