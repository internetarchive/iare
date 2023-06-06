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

    // const textLinks = getLinks(pageData, 'text_links');
    // const textLinksFromOriginal = getLinks(pageData, 'links_from_original_text');
    // const textLinksFromOmitLinebreaks = getLinks(pageData, 'links_from_text_without_linebreaks');
    // const textLinksFromOmitSpaces = getLinks(pageData, 'links_from_text_without_spaces');

    const textLinks = pageData.text_links
        ? getLinks(pageData, 'text_links')
        : getLinks(pageData, 'links_from_text_without_linebreaks');

    /*
    "links_from_original_text": links_from_original_text,
    "links_from_text_without_linebreaks": links_from_text_without_linebreaks,
    "links_from_text_without_spaces": links_from_text_without_spaces,
     */
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
        // {
        //     list: textLinksFromOriginal,
        //     label: 'Links from Original Text',
        //     tag: 'O'
        // },
        // {
        //     list: textLinksFromOmitLinebreaks,
        //     label: 'Links from Original Text without Linebreaks',
        //     tag: 'L'
        // },
        // {
        //     list: textLinksFromOmitSpaces,
        //     label: 'Links from Original Text without Spaces',
        //     tag: 'S'
        // },
    ]

    return <>
        <div className={"page-data"}>
            <div className={"display-content"}>
                <UrlDisplayPdf caption={'URL Links'} flocks={flocks} options={{refresh: pageData.refresh}} filterMap={URL_FILTER_MAP}/>
            </div>
        </div>
    </>
}

