import React from 'react';

/*
assumes urls is an array of url data objects with:
    url : <url>
    status_code : <status_code>
    (and maybe data property)
 */
export default function Urls( { urlArray, filter } ) {

    let urlDisplay = [];
    if (!urlArray || urlArray.length === 0) {
        urlDisplay = <p>No urls to show!</p>;
    }
    else {
        const filteredUrls = filter ? urlArray.filter( (filter.filterFunction)() ) : urlArray;

        // iterate over array of url objects
        const rows = filteredUrls.map((u, i) => {

            return <div className={`url-row ${u.data.status_code === 0 
                ? "url-is-unknown" : ""} ${u.data.status_code >= 300 && u.data.status_code < 400 
                ? "url-is-redirect" : ""} ${u.data.status_code >= 400 && u.data.status_code < 500
                ? "url-is-notfound" : ""} ${u.data.status_code >= 500 && u.data.status_code < 600
                ? "url-is-error" : ""}`} key={i}>
                <div className={"url-name"}><a href={u.data.url} target={"_blank"} rel={"noreferrer"} key={i}>{u.data.url}</a></div>
                <div className={"url-status"}>{u.data.status_code}</div>
            </div>

        } )

        const label = filteredUrls.length === urlArray.length
            ? `All URLs - ${urlArray.length}`
            : `${filter ? filter.caption : "No Filter"} - count: ${filteredUrls.length}`;

        urlDisplay = <>
            <h4 style={{color:"grey"}}>{label}</h4>
            <div className={"url-display"}>
                <div className={"url-row"}>
                    <div className={"url-name"}>url</div>
                    <div className={"url-status"}>status</div>
                </div>
                {rows}
            </div>
        </>
    }

    return <>
        <div className={"urls"}>
            <h3>URLs</h3>
            {urlDisplay}
        </div>
    </>
}