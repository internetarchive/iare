import React, {useCallback, useState} from 'react';
import FlockBox from "../../FlockBox.jsx";
import "../../css/flock.css"

import {convertToCSV, copyToClipboard, iareAlert} from "../../../utils/generalUtils.js";
import {getUrlLiveStatusClass, getColumnTooltip} from "../../../utils/flockUtils.jsx";
import {getArchiveStatusInfo} from "../../../utils/urlUtils.jsx";
import {BadgeContexts as badgeContext, BadgeContexts} from "../../../constants/badgeContexts.jsx";

import {ACTIONS_IARE} from "../../../constants/actionsIare.jsx";
import {ARCHIVE_STATUS_FILTER_MAP as archiveFilterDefs} from "../../../constants/urlFilterMaps.jsx";

// import {urlColumnRegistry} from "../../../constants/urlColumnRegistry.jsx";
import signalBadgeRegistry, {signalBadgePrefix} from "../../../constants/badges/signalBadgeRegistry.jsx";

import Popup from "../../Popup.jsx";

import ColumnBox from "../../ColumnBox.jsx";

// import SignalDisplay from "../../SignalDisplay.jsx";
import SignalsDocs from "../../SignalsDocs.jsx";
import SignalBadges from "../../SignalBadges.jsx";

// context to provide global flag for sorting value
// TODO move this into main config context, i think??
import { ColumnSortContext } from "../../../contexts/ColumnSortContext.jsx"

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
                                                  options = {showRefs: true},
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

    const [feedbackText, setFeedbackText] = useState("")

    const [urlTooltipHtml, setUrlTooltipHtml] = useState('<div>ToolTip' +
        '<br>UrlFlock<br />second line');
    // TODO there is a bug where sort re-renders list every time tooltip text/html property is updated
    // TODO maybe fix using React.useRef somehow???

    /**
     * State for column sorting configuration.
     *
     * - sorts: An object that keeps track of the sort status for each column type (e.g., status, signal_score).
     *          Each key represents a column name, and its value is another object with the following properties:
     *              - name: Name of the sort key.
     *              - dir: Direction of sorting: 1 = ascending, -1 = descending, 0 = none.
     *
     *          Example:
     *          {
     *              "status": {name: "status", dir: 1},  // dir: 1 is ascending
     *              "signal_score": {name: "signal_score", dir: -1},  // dir: -1 is descending
     *          }
     *
     * - sortBy: An array indicating the order of sorts to be applied. For now, it supports only single-column sorting.
     *
     *          Example:
     *          ["status"]  // Only the 'status' column is sorted.
     */
    const [columnSort, setColumnSort] = useState({
        sorts: {},
        sortBy: []
            // NB for now, sort just respects first item in list
            // TODO fix this by implementing chained sorts
    })

    const monitoredSignals = [
        signalBadgeRegistry.score.key,
        signalBadgeRegistry.wayback.key,
        signalBadgeRegistry.enwiki.key,
        signalBadgeRegistry.mbfc.key,
        signalBadgeRegistry.tranco.key,
    ]

    const updateFlockSort = (sortKey) => {
        // set new sort State:
        // - toggle sort direction of specified sort
        // - set new sort state with setSort

        console.log(`updateFlockSort: sortKey = ${sortKey}`)

        // selectively change the specified sort type
        // https://stackoverflow.com/questions/43638938/updating-an-object-with-setstate-in-react
        setColumnSort(prevState => {

            // guarantee sorts object has new "sort" entry in it
            if (!(prevState.sorts[sortKey])) {
                prevState.sorts[sortKey] = {name: sortKey, dir: 0}
            }

            const prevDir = prevState.sorts[sortKey].dir
            const sortDir = ({ 1: -1, '-1': 0 }[prevDir] ?? 1); // 1=asc, -1=desc, 0=none
            // if 1 (asc), then next is -1 (desc)
            // if -1 (desc), then next is 0 (none)
            // if 0 (none), then next is 1 (asc)

            return {
                sorts: {
                    ...prevState.sorts,
                    // change just the sortKey specified
                    [sortKey]: {
                        ...prevState.sorts[sortKey],
                        // dir: -1 * prevState.sorts[sortKey].dir
                        dir: sortDir
                    }
                },

                sortBy: sortDir === 0 ? [] : [sortKey]  // sort by at most one column for now...
                // if sortDir is 0, remove all sorting
                // TODO implement so that sortBy contains an array of a list of sortKey's, not just one
            }
        })
    }

    const handleSignalBadgesClick = (e) => {
        e.stopPropagation()

        console.log(`handleSignalBadgesClick: e.target.className = ${e.target.className}`)

        let rowEl = e.target.closest('.flock-header')
        if (rowEl) {
            const el = e.target.closest('.signal-badge')
            const badgeKey = el.dataset.badgekey

            console.log(`Click on signal badge in header for ${badgeKey}`)
            iareAlert(`Click on signal badge in header for ${badgeKey}`)
            return

            // fetch sort key from data
            // updateFlockSort("signals_score")
        }

        // what else to do if clicked in non-header?
    }


    const sortByNative = (a, b) => {
        // sort by original index as it was received
        const indexA = a.index
        const indexB = b.index
        return indexA - indexB  // neg, 0, or pos
    }

    const sortByName = (a, b) => {
        // sort by url name in url column
        const nameA = a.url
        const nameB = b.url

        // respect sortDir
        if (nameA < nameB) return columnSort.sorts['name'].dir * -1;
        if (nameA > nameB) return columnSort.sorts['name'].dir;
        return 0;
    }

    const sortByStatus = (a, b) => {
        // sort by status column values
        const statusA = a && a.status_code !== undefined ? a.status_code : -1;
        const statusB = b && b.status_code !== undefined ? b.status_code : -1;

        // respect sort dir
        if (statusA < statusB) return columnSort.sorts['status'].dir * -1;
        if (statusA > statusB) return columnSort.sorts['status'].dir;
        return 0;
    }

    const sortByArchiveStatus = (a, b) => {
        const archiveA = a?.archive_status?.hasArchive ? 1 : 0;
        const archiveB = b?.archive_status?.hasArchive ? 1 : 0;
        const bookA = a?.isBook ? 1 : 0;
        const bookB = b?.isBook ? 1 : 0;

        // sort by book status first, respect sortDir
        // NB: ignoring book type (e.g. google or archive.org) for now
        if (bookA) return columnSort.sorts['archive_status'].dir * -1
        if (bookB) return columnSort.sorts['archive_status'].dir

        // if neither a or b is a book, sort by archive status, respect sortDir
        if (archiveA > archiveB) return columnSort.sorts['archive_status'].dir * -1;
        if (archiveA < archiveB) return columnSort.sorts['archive_status'].dir;
        return 0;
    }

    const sortByReference = (a, b) => {
        const statusA = a.reference_info?.statuses?.length ? a.reference_info.statuses[0] : ''
        const statusB = b.reference_info?.statuses?.length ? b.reference_info.statuses[0] : ''
        return columnSort.sorts['references'].dir * ((statusA > statusB) ? 1 : (statusA < statusB ? -1 : 0));  // dir is multiplied by 1, -1 or 0
    }

    const sortByTemplate = (a, b) => {

        const nameA = a.reference_info?.templates?.length ? a.reference_info.templates[0] : ''
        const nameB = b.reference_info?.templates?.length ? b.reference_info.templates[0] : ''

        // respect sortDir
        if (nameA < nameB) return columnSort.sorts['templates'].dir * -1;
        if (nameA > nameB) return columnSort.sorts['templates'].dir;
        return 0;
    }

    const sortByActionable = (a, b) => {

        const actionA = a.actionable?.length ? a.actionable[0] : ''
        const actionB = b.actionable?.length ? b.actionable[0] : ''

        // respect sortDir
        if (actionA < actionB) return columnSort.sorts['actionable'].dir * -1;
        if (actionA > actionB) return columnSort.sorts['actionable'].dir;
        return 0;
    }

    const sortByPerennial = (a, b) => {

        const nameA = a.rsp?.length ? a.rsp[0] : ''
        const nameB = b.rsp?.length ? b.rsp[0] : ''

        // respect sortDir
        if (nameA < nameB) return columnSort.sorts['perennial'].dir * -1;
        if (nameA > nameB) return columnSort.sorts['perennial'].dir;
        return 0;
    }

    const sortBySection = (a, b) => {

        const sectionA = a.reference_info?.sections?.length ? a.reference_info.sections[0] : ''
        const sectionB = b.reference_info?.sections?.length ? b.reference_info.sections[0] : ''

        // respect sortDir
        if (sectionA < sectionB) return columnSort.sorts['sections'].dir * -1;
        if (sectionA > sectionB) return columnSort.sorts['sections'].dir;
        return 0;
    }


    const sortByProbes = (a, b) => {
        return 0  // for now...
    }

    const sortFunctions = {
        // TODO what we really want to do is use the
        //  sorting function defined in the column definition
        //  associated with the column specified by column key

        native: sortByNative,

        name: sortByName,
        status: sortByStatus,
        references: sortByReference,
        actionable: sortByActionable,
        archive_status: sortByArchiveStatus,

        // signals: sortBySignals,
        // signal_score: sortByWikiSignalsScore,

        // not really used
        templates: sortByTemplate,
        sections: sortBySection,

        // deprecated
        perennial: sortByPerennial,
        probes: sortByProbes,

    }

    const columnKeyAssociation = {
        "url-name": "name",
        "url-live_status": "status",
        "url-archive_status": "archive_status",
        "url-actionable": "actionable",
    }

    const getSortFunction = () => {
        // return sort function based on current value of state variable columnSort

        // first see if sortFn defined "directly" for sortKey
        const sortKey = columnSort.sortBy[0] ?? "native"  // NB sortKey from global state columnSort.sortBy array

        console.log(`***** getSortFunction: sortKey is ${sortKey}`)

        // TODO?? what to do if sortKey is not valid?

        const sortFn = sortFunctions[sortKey]

        if (sortFn) {
            return sortFn  // sortFn found in sortFunctions dict, so return it
        }

        // else continue to special case

        // if sortKey is of type "signal_", use sortFn from badgeDef
        if (sortKey.startsWith(signalBadgePrefix)) {
            // extract badge key from sortKey
            const badgeKey = sortKey.split(signalBadgePrefix)[1]; // Extract substring after "signal_"
            const badgeDef = signalBadgeRegistry[badgeKey]

            return (badgeDef.sort)
                ? (a, b) => badgeDef.sort(a, b, columnSort)  // must pass columnSort
                : undefined  // "null" sort function
        }

        // nothing found - return "null" function
        return undefined
    }

    const onHoverFlockRow = e => {
        e.stopPropagation()  // prevents onHover from propagating engaging and erasing tooltip
        const html = getColumnTooltip(e)
        setUrlTooltipHtml(html)
    }

    const onClickFlockRow = (e) => {
        e.stopPropagation()

        console.log("onClickFlockRow")

        let rowEl = null

        // for header row...
        rowEl = e.target.closest('.flock-header')
        if (rowEl) {
            onClickFlockHeaderRow(e)
        }

        // for data row...
        rowEl = e.target.closest('.url-row')
        if (rowEl) {
            // get the url associated with the row of the clicked element
            const url = rowEl?.dataset.url

            // send action up component tree to co-filter references list
            onAction({
                "action": ACTIONS_IARE.SHOW_REFERENCE_VIEW_FOR_URL.key,
                "value": url,
            })
        }

    }


    const onClickFlockHeaderRow = (e) => {
        let colEl = null

        colEl = e.target.closest('.signal-badge')
        if (colEl) {
            // we have a signal badge column - calc sortKey
            const badgeKey = colEl.dataset.badgekey
            const sortKey = `${signalBadgePrefix}${badgeKey}`  // e.g. "signal_wayback"

            console.log(`Clicked on flock header row; signal badge: ${badgeKey}`)
            // iareAlert(`Click on header: signal badge ${badgeKey}`)

            updateFlockSort(sortKey)
            return
        }

        // we have a normal flock column - extract sortKey from column class
        colEl = e.target.closest('.flock-col')
        if (colEl) {

            const columnKey = colEl.dataset.columnKey
            const sortKey = columnKeyAssociation[columnKey]

            console.log(`Clicked on header column for ${sortKey}`)
            // iareAlert(`Click on column in header for ${columnClass}`)

            updateFlockSort(sortKey)
        }

    }


    const onClickDetailsPopupHeader = (e) => {

        const targetElement = e.target
        const targetClass = targetElement.className

        if (targetClass === "info-click") {
            console.log("Info for Details Popup Header Clicked")
            setIsSignalsDocsPopupOpen(true)
        }

    }

    const getUrlRows = (urlArray, flockFilters) => {
        // TODO implement columnsToShow (ignoring for now)

        // returns [flockRow markup, array of filtered urls]
        if (!urlArray || urlArray.length === 0) {
            return [<h4>No URLs to show</h4>, []]
        }

        if (!flockFilters) flockFilters = {}  // prevent null errors
        // TODO what to do if flockFilters is not an object of keyed FlockFilter's?
        //  Can we make flockFilters a custom "FlockFilters" type?


        // filter the urls according to the set of filters provided
        // NB Currently only 1 filter is supported; in the future we may support more

        let filteredUrls = urlArray  // initialize url array as the full provided array

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
        if (columnSort.sortBy?.length > 0) {
            const sortFn = getSortFunction()
            console.log(`sorting rows by: ${columnSort.sortBy[0]}`)  //
            filteredUrls.sort(sortFn)
        } else {
            // do nothing??? could sort by native...
            filteredUrls.sort(sortByNative)
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

        const getDataRow = (u, i) => {

            const classList = 'url-row '
                + getUrlLiveStatusClass(u.status_code)
                + (u.url === selectedUrl ? ' url-selected' : '')
                // + (u.rsp ? ` url-rating-${u.rsp[0]}` : '')  // TODO deprecated?

            return <div className={classList} key={i}

                        data-url={u.url}
                        data-status_code={u.status_code}
                        data-archive_status={u.archive_status?.hasArchive}
                        data-live_state={u.archive_status?.live_state}
                        data-actionable={u.actionable ? u.actionable[0] : null}  // return first actionable only (for now)
                        data-is_book={u.isBook}
            >

                <div className={"url-name"}>{u.url}</div>
                <div className={"url-live_status"}>{u.status_code ? u.status_code : "?"}</div>
                <div className={"url-archive_status"}>{getArchiveStatusInfo(u)}</div>
                <div className={"url-actionable"}>{getActionableInfo(u)}</div>

                <div className={"url-signals"}>

                    <SignalBadges urlObj={u}
                                  badgeContextKey={badgeContext.inline.key}
                                  signalData={u?.signal_data?.signals ?? {}}
                                  monitoredSignals={monitoredSignals}
                                  onAction={onAction}
                                  fromCache = {u?.signal_data?.retrieved_from_cache}
                    />



                </div>

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
        const urlRows = filteredUrls.map((u, i) => {

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

        return [urlRows, filteredUrls]  // urlRows is markup for filteredUrls

    }  // end getUrlRows


    const getHeaderRow = () => {

        return <ColumnSortContext.Provider value={columnSort}>

            <div className={"flock-header"}>

                <ColumnBox
                    content={<><br/>URL Link</>}
                    columnClass={"url-name flock-col"}
                    columnKey={"url-name"}
                />

                <ColumnBox
                    content={<>Live<br/>Status</>}
                    columnClass={"url-live_status flock-col"}
                    columnKey={"url-live_status"}
                />
                <ColumnBox
                    content={archiveFilterDefs['iabot']._.name}
                    columnClass={"url-archive_status flock-col"}
                    columnKey={"url-archive_status"}
                />
                <ColumnBox
                    content={<>Action<br/>Items</>}
                    columnClass={"url-actionable flock-col"}
                    columnKey={"url-actionable"}
                />

                {/* signals column is special... */}
                <div className={"url-signals flock-col"}>
                    <div>
                        <SignalBadges badgeContextKey={BadgeContexts.sort.key}
                                      monitoredSignals={monitoredSignals}
                                      onAction={onAction}
                        />
                    </div>
                </div>

            </div>

        </ColumnSortContext.Provider>

    }


    // fades feedback text (iare alert) in and out
    //
    // //  NB   T H I S   E F F E C T   I S   N O T   R E A D Y   Y E T
    //
    //

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

    const handleFeedback = (feedback) => {
        setFeedbackText(feedback)
    }

    const spanFeedback =  // placeholder to show disappearing messages
        <div className={`feedback-div ${feedbackText ? 'feedback-fade-text' : ''}`}>
            {feedbackText && <span>{feedbackText}</span>}
        </div>


    /* Copy functions */

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

    const buttonShowHideRefs =
        <button onClick={() => onAction({action: ACTIONS_IARE.TOGGLE_SHOW_REFS.key})}
                className={'btn utility-button small-button'}
        >
            <span>{options.showRefs ? "Hide Refs" : "Show Refs"}</span>
        </button>

    const buttonShowHideFilters =
        <button onClick={() => onAction({action: ACTIONS_IARE.TOGGLE_SHOW_FILTERS.key})}
                className={'btn utility-button small-button'}
        >
            <span>{options.showFilters ? "Hide Filters" : "Show Filters"}</span>
        </button>


    /* flock info */

    const [flockDataRows, flockArray] = getUrlRows(urlArray, urlFilters);
        // flockDataRows is array of row markup; flockArray is array of url data that markup represents

    const flockInfo = `${flockDataRows.length} ` +
        `${flockDataRows.length === 1 ? 'URL' : 'URLs'}`

    const flockCaption = <>
        <div className={"main-caption"}>
            <div>URL Links</div>
            <div>
                <div style={{position: "relative", top: ".2rem"}}>{buttonShowHideFilters}{buttonShowHideRefs}{buttonCopyList}{buttonCopyDetails}</div>
            </div>
        </div>
        <div className={"sub-caption"}>
            <div>{flockInfo}</div>
            <div>{spanFeedback} </div>
        </div>
    </>

    const flockHeader = getHeaderRow()
    const flockRows = <div className={"flock-rows"}>
        {flockDataRows}
    </div>

    const flock = <div className={"flock-container"}
                       onClick={onClickFlockRow}
                       onMouseOver={onHoverFlockRow} >
        {flockHeader}
        {flockRows}
    </div>

    return <>

        <div data-tooltip-id={tooltipId}         // passed in tooltipId for this flock
             data-tooltip-html={urlTooltipHtml}  // set urlTooltipHtml to set tooltip contents

            ><FlockBox caption={flockCaption} className={"url-flock"}>{flock}</FlockBox>

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
            <SignalsDocs onClose={() => {
                setIsSignalsDocsPopupOpen(false)
            }}/>

        </Popup>

        {/* popup title, data and open status set in handleSignalClick function */}
        <Popup isOpen={isSignalDetailsPopupOpen}
               onClose={() => {
                   setIsSignalDetailsPopupOpen(false)
               }}
               title={signalDetailsPopupTitle}
               className={"signal-details-popup"}
               initialSize={{width: 800, height: 780}}
               initialPosition={{x: 160, y: 50}}
               onClickHeader={onClickDetailsPopupHeader}
        >
            {signalDetailsPopupContents}
        </Popup>

    </>
})

export default urlFlock
