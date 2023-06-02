import React from "react";
import UrlDisplayPdf from "./UrlDisplayPdf.js";
import {URL_FILTER_MAP} from "./filters/urlFilterMaps";

export default function PageData({pageData = {}}) {

    const getLinks = (pageData, linksName) => {
        let links = [];

        if (Array.isArray(pageData[linksName])) {
            links = pageData[linksName].map(l => {
                return l.url
            })
        }

        // uniquify links array
        links = links.filter((value, index, array) => {
            return array.indexOf(value) === index;
        });

        return links;
    }

    const annotationLinks = getLinks(pageData, 'annotation_links');
    const textLinks = getLinks(pageData, 'text_links');
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
    ]

    return <>
        <div className={"page-data"}>
            <div className={"display-content"}>
                <UrlDisplayPdf caption={'URL Links'} flocks={flocks} options={{refresh: pageData.refresh}} filterMap={URL_FILTER_MAP}/>
            </div>
        </div>
    </>
}

