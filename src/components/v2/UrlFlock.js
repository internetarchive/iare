import React, {useCallback, useState} from 'react';
import {httpStatusCodes, iabotLiveStatusCodes} from "../../constants/httpStatusCodes"
import {ARCHIVE_STATUS_FILTER_MAP as archiveFilterDefs} from "../../constants/urlFilterMaps";
import {convertToCSV, copyToClipboard} from "../../utils/utils";
import {rspMap} from "../../constants/perennialList";
import FlockBox from "../FlockBox";
import {IARE_ACTIONS} from "../../constants/iareActions";
import {ACTIONABLE_FILTER_MAP} from "../../constants/actionableMap";

/* definitions of url list headers */
const urlListDef = {  // keys match class names
    columns : {
        "url-name": {
            ttHeader: `<div>URL Link Text</div>`,
            ttData: `<div>Link Text of URL</div>`,
            tooltip: {
                header: `<div>URL Link Text</div>`,
                rows: `<div>Link Text of URL</div>`,
            }
        },
        "url-status": {
            ttHeader: `<div>HTTP Status Code of Primary URL</div>`,
            ttData: `<div>{status_code} : {statusDescription}</div>`
        },
        "url-archive_status": {
            ttHeader: `<div>Archive exists in IABot database</div>`,
            ttData: ``,
        },
        "url-citations": {
            ttHeader: `<div>URL Status as indicated by Citation Template "url-status" Parameter</div>`,
            ttData: '<div>Link Status as indicated in Citation</div>',
        },

        "url-templates": {
            ttHeader: `<div>Names of Templates used by Citation</div>`,
            ttData: `<div>Templates used by Citation</div>`,
        },
        "url-actionable": {
            ttHeader: `<div>Actions that can be taken to improve citation</div>`,
            ttData: `<div>Actions that can be taken to improve citation</div>`,
        },

        "url-sections": {
            ttHeader: `<div>Section in Wikipedia article where Citation is defined</div>`,
            ttData: `Section in Wikipedia article where Reference originated`,
        },
        "url-perennial": {
            ttHeader: `<div>Reliability Rating of URL, according to Wikipedia Reliable Sources</div>`,
            ttData: `Reliability Rating`,
        },

                    // "url-iabot_status": {
                    //     ttHeader: `<div>URL Status reported by IABot</div>`,
                    //     ttData: `placeholder`,
                    // },

    }
}

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

example:
    {
        caption: "General",
        desc: "",
        filterFunction: () => (d) => {return d.type === "general"},
    }


