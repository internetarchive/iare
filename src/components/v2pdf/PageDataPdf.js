import React from "react";
import UrlDisplayPdf from "./UrlDisplayPdf.js";
import {URL_FILTER_MAP} from "./filters/urlFilterMaps";

export default function PageDataPdf({pageData = {}}) {

    const getLinks = (pageData, linksPropertyName) => {
        let links = [];

        // if returns as a URL add that item's url property to the array
        if (Array.isArray(pageData[linksPropertyName])) {
            links = pageData[linksPropertyName].map(l => {
                return l.url
            })
        }

        // uniquify links array
        links = links.filter((value, index, array) => {
            return array.indexOf(value) === index;
        });

        return links;
    }

    // Annotation links will always be available...
    const annotationLinks = getLinks(pageData, 'annotation_links');

    // TODO text links are under construction; using following heuristics for now (2023.06.10)
    const textLinks = pageData.text_links
        ? getLinks(pageData, 'text_links')
        : getLinks(pageData, 'links_from_text_without_linebreaks');
        // choices:
        // links_from_original_text,
        // links_from_text_without_linebreaks,
        // links_from_text_without_spaces,

    const blockLinks = []  // need to fetch these from async thingy, or set with useState, or use only with debug flag

    const flocks = [
        {
            list: annotationLinks,
            label: 'Annotation Links',
            tag: 'A'
        },
        {
            list: textLinks,
            label: 'Content Links',
            tag: 'C'
        },
        {
            list: blockLinks,
            label: 'Block Links',
            tag: 'B'
        },
    ]

    return <>
        <div className={"page-data"}>
            <div className={"display-content"}>
                <UrlDisplayPdf caption={'URL Links'} flocks={flocks} options={{refresh: pageData.forceRefresh}} filterMap={URL_FILTER_MAP}/>
            </div>
        </div>
    </>
}

