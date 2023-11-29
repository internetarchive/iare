import React, {useContext, useState} from 'react';
import {Tooltip as MyTooltip} from "react-tooltip";
import {ConfigContext} from "../../contexts/ConfigContext";
import {httpStatusCodes, iabotLiveStatusCodes} from "../../constants/httpStatusCodes"
import {ARCHIVE_STATUS_FILTER_MAP as archiveFilterDefs} from "./filterMaps/urlFilterMaps";
import {UrlStatusCheckMethods} from "../../constants/checkMethods";
import {convertToCSV, copyToClipboard} from "../../utils/utils";

const localized = {
    "show_all_button_text":"Show All",
}

const urlListDef = {
    columns : {
        "url-name": {
            ttHeader: `<div>URL Link Text</div>`,
            ttData: `<div>Link Text of URL</div>`
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
        "url-sections": {
            ttHeader: `<div>Section in Wikipedia article where Citation is defined</div>`,
            ttData: `Section in Wikipedia article where Reference originated`,
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
                                extraCaption = null,
                                fetchMethod="" }) {
    // TODO maybe should not/don't have to use memo here??

    const [urlTooltipHtml, setUrlTooltipHtml] = useState( '<div>ToolTip<br />second line' );
        // TODO there is a bug where sort re-renders list every time tooltip text/html property is updated
        // TODO maybe fix using React.useRef somehow???

    const [sort, setSort] = useState({
        sorts: {  // holds sort value for all different sort types
            "status": {name: "status", dir: 1},  // dir: 1 is asc, -1 is desc, 0 is do not sort
            "archive_status": {name: "archive_status", dir: -1},
            "references": {name: "references", dir: -1},
            "templates": {name: "templates", dir: -1},
            "sections": {name: "sections", dir: -1},
        },
        sortOrder: ["status"]  // array indicating which sorts get applied and in what order. NB this is not implemented yet, but will be
    })

    const myConfig = useContext(ConfigContext);

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
        const archiveA = a?.iabot_archive_status.hasArchive ? 1 : 0;
        const archiveB = b?.iabot_archive_status.hasArchive ? 1 : 0;

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
        else if(sort.sortOrder[0] === "sections") {
            return sortBySection(a,b)
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
            "action": "showRefsForUrl",
            "value": url,
        })
    }

    const handleRemoveFilter = (e) => {
        // send action back up the component tree
        onAction( {
            "action": "removeUrlFilter",
            "value": '',
        })
    }

    const onClickHeader = (evt) => {
    }

    const onHoverUrlFlock = (e) => {
        // clears tooltip html...only if no other sub-elements got there first
        setUrlTooltipHtml('')
    }
    const onHoverHeaderRow = (e) => {
        e.stopPropagation()  // prevents default onHover of UrlFlock from engaging and erasing tooltip

        const html = urlListDef.columns[e.target.className]?.ttHeader

        setUrlTooltipHtml(html)
    }

    const onHoverDataRow = e => {
        // show tool tip for targeted column of hovered row

        e.stopPropagation()  // stop higher up elements from changing tooltip

        const row = e.target.closest('.url-row')

        // get the class name of the column we are in...this is a little tricky because of possible sub elements
        const myClassName = e.target.parentElement.classList.contains('url-row')
            ? e.target.className
            : e.target.parentElement.className

        let html = ''

        if (myClassName === "url-status") {
            // status code column special handling
            const statusDescription = httpStatusCodes[row.dataset.status_code]
            html = `<div>${row.dataset.status_code} : ${statusDescription}</div>`

        } else if (myClassName === "url-archive_status") {
            // WBM archive status column special handling
            html = row.dataset.live_state
                ? `<div>${row.dataset.live_state}: ${iabotLiveStatusCodes[row.dataset.live_state]}` +
                    `<br/>${row.dataset.archive_status === "true" ? 'Archived' : 'Not Archived'}</div>`
                : ''

        } else if (myClassName === "url-citations") {
            // live status from template special handling
            html = row.dataset.citation_status && row.dataset.citation_status !== '--'
                ? `<div>Link Status ${'"' + row.dataset.citation_status + '"'} as indicated in Citation</div>`
                : `<div>No Link Status defined in Citation</div>`

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

    const getMultiLineCaption = ( myCaptions = [] ) => {
        const prefixBreak = myCaptions.length > 1
        return myCaptions.map((str, index) => (
            <React.Fragment key={index}>
                {prefixBreak && index === 0 ? <br/> : null}
                {str}
                {index < myCaptions.length - 1 && <br />}  {/* Add <br/> except for the last element */}
            </React.Fragment>))
    }


    const getFlock = (flockArray, flockFilters) => {
        if (!flockArray || flockArray.length === 0) return <h4>No URLs to show</h4>

        if (!flockFilters) flockFilters = {}  // prevent null errors
        // TODO what to do if flockFilters not a keyed object of FlockFilter's? Can we make it a custom type (of FlockFilters)?

        // initialize the urls as the full provided array
        let filteredUrls = flockArray

        const handleCopyClick = () => { // used to copy url list and status
            // TODO Add column heading for cite status

            const urlArrayData = [...filteredUrls].sort(
                (a, b) => (a.url > b.url) ? 1 : (a.url < b.url) ? -1 : 0  // sort by url

            ).map( u => {  // get one row per line:
                return [
                    u.url,
                    u.status_code,
                    u.reference_info?.templates ? u.reference_info?.templates.join(",") : null,
                    u.status_code_errors?.reason ? u.status_code_errors.reason : null,
                    u.status_code_errors?.message ? u.status_code_errors.message : null,
                ]
                // TODO output archive status and maybe iabot live stuff
            })

            // add column labels
            urlArrayData.unshift( [
                'URL',
                `${fetchMethod} status`,
                `Templates`,
                `Error reason`,
                `Error message`
            ] )

            copyToClipboard(convertToCSV(urlArrayData))

        }

        // get final filteredUrls by applying filters successively, while accumulating the
        // filter captions into the filterCaptions array, via a side effect within .map()
        // TODO turn this into a function...
        let filterCaptions = Object.keys(flockFilters)
            .filter(key => !!flockFilters[key] && flockFilters[key].filterFunction )  // exclude null filter defs, and null filter functions
            .map( filterName => {  // apply non-null filters and append filter caption
                const f = flockFilters[filterName]
                if (Array.isArray(f.filterFunction)) {
                    // interpret f.filterFunction as an array of filters,
                    //    and apply all filters one at a time
                    // TODO turn this into some kind of effective recursive loop
                    const captionList = f.filterFunction.map( oneFilter => {
                        filteredUrls = filteredUrls.filter( (oneFilter.filterFunction)() )  // NB: Note self-calling function
                        return oneFilter.caption
                    })
                    return getMultiLineCaption(captionList)
                } else {  // f is one filter
                    filteredUrls = filteredUrls.filter( (f.filterFunction)() )  // NB: Note self-calling function
                    return flockFilters[filterName].caption
                }
            })

        // temporarily fixes bug where flockFilters is being set to an array with a single elment of another emoty array.
        // it has something to do with the empty Archive Status state setting the flockFilters when it shouldn't
        // TODO NB Fix this bug
        if (filterCaptions.length === 1 && filterCaptions[0].length === 0) {
            filterCaptions = ''
        }

        // sort filteredUrls if specified
        if (sort.sortOrder?.length > 0) {
            console.log(`sorting urls by: ${sort.sortOrder[0]}`)
            filteredUrls.sort(sortFunction)
        }

        const getArchiveStatusInfo = (u => <span className={u.iabot_archive_status?.hasArchive ? "archive-yes" : "archive-no" }></span> )

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

        const getTemplateInfo = (u => {
            return !u.reference_info?.templates
                ? null
                : u.reference_info.templates.map( (s,i) => {
                    return <div key={i}>{s}</div>
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

        const getDataRow = (u, i, classes) => {

            const citationStatus = !u.reference_info?.statuses?.length
                // TODO rethink this column - could have a JSON array version
                ? null
                : u.reference_info.statuses[0]  // just return first one

            return <div className={classes} key={i}
                        data-url={u.url}
                        data-status_code={u.status_code}
                        data-archive_status={u.iabot_archive_status?.hasArchive}
                        data-citation_status={citationStatus}
                        data-live_state={u.iabot_archive_status?.live_state}
            >
                <div className={"url-name"}>{u.url}</div>
                <div className={"url-status"}>{u.status_code}</div>
                <div className={"url-archive_status"}>{getArchiveStatusInfo(u)}</div>

                <div className={"url-citations"}>{getCitationInfo(u)}</div>
                <div className={"url-templates"}>{getTemplateInfo(u)}</div>
                <div className={"url-sections"}>{getSectionInfo(u)}</div>

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

                <div className={"url-citations"}>&nbsp;</div>
                <div className={"url-templates"}>&nbsp;</div>
                <div className={"url-sections"}>&nbsp;</div>

            </div>
        }

        const enableShowAllButton = Object.keys(flockFilters).length > 0
            && flockFilters[Object.keys(flockFilters)[0]]
            && flockFilters[Object.keys(flockFilters)[0]]['name'] !== 'all'
                // make sure filter definition is not null
                // and that this is not the "all" filter,
                // in which case we disable the "Show All" button
        const buttonShowAll = <button
            className={`utility-button small-button${enableShowAllButton ?'':' disabled'}` }
                onClick={handleRemoveFilter}
                disabled={!enableShowAllButton}
                // className={'utility-button button-remove-url-filter'}
            ><span>{localized['show_all_button_text']}</span></button>

        const checkMethodDisplay = UrlStatusCheckMethods[fetchMethod]?.caption

        const buttonCopy = <button className={'btn utility-button small-button'} onClick={handleCopyClick} ><span>Copy to Clipboard</span></button>

        const firstLineCaption = `${filteredUrls.length.toString()} ${filteredUrls.length === 1 ? 'URL' : 'URLs'}, Status Check Method: ${checkMethodDisplay}`

        const flockMetaHeader = <div className={"url-list-meta-header"}>
            <div>
                <h4 className={"url-flock-caption"}>{firstLineCaption}</h4>
            </div>
            <div>{myConfig.isShowExpertMode && buttonCopy} {buttonShowAll}</div>
        </div>

        // show filter.desc
        // show filter.fixit

        const allFilterNames = Object.keys(flockFilters)
        const oneFilter = allFilterNames?.length > 0 ?  flockFilters[allFilterNames[0]] : {}
        // first filter only gets "info treatment"
        // TODO must handle mul;tiple conditions...
        const flockInfoHeader = <div className={"url-list-info-header"}>
            {oneFilter?.desc
                ? <div>
                    <div className={"flock-info-condition" + (oneFilter.fixit ? '' : ' condition-calm')}>Condition:</div>
                    <div>{oneFilter.desc}</div>
                  </div>
                : <div>
                    <div className={"flock-info-condition condition-calm"}>Condition:</div>
                    <div>No Condition applied; All URLs shown.</div>
                  </div>
            }
            {oneFilter?.fixit
                ? <div>
                <div className={"flock-info-tofix"}>To Fix:</div>
                <div>{oneFilter.fixit}</div>
                </div>
                : null}
        </div>

        const flockHeaderRow = <div
            className={"url-list-header"}
            onClick={onClickHeader}
            onMouseOver={onHoverHeaderRow} >

            {/* top row of header - for layout reasons - blank for now, but may be useful if column-spanning labels are desired */}
            <div className={"url-row url-header-row url-row-top"}>
                <div className={"url-name"}>&nbsp;</div>
                <div className={"url-status"}>&nbsp;</div>
                <div className={"url-archive_status"} >&nbsp;</div>
                <div className={"url-citations"}>&nbsp;</div>
                <div className={"url-templates"}>&nbsp;</div>
                <div className={"url-sections"}>&nbsp;</div>
            </div>

            {/* second header row - contains column labels */}
            <div className={"url-row url-header-row"}>
                <div className={"url-name"} onClick={() => {
                    handleSortClick("name")
                }
                }><br/>URL Link</div>

                <div className={"url-status"} onClick={() => {
                    handleSortClick("status")
                }
                }>Status<br/>{checkMethodDisplay}</div>

                <div className={"url-archive_status"} onClick={() => { handleSortClick("archive_status"); } }
                    >{archiveFilterDefs['iabot']._.name}</div>

                <div className={"url-citations"} onClick={() => { handleSortClick("references"); } }
                >Citation<br/>Priority</div>

                <div className={"url-templates"} onClick={() => { handleSortClick("templates"); } }
                >Template<br/>Type</div>

                <div className={"url-sections"} onClick={() => { handleSortClick("sections"); } }
                >Origin<br/>Section</div>

            </div>

        </div>



        // iterate over array of url objects to create rendered output
        const flockRows = filteredUrls.map((u, i) => {

            // TODO: we should sanitize earlier on in the process to save time here...

            // if url object is problematic...
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

            // TODO do something akin to "myMethodRenderer.getRowData"
            return getDataRow(u, i, classes)

        } )

        return <>
            {/*{false && flockCaption}*/}
            {/* TODO do something akin to "myMethodRenderer.getHeaderRow" */}
            {flockMetaHeader}
            {flockInfoHeader}
            {flockHeaderRow}
            <div className={"url-list"}
                 onClick={handleRowClick}
                 onMouseOver={onHoverDataRow}
            >
                {flockRows}
            </div>
        </>        
    }
    

    const tooltip = <MyTooltip id="my-url-tooltip"
                               float={true}
                               closeOnEsc={true}
                               delayShow={420}
                               variant={"info"}
                               noArrow={true}
                               offset={5}
                               className={"url-flock-tooltip"}
    />

    const urls = getFlock(urlArray, urlFilters)

    return <>
        <div className={"url-flock"}
             data-tooltip-id="my-url-tooltip"
             // data-tooltip-content={urlTooltipText}
             data-tooltip-html={urlTooltipHtml}
             onMouseOver={onHoverUrlFlock}
            >
            {urls}
        </div>
        {tooltip}
    </>
})

export default urlFlock