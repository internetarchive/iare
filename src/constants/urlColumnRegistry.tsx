/* definitions of url list column headers */
import type {ColumnDef} from "../components/flock/flockTypes";
import * as React from "react";

import {formatNumberWithLocale, getNormalizedCount, getPrettyCount, trimifyNumber} from "../utils/generalUtils";

// import ScoreBadge from "./badges/ScoreBadge.jsx";
import imgScoreLogo from "../images/columns/wikisignals.logo.v1r4.png";
import imgWaybackLogo from "../images/columns/badge.logo.wayback.small.png";
import imgWikiLogo from "../images/columns/badge.logo.wiki.png"
import {httpStatusCodes} from "./httpStatusCodes";

// import imgScoreLogo from "./images/wikisignals.logo.v1r4.png"
// import imgTrancoLogo from './images/badge.logo.tranco.png'
// import imgMbfcLogo from "./images/badge.logo.mbfc.png";

type ColumnRegistry = {
    columns: Record<string, ColumnDef>;
    specs: Record<string, any>
};

const msgClickForMore = "*Click to explore more...*"
const STR_BADVALUE = "!"
const URL_IABOT_EXPLORER = "https://tss.toolforge.org/?house=activity&group=es_iabot_wayback&metrics=iabot_wayback&grain=year&display=grid"
const URL_TRANCO_EXPLORER = "https://tranco-list.eu/tranco-list/"
const URL_MBFC_EXPLORER = "https://mbfc.toolforge.org/"

