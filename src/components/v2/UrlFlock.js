import React, {useState} from 'react';
import {Tooltip as MyTooltip} from "react-tooltip";
import {UrlStatusCheckMethods} from "../../constants/endpoints";
import {httpStatusCodes, iabotLiveStatusCodes} from "../../constants/httpStatusCodes"
import {ARCHIVE_STATUS_FILTER_MAP as archiveFilterDefs} from "./filters/urlFilterMaps";
// import {forEach} from "react-bootstrap/ElementChildren";

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
// export default function UrlFlock({ urlArray, urlFilterDef, isLoading, onAction, selectedUrl = '', extraCaption = null, fetchMethod="" }) {
export default function UrlFlock({ urlArray,
                                     urlFilters = {},  // keyed object of filter definitions to apply to urlArray for final url list display
                                     onAction,
                                     selectedUrl = '',
                                     extraCaption = null,
                                     fetchMethod="" }) {

    const [urlTooltipHtml, setUrlTooltipHtml] = useState( '<div>ToolTip<br />second line' );
    // TODO fix tooltip using React.useRef somehow so that re-render is avoided upon every tooltip text/html change

    const [sort, setSort] = useState({
        sorts: {
            "status": {name: "status", dir: 1},  // dir: 1 is asc, -1 is desc, 0 is do not sort
            "arch_iari": {name: "arch_iari", dir: 1},
            "arch_iabot": {name: "arch_iabot", dir: 1},
            "arch_tmplt": {name: "arch_tmplt", dir: 1},
        },
        sortOrder: ["status"]
    })

    const handleSortClick = (sortName) => {
        // toggle sort direction of specified sort

        // TODO eventually we need to add sortName to front of sort.sortOrder array

        // selectively change the specified sort type
        // https://stackoverflow.com/questions/43638938/updating-an-object-with-setstate-in-react
        setSort(prevState => ({
            sorts: {
                ...prevState.sorts,
                [sortName]: {  // TODO NB: must check if sortName is there already and append to array if not
                    ...prevState.sorts[sortName],
                    dir: -1 * prevState.sorts[sortName].dir
                }
            },
            sortOrder: [sortName]  // set only one for now...TODO add/move to head of sortOrder array
        }))
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
        if (archiveA < archiveB) return sort.sorts['arch_iabot'].dir * -1;
        if (archiveA > archiveB) return sort.sorts['arch_iabot'].dir;
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

    const sortFunction = (a,b) => {
        // TODO make this recursive to do all sorts defined in sort.sortOrder array
        if(sort.sortOrder[0] === "status") {
            return sortByStatus(a,b)
        }
        else if(sort.sortOrder[0] === "arch_iari") {
            return sortByArchIari(a,b)
        }
        else if(sort.sortOrder[0] === "arch_iabot") {
            return sortByArchIa(a,b)
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
        const url = e.target.closest('.url-row').getAttribute('data-url');

        // send action back up the component tree to filter the references list
        onAction( {
            "action": "setUrlReferenceFilter",
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

    const onHoverHeaderRow = (e) => {
        let html = ''
        if (e.target.className === "url-status") {
            html = `<div>HTTP status code of primary URL</div>`

        } else if (e.target.className === "url-arch-iari") {
            html = `<div>Archive found within set of<br/>URLs returned from IARI</div>`
        } else if (e.target.className === "url-arch-ia") {
            html = `<div>Archive exists in IABot database</div>`
        } else if (e.target.className === "url-arch-tmplt") {
            html = `<div>Archive found in archive_url<br/>parameter of citation template</div>`

        } else if (e.target.className === "url-iabot-status") {
            html = `<div>URL status reported by IABot</div>`
        }
        setUrlTooltipHtml(html)
    }

    const onHoverDataRow = e => {
        // show tool tip for appropriate column

        const row = e.target.closest('.url-row')

        let html = ''
        
        if (e.target.className === "url-status") {
            // status code column
            const statusDescription = httpStatusCodes[row.dataset.status_code]
            html = `<div>${row.dataset.status_code} : ${statusDescription}</div>`

        } else if (e.target.className === "url-iabot-status") {
            // IABot info column
            html = row.dataset.live_state
                ? `<div>${row.dataset.live_state}: ${iabotLiveStatusCodes[row.dataset.live_state]}` +
                `<br/>${row.dataset.arch_iabot === "true" ? 'Archived' : 'Not archived'}</div>`
                : ''
        }

        else if (e.target.className === "archive-yes" || e.target.className === "archive-no") {
            // target is any of the archive status columns

            if (e.target.parentElement.className === "url-arch-iari") {
                html = `<div>${row.dataset.arch_iari === "true" ? "Archive in page URLs" : "Archive NOT in page URLs"}</div>`

            } else if (e.target.parentElement.className === "url-arch-ia") {
                html = `<div>${row.dataset.arch_iabot === "true" ? "Archive in IABot database" : "Archive NOT in IABot database"}</div>`

            } else if (e.target.parentElement.className === "url-arch-tmplt") {
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

    let urls, flockCaption;

    if (!urlArray || urlArray.length === 0) {
        flockCaption = <h4>No URLs to show</h4>
        urls = null

    } else {

        if (!urlFilters) urlFilters = {}  // prevent null errors
        // TODO what to do if urlFilters not a keyed object of UrlFilter's? Can we make it a custom type (of UrlFilters)?

        // initialize the urls as the full provided array
        let filteredUrls = urlArray

        // we apply any specified filters successively, while at the same time aggregating the filter captions
        // into the filterCaptions array. This uses a side effect of the .map() function.
        let filterCaptions = Object.keys(urlFilters)
            .filter(key => urlFilters[key].filterFunction )  // exclude null filters
            .map( filterName => {  // apply non-null filters and append filter caption
                const f = urlFilters[filterName]
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
                    return urlFilters[filterName].caption
                }
            })

        // temporarily fixes bug where urlFilters is being set to an array with a singkle elment of another empoty array.
        // it has something to do with the empty Archive Status state setting the urlFilters when it shouldn't
        if (filterCaptions.length === 1 && filterCaptions[0].length === 0) {
            filterCaptions = ''
        }

        // sort if specified
        if (sort.sortOrder?.length > 0) {
            console.log(`sorting urls by: ${sort.sortOrder[0]}`)
            filteredUrls.sort(sortFunction)
        }

        // show Remove Filter button ONLY IF there are any filters applied
        const buttonRemove = filterCaptions.length > 0
            ? <button onClick={handleRemoveFilter}
                      className={'utility-button'}
                      style={{position: "relative", top: "-0.1rem"}}
            ><span>Remove Filter</span></button>
            : null


        flockCaption = <>
            <h4><span className={"filter-title"}>Applied Filter:</span> {
                filterCaptions.length > 0 ? filterCaptions : 'Show All' }</h4>
            <h4 style={{marginTop:".5rem"}}>{filteredUrls.length} {filteredUrls.length === 1
                ? 'URL' : 'URLs'}{buttonRemove}</h4>
            {extraCaption}
        </>

        // TODO this should be within IABOT row renderer
        // const getArchIariStatus = (u => <span className={u.hasArchive ? "archive-yes" : "archive-no" }></span> )
        const getArchIaStatus = (u => <span className={u.searchurldata_archived ? "archive-yes" : "archive-no" }></span> )
        const getArchTmpltStatus = (u => <span className={u.hasTemplateArchive ? "archive-yes" : "archive-no" }></span> )

        // TODO this should be within IABOT row renderer
        const getIabotStatus = (u => {
            if (!u.searchurldata_status) {
                return ''
            }
            // return r.searchurldata_status + (r.searchurldata_archived ? ", A" : ', X') + (!r.searchurldata_hasarchive ? "-" : '')
            return u.searchurldata_status + (u.searchurldata_archived ? ", A" : ', X')
        })

        const getDataRow = (u, i, classes) => {
            return <div className={classes} key={i} data-url={u.url}
                        data-status_code={u.status_code}
                        data-live_state={u.searchurldata_status}
                        data-arch_iari={!!u.hasArchive}
                        data-arch_iabot={!!u.searchurldata_archived}
                        data-arch_tmplt={!!u.hasTemplateArchive}
            >
                <div className={"url-name"}>{u.url}</div>
                <div className={"url-status"}>{u.status_code}</div>
                {fetchMethod === UrlStatusCheckMethods.IABOT.key
                    ? <>
                        <div className={"url-arch-ia"}>{getArchIaStatus(u)}</div>
                        <div className={"url-arch-tmplt"}>{getArchTmpltStatus(u)}</div>

                        <div className={"url-iabot-status"}>{getIabotStatus(u)}</div>
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
                        <div className={"url-arch-ia"}>?</div>
                        <div className={"url-arch-tmplt"}>?</div>

                        <div className={"url-iabot-status"}>---</div>
                        </>
                    : null }
            </div>
        }

        const getHeaderRow = () => {

            return <div
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
                            <div className={"url-arch-ia"} >Archive</div>
                            <div className={"url-arch-tmplt"}>&nbsp;</div>

                            <div className={"url-iabot-status"}>&nbsp;</div>
                        </>
                        : null }
                </div>

                {/* second header row - contains column labels */}
                <div className={"url-row url-header-row"}>
                    <div className={"url-name"}>URL</div>
                    <div className={"url-status"} onClick={() => {
                        handleSortClick("status")
                    }
                    }>status</div>

                    {/* TODO this should be within IABOT row renderer */}
                    {fetchMethod === UrlStatusCheckMethods.IABOT.key
                        ? <>
                            {/*<div className={"url-arch-iari"} onClick={() => { handleSortClick("arch_iari"); } }*/}
                            {/*>{archiveFilterDefs['iari']._.name}</div>*/}
                            <div className={"url-arch-ia"} onClick={() => { handleSortClick("arch_iabot"); } }
                            >{archiveFilterDefs['iabot']._.name}</div>
                            <div className={"url-arch-tmplt"} onClick={() => { handleSortClick("arch_tmplt"); } }
                            >{archiveFilterDefs['template']._.name}</div>

                            <div className={"url-iabot-status"}>IABot</div>
                        </>
                    : null }
                </div>

            </div>
        }


        // iterate over array of url objects to create rendered output
        const rows = filteredUrls.map((u, i) => {

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

        urls = <>
            {/* TODO do something akin to "myMethodRenderer.getHeaderRow" */}
            {getHeaderRow()}
            <div className={"url-list"}
                 onClick={handleRowClick}
                 onMouseOver={onHoverDataRow}
            >
                {rows}
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

    return <>
        <div className={"url-flock"}
             data-tooltip-id="my-url-tooltip"
             // data-tooltip-content={urlTooltipText}
             data-tooltip-html={urlTooltipHtml}
            >
            {flockCaption}
            {urls}
        </div>
        {tooltip}
    </>
}