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

        /* pageData.links is array of objects:

        [
            {
                url: <abd,def>,
                page: 23
            }
        ]

        we parse that into a simple array of surl strings andpas that to the UrlDisplay component

        */

        links = pageData.links.map( l => {
            return l.url
        })

    } else {
        // deprecated format
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

