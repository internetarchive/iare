import React, {useCallback, useState} from 'react';
import FlockBox from "../../FlockBox.jsx";

import {convertToCSV, copyToClipboard} from "../../../utils/generalUtils.js";
import {getArchiveStatusInfoGrok} from "../../../utils/urlUtils.jsx";

import {ACTIONABLE_FILTER_MAP} from "../../../constants/actionableMap.jsx";
import {ARCHIVE_STATUS_FILTER_MAP as archiveFilterDefs} from "../../../constants/urlFilterMaps.jsx";
import {httpStatusCodes, iabotLiveStatusCodes} from "../../../constants/httpStatusCodes.jsx"
import {urlColumnDefs} from "../../../constants/urlColumnDefs.jsx";
import Popup from "../../Popup.jsx";
import SignalDisplay from "../../SignalDisplay.jsx";
import SignalDataDetailsTitle from "../../SignalDataDetailsTitle.jsx";
import SignalDataDetails from "../../SignalDataDetails.jsx";

import '../../css/grok.css';
import Checkbox from "../../Checkbox.jsx";
import MakeLink from "../../MakeLink.jsx";
import SignalsSort from "../../SignalsSort.jsx";
import SignalsDocs from "../../SignalsDocs.jsx";


/*
assumes urlArray is an array of url objects:
    [
        {
            url : <url>,
            live_status : <status_code>,
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
const grokFlock = React.memo(function GrokFlock({
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

    // TODO how do we make the Signal Popup a global, like a tooltip, sort of?
    const [isSignalPopupOpen, setIsSignalPopupOpen] = useState(false)
    const [signalPopupTitle, setSignalPopupTitle] = useState(<>Modal Title</>);
    const [signalPopupContents, setSignalPopupContents] = useState(null);

    const [isSignalsDocsPopupOpen, setIsSignalsDocsPopupOpen] = useState(false)
    const [isSignalsSortPopupOpen, setIsSignalsSortPopupOpen] = useState(false)

    const [showHotLinksDisplay, setShowHotLinksDisplay] = useState(true)
    const [useHotLinks, setUseHotLinks] = useState(false)

    const [feedbackText, setFeedbackText] = useState("")
    const [tooltipHtml, setTooltipHtml] = useState('<div>ToolTip<br />GrokFlock<br />second line');
    // TODO there is a bug where sort re-renders list every time tooltip text/html property is updated
    // TODO maybe fix using React.useRef somehow???

    const [sortDefs, setSortDefs] = useState({
        sorts: {  // holds sort value for all different sort types
            "none": {name: "none", dir: 0},
            "status": {name: "status", dir: 1},  // dir: 1 is asc, -1 is desc, 0 is do not sort
            "archive_status": {name: "archive_status", dir: -1},
            // "references": {name: "references", dir: -1},
            // "templates": {name: "templates", dir: -1},
            "actionable": {name: "actionable", dir: -1},
            // "sections": {name: "sections", dir: -1},
            // "perennial": {name: "perennial", dir: -1},
            "signals": {name: "signalValues", dir: -1},
        },
        sortOrder: ["status"]  // array indicating which sorts get applied and in what order. NB this is not implemented yet, but will be
    })

    // NB this is experimental - want to eventually control wgich columns are shown and not shown
    const flockColumns = {
        "status": {
            show: true,
            caption: <>Live<br/>Status</>
        },
        "reliability": { show: true }
    }

    // when Signal elements in Signal Results column are clicked
    const handleSignalClick = (e) => {
        // target element is Signal badge, "inside" of url row...

        e.stopPropagation()  // stops row click from engaging

        const targetElement = e.target

        const urlRow = targetElement.closest('.url-row')
        const urlLink = urlRow.dataset.url
        const urlObj = urlDict[urlLink]

        // const rawSignalData = <pre>{JSON.stringify(urlObj.signal_data, null, 2)}</pre>
        const rawSignalData = urlObj.signal_data
        const score = "TBD"

        setSignalPopupTitle(<SignalDataDetailsTitle urlLink={urlLink} />)
        setSignalPopupContents(<SignalDataDetails
            urlLink={urlLink}
            score={score}
            rawSignalData={rawSignalData}
        />)

        setIsSignalPopupOpen(true)

    }

    const updateFlockSort = (sortKey) => {
        // set new sort State:
        // - toggle sort direction of specified sort
        // - set new sort state with setSort

        // selectively change the specified sort type
        // https://stackoverflow.com/questions/43638938/updating-an-object-with-setstate-in-react
        setSortDefs(prevState => {
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

    const sortByNone = (a, b) => {
        const idxA = a?.idx ?? 0;
        const idxB = b?.idx ?? 0;
        return idxA - idxB;
    }

    const sortByName = (a, b) => {
        const nameA = a.url
        const nameB = b.url

        // respect sortDir
        if (nameA < nameB) return sortDefs.sorts['name'].dir * -1;
        if (nameA > nameB) return sortDefs.sorts['name'].dir;
        return 0;
    }

    const sortByLiveStatus = (a, b) => {
        const statusA = a && a.live_status !== undefined ? a.live_status : -1;
        const statusB = b && b.live_status !== undefined ? b.live_status : -1;

        // respect sort dir
        if (statusA < statusB) return sortDefs.sorts['status'].dir * -1;
        if (statusA > statusB) return sortDefs.sorts['status'].dir;
        return 0;
    }

    const sortByArchiveStatus = (a, b) => {
        const archiveA = a?.archive_data?.archive_exists ? 1 : 0;
        const archiveB = b?.archive_data?.archive_exists ? 1 : 0;
        const bookA = a?.isBook ? 1 : 0;
        const bookB = b?.isBook ? 1 : 0;

        // sort by book status first, respect sortDir
        // NB: ignoring book type (e.g. google or archive.org) for now
        if (bookA) return sortDefs.sorts['archive_status'].dir * -1
        if (bookB) return sortDefs.sorts['archive_status'].dir

        // if neither a or b is a book, sort by archive status, respect sortDir
        if (archiveA > archiveB) return sortDefs.sorts['archive_status'].dir * -1;
        if (archiveA < archiveB) return sortDefs.sorts['archive_status'].dir;
        return 0;
    }

    const sortBySignals = (a, b) => {
        const signalA = a?.signal_data?.error ? 0 : 1;
        const signalB = b?.signal_data?.error ? 0 : 1;

        if (signalA > signalB) return sortDefs.sorts['signals'].dir * -1;
        if (signalA < signalB) return sortDefs.sorts['signals'].dir;
        return 0;
    }

    const sortBySignalWayback = (a, b) => {
        // signal A is wayback value of
        const signalA = a?.signal_data?.error ? 0
            : a?.signal_data?.signalValues?.n_wayback_machine_snapshot ? a.signal_data.signalValues.n_wayback_machine_snapshot : 0
        const signalB = a?.signal_data?.error ? 0
            : b?.signal_data?.signalValues?.n_wayback_machine_snapshot ? b.signal_data.signalValues.n_wayback_machine_snapshot : 0

        if (signalA > signalB) return sortDefs.sorts['signal_wayback'].dir * -1;
        if (signalA < signalB) return sortDefs.sorts['signal_wayback'].dir;
        return 0;
    }

    const sortBySignalWiki = (a, b) => {
        const signalA = a?.signal_data?.error ? 0
            : a?.signal_data?.signalValues?.en_wikipedia_external_link_count ? a.signal_data.signalValues.en_wikipedia_external_link_count : 0
        const signalB = a?.signal_data?.error ? 0
            : b?.signal_data?.signalValues?.en_wikipedia_external_link_count ? b.signal_data.signalValues.en_wikipedia_external_link_count : 0

        if (signalA > signalB) return sortDefs.sorts['signal_wiki'].dir * -1;
        if (signalA < signalB) return sortDefs.sorts['signal_wiki'].dir;
        return 0;
    }

    const sortByActionable = (a, b) => {

        const actionA = a.actionable?.length ? a.actionable[0] : ''
        const actionB = b.actionable?.length ? b.actionable[0] : ''

        // respect sortDir
        if (actionA < actionB) return sortDefs.sorts['actionable'].dir * -1;
        if (actionA > actionB) return sortDefs.sorts['actionable'].dir;
        return 0;
    }

    const sortFunctions = {
        "none": sortByNone,
        "name": sortByName,
        "status": sortByLiveStatus,
        "archive_status": sortByArchiveStatus,
        "actionable": sortByActionable,
        "signals": sortBySignals,
        "signal_wayback": sortBySignalWayback,
        "signal_wiki": sortBySignalWiki,
    }

    const sortFunction = (a, b) => {
        // returns sort function based on current value of sortDefs

        // TODO make sorting respect a list sort definitions as described in a
        //  "sort.sortOrder" array of key names for sort methods.
        //  "e.g: sort.sortOrder = ["references", "archive_status", "name"]

        const sort_column = sortDefs.sortOrder[0];  // just sort one column for now, i.e., no cascading sorts
        const sortFn = sortFunctions[sort_column];
        return sortFn ? sortFn(a, b) : 0;

    }

    const handleRowClick = (e) => {
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

        console.log(`Row clicked for URL: ${url}`)

        // do nothing for now...
        
        // // send action back up the component tree to co-filter the references list
        // onAction({
        //     "action": ACTIONS_IARE.SHOW_MESSAGE.key,
        //     "value": `Row clicked for URL: ${url}`,
        // })
    }

    const onSignalHeaderClick = (e) => {

        e.stopPropagation()

        console.log(`onClickHeaderSignal: e.target.className = ${e.target.className}`)

        setIsSignalsDocsPopupOpen(true)
        // alert("Signal Header column clicked")
    }

    const onHoverFlock = (e) => {
        // clears tooltip html...only if no other sub-elements got there first
        setTooltipHtml('')
        console.log(`GrokFlock onHoverFlock: ${e.type}`)
    }

    const onHoverHeaderRow = useCallback((e) => {  // useCallback prevents re-render upon hover???
        e.stopPropagation()  // prevents default onHover of GrokFlock from engaging and erasing tooltip
        // const html = urlColumnDefs.columns[e.target.className]?.ttCaption

        const col = e.target.classList.contains('flock-col')
            ? e.target
            : e.target.closest('.flock-col')
        let html = ""
        if (col) {
            const colClassName = col.className.replace('flock-col ', '')  // extract out generic 'flock-col'
            html = (colClassName === "url-signalValues")
                ? "Click to sort by Signals"  // special case signalValues
                : colClassName  // default use class name of column
        }
        console.log(`GrokFlock onHoverHeaderRow: ${html}`)
        setTooltipHtml(html)
    }, [])

    const onHoverDataRow = e => {
        // show tool tip for targeted column of hovered row

        e.stopPropagation()  // stop higher up elements from changing tooltip

        const row = e.target.closest('.url-row')

        // get the class name of the column we are in...this is
        // a little tricky because of possible sub elements
        const columnClass = e.target.parentElement.classList.contains('url-row')
            ? e.target.className
            : (e.target.parentElement.classList.contains("probe-results")
                ? "url-probes"
                : e.target.parentElement.className)

        let html = ''

        console.log(`GrokFlock onHover: columnClass = ${columnClass}`)

        if (columnClass === "url-live_status") {
            const statusDescription = httpStatusCodes[row.dataset.live_status]
            html = `<div>${row.dataset.live_status} : ${statusDescription}</div>`

        } else if (columnClass === "url-archive_status") {
            html = row.dataset.live_state
                ? `<div>${row.dataset.archive_status === "true" ? 'Archived' : 'Not Archived'}` +
                `<br/>` +
                `IABot live_state: ${row.dataset.live_state} - ${iabotLiveStatusCodes[row.dataset.live_state]}</div>`
                : `IABot archive_status = ${row.dataset.archive_status}<br/>IABot live_state = ${row.dataset.live_state}`

        } else if (columnClass === "url-citations") {
            html = row.dataset.citation_status && row.dataset.citation_status !== '--'
                ? `<div>Link Status ${'"' + row.dataset.citation_status + '"'} as indicated in Citation</div>`
                : `<div>No Link Status defined in Citation</div>`

        } else if (columnClass === "url-actionable" || columnClass === "yes-actionable") {
            const actionableKey = row.dataset.actionable
            const desc = ACTIONABLE_FILTER_MAP[actionableKey]?.desc
            html = desc
                ? `<div>${desc}</div>`
                : ""

        } else if (columnClass === "url-probes") {
            if (e.target.classList.contains("probe-badge")) {
                const probeKey = e.target.dataset.probeKey
                const probeScore = e.target.dataset.probeScore
                html = probeScore === "error"
                    ? "Error with probe data"
                    : probeScore === "nodata"
                        ? "No probe data for this URL"
                        :`<div>${probeKey} score is ${probeScore}</div>`
            }

        } else {
            // if not a special case column, show tooltip from column definition
            html = urlColumnDefs.columns[columnClass]?.ttData
        }

        setTooltipHtml(html)
    }

    const onHoverErrorRow = e => {
        // sets tooltip to error text of row
        const text = e.currentTarget.getAttribute('data-err-text');
        // console.log("handleRowHover", text)
        setTooltipHtml(text)
    }

    const getHeaderRow = () => {

        // TODO: do the columns more like this
        //  NB: problem is when caption is a function
        // const headerColumns = [
        //     "name", "status", "archive_status", "actionable", "signalValues",
        // ]
        //
        // const headerColumnDefs = {
        //     "name": {
        //         "caption": "Reference URL Link",
        //         ""
        //     },
        //     "status": {
        //         "caption": "Live Status",
        //         "ttData": "Live Status",
        //     },
        //     "archive_status": {
        //         "caption": "Archive Status",
        //     }
        //
        // }
        return <div
            className={"url-list-header"}
            // onClick={onClickHeaderRow}
            onMouseOver={onHoverHeaderRow}>

            {/*<div className={"url-header-row"}>*/}

                <div className={"flock-col url-name"} onClick={() => {
                    updateFlockSort("name")
                }}
                ><br/>Reference URL Link
                </div>

                <div className={"flock-col url-live_status"} onClick={() => {
                    updateFlockSort("status")
                }}
                >Live<br/>Status
                </div>

                <div className={"flock-col url-archive_status"} onClick={() => {
                    updateFlockSort("archive_status");
                }}
                >{archiveFilterDefs['iabot']._.name}</div>  {/* huh? whats this? very obscure! */}

                <div className={"flock-col url-actionable"} onClick={() => {
                    updateFlockSort("actionable");
                }}
                >Action<br/>Items
                </div>

                <div className={"flock-col url-signals"} onClick={(e) => {
                    // skip sort click, as Signal will do something different

                    // handleSortClick("signalValues");
                    onSignalHeaderClick(e)
                }}
                >
                    <div className={"wiki-signals-docs"}>WikiSignals Data</div>
                    <div className={"wiki-signals-sort descriptor-text"}>Click to sort</div>
                </div>

            {/*</div>*/}

        </div>
    }

    const getDataRows = (flockArray, flockFilters) => {
        // returns [flockRow markup, array of filtered urls, filter caption]

        if (!flockArray || flockArray.length === 0) {
            return [<h4>No URLs to show.<br/><span style={{color:"red"}}>(Grok has changed format - will fix ASAP)</span></h4>, []]
        }

        if (!flockFilters) flockFilters = {}  // prevent null errors

        // filter the urls according to the set of filters provided
        // NB Currently only 1 filter is supported at a time; in the future we may support more

        let filteredUrls = flockArray  // initialize url array as the full provided array
        let filterCaption = ""
        
        Object.keys(flockFilters).forEach(filterName => {
            const f = flockFilters[filterName]
            if (f) {  // only process if filter is non-null

                if (Array.isArray(f.filterFunction)) {  // f is an array of filters
                    // interpret f.filterFunction as an array of filters,
                    //    and apply all filters one at a time
                    // TODO turn this into some kind of effective recursive loop
                    f.filterFunction.forEach((oneFilter, i) => {
                        if (oneFilter.filterFunction) {
                            filteredUrls = filteredUrls.filter((oneFilter.filterFunction)())
                            filterCaption += (i > 0 ? " AND " : "" ) + oneFilter.caption
                        }  // NB: Note self-calling function
                    })

                } else {  // f is one filter
                    if (f.filterFunction) {
                        filteredUrls = filteredUrls.filter((f.filterFunction)())
                        filterCaption = f.caption
                    }  // NB: Note self-calling function
                }
            }
        })

        // sort filteredUrls if specified
        if (sortDefs.sortOrder?.length > 0) {
            console.log(`sorting urls by: ${sortDefs.sortOrder[0]}`)
            filteredUrls.sort(sortFunction)  // sorts according to "sort" object state
        }

        const getActionableInfo = (u => {
            return !u.actionable
                ? null
                : u.actionable.map((key, i) => {
                    // return <div className={"yes-actionable"} key={i}>
                    //     <span className={"icon-area"}></span>{ACTIONABLE_FILTER_MAP[key].short_caption}</div>
                    return <div className={"yes-actionable"} key={i}>
                        <span className={"icon-area"}></span>
                    </div>
                })
        })

        const getDataRow = (u, i, classes) => {

            const citationStatus = !u.reference_info?.statuses?.length
                // TODO rethink this column - could have a JSON array version
                ? null
                : u.reference_info.statuses[0]  // just return first one

            const url = useHotLinks
                ? <MakeLink href={u.url}/>
                : <>{u.url}<MakeLink href={u.url} linkText={<span className={"cite-ref-jump-link"}></span>}/></>

            return <div className={classes} key={i}
                        data-url={u.url}
                        data-live_status={u.live_status}
                        data-archive_status={u.archive_status?.hasArchive}

                        data-is_book={u.isBook}
                        data-citation_status={citationStatus}
                        data-live_state={u.archive_status?.live_state}
                        data-actionable={u.actionable ? u.actionable[0] : null}  // return first actionable only (for now)
            >
                <div className={"flock-col url-name"}>{url}</div>
                <div className={"flock-col url-live_status"}>{u.live_status ? u.live_status : "?"}</div>
                <div className={"flock-col url-archive_status"}>{getArchiveStatusInfoGrok(u)}</div>

                <div className={"flock-col url-actionable"}>{getActionableInfo(u)}</div>

                {/* idea: use UrlDataCol component when columns become dynamically described (in the future) */}
                {/* <UrlDataCol urlObj={u} column_name={"probes"} options={{onProbeClick: handleProbeClick}}/> */}

                <div className={"flock-col url-signals"}>
                    <SignalDisplay urlObj={u} onSignalClick={handleSignalClick} />
                </div>

            </div>

        }

        const getErrorRow = (u, i, errText) => {
            return <div className={`url-row url-row-error`} key={i}
                        data-url={u.url}
                        data-err-text={errText}
                // onMouseOverCapture={handleRowHover}>
                        onMouseOver={onHoverErrorRow}
                        onMouseLeave={() => setTooltipHtml('')}
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
            if (!u || u.url === undefined) {

                const errText = !u ? `URL data not defined for index ${i}`
                    : !u.url ? `URL missing for index ${i}`
                        : u.live_status === undefined ? `URL live status undefined (try Force Refresh)`
                            : 'Unknown error'; // this last case should not happen

                // TODO do something akin to "myMethodRenderer.getErrorRow"
                return getErrorRow(u, i, errText)
            }

            // otherwise show "normally"
            // TODO change this to something like:
            //  return myCheckMethod.renderRow(u)
            const classes = 'url-row '
                + (u.live_status === 0 ? ' url-is-unknown'
                    : u.live_status >= 300 && u.live_status < 400 ? ' url-is-redirect'
                        : u.live_status >= 400 && u.live_status < 500 ? ' url-is-notfound'
                            : u.live_status >= 500 && u.live_status < 600 ? ' url-is-error'
                                : '')
                + (u.url === selectedUrl ? ' url-selected' : '')

            return getDataRow(u, i, classes)

        })

        return [flockRows, filteredUrls, filterCaption]

    }  // end getFlockRows

    const getFlock = (rows) => {

        const flockHeaderRow = getHeaderRow()

        return <>
            <div className={"url-table-scroll"}>

                {flockHeaderRow}
                <div className={"url-rows"}
                     onClick={handleRowClick}
                     onMouseOver={onHoverDataRow}
                >{rows}</div>

            </div>
        </>
    }  // end getFlock

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


    const [flockRows, flockArray, filterCaption] = getDataRows(urlArray, urlFilters)
    const flock = getFlock(flockRows)

    const handleCopyUrlDetails = () => {

        const urlArrayData = [...flockArray].sort(   // NB "..." used so that copy of array is sorted, not original flock array
            (a, b) => (a.url > b.url) ? 1 : (a.url < b.url) ? -1 : 0  // sort by url

        ).map(u => {  // get one row per line:
            return [
                u.url,
                u.live_status,
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

    const buttonCopyList = <button onClick={handleCopyUrlList} className={'btn utility-button small-button'}><span>Copy URL List</span>
    </button>
    const buttonCopyDetails = <button onClick={handleCopyUrlDetails} className={'btn utility-button small-button'}>
        <span>Copy URL Details</span></button>
    const spanFeedback = <div className={`feedback-div ${feedbackText ? 'feedback-fade-text' : ''}`}>
        {feedbackText && <span>{feedbackText}</span>}
    </div>

    const hotLinksDisplay = showHotLinksDisplay
        ? <Checkbox className={"chk-checkbox chk-show-hot-links"}
                    label={"Make URL links hot"}
                    value={useHotLinks}
                    onChange={() => setUseHotLinks(!useHotLinks)}/>
        : null

    const filterMessage = filterCaption
        ? <span> &mdash; Filter: {filterCaption}</span>
        : <span> &mdash; Showing All links</span>

    const captionBox = <>
        <div>Citation URL Links{hotLinksDisplay}</div>
        <div className={"sub-caption"}>
            <div>{flockRows.length} {flockRows.length === 1 ? 'URL' : 'URLs'}
                {filterMessage}
            </div>
            <div>{spanFeedback} {buttonCopyList} {buttonCopyDetails}</div>
        </div>
    </>

    return <>
        <div className="tooltip-container"
             data-tooltip-id={tooltipId}
             data-tooltip-html={tooltipHtml}
             data-tooltip-place="right"
             onMouseOver={onHoverFlock}>
            <FlockBox caption={captionBox} className={"grok-flock"}>{flock}</FlockBox>
        </div>

        <Popup isOpen={isSignalsDocsPopupOpen}
               onClose={() => {
                   setIsSignalsDocsPopupOpen(false)
               }}
               title={"WikiSignals Documentation?"}
               initialSize={{ width: 600, height: 300 }}
               initialPosition={{ x: 600, y: 160 }}
        >
            <SignalsDocs/>
        </Popup>

        <Popup isOpen={isSignalsSortPopupOpen}
               onClose={() => {
                   setIsSignalsSortPopupOpen(false)
               }}
               title={"WikiSignals Sort"}
               initialSize={{ width: 600, height: 300 }}
               initialPosition={{ x: 600, y: 160 }}
        >
            <SignalsSort onSort={updateFlockSort} />
        </Popup>

        <Popup isOpen={isSignalPopupOpen}
               onClose={() => { setIsSignalPopupOpen(false) }}
               title={signalPopupTitle}>
            {signalPopupContents}
        </Popup>

    </>
})

export default grokFlock
