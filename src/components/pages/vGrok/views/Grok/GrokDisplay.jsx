import React, {useCallback, useState} from 'react';
import './grokDisplay.css';
import '../../../../css/components.css';
import {ConfigContext} from "../../../../../contexts/ConfigContext.jsx";
import GrokFlock from "../../GrokFlock.jsx";
import GrokFilterPanel from "./GrokFilterPanel.jsx";
import {ACTIONS_IARE} from "../../../../../constants/actionsIare.jsx";
import {ARCHIVE_STATUS_MAP} from "../../../../../constants/archiveStatusMap.jsx";
import {Tooltip as MyTooltip} from "react-tooltip";


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
        live_status: { key: "live_status" },
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

        const f = ARCHIVE_STATUS_MAP[archiveStatus]
        if (!f) return null  // null means "all" filter

        const filterFunction = f.filterFunction
        if (!filterFunction) return null  // if no filter function then show all

        // return synthetic filter object for archive_status
        return {
            "archive_status": {
                desc: `URLs that have Archive Status of "${f.filterDescription}"`,
                caption: f.filterDescription,
                filterFunction: filterFunction
            }
        }
    }


    // TODO get this from liveStatus filter definition from Filter defs
    //  that def should contain a "Url filter def"
    const getFilterLiveStatus = (liveStatus) => {
        if (liveStatus === null) {
            return null; // no live stat means all filter
        }

        // return synthetic filter object for live_status
        return {
            "live_status": {
                desc: `URLs that have Live Status of "${liveStatus}"`,
                caption: `Status code: ${liveStatus}`,
                filterFunction: () => (url) => {
                    // Convert live_status to number, default to 0 if null/invalid
                    const urlStatus = !url.live_status || isNaN(Number(url.live_status))
                        ? 0
                        : Number(url.live_status);
                    const compareStatus = !liveStatus || isNaN(Number(liveStatus))
                        ? 0
                        : Number(liveStatus);
                    return urlStatus === compareStatus;
                },
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
            ACTIONS_IARE.SHOW_MESSAGE.key
        ) {
            alert(value)
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
            // value is "archived" or "no archive", keys into ARCHIVE_STATUS_MAP
            // alert(`handling action: ${action}, value: ${value}`)
            setFlockFilters(getFilterArchiveStatus(value))
            setFilterState(availableFilters.archive_status, value)
        }

        else if (action === ACTIONS_IARE.SET_LIVE_STATUS_FILTER.key
        ) {
            // value is live status
            setFlockFilters(getFilterLiveStatus(value))
            setFilterState(availableFilters.live_status, value)
        }


        else {
            console.log(`Action "${action}" not supported.`)
            alert(`Action "${action}" not supported.`)
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    const tooltipForGrokDisplay = <MyTooltip id="grok-display-tooltip"
                                            float={true}
                                            closeOnEsc={true}
                                            delayShow={420}
                                            variant={"info"}
                                            noArrow={true}
                                            offset={5}
                                            className={"grok-display-tooltip"}
                                            style={{ zIndex: 99 }}
    />

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
                                    tooltipId={"grok-display-tooltip"}/>
                </div>

                <div className={"flock-display-contents"}>
                    <GrokFlock urlDict={pageData.urlDict}
                               urlArray={pageData.urlArray}
                               urlFilters={flockFilters}

                               onAction={handleAction}
                               tooltipId={"grok-display-tooltip"}

                               selectedUrl={selectedUrl}
                               fetchMethod={myConfig.urlStatusMethod}
                    />
                </div>
            </div>

            {tooltipForGrokDisplay}

        </div>

    </>
}
