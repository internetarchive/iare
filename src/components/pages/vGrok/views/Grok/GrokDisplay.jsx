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

    const filters = {
        archive_status: { key: "archive_status" },
    }


    let myConfig = React.useContext(ConfigContext);
    myConfig = myConfig ? myConfig : {} // prevents "undefined.<param>" errors

            // const simpleUrlDict = Object.keys(pageData.urlDict).map( urlKey => {
            //     // extract url from key
            //     return { url: urlKey }
            // }).sort(compareByUrl('asc'));
            //
            // const simpleUrlArray = pageData.urlArray.map( urlObj => {
            //     // extract url from url object
            //     return { url: urlObj.url }
            // }).sort(compareByUrl('asc'))

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
        const statusDisplay = ARCHIVE_STATUS_MAP[archiveStatus]?.key || null

        if (statusDisplay === null) {
            return null; // null means "all" filter
        }

        const filterFunction = ARCHIVE_STATUS_MAP[archiveStatus]?.filterFunction
        if (!filterFunction) return null;

        // return synthetic filter showing URLs that have specified archiveStatus
        return {
            "archive_status": {
                desc: `URLs that have Archive Status of "${statusDisplay}"`,
                caption: <span>{`Contains Archive Status "${statusDisplay}"`}</span>,
                // filterFunction: () => (url) => {
                //     if (!url.rsp) return false  // if no rsp list for url, block it - it does not "belong"
                //     return url.rsp.includes(perennialKey)
                // }
                filterFunction: filterFunction
            }
        }
    }

    
    const handleAction = useCallback( result => {
        // handles callback functionality when something "down below" (like a url row) gets clicked

        const {action, value} = result;
        console.log (`UrlDisplay: handleAction: action=${action}, value=${value}`);

        const noneFilter = {
            "filter" : {
                filterFunction: () => () => {return false},
            }
        }

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
            // value is true (archived) or false (no archive)
            alert(`handling action: ${action}, value: ${value}`)
            setFlockFilters(getFilterArchiveStatus(value))
            setFilterState(filters.reference_stats, value)
        }

    else {
            console.log(`Action "${action}" not supported.`)
            alert(`Action "${action}" not supported.`)
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // simpleArchiveDisplay
    // simpleUrlArray is collection of "pure" links - does not include archives
    // each should have associated archive
    // and live status
    // goal: make a d3 collection of urls

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
