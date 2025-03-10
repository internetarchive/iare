import React, { useState } from 'react';

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
export default function UrlFlockPdf({ urlArray, urlFilterDef, originFilterDef, isLoading, onAction }) {

    // const [sort, setSort] = useState("status");
    const sort = "status";
    const [sortDir, setSortDir] = useState(true);
    const [sortOriginDir, setSortOriginDir] = useState(true);

    // const [selectedUrl, setSelectedUrl] = useState('' ); // selected url in list

    // const onClick = (evt) => {
    //     const url = evt.target.parentNode.dataset["url"];
    //     onAction( {
    //         "action": "setUrlFilter",
    //         "value": url,
    //     })
    //     setSelectedUrl(url)
    // }

    const onClickHeader = (evt) => {
    }

    const onHoverHeader = (evt) => {
        // console.log("FldFlock: onHoverHeader")
        // toggle show of Show All button
    }

    let urls = [];

    if (!urlArray || !urlArray.length) { // urlArray is not a valid array
        urls = <p>URL array is invalid.</p>;
    }

    else {
        // filter the urls if filter defined
        let filteredUrls = urlFilterDef
            ? urlArray.filter( (urlFilterDef.filterFunction)() )
            : urlArray;

        // filter by origin if specified
        if (originFilterDef) {
            filteredUrls = filteredUrls.filter( (originFilterDef.filterFunction)() )
        }

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

        // iterate over array of url objects to create rendered output

        const label = <div>{filteredUrls.length} URLs: {urlFilterDef ? urlFilterDef.caption : "No Status Filter"}
            <br />{originFilterDef ? originFilterDef.caption : ''}
        </div>

        function displayUrl(url, errorCode, errorText) {
            if (errorCode === -1) {
                return <div className={"url-name"}>{url}<br />Error: {errorText}</div>
            }
            return <div className={"url-name"}><a href={url} target={"_blank"} rel={"noreferrer"} >{url}</a></div>
        }

        urls = <>
            <h4 className={'list-header'}>{label}</h4>

            <div className={"url-list-header"} onClick={onClickHeader} onMouseOver={onHoverHeader} >
                <div className={"url-row url-header-row"}>
                    <div className={"url-name"}>URL</div>
                    <div className={"url-source"} onClick={() => { setSortOriginDir(!sortOriginDir);}
                    }>origin</div>
                    <div className={"url-status"} onClick={() => { setSortDir(!sortDir);}
                    }>status</div>
                </div>
            </div>

            <div className={"url-list"}>

                {filteredUrls.map((u, i) => {

                    // TODO: we should sanitize earlier on in the process to save time here...

                    // if url object is problematic...
                    if (!u.data || u.data.url === undefined || u.data.status_code === undefined)
                        return <div className={`url-row url-row-error`} key={i}>
                            <div className={"url-name"}>{u.data.url ? u.data.url : `ERROR: No url for index ${i}`}</div>
                            <div className={"url-source"}>{'error'}</div>
                            <div className={"url-status"}>{-111}</div>
                        </div>;

                    // else show with styling for url status type
                    const rowClass = `url-row ${u.data.status_code <= 0 
                        ? "url-is-unknown" : ""} ${u.data.status_code >= 300 && u.data.status_code < 400
                        ? "url-is-redirect" : ""} ${u.data.status_code >= 400 && u.data.status_code < 500
                        ? "url-is-notfound" : ""} ${u.data.status_code >= 500 && u.data.status_code < 600
                        ? "url-is-error" : ""}`

                    const url = u.data.url
                    return <div className={rowClass} key={i}>
                        {displayUrl(url, u.data.error_code, u.data.error_text)}
                        {/*<div className={"url-name"}><a href={url} target={"_blank"} rel={"noreferrer"} >{url}</a></div>*/}
                        {/*<div className={"url-name"}><a href={u.data.url} target={"_blank"} rel={"noreferrer"} key={i}>{u.data.url}</a></div>*/}
                        <div className={"url-source"}>{u.data.tags.join(', ')}</div>
                        <div className={"url-status"}>{u.data.status_code}</div>
                    </div>

                } )}
            </div>
        </>
    }

    return <>
        <div className={"url-flock"}>
            {urls}
        </div>
    </>
}