*/
const urlFlock = React.memo( function UrlFlock({
                                urlArray,
                                urlFilters = {},  // keyed object of filter definitions to apply to urlArray for final url list display
                                onAction,
                                selectedUrl = '',
                                fetchMethod="",
                                tooltipId = ''}) {
    // TODO maybe should not/don't have to use memo here??
    //  making it a memo seemed to reduce the re-renders of the flock when the tooltip text was updated

    const [feedbackText, setFeedbackText] = useState("")

    const [urlTooltipHtml, setUrlTooltipHtml] = useState( '<div>ToolTip<br />second line' );
        // TODO there is a bug where sort re-renders list every time tooltip text/html property is updated
        // TODO maybe fix using React.useRef somehow???

    const [sort, setSort] = useState({
        sorts: {  // holds sort value for all different sort types
            "status": {name: "status", dir: 1},  // dir: 1 is asc, -1 is desc, 0 is do not sort
            "archive_status": {name: "archive_status", dir: -1},
            "references": {name: "references", dir: -1},
            "templates": {name: "templates", dir: -1},
            "actionable": {name: "actionable", dir: -1},
            "sections": {name: "sections", dir: -1},
            "perennial": {name: "perennial", dir: -1},
        },
        sortOrder: ["status"]  // array indicating which sorts get applied and in what order. NB this is not implemented yet, but will be
    })

    const handleSortClick = (sortKey) => {
        // toggle sort direction of specified sort and set new sort state with setSort

        // selectively change the specified sort type
        // https://stackoverflow.com/questions/43638938/updating-an-object-with-setstate-in-react
        setSort(prevState => {
            // guarantee new sort has entry in sorts object
            if (!(prevState.sorts[sortKey])) {
                prevState.sorts[sortKey] = { name: sortKey, dir: 1}
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
                sortOrder: [sortKey]  // set only one for now...TODO implement so that sortOrder array accumulates sortKey
            }
        })
    }

    const sortByName = (a,b) => {
        const nameA = a.url
        const nameB = b.url

        // respect sortDir
        if (nameA < nameB) return sort.sorts['name'].dir * -1;
        if (nameA > nameB) return sort.sorts['name'].dir;
        return 0;
    }

    const sortByStatus = (a,b) => {
        const statusA = a && a.status_code !== undefined ? a.status_code : -1;
        const statusB = b && b.status_code !== undefined ? b.status_code : -1;

        // respect sort dir
        if (statusA < statusB) return sort.sorts['status'].dir * -1;
        if (statusA > statusB) return sort.sorts['status'].dir;
        return 0;
    }

    const sortByArchiveStatus = (a,b) => {
        const archiveA = a?.archive_status.hasArchive ? 1 : 0;
        const archiveB = b?.archive_status.hasArchive ? 1 : 0;

        // respect sortDir
        if (archiveA < archiveB) return sort.sorts['archive_status'].dir * -1;
        if (archiveA > archiveB) return sort.sorts['archive_status'].dir;
        return 0;
    }

    const sortByReference = (a,b) => {
        const statusA = a.reference_info?.statuses?.length ? a.reference_info.statuses[0] : ''
        const statusB = b.reference_info?.statuses?.length ? b.reference_info.statuses[0] : ''
        return sort.sorts['references'].dir * ((statusA > statusB)?1:(statusA < statusB?-1:0));  // dir is multiplied by 1, -1 or 0
    }

    const sortByTemplate = (a,b) => {

        const nameA = a.reference_info?.templates?.length ? a.reference_info.templates[0] : ''
        const nameB = b.reference_info?.templates?.length ? b.reference_info.templates[0] : ''

        // respect sortDir
        if (nameA < nameB) return sort.sorts['templates'].dir * -1;
        if (nameA > nameB) return sort.sorts['templates'].dir;
        return 0;
    }

    const sortByActionable = (a,b) => {

        const actionA = a.actionable?.length ? a.actionable[0] : ''
        const actionB = b.actionable?.length ? b.actionable[0] : ''

        // respect sortDir
        if (actionA < actionB) return sort.sorts['actionable'].dir * -1;
        if (actionA > actionB) return sort.sorts['actionable'].dir;
        return 0;
    }

    const sortByPerennial = (a,b) => {

        const nameA = a.rsp?.length ? a.rsp[0] : ''
        const nameB = b.rsp?.length ? b.rsp[0] : ''

        // respect sortDir
        if (nameA < nameB) return sort.sorts['perennial'].dir * -1;
        if (nameA > nameB) return sort.sorts['perennial'].dir;
        return 0;
    }

    const sortBySection = (a,b) => {

        const sectionA = a.reference_info?.sections?.length ? a.reference_info.sections[0] : ''
        const sectionB = b.reference_info?.sections?.length ? b.reference_info.sections[0] : ''

        // respect sortDir
        if (sectionA < sectionB) return sort.sorts['sections'].dir * -1;
        if (sectionA > sectionB) return sort.sorts['sections'].dir;
        return 0;
    }

    const sortFunction = (a,b) => {
        // TODO make this recursive to do collection of sort definitions as described in a "sort.sortOrder" array of key names for sort methods
        // TODO e.g: sort.sortOrder = ["references", "archive_status", "name"]
        if(sort.sortOrder[0] === "name") {
            return sortByName(a,b)
        }
        else if(sort.sortOrder[0] === "status") {
            return sortByStatus(a,b)
        }
        else if(sort.sortOrder[0] === "references") {
            return sortByReference(a,b)
        }
        else if(sort.sortOrder[0] === "templates") {
            return sortByTemplate(a,b)
        }
        else if(sort.sortOrder[0] === "actionable") {
            return sortByActionable(a,b)
        }
        else if(sort.sortOrder[0] === "sections") {
            return sortBySection(a,b)
        }
        else if(sort.sortOrder[0] === "perennial") {
            return sortByPerennial(a,b)
        }

        else if(sort.sortOrder[0] === "archive_status") {
            return sortByArchiveStatus(a,b)
        }
        else {
            return 0  //
        }
    }

    const handleRowClick = (e) => {
        // get the url from the data of the row associated with the clicked element
        const url = e.target.closest('.url-row').getAttribute('data-url');  // TODO fix this ti use dataset property

        // send action back up the component tree to filter the references list
        onAction( {
            "action": IARE_ACTIONS.SHOW_REFERENCE_VIEWER_FOR_URL.key,
            "value": url,
        })
    }
                //
                // const handleRemoveFilter = (e) => {
                //     // send action back up the component tree
                //     onAction( {
                //         "action": "removeUrlFilter",
                //         "value": '',
                //     })
                // }

    const onClickHeader = (evt) => {
    }

    const onHoverUrlFlock = (e) => {
        // clears tooltip html...only if no other sub-elements got there first
        setUrlTooltipHtml('')
    }

    // const onHoverHeaderRow = (e) => {
    //     e.stopPropagation()  // prevents default onHover of UrlFlock from engaging and erasing tooltip
    //
    //     const html = urlListDef.columns[e.target.className]?.ttHeader
    //
    //     setUrlTooltipHtml(html)
    // }

    const onHoverHeaderRow = useCallback ((e) => {  // useCallback prevents re-render upon hover???
        e.stopPropagation()  // prevents default onHover of UrlFlock from engaging and erasing tooltip
        const html = urlListDef.columns[e.target.className]?.ttHeader
        setUrlTooltipHtml(html)
    }, [])

    const onHoverDataRow = e => {
        // show tool tip for targeted column of hovered row

        e.stopPropagation()  // stop higher up elements from changing tooltip

        const row = e.target.closest('.url-row')

        // get the class name of the column we are in...this is a little tricky because of possible sub elements
        const myClassName = e.target.parentElement.classList.contains('url-row')
            ? e.target.className
            : e.target.parentElement.className

        console.log(`className for hoer is ${myClassName}`)
        let html = ''

        if (myClassName === "url-status") {
            // status code column special handling
            const statusDescription = httpStatusCodes[row.dataset.status_code]
            html = `<div>${row.dataset.status_code} : ${statusDescription}</div>`

        } else if (myClassName === "url-archive_status") {
            // WBM archive status column special handling
            html = row.dataset.live_state
                ? `<div>${row.dataset.archive_status === "true" ? 'Archived' : 'Not Archived'}` +
                  `<br/>` +
                  `IABot live_state: ${row.dataset.live_state} - ${iabotLiveStatusCodes[row.dataset.live_state]}</div>`
               : `IABot archive_status = ${row.dataset.archive_status}<br/>IABot live_state = ${row.dataset.live_state}`

        } else if (myClassName === "url-citations") {
            // live status from template special handling
            html = row.dataset.citation_status && row.dataset.citation_status !== '--'
                ? `<div>Link Status ${'"' + row.dataset.citation_status + '"'} as indicated in Citation</div>`
                : `<div>No Link Status defined in Citation</div>`

        } else if (myClassName === "url-actionable") {
            // display descriptor of actionable items
            const actionableKey = row.dataset.actionable
            const desc = ACTIONABLE_FILTER_MAP[actionableKey]?.desc
            html = desc
                ? `<div>${desc}</div>`
                : urlListDef.columns[myClassName]?.ttData

        } else {
            // show tooltip from list definition
            html = urlListDef.columns[myClassName]?.ttData
        }

        setUrlTooltipHtml(html)
    }

    const onHoverErrorRow = e => {
        const text = e.currentTarget.getAttribute('data-err-text');
        // console.log("handleRowHover", text)
        setUrlTooltipHtml(text);
    }

    // returns [flockRow markup, array of filtered urls]
    const getFlockRows = (flockArray, flockFilters) => {
        if (!flockArray || flockArray.length === 0) {
            return [<h4>No URLs to show</h4>, []]
        }

        if (!flockFilters) flockFilters = {}  // prevent null errors
        // TODO what to do if flockFilters not a keyed object of FlockFilter's? Can we make it a custom type (of FlockFilters)?


        // filter the urls according to the set of filters provided
        // NB Currently only 1 filter is supported; in the future we may support more

        let filteredUrls = flockArray  // initialize the urls as the full provided array

        Object.keys(flockFilters).forEach( filterName => {
            const f = flockFilters[filterName]
            if (f) {  // if filter is null, skip
                if (Array.isArray(f.filterFunction)) {
                    // interpret f.filterFunction as an array of filters,
                    //    and apply all filters one at a time
                    // TODO turn this into some kind of effective recursive loop
                    f.filterFunction.forEach( oneFilter => {
                        if (oneFilter.filterFunction) {
                            filteredUrls = filteredUrls.filter((oneFilter.filterFunction)())
                        }  // NB: Note self-calling function
                    })
                } else {  // f is one filter
                    if (f.filterFunction) {
                        filteredUrls = filteredUrls.filter( (f.filterFunction)() )
                    }  // NB: Note self-calling function
                }
            }
        })

        // sort filteredUrls if specified
        if (sort.sortOrder?.length > 0) {
            console.log(`sorting urls by: ${sort.sortOrder[0]}`)
            filteredUrls.sort(sortFunction)
        }

        const getArchiveStatusInfo = (u => <span className={u.archive_status?.hasArchive ? "archive-yes" : "archive-no" }></span> )

        // eslint-disable-next-line no-unused-vars
        const getCitationInfo = (u => {
            // for now, returns array of statuses from url's associated references
            return !u.reference_info?.statuses
                ? null
                : u.reference_info.statuses.map( (s,i) => {
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
                : u.reference_info.templates.map( (s,i) => {
                    return <div key={i}>{s}</div>
                })
        })

        const getActionableInfo = (u => {
            return !u.actionable
                ? null
                : u.actionable.map( (key,i) => {
                    return <div key={i}>{ACTIONABLE_FILTER_MAP[key].short_caption}</div>
                })
        })

        const getSectionInfo = (u => {
            return !u.reference_info?.sections
                ? null
                : u.reference_info.sections.map( (s,i) => {
                    s = (s === 'root'?'Lead':s)  // transform "root" section to "Lead  TODO: do this earlier...
                    return <div key={i}>{s}</div>
                })
        })

        const getPerennialInfo = (u => {
            return !u.rsp
                ? null
                // rsp contains keys into rspMap
                : u.rsp.map( (s,i) => {
                    return <div key={i}>{rspMap[s]?.shortCaption ? rspMap[s].shortCaption : ''}</div>
                })
        })

        const getDataRow = (u, i, classes) => {

            const citationStatus = !u.reference_info?.statuses?.length
                // TODO rethink this column - could have a JSON array version
                ? null
                : u.reference_info.statuses[0]  // just return first one

            return <div className={classes} key={i}
                        data-url={u.url}
                        data-status_code={u.status_code}
                        data-archive_status={u.archive_status?.hasArchive}
                        data-citation_status={citationStatus}
                        data-live_state={u.archive_status?.live_state}
                        data-perennial={u.rsp ? u.rsp[0] : null}  // just return first perennial if found for now...dont deal with > 1
                        data-actionable={u.actionable ? u.actionable[0] : null}  // return first actionable only (for now)
            >
                <div className={"url-name"}>{u.url}</div>
                <div className={"url-status"}>{u.status_code}</div>
                <div className={"url-archive_status"}>{getArchiveStatusInfo(u)}</div>

                {/*<div className={"url-citations"}>{getCitationInfo(u)}</div>*/}

                {/*<div className={"url-templates"}>{getTemplateInfo(u)}</div>*/}
                <div className={"url-actionable"}>{getActionableInfo(u)}</div>

                <div className={"url-sections"}>{getSectionInfo(u)}</div>
                <div className={"url-perennial"}>{getPerennialInfo(u)}</div>

            </div>

        }

        const getErrorRow = (u, i, errText) => {
            return <div className={`url-row url-row-error`} key={i}
                        data-url={u.url}
                        data-err-text={errText}
                        // onMouseOverCapture={handleRowHover}>
                        onMouseOver={onHoverErrorRow}
                        onMouseLeave={() => setUrlTooltipHtml('')}
            >
                <div className={"url-name"}>{u.url ? u.url : `ERROR: No url for index ${i}`}</div>
                <div className={"url-status"}>{-1}</div>
                <div className={"url-archive_status"}>?</div>

                {/*<div className={"url-citations"}>&nbsp;</div>*/}

                {/*<div className={"url-templates"}>&nbsp;</div>*/}
                <div className={"url-actionable"}>&nbsp;</div>

                <div className={"url-sections"}>&nbsp;</div>
                <div className={"url-perennial"}>&nbsp;</div>

            </div>
        }

        // iterate over array of url objects to create rendered output
        const flockRows = filteredUrls.map((u, i) => {

            // TODO: we should sanitize earlier on in the process to save time here...

            // if url object is problematic...display as error row
            if (!u || u.url === undefined || u.status_code === undefined) {

                const errText = !u ? `URL data not defined for index ${i}`
                    : !u.url ? `URL missing for index ${i}`
                        : u.status_code === undefined ? `URL status code undefined (try Force Refresh)`
                            : 'Unknown error'; // this last case should not happen

                // TODO do something akin to "myMethodRenderer.getErrorRow"
                return getErrorRow(u, i, errText)
            }

            // otherwise show "normally"
            const classes = 'url-row '
                + (u.status_code === 0 ? ' url-is-unknown'
                    : u.status_code >= 300 && u.status_code < 400 ? ' url-is-redirect'
                        : u.status_code >= 400 && u.status_code < 500 ? ' url-is-notfound'
                            : u.status_code >= 500 && u.status_code < 600 ? ' url-is-error'
                                : '')
                + (u.url === selectedUrl ? ' url-selected' : '')
                + (u.rsp ? ` url-rating-${u.rsp[0]}` : '')

            // TODO do something akin to "myCheckMethod.renderRowData"
            return getDataRow(u, i, classes)

        } )

        return [flockRows, filteredUrls]

    }  // end getFlockRows

    const getFlock = (rows) => {

        const flockHeaderRow = <div
            className={"url-list-header"}
            onClick={onClickHeader}
            onMouseOver={onHoverHeaderRow} >

            {/* top row of header - for layout reasons - blank for now, but may be useful if column-spanning labels are desired */}
            <div className={"url-row url-header-row url-row-top"}>
                <div className={"url-name"}>&nbsp;</div>
                <div className={"url-status"}>&nbsp;</div>
                <div className={"url-archive_status"} >&nbsp;</div>

                {/*<div className={"url-citations"}>&nbsp;</div>*/}

                {/*<div className={"url-templates"}>&nbsp;</div>*/}
                <div className={"url-actionable"}>&nbsp;</div>

                <div className={"url-sections"}>&nbsp;</div>
                <div className={"url-perennial"}>&nbsp;</div>
            </div>

            {/* second header row - contains column labels */}
            <div className={"url-row url-header-row"}>

                {/*<div className={"url-name"} onClick={() => {handleSortClick("name")}}*/}
                {/*><span className={"pull-right"} sxxtyle={{float:"right"}}>Method used to Check Status: {checkMethodDisplay}</span><br/>URL Link</div>*/}
                <div className={"url-name"} onClick={() => {handleSortClick("name")}}
                ><br/>URL Link</div>

                <div className={"url-status"} onClick={() => {handleSortClick("status")}}
                >Link<br/>Status</div>

                <div className={"url-archive_status"} onClick={() => { handleSortClick("archive_status"); } }
                >{archiveFilterDefs['iabot']._.name}</div>

                {/*<div className={"url-citations"} onClick={() => { handleSortClick("references"); } }*/}
                {/*>Citation<br/>Priority</div>*/}

                {/*<div className={"url-templates"} onClick={() => { handleSortClick("templates"); } }*/}
                {/*>Template<br/>Type</div>*/}
                <div className={"url-actionable"} onClick={() => { handleSortClick("actionable"); } }
                >Actionable<br/>Items</div>

                <div className={"url-sections"} onClick={() => { handleSortClick("sections"); } }
                >Section<br/>of Origin</div>

                <div className={"url-perennial"} onClick={() => { handleSortClick("perennial"); } }
                >Reliability<br/>Rating</div>

            </div>

        </div>

        return <>
            {flockHeaderRow}
            <div className={"url-list"}
                 onClick={handleRowClick}
                 onMouseOver={onHoverDataRow}>{rows}</div>
        </>
    }


    const [flockRows, flockArray] = getFlockRows(urlArray, urlFilters)
    const flock = getFlock(flockRows)

    // fades in feedback text and then fades it out
    React.useEffect(() => {
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

    const handleCopyUrlsDetails = () => {

        const urlArrayData = [...flockArray].sort(   // NB "..." used so that copy of array is sorted, not original flock array
            (a, b) => (a.url > b.url) ? 1 : (a.url < b.url) ? -1 : 0  // sort by url

        ).map( u => {  // get one row per line:
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
        urlArrayData.unshift( [
            'URL',
            `${fetchMethod} status`,
            `Has Archive`,
            `Templates`,
            `Error reason`,
            `Error message`
        ] )

        copyToClipboard(convertToCSV(urlArrayData), `${numItems} URL Data Rows`, handleFeedback)

    }

    const handleFeedback = (feedback) => {
        setFeedbackText(feedback)
    }

    const handleCopyUrlsList = () => {

        const urlArrayData = [...flockArray].sort(   // NB used "..." so that copy of array is sorted, not original flock array
            (a, b) => (a.url > b.url) ? 1 : (a.url < b.url) ? -1 : 0  // sort by url

        ).map( u => {  // get one row per line:
            return u.url
        })

        copyToClipboard(urlArrayData.join("\n"), `${urlArrayData.length} URLs`, handleFeedback)

    }

    const buttonCopyList = <button onClick={handleCopyUrlsList} className={'btn utility-button small-button'} ><span>Copy URL List</span></button>
    const buttonCopyDetails = <button onClick={handleCopyUrlsDetails} className={'btn utility-button small-button'} ><span>Copy URL Details</span></button>
    // const spanFeedback = <div className={`feedback-div feedback-fade-text ${feedbackText ? 'feedback-visible' : ''} ${feedbackFadeout ? 'feedback-fadeout' : ''}`}>
    //     {feedbackText && <span>{feedbackText}</span>}
    // </div>
    const spanFeedback = <div className={`feedback-div ${feedbackText ? 'feedback-fade-text' : ''}`}>
        {feedbackText && <span>{feedbackText}</span>}
    </div>

    const flockCaption = <>
        <div>URL Links</div>
        <div className={"sub-caption"}>
            <div>{flockRows.length} {flockRows.length === 1 ? 'URL' : 'URLs'}</div>
            <div>{spanFeedback} {buttonCopyList} {buttonCopyDetails}</div>
            {/*{buttonCopyList} {buttonCopyDetails}*/}
        </div>
    </>

    return <FlockBox caption={flockCaption} className={"url-flock"}>

        {/*<div data-tooltip-id="url-display-tooltip"  // id of tooltip for entire url display (not just this flock)*/}
        <div data-tooltip-id={tooltipId}  // id of tooltip for entire url display (not just this flock)
             data-tooltip-html={urlTooltipHtml}
             onMouseOver={onHoverUrlFlock}
        >{flock}</div>

    </FlockBox>

})

export default urlFlock
