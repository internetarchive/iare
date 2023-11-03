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
    // TODO maybe should not use memo here

    const [urlTooltipHtml, setUrlTooltipHtml] = useState( '<div>ToolTip<br />second line' );
    // TODO fix tooltip using React.useRef somehow so that re-render is avoided upon every tooltip text/html change

    const [sort, setSort] = useState({
        sorts: {
            "status": {name: "status", dir: 1},  // dir: 1 is asc, -1 is desc, 0 is do not sort
            "arch_iari": {name: "arch_iari", dir: 1},
            "arch_wbm": {name: "arch_wbm", dir: -1},
            "arch_tmplt": {name: "arch_tmplt", dir: 1},
            "references": {name: "references", dir: -1},
            "templates": {name: "templates", dir: -1},
            "sections": {name: "sections", dir: -1},
        },
        sortOrder: ["status"]
    })

    const handleSortClick = (sortKey) => {
        // toggle sort direction of specified sort

        // TODO eventually we need to add sortName to front of sort.sortOrder array

        // selectively change the specified sort type
        // https://stackoverflow.com/questions/43638938/updating-an-object-with-setstate-in-react
        setSort(prevState => {
            if (!(prevState.sorts[sortKey])) {
                prevState.sorts[sortKey] = { name: sortKey, dir: 1}
            }
            return {
                sorts: {
                    ...prevState.sorts,
                    [sortKey]: {  // TODO NB: must check if sortName is there already and append to array if not
                        ...prevState.sorts[sortKey],
                        dir: -1 * prevState.sorts[sortKey].dir
                    }
                },
                sortOrder: [sortKey]  // set only one for now...TODO add/move to head of sortOrder array
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

    const sortByArchIa = (a,b) => {
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

        // respect sortDir
        if (statusA < statusB) return sort.sorts['references'].dir * -1;
        if (statusA > statusB) return sort.sorts['references'].dir;
        return 0;
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
        else if(sort.sortOrder[0] === "arch_iari") {
            return sortByArchIari(a,b)
        }
        else if(sort.sortOrder[0] === "arch_wbm") {
            return sortByArchIa(a,b)
        }
        else if(sort.sortOrder[0] === "arch_tmplt") {
            return sortByArchTmlpt(a,b)
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
        else {
            return 0  //
        }
    }

    const handleRowClick = (e) => {
        // get the url from the data of the row associated with the clicked element
        const url = e.target.closest('.url-row').getAttribute('data-url');

        // send action back up the component tree to filter the references list
                        // onAction( {
                        //     "action": "setUrlReferenceFilter",
                        //     "value": url,
                        // })
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

        let html = ''

        if (e.target.className === "url-status") {
            html = `<div>HTTP status code of primary URL</div>`

        } else if (e.target.className === "url-arch-iari") {
            html = `<div>Archive found within set of<br/>URLs returned from IARI</div>`

        } else if (e.target.className === "url-arch_wbm") {
            html = `<div>Archive exists in IABot database</div>`

        } else if (e.target.className === "url-arch_tmplt") {
            html = `<div>Archive found in archive_url<br/>parameter of citation template</div>`

        } else if (e.target.className === "url-iabot_status") {
            html = `<div>URL status reported by IABot</div>`

        } else if (e.target.className === "url-references") {
            html = `<div>URL status as indicated by citation template ("url-status" parameter)</div>`

        } else if (e.target.className === "url-sections") {
            html = `<div>Section in Wikipedia article where reference originated</div>`

        }

        setUrlTooltipHtml(html)
    }

    const onHoverDataRow = e => {
        // show tool tip for appropriate column
        e.stopPropagation()


                    // const row = e.target.closest('.url-row')
                    // const classNames = row.className ? row.className.split(" ") : []
                    //
                    // let html = ''
                    //
                    // if (classNames.includes("url-status")) {
                    //     // status code column
                    //     const statusDescription = httpStatusCodes[row.dataset.status_code]
                    //     html = `<div>${row.dataset.status_code} : ${statusDescription}</div>`
                    //
                    // } else if (classNames.includes("url-iabot_status")) {
                    //     // IABot info column
                    //     html = row.dataset.live_state
                    //         ? `<div>${row.dataset.live_state}: ${iabotLiveStatusCodes[row.dataset.live_state]}` +
                    //         `<br/>${row.dataset.arch_wbm === "true" ? 'Archived' : 'Not archived'}</div>`
                    //         : ''
                    // } else if (classNames.includes("url-references")) {
                    //     // References info column
                    //     html = 'Link status as indicated in template'
                    //
                    // } else if (classNames.includes("url-templates")) {
                    //     // Template info column
                    //     html = 'Template names used in this reference'
                    //
                    // } else if (classNames.includes("url-sections")) {
                    //     // Template info column
                    //     html = 'Section in Wikipedia article where reference originated'
                    //
                    // } else if (classNames.includes("archive-yes") || classNames.includes("archive-no")) {
                    //     // target is any of the archive status columns
                    //
                    //     if (e.target.parentElement.className === "url-arch-iari") {
                    //         html = `<div>${row.dataset.arch_iari === "true" ? "Archive in page URLs" : "Archive NOT in page URLs"}</div>`
                    //
                    //     } else if (e.target.parentElement.className === "url-arch_wbm") {
                    //         html = `<div>${row.dataset.arch_wbm === "true" ? "Archive in IABot database" : "Archive NOT in IABot database"}</div>`
                    //
                    //     } else if (e.target.parentElement.className === "url-arch_tmplt") {
                    //         html = `<div>${row.dataset.arch_tmplt === "true" ? "Archive supplied in citation template" : "Archive NOT supplied in citation template"}</div>`
                    //     }
                    // }

        const row = e.target.closest('.url-row')

        let html = ''

        console.log(`parent className: ${e.target.parentElement.className}`)
        /*
        e.target.parentElement.className === url-list if in "space" of row
if parentclass includes url-row, then use className of self
if parentClass is url-list, we are probably on aborder, so igbnore
otherwise, get the className of parent as comparison
         */
        if (e.target.className === "url-status") {
            // status code column
            const statusDescription = httpStatusCodes[row.dataset.status_code]
            html = `<div>${row.dataset.status_code} : ${statusDescription}</div>`

        } else if (e.target.className === "url-iabot_status") {
            // IABot info column
            html = row.dataset.live_state
                ? `<div>${row.dataset.live_state}: ${iabotLiveStatusCodes[row.dataset.live_state]}` +
                `<br/>${row.dataset.arch_wbm === "true" ? 'Archived' : 'Not archived'}</div>`
                : ''
        } else if (e.target.className === "url-references") {
            // References info column
            html = 'Link status as indicated in template'

        } else if (e.target.className === "url-templates") {
            // Template info column
            html = 'Template names used in this reference'

        } else if (e.target.className === "url-sections") {
            // Template info column
            html = 'Section in Wikipedia article where reference originated'

        } else if (e.target.className === "archive-yes" || e.target.className === "archive-no") {
            // target is any of the archive status columns

            if (e.target.parentElement.className === "url-arch-iari") {
                html = `<div>${row.dataset.arch_iari === "true" ? "Archive in page URLs" : "Archive NOT in page URLs"}</div>`

            } else if (e.target.parentElement.className === "url-arch_wbm") {
                html = `<div>${row.dataset.arch_wbm === "true" ? "Archive in IABot database" : "Archive NOT in IABot database"}</div>`

            } else if (e.target.parentElement.className === "url-arch_tmplt") {
                html = `<div>${row.dataset.arch_tmplt === "true" ? "Archive supplied in citation template" : "Archive NOT supplied in citation template"}</div>`
            }
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

        // // TODO this should be within a passed in a "IABOT row renderer"
        // const getIabotStatus = (u => {
        //     if (!u.searchurldata_status) {
        //         return ''
        //     }
        //     // return r.searchurldata_status + (r.searchurldata_archived ? ", A" : ', X') + (!r.searchurldata_hasarchive ? "-" : '')
        //     return u.searchurldata_status + (u.searchurldata_archived ? ", A" : ', X')
        // })

        const getReferenceInfo = (u => {
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
                    s = (s === 'root'?'Lead':s)
                    return <div key={i}>{s}</div>
                })
        })

        const getDataRow = (u, i, classes) => {
            return <div className={classes} key={i} data-url={u.url}
                        data-status_code={u.status_code}
                        data-live_state={u.searchurldata_status}
                        data-arch_iari={!!u.hasArchive}
                        data-arch_wbm={!!u.searchurldata_archived}
                        data-arch_tmplt={!!u.hasTemplateArchive}
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

                        <div className={"url-references"}>{getReferenceInfo(u)}</div>
                        <div className={"url-templates"}>{getTemplateInfo(u)}</div>
                        <div className={"url-sections"}>{getSectionInfo(u)}</div>

                    </>
                    : null }

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

                        <div className={"url-references"}>&nbsp;</div>
                        <div className={"url-templates"}>&nbsp;</div>
                        <div className={"url-sections"}>&nbsp;</div>

                    </>
                    : null }
            </div>
        }

        const enableShowAllButton = Object.keys(flockFilters).length > 0
            && flockFilters[Object.keys(flockFilters)[0]]
            && flockFilters[Object.keys(flockFilters)[0]]['name'] !== 'all'
                // make sure filter definition is not null
                // and that this is not the "all" filter,
                // in which case we disable the "Show All" button
        const buttonRemove = <button
            // className={`utility-button small-button${enableShowAllButton ?'':' disabled'}` }
            className={`utility-button small-button${enableShowAllButton ?'':' disabled'}` }
                onClick={handleRemoveFilter}
                disabled={!enableShowAllButton}
                // className={'utility-button button-remove-url-filter'}
            ><span>{localized['show_all_button_text']}</span></button>

        const buttonCopy = <button className={'btn utility-button small-button'} onClick={handleCopyClick} ><span>Copy to Clipboard</span></button>

        const flockCaption = <>

            <h4 className={"url-flock-caption"}>{filteredUrls.length.toString() + ' ' + (filteredUrls.length === 1 ? 'URL' : 'URLs')
            }</h4>{buttonRemove}

            <h4><span className={"filter-title"}
            >{`Applied Filter${filterCaptions.length === 1 ? '' : 's'}:`}<
            /span> {
                filterCaptions.length > 0 ? filterCaptions : 'Show All' }</h4>

            {extraCaption}
        </>


        const flockMetaHeader = <div className={"url-list-meta-header"}>

            <div>
                <h4 className={"url-flock-caption"}>{filteredUrls.length.toString() + ' ' + (filteredUrls.length === 1 ? 'URL' : 'URLs')
                }</h4>{buttonCopy}

                {/*<h4><span className={"filter-title"}*/}
                {/*>{`Applied Filter${filterCaptions.length === 1 ? '' : 's'}:`}<*/}
                {/*/span> {*/}
                {/*    filterCaptions.length > 0 ? filterCaptions : 'Show All' }</h4>*/}
                {/*53 URls  (copy to clipboard)*/}
            </div>

            <div>{buttonRemove}</div>
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
                        {/*<div className={"url-arch-iari"}>&nbsp;</div>*/}
                        {/*<div className={"url-arch_wbm"} >Archive</div>*/}
                        <div className={"url-arch_wbm"} >&nbsp;</div>
                        <div className={"url-arch_tmplt"}>&nbsp;</div>

                        <div className={"url-iabot_status"}>&nbsp;</div>
                        <div className={"url-references"}>&nbsp;</div>
                        <div className={"url-templates"}>&nbsp;</div>
                        <div className={"url-sections"}>&nbsp;</div>
                    </>
                    : null }
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

                        <div className={"url-references"} onClick={() => { handleSortClick("references"); } }
                        >Citation<br/>Status</div>

                        <div className={"url-templates"} onClick={() => { handleSortClick("templates"); } }
                        >Template<br/>Type</div>

                        <div className={"url-sections"} onClick={() => { handleSortClick("sections"); } }
                        >Origin<br/>Section</div>

                    </>
                    : null }
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