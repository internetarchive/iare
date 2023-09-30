import React, {useState} from 'react';
import {Tooltip as MyTooltip} from "react-tooltip";
import {UrlStatusCheckMethods} from "../../constants/endpoints";
import {httpStatusCodes, iabotLiveStatusCodes} from "../../constants/httpStatusCodes"

/*
assumes urlArray is an array of url objects wrapped in a data object:
    [
        {
            data: {
                url : <url>,
                status_code : <status_code>,
                <other url info>
            },
            status_code: XXX
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
export default function UrlFlock({ urlArray, urlFilterDef, isLoading, onAction, selectedUrl = '', extraCaption = null, fetchMethod="" }) {

    // const [urlTooltipText, setUrlTooltipText] = useState( '' );
    const [urlTooltipHtml, setUrlTooltipHtml] = useState( '<div>ToolTip<br />second line' );

    const [sort, setSort] = useState({
        sorts: {
            "status": {name: "status", dir: 1},  // dir: 1 is asc, -1 is desc, 0 is do not sort
            "arch_iari": {name: "arch_iari", dir: 1},
            "arch_ia": {name: "arch_ia", dir: 1},
            "arch_tmplt": {name: "arch_tmplt", dir: 1},
        },
        sortOrder: ["status"]
    })

    const handleSortClick = (sortName) => {
        // toggle sort direction of specified sort

        // TODO eventually we need to add sortName to front of sort.sortOrder array

        // <div className={"url-arch-tmplt"} onClick={() => { handleSortClick("arch_tmplt", -1 * sort.sorts['arch_tmplt'].dir); }

        // selectively change the specified sort type
        // https://stackoverflow.com/questions/43638938/updating-an-object-with-setstate-in-react
        setSort(prevState => ({
                // TODO NB: must check if sortName is there already and append to array if not
                sorts: {
                    ...prevState.sorts,
                    [sortName]: {
                        ...prevState.sorts[sortName],
                        dir: -1 * prevState.sorts[sortName].dir
                    }
                },
                sortOrder: [sortName]  // set only one for now...TODO add/move to head of sortOrder array
            }
        ))
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
        if (archiveA < archiveB) return sort.sorts['arch_ia'].dir * -1;
        if (archiveA > archiveB) return sort.sorts['arch_ia'].dir;
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
        else if(sort.sortOrder[0] === "arch_ia") {
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
        } else if (e.target.className === "url-botstat") {
            html = `<div>Entry data from IABot database</div>`
        } else if (e.target.className === "url-arch-iari") {
            html = `<div>Archive found within page URLs</div>`
        } else if (e.target.className === "url-arch-ia") {
            html = `<div>Archive exists in IABot database</div>`
        } else if (e.target.className === "url-arch-tmplt") {
            html = `<div>Archive described in citation template</div>`
        }
        setUrlTooltipHtml(html)
    }

    const onHoverDataRow = e => {
        // show tool tip for appropriate column

        const row = e.target.closest('.url-row')

        // console.log(`onHoverDataRow: ${e.target.className} ${row.dataset.statusCode} ${row.dataset.liveState} ${row.dataset.url} ${row.dataset.archived === "true" ? "archived" : "not archived"}`)

        let html = ''
        if (e.target.className === "url-status") {
            const statusDescription = httpStatusCodes[row.dataset.statusCode]
            html = `<div>${row.dataset.statusCode} : ${statusDescription}</div>`

        } else if (e.target.className === "url-botstat") {
            html = row.dataset.liveState
                ? `<div>${row.dataset.liveState}: ${iabotLiveStatusCodes[row.dataset.liveState]}` +
                `<br/>${row.dataset.archived === "true" ? 'Archived' : 'Not archived'}</div>`
                : ''
        }

        else if (e.target.className === "yes-archive" || e.target.className === "no-archive") {
            if (e.target.parentElement.className === "url-arch-iari") {
                html = `<div>${row.dataset.arch_iari === "true" ? "Archive in page URLs" : "Archive NOT in page URLs"}</div>`
            } else if (e.target.parentElement.className === "url-arch-ia") {
                html = `<div>${row.dataset.arch_ia === "true" ? "Archive in IA database" : "Archive NOT in IA database"}</div>`
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

    let urls, caption;

    if (!urlArray || urlArray.length === 0) {
        caption = <h4>No URLs to show</h4>
        urls = null

    } else {

        // filter the urls if filter defined
        const filteredUrls = urlFilterDef
            ? urlArray.filter( (urlFilterDef.filterFunction)() ) // Note self-calling function
            : urlArray

        // sort if specified
        if (sort.sortOrder?.length > 0) {
            console.log(`sorting urls by: ${sort.sortOrder[0]}`)
            filteredUrls.sort(sortFunction)
        }

        const buttonRemove = urlFilterDef
            ? <button onClick={handleRemoveFilter}
                      className={'utility-button'}
                      style={{position: "relative", top: "-0.1rem"}}
            ><span>Remove Filter</span></button>
            : null

        caption = <>
            <h4>Applied Filter: {urlFilterDef ? urlFilterDef.caption : 'Show All'}</h4>
            <h4 style={{marginTop:".5rem"}}>{filteredUrls.length} {filteredUrls.length === 1
                ? 'URL' : 'URLs'}{buttonRemove}</h4>
            {extraCaption}
        </>

        const getHeaderRow = () => {
            return <div className={"url-list-header"}
                        onClick={onClickHeader}
                        onMouseOver={onHoverHeaderRow} >
                <div className={"url-row url-header-row"}>
                    <div className={"url-name"}>URL</div>
                    <div className={"url-status"} onClick={() => {
                        handleSortClick("status")
                    }
                    }>status</div>

                    {/* TODO this should be within IABOT row renderer */}
                    {fetchMethod === UrlStatusCheckMethods.IABOT.key
                        ? <>
                            <div className={"url-arch-iari"} onClick={() => { handleSortClick("arch_iari"); } }>Arch IARI</div>
                            <div className={"url-arch-ia"} onClick={() => { handleSortClick("arch_ia"); } }>Arch IA</div>
                            <div className={"url-arch-tmplt"} onClick={() => { handleSortClick("arch_tmplt"); } }>Arch Tmplt</div>

                            <div className={"url-botstat"}>IABOT</div>
                            </>
                        : null }
                </div>
            </div>
        }

        // TODO this should be within IABOT row renderer
        const getArchIariStatus = (u => <span className={u.hasArchive ? "yes-archive" : "no-archive" }></span> )
        const getArchIaStatus = (u => <span className={u.searchurldata_archived ? "yes-archive" : "no-archive" }></span> )
        const getArchTmpltStatus = (u => <span className={u.hasTemplateArchive ? "yes-archive" : "no-archive" }></span> )

        // TODO this should be within IABOT row renderer
        const getIabotStatus = (r => {
            if (!r.searchurldata_status) {
                return ''
            }
            // return r.searchurldata_status + (r.searchurldata_archived ? ", A" : ', X') + (!r.searchurldata_hasarchive ? "-" : '')
            return r.searchurldata_status + (r.searchurldata_archived ? ", A" : ', X')
        })

        const getDataRow = (u, i, classes) => {
            return <div className={classes} key={i} data-url={u.url}
                        data-status-code={u.status_code}
                        data-live-state={u.searchurldata_status}
                        data-arch_iari={!!u.hasArchive}
                        data-arch_ia={!!u.searchurldata_archived}
                        data-arch_tmplt={!!u.hasTemplateArchive}
            >
                <div className={"url-name"}>{u.url}</div>
                <div className={"url-status"}>{u.status_code}</div>
                {fetchMethod === UrlStatusCheckMethods.IABOT.key
                    ? <>
                        <div className={"url-arch-iari"}>{getArchIariStatus(u)}</div>
                        <div className={"url-arch-ia"}>{getArchIaStatus(u)}</div>
                        <div className={"url-arch-tmplt"}>{getArchTmpltStatus(u)}</div>

                        <div className={"url-botstat"}>{getIabotStatus(u)}</div>
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
                        <div className={"url-arch-iari"}>?</div>
                        <div className={"url-arch-ia"}>?</div>
                        <div className={"url-arch-tmplt"}>?</div>

                        <div className={"url-botstat"}>---</div>
                        </>
                    : null }
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
            <div className={"url-list"} onClick={handleRowClick} onMouseOver={onHoverDataRow} >
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
            {caption}
            {urls}
        </div>
        {tooltip}
    </>
}