export const urlColumnRegistry: ColumnRegistry = {
    specs: {  // TODO rename to "defaults"
        defaultColumnWidth: "3.5rem"
    },

    columns: {

        "url_name": {
            key: "url_name",

            caption: <><br/>URL Link</>,
            label: "URL Link",
            width: "minmax(11.5rem, 22rem)",

            ttMarkup:
`##### Citation URL Link

URL of Citation Source.

${msgClickForMore}`,

            popMarkup:
`##### Citation URL Link

URL of Citation Source.

Click on row to open Reference Detail view.`,

            ttCell: (dataset) => <div>Link Text of URL</div>,
            renderCell: (urlObj: Object) => {
                return urlObj.url
            },

            sortable: true,
            sortFunction: (a, b, dir) => {
                if (a.url > b.url) return dir * -1
                if (a.url < b.url) return dir;
                return 0;
            },

            // logo?: string;      // path to logo
            // logoAlt?: string;   // alt text for image

        },


        "live_status": {  // NB leaning towards using this one for now...
            key: "live_status",

            caption: <>Live<br/>Status</>,
            label: "HTTP Status Code of URL",

            ttMarkup:
`##### HTTP Status Code of URL

Most recent status when querying.

Uses LiveWebCheck from Wayback machine.

${msgClickForMore}`,

            popMarkup:
`##### HTTP Status code

Live status of URL as of last check.

Uses LiveWebCheck from Wayback machine.

Click on row to open Reference Detail view.`,

            ttCell: (dataset) => {
                const statusDesc = httpStatusCodes[dataset.status_code] || "Unknown status";
                return <div>{dataset.status_code} : {statusDesc}</div>;
            },
            renderCell: (urlObj: Object) => {
                return urlObj.status_code
            },

            sortable: true,
            sortFunction: (a, b, dir) => {
                const statusA = a && a.status_code !== undefined ? a.status_code : -1;
                const statusB = b && b.status_code !== undefined ? b.status_code : -1;
                if (statusA > statusB) return dir * -1;
                if (statusA < statusB) return dir;
                return 0;
            },

            // logo?: string;      // path to logo
            // logoAlt?: string;   // alt text for image

        },


        "archive_status": {
            key: "archive_status",

            caption: <>Archive<br/>Status</>,
            label: "Archive Status of URL",

            // storedFunctions: {
            //     functions repeatable for this column def
            // },

            ttMarkup:
`##### Archive Status

This is a Book Reference, or,

Archive Status in IABot database

${msgClickForMore}`,

            popMarkup:
`##### Archive Status

Archive exists in IABot database

Click [here](${URL_IABOT_EXPLORER}) to 
[explore IABot database](${URL_IABOT_EXPLORER}).`,

            ttCell: (dataset, urlDict) => {

                const url = dataset.url
                const urlObj = urlDict[url]

                if (!urlObj) return "Unreachable URL object"

                const displayArchive = urlObj.isBook
                    ? "This is a book"
                    : urlObj.archive_status?.hasArchive
                        ? "This link is archived."
                        : "This link is NOT archived."
                return <span>{displayArchive}</span>
            },

            renderCell: (urlObj: Object) => {
                return <span className=
                                 {urlObj.isBook
                                     ? "archive-book"
                                     : urlObj.archive_status?.hasArchive
                                         ? "archive-yes"
                                         : "archive-no"}
                ></span>


            },

            sortable: true,
            sortFunction: (a, b, dir) => {
                const archiveA = a?.archive_status?.hasArchive ? 1 : 0;
                const archiveB = b?.archive_status?.hasArchive ? 1 : 0;
                const bookA = a?.isBook ? 1 : 0;
                const bookB = b?.isBook ? 1 : 0;

                // sort by book status first, respect sortDir
                // NB: ignoring book type (e.g. google or archive.org) for now
                if (bookA) return dir * -1
                if (bookB) return dir

                // if neither a or b is a book, sort by archive status, respect sortDir
                if (archiveA > archiveB) return dir * -1;
                if (archiveA < archiveB) return dir;
                return 0;
            },

            // logo?: string;      // path to logo
            // logoAlt?: string;   // alt text for image

        },




        "ws_score": {
            key: "ws_score",

            caption: <>WikiSignals<br/>Score</>,
            label: "WikiSignals Score",

            ttMarkup:
`##### WikiSignals Score

A website reliability estimate (0.0 – 1.0).

A higher score is better, with 1.0 being the highest possible.

${msgClickForMore}`,

            popMarkup: `
##### WikiSignals Score

A website reliability estimate (0.0 – 1.0) based on evaluations by ratings agencies and other credibility indicators.

A higher score is better, with 1.0 being the highest possible score.

See [WikiSignals.org](https://wikisignals.org) for more details.`,

            ttCell: (dataset, urlDict) => {
                // return JSON.stringify(dataset)
                // // tooltip when hover over data cell
                //

                const url = dataset.url
                const urlObj = urlDict[url]

                if (!urlObj) return "Unreachable URL object"

                const meta = urlObj.signal_data?.signals?.meta
                if (!meta) return "No Wayback signal data"

                const score = parseFloat(urlObj.signal_data?.signals?.meta?.ws_score) || null;
                const scoreDisplay = typeof score === "number"
                    ? score.toFixed(2).replace(/^0+/, '')
                    : 'N/A'

                return <>
                    <span>WikiSignals: {scoreDisplay} out of 1</span><br/>
                    <span>Analysis: {"TBD"}</span>
                </>
            },

            renderCell: (urlObj: Object) => {

                const value = parseFloat(urlObj.signal_data?.signals?.meta?.ws_score) || "-";
                return <div>{typeof value === "number"
                    ? value.toFixed(2).replace(/^0+/, '')
                    : ''}</div>
            },

            sortable: true,
            sortFunction: (a, b, dir: number = 1) => {
                const signalA = a?.signal_data?.signals?.meta
                    ? a?.signal_data?.signals?.meta?.ws_score ?? 0
                    : -1
                const signalB = b?.signal_data?.signals?.meta
                    ? b?.signal_data?.signals?.meta?.ws_score ?? 0
                    : -1

                if (signalA > signalB) return dir * -1;
                if (signalA < signalB) return dir;
                return 0;
            },

            logo: imgScoreLogo,
            logoAlt: "WikiSignals",

        },


        "wayback": {
            key: "wayback",

            caption: <>Wayback<br/>Machine</>,
            label: "Wayback Machine History",

            ttMarkup:
`##### Wayback Machine History

Display is Year of first capture of domain in Wayback Machine.

Time span is years between first capture and last capture.

Longer times do not necessarily imply more reliable sources.

${msgClickForMore}`,

            popMarkup:
`##### Wayback Machine History


Display is Year of first capture of domain in Wayback Machine.

Time span is years between first capture and last capture.

Longer times do not necessarily imply more reliable sources.

See See [Wayback Machine](https://web.archive.org).`,

            ttCell: (dataset, urlDict) => {
                // return JSON.stringify(dataset)
                // // tooltip when hover over data cell
                //

                const url = dataset.url
                const urlObj = urlDict[url]

                if (!urlObj) return "Unreachable URL object"

                const meta = urlObj.signal_data?.signals?.meta
                if (!meta) return "No Wayback signal data"

                // const ia_count = trimifyNumber(getNormalizedCount(meta["ws_wbm_total"]))
                const ia_count = formatNumberWithLocale(getNormalizedCount(meta["ws_wbm_total"]))
                const dateWaybackFirst = meta["ws_wbm_first"] ? new Date(meta["ws_wbm_first"]) : null
                const dateWaybackLast = meta["ws_wbm_last"] ? new Date(meta["ws_wbm_last"]) : null
                const ia_first = dateWaybackFirst ? dateWaybackFirst?.toISOString().slice(0, 4) : 'N/A'
                const ia_span = ((dateWaybackLast - dateWaybackFirst) /
                        (1000 * 60 * 60 * 24 * 365)).toFixed(1)

                return <>
                    <span>First archive: {ia_first}</span><br/>
                    <span>Timespan: {ia_span}y</span><br/>
                    <span>Captures: {ia_count}</span>
                </>
            },

            renderCell: (urlObj: Object) => {

                const badValue = "!"

                const meta = urlObj.signal_data?.signals?.meta
                if (!meta) return "--"  // TODO make ttCell also indicate no meta data

                const count = getNormalizedCount(meta["ws_wbm_total"])
                const dateWaybackFirst = meta["ws_wbm_first"] ? new Date(meta["ws_wbm_first"]) : null
                const dateWaybackLast = meta["ws_wbm_last"] ? new Date(meta["ws_wbm_last"]) : null
                // const displayWaybackFirst = dateWaybackFirst ? dateWaybackFirst?.toISOString().slice(0, 7) : 'N/A'
                const displayWaybackFirst = dateWaybackFirst ? dateWaybackFirst?.toISOString().slice(0, 4) : 'N/A'

                if (count < 0 || dateWaybackFirst === null || dateWaybackLast === null) {  // getNormalizedCount returns -1 if NaN
                    return <div>{badValue}</div>  // ttCell returns message also
                } else {
                    return <>
                        <span>{displayWaybackFirst}</span><br/>
                        <span>{((dateWaybackLast - dateWaybackFirst) /
                            (1000 * 60 * 60 * 24 * 365)).toFixed(1)}y</span>
                    </>
                }
            },


            sortable: true,
            sortFunction: (a, b, dir: number = 1) => {
                const aMeta = a?.signal_data?.signals?.meta
                const bMeta = b?.signal_data?.signals?.meta

                const aFirst = aMeta ? aMeta["ws_wbm_first"] : 0
                const aLast = aMeta ? aMeta["ws_wbm_last"] : 0

                const bFirst = bMeta ? bMeta["ws_wbm_first"] : 0
                const bLast = bMeta ? bMeta["ws_wbm_last"] : 0

                // signalA and signalB is length of time
                const signalA = new Date(aLast) - new Date(aFirst)
                const signalB = new Date(bLast) - new Date(bFirst)

                if (signalA > signalB) return dir * -1;
                if (signalA < signalB) return dir;

                return 0;
            },

            logo: imgWaybackLogo,
            logoAlt: "Wayback Legacy",

        },


        "enwiki": {
            key: "enwiki",

            label: "Wikipedia Usage",
            caption: <>Wikipedia<br/>Usage</>,

            logo: imgWikiLogo,
            logoAlt: "Wikipedia",

            ttMarkup:
`##### English Wikipedia Usage
 
The number of times the domain appeared in links within English Wikipedia (English) articles\
         (including the Citations, References, Notes and External Links sections).

${msgClickForMore}`,

            popMarkup:
`##### English Wikipedia Usage
 
The number of times the domain appeared in links within English Wikipedia (English) articles\

Links are extracted from the Citations, References, Notes and External Links sections.

See [Wikipedia.org](Wikipedia.org)`,

            ttCell: (dataset) => {  // tooltip when hover data cell
                return <div>UNDER CONSTRUCTION<br/>#times here</div>
            },

            renderCell: (urlObj: Object) => {
                /*

                                try {
                                    const meta = signals?.meta || {}
                                    // const wikiCount = trimifyNumber(meta["ws_wiki_cite_en"] ?? 0)
                                    const count = getPrettyCount(meta["ws_wiki_cite_en"]);
                                    badgeData = {"wikicount": count}

                                    if (count < 0) {  // -1 means not provided
                                        badgeText = <div>{noDataProvidedText}</div>
                                        badgeClass += " missing-value"
                                    } else {
                                        // badgeText = <div>{`Wiki Count: ${count}`}</div>
                                        badgeText = <div>{`${count}`}</div>
                                    }
                */
                const count = getPrettyCount(meta["ws_wiki_cite_en"]);

                return <div>{count}</div>
            },


            sortable: true,
            sortFunction: (a, b, dir: number = 1) => {
                const signalA = a?.signal_data?.signals?.meta
                    ? a?.signal_data?.signals?.meta?.ws_wiki_cite_en ?? 0
                    : -1
                const signalB = b?.signal_data?.signals?.meta
                    ? b?.signal_data?.signals?.meta?.ws_wiki_cite_en ?? 0
                    : -1

                if (signalA > signalB) return dir * -1;
                if (signalA < signalB) return columnSort.sorts['signal_enwiki']?.dir;
                return 0;

            },


        },

        "domain": {
            key: "domain",

            label: "Domain",
            caption: <>Domain</>,

            logo: null,
            logoAlt: "Domain",

            ttMarkup:
`##### Domain
 
The domain of the url link.

${msgClickForMore}`,

            popMarkup:
`##### Domain

The domain of the url link.

*maybe other things to go to regrarding this domain...*
*domain intensity on wikipedia, for instance*`,

            ttCell: (dataset) => {
                // tooltip when hover data cell
                return <div>what goes here???</div>
            },

            renderCell: (urlObj: Object) => {
                /*

                                try {
                                    const meta = signals?.meta || {}
                                    // const wikiCount = trimifyNumber(meta["ws_wiki_cite_en"] ?? 0)
                                    const count = getPrettyCount(meta["ws_wiki_cite_en"]);
                                    badgeData = {"wikicount": count}

                                    if (count < 0) {  // -1 means not provided
                                        badgeText = <div>{noDataProvidedText}</div>
                                        badgeClass += " missing-value"
                                    } else {
                                        // badgeText = <div>{`Wiki Count: ${count}`}</div>
                                        badgeText = <div>{`${count}`}</div>
                                    }
                */
                const domain =  urlObj.url
                return <div>{count}</div>
            },


            sortable: true,
            sortFunction: (a, b, dir: number = 1) => {
                const signalA = a?.signal_data?.signals?.meta
                    ? a?.signal_data?.signals?.meta?.ws_wiki_cite_en ?? 0
                    : -1
                const signalB = b?.signal_data?.signals?.meta
                    ? b?.signal_data?.signals?.meta?.ws_wiki_cite_en ?? 0
                    : -1

                if (signalA > signalB) return dir * -1;
                if (signalA < signalB) return columnSort.sorts['signal_enwiki']?.dir;
                return 0;

            },


        },

        /* do these still:

           .mbfc.key,
           .tranco.key,

         */

    },
}

//         "actionable": {
//             colCaption: <>Action<br/>Items</>,
//             colClass: "actionable",
//
//             sortable: true,
//
//             ttCaption: `Actions that can be taken to improve citation`,
//             ttMarkup: `##### Actionable
// Action can be taken to improve citation`,
//             ttData: `<div>Actions that can be taken to improve citation</div>`,
//             popMarkup: `
// ##### Actionable
//
// When actionable, places have been identified that could use improvement.
//
// Click row to open details for Citation Reference link.
// `,
//         },
//
//
// // Extract actionable information from URLs and render corresponding components.
// const getActionableInfo = (u => {
//     return !u.actionable
//         ? null
//         : u.actionable.map((key, i) => {
//             return <div className={"yes-actionable"} key={i}>
//                 <span className={"icon-area"}></span>
//             </div>
//         })
// })
