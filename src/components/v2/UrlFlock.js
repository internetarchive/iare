import React, {useState} from 'react';
import {Tooltip as MyTooltip} from "react-tooltip";
import {UrlStatusCheckMethods} from "../../constants/endpoints";
import {httpStatusCodes, iabotLiveStatusCodes} from "../../constants/httpStatusCodes"
import {ARCHIVE_STATUS_FILTER_MAP as archiveFilterDefs} from "./filters/urlFilterMaps";
import {convertToCSV, copyToClipboard} from "../../utils/utils";
// import {forEach} from "react-bootstrap/ElementChildren";

const localized = {
    "show_all_button_text":"Show All",
}

const urlListDef = {
    columns : {
        "url-name": {
            ttHeader: `<div>URL link text</div>`,
            ttData: `<div>Link text of URL</div>`
        },
        "url-status": {
            ttHeader: `<div>HTTP status code of primary URL</div>`,
            ttData: `<div>{status_code} : {statusDescription}</div>`
        },
        "url-iabot_status": {
            ttHeader: `<div>URL status reported by IABot</div>`,
            ttData: `placeholder`,
        },
        "url-references": {
            ttHeader: `<div>URL status as indicated by citation template ("url-status" parameter)</div>`,
            ttData: '<div>Link status as indicated in Citation</div>',
        },
        "url-templates": {
            ttHeader: `<div>Names of templates used by citation</div>`,
            ttData: `<div>Templates used by Citation</div>`,
        },
        "url-sections": {
            ttHeader: `<div>Section in Wikipedia article where Citation is defined</div>`,
            ttData: `Section in Wikipedia article where reference originated`,
        },

        // archive flavors; NB only IABot is used practically
        "url-arch-iari": {
            ttHeader: `<div>Archive found within set of<br/>URLs returned from IARI</div>`,
            ttData: ``,
        },
        "url-arch_wbm": {
            ttHeader: `<div>Archive exists in IABot database</div>`,
            ttData: ``,
        },
        "url-arch_tmplt": {
            ttHeader: `<div>Archive found in archive_url<br/>parameter of citation template</div>`,
            ttData: ``,
        },

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

useSort and sort: apply sorting if set to true, use ASC if sortDir is true, DESC otherwise

*/
const urlFlock = React.memo( function UrlFlock({ urlArray,
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
            "arch_iari": {name: "arch_iari", dir: 1},
            "arch_wbm": {name: "arch_wbm", dir: -1},
            "arch_tmplt": {name: "arch_tmplt", dir: 1},
            "references": {name: "references", dir: -1},
            "templates": {name: "templates", dir: -1},
            "sections": {name: "sections", dir: -1},
        },
        sortOrder: ["status"]  // which sorts get applied and in what order. NB this is not implemented yet, but will be
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

    const sortByArchIari = (a,b) => {
        const archiveA = a?.hasArchive ? 1 : 0;
        const archiveB = b?.hasArchive ? 1 : 0;

        // respect sortDir
        if (archiveA < archiveB) return sort.sorts['arch_iari'].dir * -1;
        if (archiveA > archiveB) return sort.sorts['arch_iari'].dir;
        return 0;
    }

    const sortByArchWbm = (a,b) => {
        const archiveA = a?.searchurldata_archived ? 1 : 0;
        const archiveB = b?.searchurldata_archived ? 1 : 0;

        // respect sortDir
        if (archiveA < archiveB) return sort.sorts['arch_wbm'].dir * -1;
        if (archiveA > archiveB) return sort.sorts['arch_wbm'].dir;
        return 0;
    }
    const sortByArchTmlpt = (a,b) => {
        const archiveA = a?.hasTemplateArchive ? 1 : 0;
        const archiveB = b?.hasTemplateArchive ? 1 : 0;

        // respect sortDir
        if (archiveA < archiveB) return sort.sorts['arch_tmplt'].dir * -1;
        if (archiveA > archiveB) return sort.sorts['arch_tmplt'].dir;
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
        // TODO e.g: sort.sortOrder = ["references", "arch_wbm", "name"]
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

        else if(sort.sortOrder[0] === "arch_iari") {
            return sortByArchIari(a,b)
        }
        else if(sort.sortOrder[0] === "arch_wbm") {
            return sortByArchWbm(a,b)
        }
        else if(sort.sortOrder[0] === "arch_tmplt") {
            return sortByArchTmlpt(a,b)
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

        } else if (myClassName === "url-arch_wbm") { // TODO: clarify this arch-wbm stuff!!!
            // WBM archive status column special handling
            html = row.dataset.live_state
                ? `<div>${row.dataset.live_state}: ${iabotLiveStatusCodes[row.dataset.live_state]}` +
                    `<br/>${row.dataset.arch_wbm === "true" ? 'Archived' : 'Not archived'}</div>`
                : ''

        } else if (myClassName === "url-references") {
            // live status from template special handling
            html = row.dataset.live_status && row.dataset.live_status !== '--'
                ? `<div>Link status ${'"' + row.dataset.live_status + '"'} as indicated in Citation</div>`
                : `<div>No link status defined in Citation</div>`

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

            // get one row per line:
            const urlArrayData = [...filteredUrls].sort(
                (a, b) => (a.url > b.url) ? 1 : (a.url < b.url) ? -1 : 0
            ).map( u => {
                if (fetchMethod === UrlStatusCheckMethods.IABOT.key) {
                    return [ u.url, u.status_code, u.status_code_error_details, u.searchurldata_status ]
                } else {
                    return [ u.url, u.status_code, u.status_code_error_details ]
                }
            })

            // add column labels
            if (fetchMethod === UrlStatusCheckMethods.IABOT.key) {
                urlArrayData.unshift( [ 'URL', `${fetchMethod} status`, `error details`, "IABOT searchurlstatus" ] )
            } else {
                urlArrayData.unshift( [ 'URL', `${fetchMethod} status`, `error details` ] )
            }

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

        // TODO this should be within IABOT row renderer
        // const getArchIariStatus = (u => <span className={u.hasArchive ? "archive-yes" : "archive-no" }></span> )
        const getArchIaStatus = (u => <span className={u.searchurldata_archived ? "archive-yes" : "archive-no" }></span> )
        // const getArchTmpltStatus = (u => <span className={u.hasTemplateArchive ? "archive-yes" : "archive-no" }></span> )

        const getReferenceInfo = (u => {
            // for now, returns array of statuses from url's associated references
            return !u.reference_info?.statuses
                ? null
                : u.reference_info.statuses.map( (s,i) => {
                    return <div key={i}>{s}</div>
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

            const liveStatus = !u.reference_info?.statuses
                ? null
                : u.reference_info.statuses[0]  // just return first one

            return <div className={classes} key={i} data-url={u.url}
                        data-status_code={u.status_code}
                        data-live_state={u.searchurldata_status}
                        data-arch_iari={!!u.hasArchive}
                        data-arch_wbm={!!u.searchurldata_archived}
                        data-arch_tmplt={!!u.hasTemplateArchive}
                        data-live_status={liveStatus}
                        // data-references={!!u.hasTemplateArchive}
            >
                <div className={"url-name"}>{u.url}</div>
                <div className={"url-status"}>{u.status_code}</div>
                {fetchMethod === UrlStatusCheckMethods.IABOT.key
                    // we are essentially assuming IABot status for now - if we use corentin, then these wont display!
                    // TODO if we use corentin, could we just add as a column? add other columns? later...
                    ? <>
                        <div className={"url-arch_wbm"}>{getArchIaStatus(u)}</div>

                        {/*<div className={"url-arch_tmplt"}>{getArchTmpltStatus(u)}</div>*/}
                        {/*<div className={"url-iabot_status"}>{getIabotStatus(u)}</div>*/}

                    </>
                    : null }

                <div className={"url-references"}>{getReferenceInfo(u)}</div>
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

                {/* TODO this should be within IABOT row renderer */}
                {fetchMethod === UrlStatusCheckMethods.IABOT.key
                    ? <>
                        {/*<div className={"url-arch-iari"}>?</div>*/}
                        <div className={"url-arch_wbm"}>?</div>

                        {/*<div className={"url-arch_tmplt"}>?</div>*/}
                        {/*<div className={"url-iabot_status"}>---</div>*/}

                    </>
                    : null }

                <div className={"url-references"}>&nbsp;</div>
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
        const buttonRemove = <button
            className={`utility-button small-button${enableShowAllButton ?'':' disabled'}` }
                onClick={handleRemoveFilter}
                disabled={!enableShowAllButton}
                // className={'utility-button button-remove-url-filter'}
            ><span>{localized['show_all_button_text']}</span></button>

        const buttonCopy = <button className={'btn utility-button small-button'} onClick={handleCopyClick} ><span>Copy to Clipboard</span></button>

        const firstLineCaption = filteredUrls.length.toString() + ' ' + (filteredUrls.length === 1 ? 'URL' : 'URLs')
        const flockCaption = <>

            <h4 className={"url-flock-caption"}>{firstLineCaption}</h4>{buttonRemove}

            <h4><span className={"filter-title"}
            >{`Applied Filter${filterCaptions.length === 1 ? '' : 's'}:`}<
            /span> {
                filterCaptions.length > 0 ? filterCaptions : 'Show All' }</h4>

            {extraCaption}
        </>


        const flockMetaHeader = <div className={"url-list-meta-header"}>
            <div>
                <h4 className={"url-flock-caption"}>{firstLineCaption}</h4>{buttonCopy}
            </div>
            <div>{buttonRemove}</div>
        </div>

        // show filter.desc
        // show filter.fixit

        const allFilterNames = Object.keys(flockFilters)
        const oneFilter = allFilterNames?.length > 0 ?  flockFilters[allFilterNames[0]] : {} // first filter only gets "info treatment"
        const flockInfoHeader = <div className={"url-list-info-header"}>
            {oneFilter.desc
                ? <div>
                    <div className={"flock-info-condition"}>Condition:</div>
                    <div>{oneFilter.desc}</div>
                  </div>
                : <div>
                    <div className={"flock-info-condition"}>Condition:</div>
                    <div>No Conditions applied; All URLs shown.</div>
                  </div>
            }
            {oneFilter.fixit
                ? <div>
                <div className={"flock-info-condition"}>To Fix:</div>
                <div>{oneFilter.fixit}</div>
                </div>
                : null}
        </div>

        const flockHeaderRow = <div
            className={"url-list-header"}
            onClick={onClickHeader}
            onMouseOver={onHoverHeaderRow} >

            {/* top row of header - for layout reasons */}
            <div className={"url-row url-header-row url-row-top"}>
                <div className={"url-name"}>&nbsp;</div>
                <div className={"url-status"}>&nbsp;</div>
                {fetchMethod === UrlStatusCheckMethods.IABOT.key
                    ? <>
                        <div className={"url-arch_wbm"} >&nbsp;</div>
                        {/*<div className={"url-arch_tmplt"}>&nbsp;</div>*/}
                        {/*<div className={"url-iabot_status"}>&nbsp;</div>*/}
                    </>
                    : null }
                <div className={"url-references"}>&nbsp;</div>
                <div className={"url-templates"}>&nbsp;</div>
                <div className={"url-sections"}>&nbsp;</div>
            </div>

            {/* second header row - contains column labels */}
            <div className={"url-row url-header-row"}>
                <div className={"url-name"} onClick={() => {
                    handleSortClick("name")
                }
                }>URL<br/>Link</div>

                <div className={"url-status"} onClick={() => {
                    handleSortClick("status")
                }
                }>URL<br/>Status</div>

                {/* TODO this should be within IABOT row renderer */}
                {fetchMethod === UrlStatusCheckMethods.IABOT.key
                    ? <>
                        {/*<div className={"url-arch-iari"} onClick={() => { handleSortClick("arch_iari"); } }*/}
                        {/*>{archiveFilterDefs['iari']._.name}</div>*/}
                        <div className={"url-arch_wbm"} onClick={() => { handleSortClick("arch_wbm"); } }
                            >{archiveFilterDefs['iabot']._.name}</div>

                        {/*<div className={"url-arch_tmplt"} onClick={() => { handleSortClick("arch_tmplt"); } }*/}
                        {/*    >{archiveFilterDefs['template']._.name}</div>*/}


                        {/*<div className={"url-iabot_status"}>IABot</div>*/}

                    </>
                    : null }

                <div className={"url-references"} onClick={() => { handleSortClick("references"); } }
                >Citation<br/>Status</div>

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
            {false
                && flockCaption}
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