import React from "react";
import UrlDisplay from "../shared/UrlDisplay.js";
import {URL_FILTER_MAP} from "./filters/urlFilterMaps";

export default function PageData( { pageData = {} }) {

    // use pageData.links
    //
    //  or
    //
    // extract links from pageData.links { <objects with links array> }.

    let links=[];
    if (Array.isArray(pageData.links)) {
        links = pageData.links
    } else {
        // traverse object keys
        Object.keys(pageData.links).map( key => {
            // assumes pageData.links[key] is an array of links, or none
            if (pageData.links[key].length > 0) {
                links.push.apply(links, pageData.links[key]);
            }
        })
    }

    return <>
        <div className={"page-data"}>
            <UrlDisplay urlFlock={links} options={{refresh:pageData.refresh}} filterMap={URL_FILTER_MAP}/>
        </div>
    </>
}

