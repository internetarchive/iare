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
        // traverse links objects, appending urls when found
        Object.keys(pageData.links).every( key => {
            if (pageData.links[key].length > 0) {
                links.push.apply(links, pageData.links[key]);
            }
            return true; // continue with every
        })
    }

    return <>
        <div className={"page-data"}>
            <UrlDisplay urlFlock={links} options={{refresh:pageData.refresh}} filterMap={URL_FILTER_MAP}/>
        </div>
    </>
}

