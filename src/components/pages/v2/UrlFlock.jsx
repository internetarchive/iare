import React, {useCallback, useState} from 'react';
import FlockBox from "../../FlockBox.jsx";
import "../../css/flock.css"

import {convertToCSV, copyToClipboard} from "../../../utils/generalUtils.js";
import {getArchiveStatusInfo, getProbePopupData} from "../../../utils/urlUtils.jsx";
import {BadgeContextEnum as badgeContext, BadgeContextEnum} from "../../../constants/badgeDisplayTypes.jsx";

import {ACTIONS_IARE} from "../../../constants/actionsIare.jsx";
import {ACTIONABLE_FILTER_MAP} from "../../../constants/actionableMap.jsx";
import {ARCHIVE_STATUS_FILTER_MAP as archiveFilterDefs} from "../../../constants/urlFilterMaps.jsx";
import {httpStatusCodes, iabotLiveStatusCodes} from "../../../constants/httpStatusCodes.jsx"
import {reliabilityMap} from "../../../constants/perennialList.jsx";
import {urlColumnDefs} from "../../../constants/urlColumnDefs.jsx";

import Popup from "../../Popup.jsx";

import SignalDisplay from "../../SignalDisplay.jsx";
import SignalDataDetails from "../../SignalDataDetails.jsx";
import SignalsDocs from "../../SignalsDocs.jsx";
import SignalsSort from "../../SignalsSort.jsx";

import SignalDataDetailsTitle from "../../SignalDataDetailsTitle.jsx";



