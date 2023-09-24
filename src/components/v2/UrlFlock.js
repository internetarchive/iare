import React, { useState } from 'react';
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

    const [urlTooltipText, setUrlTooltipText] = useState( '' );
    const [urlTooltipHtml, setUrlTooltipHtml] = useState( '<div>ToolTip<br />second line' );

    // const [sort, setSort] = useState("status");
    const sort = "status";
    const [sortDir, setSortDir] = useState(true);

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
                    //
                    // const onHover = (evt) => {
                    //     // console.log("FldFlock: onHover")
                    // }
                    //
    const onHoverHeader = (evt) => {
        // console.log("FldFlock: onHoverHeader")
        // toggle show of Show All button
        setUrlTooltipText('');
    }
                    //
                    // const onClickShowAll = (evt) => {
                    // }

    const handleErrorRowHover = e => {
        const text = e.currentTarget.getAttribute('data-err-text');
        // console.log("handleRowHover", text)
        setUrlTooltipText(text);
    }

    const handleRowMouseOver = e => {
        const row = e.target.closest('.url-row')

        console.log(`handleRowMouseOver: ${e.target.className} ${row.dataset.statusCode} ${row.dataset.liveState} ${row.dataset.url} ${row.dataset.archived === "true" ? "archived" : "not archived"}`)

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

        setUrlTooltipHtml(html)
    }


    let urls, caption;

    if (!urlArray || urlArray.length === 0) {
        caption = <h4>No URLs to show</h4>
        urls = null

    } else {

        // filter the urls if filter defined
        const filteredUrls = urlFilterDef
            ? urlArray.filter( (urlFilterDef.filterFunction)() ) // Note self-calling function
            : urlArray;

        // sort if specified
        if (sort === "status") {
            filteredUrls.sort((a,b) => {
                // use status code of -1 if there was a problem with status code
                const statusA = a.data && a.data.status_code !== undefined ? a.data.status_code : -1;
                const statusB = b.data && b.data.status_code !== undefined ? b.data.status_code : -1;

                // respect sortDir
                if (statusA < statusB) return sortDir ? -1 : 1;
                if (statusA > statusB) return sortDir ? 1 : -1;
                return 0;
            })
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

        const getRowsHeader = () => {
            return <div className={"url-list-header"}
                        onClick={onClickHeader}
                        onMouseOver={onHoverHeader} >
                <div className={"url-row url-header-row"}>
                    <div className={"url-name"}>URL</div>
                    <div className={"url-status"} onClick={() => {
                        setSortDir(!sortDir);
                    }
                    }>status</div>
                    {fetchMethod === UrlStatusCheckMethods.IABOT.key
                        ? <div className={"url-botstat"}>IABOT</div>
                        : null }
                </div>
            </div>

        }

        const displayRowIabotStatus = (r => {
            if (!r.status_searchurldata) {
                return ''
            }
            // return r.status_searchurldata + (r.status_searchurldata_archived ? ", A" : ', X') + (!r.status_searchurldata_hasarchive ? "-" : '')
            return r.status_searchurldata + (r.status_searchurldata_archived ? ", A" : ', X')
        })

        const getRowData = (u, i, classes) => {
            return <div className={classes} key={i} data-url={u.data.url}
                        data-status-code={u.data.status_code}
                        data-live-state={u.data.status_searchurldata}
                        data-archived={u.data.status_searchurldata_archived} >
                <div className={"url-name"}>{u.data.url}</div>
                <div className={"url-status"}>{u.data.status_code}</div>
                {fetchMethod === UrlStatusCheckMethods.IABOT.key
                    ? <div className={"url-botstat"}>{displayRowIabotStatus(u.data)}</div>
                    : null }

            </div>

        }

        const getRowError = (u, i, errText) => {
            return <div className={`url-row url-row-error`} key={i}
                        data-url={u.data.url}
                        data-err-text={errText}
                // onMouseOverCapture={handleRowHover}>
                        onMouseOver={handleErrorRowHover}
                        onMouseLeave={() => setUrlTooltipText('')}
            >
                <div className={"url-name"}>{u.data.url ? u.data.url : `ERROR: No url for index ${i}`}</div>
                <div className={"url-status"}>{-1}</div>
                {fetchMethod === UrlStatusCheckMethods.IABOT.key
                    ? <div className={"url-botstat"}>---</div>
                    : null }
            </div>
        }

        // iterate over array of url objects to create rendered output
        const rows = filteredUrls.map((u, i) => {

            // TODO: we should sanitize earlier on in the process to save time here...

            // if url object is problematic...
            if (!u.data || u.data.url === undefined || u.data.status_code === undefined) {

                const errText = !u.data ? `URL data not defined for index ${i}`
                    : !u.data.url ? `URL missing for index ${i}`
                    : u.data.status_code === undefined ? `URL status code undefined (try Force Refresh)`
                    : 'Unknown error'; // this last case should not happen

                return getRowError(u, i, errText)
            }

            // otherwise show "normally"
            const classes = 'url-row '
                + (u.data.status_code === 0 ? ' url-is-unknown'
                    : u.data.status_code >= 300 && u.data.status_code < 400 ? ' url-is-redirect'
                    : u.data.status_code >= 400 && u.data.status_code < 500 ? ' url-is-notfound'
                    : u.data.status_code >= 500 && u.data.status_code < 600 ? ' url-is-error'
                    : '')
                + (u.data.url === selectedUrl ? ' url-selected' : '')

            return getRowData(u, i, classes)

        } )

        urls = <>
            {getRowsHeader()}
            <div className={"url-list"} onClick={handleRowClick} onMouseOver={handleRowMouseOver} >
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
             data-tooltip-content={urlTooltipText}
             data-tooltip-html={urlTooltipHtml}
            >
            {caption}
            {urls}
            {tooltip}
        </div>
    </>
}