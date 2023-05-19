import React from "react";
import UrlDisplay from "../shared/UrlDisplay.js";
import {URL_FILTER_MAP} from "./filters/urlFilterMaps";

export default function PageData({pageData = {}}) {

    /* for links property, try:
          pageData.links, or
          pageData.annotation_links

    if either exists, it should be an array of objects:

    [
        {
            url: <abd,def>,
            page: 23
        }, ...
    ]

    which is parsed into a simple array of url strings which is passed to UrlDisplay component

    */

    let links = [];

    if (Array.isArray(pageData.links)) {
        links = pageData.links.map(l => {
            return l.url
        })
    } else if (Array.isArray(pageData.annotation_links)) {
        links = pageData.annotation_links.map(l => {
            return l.url
        })
    }

    if (!links.length) {
        return <>
            <div className={"page-data"}>
                <p>No links found.</p>
            </div>
        </>
    }

    // uniquify links array
    links = links.filter((value, index, array) => {
        return array.indexOf(value) === index;
    });

    // and uniquify the links array...
    links = links.filter( (value, index, array) => {
        return array.indexOf(value) === index;
    });

    return <>
        <div className={"page-data"}>
            <UrlDisplay urlFlock={links} options={{refresh: pageData.refresh}} filterMap={URL_FILTER_MAP}/>
        </div>
    </>
}