/*
assumes urlArray is an array of url objects:
    [
        {
            url : <url>,
            status_code : <status_code>,
            <other url info>
        },
        ...
    ]

and filterDef property is a filter object definition of the form:

    {
        caption: "caption here",
        desc: "", // ? tooltip text?
        filterFunction: () => { <return callback function to filter> }
    }

example filterDef element:
    {
        caption: "General",
        desc: "",
        filterFunction: () => (d) => {return d.type === "general"},
    }

*/
const urlFlock = React.memo(function UrlFlock({
                                                  urlDict,
                                                  urlArray,
                                                  urlFilters = {},  // keyed object of filter definitions to apply to urlArray for final url list display
                                                  onAction,
                                                  selectedUrl = '',
                                                  fetchMethod = "",
                                                  tooltipId = ''
                                              }) {
    // TODO maybe should not/don't have to use memo here??
    //  making it a memo seemed to reduce the re-renders of the flock when the tooltip text was updated

    const [signalDetailsPopupTitle, setSignalDetailsPopupTitle] = useState(<>Modal Title</>);
    const [signalDetailsPopupContents, setSignalDetailsPopupContents] = useState(null);

    const [isSignalDetailsPopupOpen, setIsSignalDetailsPopupOpen] = useState(false)
    const [isSignalsDocsPopupOpen, setIsSignalsDocsPopupOpen] = useState(false)
    const [isSignalsSortPopupOpen, setIsSignalsSortPopupOpen] = useState(false)


    const [feedbackText, setFeedbackText] = useState("")

    const [urlTooltipHtml, setUrlTooltipHtml] = useState('<div>ToolTip' +
        '<br>UrlFlock<br />second line');
    // TODO there is a bug where sort re-renders list every time tooltip text/html property is updated
    // TODO maybe fix using React.useRef somehow???

    const [sort, setSort] = useState({
        sorts: {  // holds sort value for all different sort types
            "status": {name: "status", dir: 1},  // dir: 1 is asc, -1 is desc, 0 is do not sort
            "signals_score": {name: "signals_score", dir: -1},
            "archive_status": {name: "archive_status", dir: -1},
            "references": {name: "references", dir: -1},
            "templates": {name: "templates", dir: -1},
            "actionable": {name: "actionable", dir: -1},
            "sections": {name: "sections", dir: -1},
            "perennial": {name: "perennial", dir: -1},
        },
        sortOrder: ["status"]  // array indicating which sorts get applied and in what order. NB this is not implemented yet, but will be
    })

    const columnsToShow = {
        "reliability": {show: true},
        "probes": {show: true},
        "signals": {show: true}
    }

    const updateFlockSort = (sortKey) => {
        // set new sort State:
        // - toggle sort direction of specified sort
        // - set new sort state with setSort

        // selectively change the specified sort type
        // https://stackoverflow.com/questions/43638938/updating-an-object-with-setstate-in-react
        setSort(prevState => {
            // guarantee new sort has entry in sorts object
            if (!(prevState.sorts[sortKey])) {
                prevState.sorts[sortKey] = {name: sortKey, dir: 1}
            }
            // change just the element associated with the specified sortKey
            return {
                sorts: {
                    ...prevState.sorts,
                    [sortKey]: {  // TODO NB: must check if sortName is there already and append to array if not
                        ...prevState.sorts[sortKey],
                        dir: -1 * prevState.sorts[sortKey].dir
                    }
                },
                sortOrder: [sortKey]  // set only one for now...
                // TODO implement so that sortOrder contains an array of a list of sortKey's, not just one
            }
        })
    }


    const onSignalHeaderClick = (e) => {
        e.stopPropagation()
        console.log(`onSignalHeaderClick: e.target.className = ${e.target.className}`)

        const docsEl = e.target.closest(".wiki-signals-docs");
        const sortEl = e.target.closest(".wiki-signals-sort");

        if (docsEl) {
            setIsSignalsDocsPopupOpen(true);
        } else if (sortEl) {
            // setIsSignalsSortPopupOpen(true);
            updateFlockSort("signals_score")
        }
    }


    const sortByName = (a, b) => {
        const nameA = a.url
        const nameB = b.url

        // respect sortDir
        if (nameA < nameB) return sort.sorts['name'].dir * -1;
        if (nameA > nameB) return sort.sorts['name'].dir;
        return 0;
    }

    const sortByStatus = (a, b) => {
        const statusA = a && a.status_code !== undefined ? a.status_code : -1;
        const statusB = b && b.status_code !== undefined ? b.status_code : -1;

        // respect sort dir
        if (statusA < statusB) return sort.sorts['status'].dir * -1;
        if (statusA > statusB) return sort.sorts['status'].dir;
        return 0;
    }

    const sortByArchiveStatus = (a, b) => {
        const archiveA = a?.archive_status?.hasArchive ? 1 : 0;
        const archiveB = b?.archive_status?.hasArchive ? 1 : 0;
        const bookA = a?.isBook ? 1 : 0;
        const bookB = b?.isBook ? 1 : 0;

        // sort by book status first, respect sortDir
        // NB: ignoring book type (e.g. google or archive.org) for now
        if (bookA) return sort.sorts['archive_status'].dir * -1
        if (bookB) return sort.sorts['archive_status'].dir

        // if neither a or b is a book, sort by archive status, respect sortDir
        if (archiveA > archiveB) return sort.sorts['archive_status'].dir * -1;
        if (archiveA < archiveB) return sort.sorts['archive_status'].dir;
        return 0;
    }

    const sortByReference = (a, b) => {
        const statusA = a.reference_info?.statuses?.length ? a.reference_info.statuses[0] : ''
        const statusB = b.reference_info?.statuses?.length ? b.reference_info.statuses[0] : ''
        return sort.sorts['references'].dir * ((statusA > statusB) ? 1 : (statusA < statusB ? -1 : 0));  // dir is multiplied by 1, -1 or 0
    }

    const sortByTemplate = (a, b) => {

        const nameA = a.reference_info?.templates?.length ? a.reference_info.templates[0] : ''
        const nameB = b.reference_info?.templates?.length ? b.reference_info.templates[0] : ''

        // respect sortDir
        if (nameA < nameB) return sort.sorts['templates'].dir * -1;
        if (nameA > nameB) return sort.sorts['templates'].dir;
        return 0;
    }

    const sortByActionable = (a, b) => {

        const actionA = a.actionable?.length ? a.actionable[0] : ''
        const actionB = b.actionable?.length ? b.actionable[0] : ''

        // respect sortDir
        if (actionA < actionB) return sort.sorts['actionable'].dir * -1;
        if (actionA > actionB) return sort.sorts['actionable'].dir;
        return 0;
    }

    const sortByPerennial = (a, b) => {

        const nameA = a.rsp?.length ? a.rsp[0] : ''
        const nameB = b.rsp?.length ? b.rsp[0] : ''

        // respect sortDir
        if (nameA < nameB) return sort.sorts['perennial'].dir * -1;
        if (nameA > nameB) return sort.sorts['perennial'].dir;
        return 0;
    }

    const sortBySection = (a, b) => {

        const sectionA = a.reference_info?.sections?.length ? a.reference_info.sections[0] : ''
        const sectionB = b.reference_info?.sections?.length ? b.reference_info.sections[0] : ''

        // respect sortDir
        if (sectionA < sectionB) return sort.sorts['sections'].dir * -1;
        if (sectionA > sectionB) return sort.sorts['sections'].dir;
        return 0;
    }


    const sortByProbes = (a, b) => {
        return 0  // for now...
    }


                // const sortBySignals = (a, b) => {
                //     const signalA = a?.signal_data?.error ? 0 : 1;
                //     const signalB = b?.signal_data?.error ? 0 : 1;
                //
                //     if (signalA > signalB) return sortDefs.sorts['signalValues'].dir * -1;
                //     if (signalA < signalB) return sortDefs.sorts['signalValues'].dir;
                //     return 0;
                // }


    const sortByWikiSignalsScore = (a, b) => {
        // const signalA = a?.signal_data?.signals?.meta?.ws_score ?? 0;
        // const signalB = b?.signal_data?.signals?.meta?.ws_score ?? 0;
        const signalA = a?.signal_data?.signals?.meta
            ? a?.signal_data?.signals?.meta?.ws_score ?? 0
            : -1
        const signalB = b?.signal_data?.signals?.meta
            ? b?.signal_data?.signals?.meta?.ws_score ?? 0
            : -1

        if (signalA > signalB) return sort.sorts['signals_score'].dir * -1;
        if (signalA < signalB) return sort.sorts['signals_score'].dir;
        return 0;
    }
    
    
    const sortFunctions = {
        name: sortByName,
        status: sortByStatus,
        references: sortByReference,
        actionable: sortByActionable,
        archive_status: sortByArchiveStatus,

                    // signals: sortBySignals,
        signals_score: sortByWikiSignalsScore,

        // not really used
        templates: sortByTemplate,
        sections: sortBySection,

        // deprecated
        perennial: sortByPerennial,
        probes: sortByProbes,

    }

    const sortFunction = (a, b) => {
        // TODO make sorting respect a list sort definitions as described in a
        //  "sort.sortOrder" array of key names for sort methods.
        //  "e.g: sort.sortOrder = ["references", "archive_status", "name"]

        const sort_column = sort.sortOrder[0];
        const sortFn = sortFunctions[sort_column];
        return sortFn ? sortFn(a, b) : 0;

    }


    const onClickFlockRow = (e) => {
        // get the url data from the row associated with the clicked element
        // TODO fix this to use dataset property
        // const url = e.target.closest('.url-row').getAttribute('data-url');
        const el = e.target.closest('.url-row')
        const url = el?.dataset.url

        // if click on Probe badge, do not popup refView
        if (e.target.classList.contains("probe-badge")) {
            e.stopPropagation()
            return
        }

        // send action back up the component tree to co-filter the references list
        onAction({
            "action": ACTIONS_IARE.SHOW_REFERENCE_VIEWER_FOR_URL.key,
            "value": url,
        })
    }

    const onClickHeaderRow = (e) => {
    }


    const onClickSignalData = (e) => {
        // triggered when Signal column in url row is clicked.

        console.log("Signal column clicked")

        e.stopPropagation()  // stops row click from engaging

        const targetElement = e.target

        const urlElement = targetElement.closest('.url-row')
        const urlLink = urlElement.dataset.url
        const urlObj = urlDict[urlLink]

        // const rawSignalData = <pre>{JSON.stringify(urlObj.signal_data, null, 2)}</pre>
        const rawSignalData = urlObj.signal_data

        setSignalDetailsPopupTitle(<SignalDataDetailsTitle urlLink={urlLink}/>)

        setSignalDetailsPopupContents(<SignalDataDetails
            urlLink={urlLink}
            rawSignalData={rawSignalData}
            tooltipId={tooltipId}
        />)

        setIsSignalDetailsPopupOpen(true)

    }

    const onClickSignalDetail = (e) => {
        // triggered when a single Signal is clicked.

        console.log("Signal clicked")

        e.stopPropagation()  // stops row click from engaging

        alert("Will implement this later - will show details for one Signal value here.")
    }


    const onHoverUrlFlock = (e) => {
        // clears tooltip html...only if no other sub-elements got there first
        setUrlTooltipHtml('')
    }

    const onHoverFlockRow = e => {
        // handle hover for header, data row, or other

        e.stopPropagation()  // prevents onHover from engaging and erasing tooltip

        // for header row...
        let rowEl = e.target.closest('.url-row-header')
        if (rowEl) {
            const el = e.target.closest('.flock-col')
            const firstClassName = el?.classList[0];  // handles potential null and extract the first class name
            const html = urlColumnDefs.columns[firstClassName]?.ttCaption;
            console.log(`UrlFlock onHoverAllRows: in url-row-header firstClassName: ${firstClassName}`)
            setUrlTooltipHtml(html)
            return
        }

        // for error row...
        rowEl = e.target.closest('.url-row-error')
        if (rowEl) {
            const html = rowEl.currentTarget.getAttribute('data-err-text');
            setUrlTooltipHtml(html)
            return
        }

        // for data row...
        rowEl = e.target.closest('.url-row')
        if (rowEl) {
            const columnClass = e.target.closest('.url-row > *').classList[0]  // get first class in list to get column type
            const row = e.target.closest('.url-row')
            const html = getTooltipForColumn(row, columnClass)
            console.log(`UrlFlock onHoverAllRows: in url-row; class = ${columnClass}`)
            setUrlTooltipHtml(html)
            return
        }

        setUrlTooltipHtml(null);

    }


    const getTooltipForColumn = (rowEl, columnClass) => {

        const d = rowEl.dataset
        
        if (columnClass === "url-live_status") {
            const statusDescription = httpStatusCodes[d.status_code]
            return `<div>Live Status:<br/>${d.status_code} :${statusDescription}</div>`
        }

        if (columnClass === "url-archive_status") {
            if (d.is_book === "true") {
                return `<div>Book</div>`
            }
            // TODO should
            return d.live_state
                ? `<div>${d.archive_status === "true" 
                    ? 'Archived' 
                    : 'Not Archived'}` +
                `<br/>` +
                `IABot live_state: ${d.live_state} - ${iabotLiveStatusCodes[d.live_state]}</div>`

                : `Archive status = ${d.archive_status}<br/>IABot live_state is undefined`
        }

        if (columnClass === "url-citations") {
            return d.citation_status && d.citation_status !== '--'
                ? `<div>Link Status ${'"' + d.citation_status + '"'} as indicated in Citation</div>`
                : `<div>No Link Status defined in Citation</div>`

        }

        if (columnClass === "url-actionable" || columnClass === "yes-actionable") {
            const actionableKey = d.actionable
            const desc = ACTIONABLE_FILTER_MAP[actionableKey]?.desc
            return desc
                ? `<div>Actionable Item:<br/>${desc}<br/>Click to fix.</div>`
                : ""

        }

        if (columnClass === "url-signals") {
            return null
            // return `<div>${urlColumnDefs.columns[columnClass]?.ttCaption}Click to see details</div>`

        }

        // if not a special case column, show tooltip from column definition
        return urlColumnDefs.columns[columnClass]?.ttCaption
    }
                //
                // const onHoverErrorRow = e => {
                //     // sets tooltip to error text of row
                //     const text = e.currentTarget.getAttribute('data-err-text');
                //     // console.log("handleRowHover", text)
                //     setUrlTooltipHtml(text)
                // }

    const getDataRows = (flockArray, flockFilters, columnsToShow) => {
        // TODO implement columnsToShow (ignoring for now)

        // returns [flockRow markup, array of filtered urls]
        if (!flockArray || flockArray.length === 0) {
            return [<h4>No URLs to show</h4>, []]
        }

        if (!flockFilters) flockFilters = {}  // prevent null errors
        // TODO what to do if flockFilters is not an object of keyed FlockFilter's?
        //  Can we make flockFilters a custom type, such as FlockFilters?


        // filter the urls according to the set of filters provided
        // NB Currently only 1 filter is supported; in the future we may support more

        let filteredUrls = flockArray  // initialize url array as the full provided array

        Object.keys(flockFilters).forEach(filterName => {
            const f = flockFilters[filterName]
            if (f) {  // only process if filter is non-null

                if (Array.isArray(f.filterFunction)) {  // f is an array of filters
                    // interpret f.filterFunction as an array of filters,
                    //    and apply all filters one at a time
                    // TODO turn this into an effective recursive loop
                    f.filterFunction.forEach(oneFilter => {
                        if (oneFilter.filterFunction) {
                            filteredUrls = filteredUrls.filter((oneFilter.filterFunction)())
                        }  // NB: Note self-calling function
                    })

                } else {  // f is one filter
                    if (f.filterFunction) {
                        filteredUrls = filteredUrls.filter((f.filterFunction)())
                    }  // NB: Note self-calling function
                }
            }
        })

        // sort filteredUrls if specified
        if (sort.sortOrder?.length > 0) {
            console.log(`sorting urls by: ${sort.sortOrder[0]}`)
            filteredUrls.sort(sortFunction)  // sorts by "sort" object state
        }

        const getActionableInfo = (u => {
            return !u.actionable
                ? null
                : u.actionable.map((key, i) => {
                    return <div className={"yes-actionable"} key={i}>
                        <span className={"icon-area"}></span>
                    </div>
                })
        })

        // eslint-disable-next-line no-unused-vars
        const getCitationInfo = (u => {
            // NB This needs to be more clearly defined
            // for now, returns array of statuses from url's associated references
            return !u.reference_info?.statuses
                ? null
                : u.reference_info.statuses.map((s, i) => {
                    const display = s === "--"  // this is what PageData set status to if not there - TODO do this better!
                        ? ""
                        : s.charAt(0).toUpperCase() + s.slice(1)
                    return <div key={i}>{display}</div>
                })
        })

        // eslint-disable-next-line no-unused-vars
        const getTemplateInfo = (u => {
            return !u.reference_info?.templates
                ? null
                : u.reference_info.templates.map((s, i) => {
                    return <div key={i}>{s}</div>
                })
        })


        // eslint-disable-next-line no-unused-vars
        const getSectionInfo = (u => {
            // display array of section names
            return !u.reference_info?.sections
                ? null
                : u.reference_info.sections.map((s, i) => {
                    s = (s === 'root' ? 'Lead' : s)  // transform "root" section to "Lead"
                    // TODO: should transform s earlier...
                    return <div key={i}>{s}</div>
                })
        })

        // eslint-disable-next-line no-unused-vars
        const getPerennialInfo = (u => {
            return !u.rsp
                ? null
                // rsp contains keys into reliabilityMap
                : u.rsp.map((s, i) => {
                    return <div key={i} className={reliabilityMap[s]?.key === "__unassigned" ? "lolite" : ""}>{
                        reliabilityMap[s]?.shortCaption ? reliabilityMap[s].shortCaption : ''
                    }</div>
                })
        })

        const getDataRow = (u, i) => {

            const classes = 'url-row '
                + (u.status_code === 0 ? ' url-is-unknown'
                    : u.status_code >= 300 && u.status_code < 400 ? ' url-is-redirect'
                        : u.status_code >= 400 && u.status_code < 500 ? ' url-is-notfound'
                            : u.status_code >= 500 && u.status_code < 600 ? ' url-is-error'
                                : '')
                + (u.url === selectedUrl ? ' url-selected' : '')
                + (u.rsp ? ` url-rating-${u.rsp[0]}` : '')  // TODO deprecated?

            const citationStatus = !u.reference_info?.statuses?.length
                // TODO rethink this column - could have a JSON array version
                ? null
                : u.reference_info.statuses[0]  // just return first one

            return <div className={classes} key={i}

                        data-url={u.url}
                        data-actionable={u.actionable ? u.actionable[0] : null}  // return first actionable only (for now)

                        data-status_code={u.status_code}
                        data-archive_status={u.archive_status?.hasArchive}
                        data-live_state={u.archive_status?.live_state}

                        data-is_book={u.isBook}
                        data-citation_status={citationStatus}
            >

                <div className={"url-name"}>{u.url}</div>
                <div className={"url-live_status"}>{u.status_code ? u.status_code : "?"}</div>
                <div className={"url-archive_status"}>{getArchiveStatusInfo(u)}</div>
                <div className={"url-actionable"}>{getActionableInfo(u)}</div>

                {columnsToShow.signals.show ?
                    <div className={"url-signals"} onClick={onClickSignalData}>
                        <SignalDisplay
                            urlObj={u}
                            onSignalClick={onClickSignalDetail}
                            badgeContext={badgeContext.INLINE}
                        />
                    </div>

                    : null
                }

            </div>

        }

        const getErrorRow = (u, i, errText) => {
            return <div className={`url-row url-row-error`} key={i}
                        data-url={u.url}
                        data-err-text={errText}
                        // onMouseOver={onHoverErrorRow}
                        onMouseLeave={() => setUrlTooltipHtml('')}
            >
                <div className={"url-name"}>{u.url ? u.url : `ERROR: No url for index ${i}`}</div>
                <div className={"url-live_status"}>{-1}</div>
                <div className={"url-archive_status"}>?</div>
                <div className={"url-actionable"}>&nbsp;</div>
                <div className={"url-signals"}>&nbsp;</div>

            </div>
        }


        // iterate over array of url objects to create rendered output
        const flockRows = filteredUrls.map((u, i) => {

            // TODO: we should sanitize earlier on in the process to save time here...

            // if url object is problematic, return as error row
            if (!u || u.url === undefined || u.status_code === undefined) {

                const errText = !u ? `URL data not defined for index ${i}`
                    : !u.url ? `URL missing for index ${i}`
                        : u.status_code === undefined ? `URL status code undefined (try Force Refresh)`
                            : 'Unknown error'  // this last case should not happen

                // TODO do something akin to "myMethodRenderer.getErrorRow"
                return getErrorRow(u, i, errText)
            }

            // otherwise show "normal" data row
            // TODO change this to something like:
            //  return myCheckMethod.renderRow(u)

            return getDataRow(u, i)

        })

        return [flockRows, filteredUrls]  // flockRows is markup, filteredUrls

    }  // end getFlockRows


    const getHeaderRow = (columns) => {
        return <div
            className={"url-row-header flock-row-header"}
            // onClick={onClickHeaderRow}
        >

            <div className={"url-name flock-col"} onClick={() => {
                updateFlockSort("name")
            }}
            ><br/>URL Link
            </div>

            <div className={"url-live_status flock-col"} onClick={() => {
                updateFlockSort("status")
            }}
            >Live<br/>Status
            </div>

            <div className={"url-archive_status flock-col"} onClick={() => {
                updateFlockSort("archive_status");
            }}
            >{archiveFilterDefs['iabot']._.name}</div>

            <div className={"url-actionable flock-col"} onClick={() => {
                updateFlockSort("actionable");
            }}
            >Action<br/>Items
            </div>

            {columns.signals?.show ?
                <div className={"url-signals flock-col"} onClick={(e) => {
                    // don't use default sort click, as Signal-type clicks do something special
                    onSignalHeaderClick(e)
                }}
                >
                    <div className={"wiki-signals-docs flock-col"}>WikiSignals ℹ️
                        <span className={"info-icon descriptor-text"}> (Click to show information) </span>
                    </div>
                    <div className={"wiki-signals-sort flock-col"}>WikiSignal Sort <span className={"descriptor-text"}>(Click to sort)</span>
                    </div>
                </div>

                : null
            }

        </div>

    }

    // fades in feedback text and then fades it out
    React.useEffect(() => {
        // this is an attempt to show feedback text for a short time before disappearing
        if (feedbackText) {

            const displayTimer = setTimeout(() => {
                setFeedbackText('');
            }, 6000);

            // const displayTimer = setTimeout(() => {
            //     setFeedbackFadeout(true)
            //     setTimeout(() => {
            //         setFeedbackText('');
            //     }, 5000)
            // }, 3000);

            // const clearTimer = setTimeout(() => {
            //     clearTimeout(displayTimer);
            // }, 5000);

            return () => {
                clearTimeout(displayTimer);
                // clearTimeout(clearTimer);
            };
        }
    }, [feedbackText]);


    // flockDataRows is markup for all rows and flockArray is array of url's used for that markup
    const [flockDataRows, flockArray] = getDataRows(urlArray, urlFilters, columnsToShow);
    const flockHeaderRow = getHeaderRow(columnsToShow)
    const flockAllRows = [flockHeaderRow, ...flockDataRows]
    const flock = <div
        className={"flock-rows url-rows"}
        onClick={onClickFlockRow}
        onMouseOver={onHoverFlockRow}
    >{flockAllRows}</div>


    // NB TODO retool to be in an IARE tools module: copyUrlDetails( urlArray )
    const handleCopyUrlDetails = () => {

        const urlArrayData = [...flockArray].sort(   // NB "..." used so that copy of array is sorted, not original flock array
            (a, b) => (a.url > b.url) ? 1 : (a.url < b.url) ? -1 : 0  // sort by url

        ).map(u => {  // get one row per line:
            return [
                u.url,
                u.status_code,
                u.archive_status?.hasArchive,
                u.reference_info?.templates ? u.reference_info?.templates.join(",") : null,
                u.status_code_errors?.reason ? u.status_code_errors.reason : null,
                u.status_code_errors?.message ? u.status_code_errors.message : null,
            ]
            // TODO output archive status and maybe iabot live stuff
        })

        const numItems = urlArrayData.length

        // add column labels
        urlArrayData.unshift([
            'URL',
            `${fetchMethod} status`,
            `Has Archive`,
            `Templates`,
            `Error reason`,
            `Error message`
        ])

        copyToClipboard(convertToCSV(urlArrayData), `${numItems} URL Data Rows`, handleFeedback)

    }

    const handleFeedback = (feedback) => {
        setFeedbackText(feedback)
    }

    const handleCopyUrlList = () => {

        const urlArrayData = [...flockArray].sort(   // NB used "..." so that copy of array is sorted, not original flock array
            (a, b) => (a.url > b.url) ? 1 : (a.url < b.url) ? -1 : 0  // sort by url

        ).map(u => {  // get one row per line:
            return u.url
        })

        copyToClipboard(urlArrayData.join("\n"), `${urlArrayData.length} URLs`, handleFeedback)

    }

    const buttonCopyList =
        <button onClick={handleCopyUrlList} className={'btn utility-button small-button'}><span>Copy URL List</span>
        </button>
    const buttonCopyDetails =
        <button onClick={handleCopyUrlDetails} className={'btn utility-button small-button'}>
            <span>Copy URL Details</span></button>
    const spanFeedback =
        <div className={`feedback-div ${feedbackText ? 'feedback-fade-text' : ''}`}>
            {feedbackText && <span>{feedbackText}</span>}
        </div>

    const flockCaption =
        <>
            <div>URL Links</div>
            <div className={"sub-caption"}>
                <div>{flockAllRows.length} {flockAllRows.length === 1 ? 'URL' : 'URLs'}</div>
                <div>{spanFeedback} {buttonCopyList} {buttonCopyDetails}</div>
            </div>
        </>

    // TODO implement tooltip id somehow
    return <>

        <div data-tooltip-id={tooltipId}  // passed in tooltipId for this flock)
             data-tooltip-html={urlTooltipHtml}
        >
            <FlockBox caption={flockCaption} className={"url-flock"}>{flock}</FlockBox>
        </div>

        <Popup isOpen={isSignalsDocsPopupOpen}
               onClose={() => {
                   setIsSignalsDocsPopupOpen(false)
               }}
               title={"What is WikiSignals?"}
               className={"wiki-signals-docs-popup"}
               initialSize={{width: 684, height: 441}}
               initialPosition={{x: 420, y: 160}}
        >
            <SignalsDocs/>
        </Popup>

        {/* popup title, data and open status set in handleSignalClick function */}
        <Popup isOpen={isSignalDetailsPopupOpen}
               onClose={() => {
                   setIsSignalDetailsPopupOpen(false)
               }}
               title={signalDetailsPopupTitle}
               initialSize={{width: 800, height: 780}}
               initialPosition={{x: 160, y: 50}}
        >
            {signalDetailsPopupContents}
        </Popup>

        <Popup isOpen={isSignalsSortPopupOpen}
               onClose={() => {
                   setIsSignalsSortPopupOpen(false)
               }}
               title={"WikiSignals Sort"}
               initialSize={{width: 600, height: 300}}
               initialPosition={{x: 600, y: 160}}
        >
            <SignalsSort onSort={updateFlockSort}/>
        </Popup>

    </>
})

export default urlFlock
