/* definitions of url list column headers */
import type {ColumnDef, RenderRole} from "../components/flock/flockTypes";
import {renderRoles} from "../components/flock/renderRoles";
import MakeLink from "../components/MakeLink";
import * as React from "react";

import {formatNumberWithLocale, getNormalizedCount, getPrettyCount, trimifyNumber} from "../utils/generalUtils";
import {httpStatusCodes} from "./httpStatusCodes";

import imgScoreLogo from "../images/columns/wikisignals.logo.v1r4.png";
import imgWaybackLogo from "../images/columns/badge.logo.wayback.small.png";
import imgWikiLogo from "../images/columns/badge.logo.wiki.png"
import imgSimPLLLogo from "../images/columns/simppl.logo.full.v2r4.png"
import imgTrancoLogo from '../images/columns/badge.logo.tranco.png'

type ColumnRegistry = {
    specs: Record<string, any>
    columns: Record<string, ColumnDef>;
};

const msgClickForMore = "*Click to explore more...*"
const STR_BADVALUE = "!"
const STR_MISSING_DATA = "∅"  // \u25FB"
const URL_IABOT_EXPLORER = "https://tss.toolforge.org/?house=activity&group=es_iabot_wayback&metrics=iabot_wayback&grain=year&display=grid"
const URL_TRANCO_EXPLORER = "https://tranco-list.eu/tranco-list/"
const URL_MBFC_EXPLORER = "https://mbfc.toolforge.org/"
const STR_UNREACHABLE_URL_OBJ = "Unreachable URL object"
const STR_NA = "N/A"

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
            // renderCell: (urlObj: Object) => {
            //     return urlObj.url
            // },
            renderCell: (urlObj?: Record<string, any>, renderRole?: RenderRole) => {
                if (!urlObj) return null;
                if (renderRole === renderRoles.refviewCell || renderRole?.className === "refview-data-cell") {
                    return <MakeLink href={urlObj.url} />;
                }
                return urlObj.url;
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

Year is first capture of domain in Wayback Machine.

Time span is years between first capture and last capture.

Longer times do not necessarily imply more reliable sources.

${msgClickForMore}`,

            popMarkup:
                `##### Wayback Machine History


First line is year of first capture of domain in Wayback Machine.

Second Line is span between first capture and last capture of domain, in years.

Longer times do not necessarily imply more reliable sources.

Click here for the [Wayback Machine](https://web.archive.org).`,

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
                    <span>Timespan: {ia_span} years</span><br/>
                    <span>Captures: {ia_count}</span>
                </>
            },

            renderCell: (urlObj: Object) => {

                const meta = urlObj.signal_data?.signals?.meta
                if (!meta) return STR_MISSING_DATA  // NB ttCell also indicates no meta data

                const count = getNormalizedCount(meta["ws_wbm_total"])
                const dateWaybackFirst = meta["ws_wbm_first"] ? new Date(meta["ws_wbm_first"]) : null
                const dateWaybackLast = meta["ws_wbm_last"] ? new Date(meta["ws_wbm_last"]) : null
                // const displayWaybackFirst = dateWaybackFirst ? dateWaybackFirst?.toISOString().slice(0, 7) : 'N/A'
                const displayWaybackFirst = dateWaybackFirst ? dateWaybackFirst?.toISOString().slice(0, 4) : 'N/A'

                if (count < 0 || dateWaybackFirst === null || dateWaybackLast === null) {  // getNormalizedCount returns -1 if NaN
                    return <div>{STR_BADVALUE}</div>  // ttCell returns message also
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

        },  // end wayback entry











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
                const domain = urlObj.url
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


        },  // end enwiki entry









        "tranco": {
            key: "tranco",

            caption: <>Tranco<br/>Rating</>,
            label: "Tranco Ranking",

            logo: imgTrancoLogo,
            logoAlt: "Tranco Ranking",

            sortable: true,
            sortFunction: (a, b, dir: number = 1) => {
                const trancoA = a?.signal_data?.signals?.meta
                    ? a.signal_data?.signals?.meta["ws_web_rank"] ?? 0
                    : -1
                const trancoB = b?.signal_data?.signals?.meta
                    ? b.signal_data?.signals?.meta["ws_web_rank"] ?? 0
                    : -1

                // if (trancoA > trancoB) return dir * -1;
                // if (trancoA < trancoB) return dir;
                // return 0;
                return (trancoA - trancoB) * dir;
            },


            ttMarkup: `##### Tranco Ranking
            
Tranco is a stable, research-oriented ranking of the world’s most popular websites.
        
${msgClickForMore}`,

            popMarkup: `##### Tranco Ranking
            
A research-oriented ranking of the most popular websites,
designed to be stable, reproducible, and resistant to manipulation.

Currently the ranking is derived from five providers: 
Cisco Umbrella, Majestic, Farsight, the Chrome User Experience Report (CrUX), and
Cloudflare Radar.
        
See the [Tranco website](https://tranco-list.eu) for more details.)`,


            ttCell: (dataset, urlDict) => {
                // show Tranco number in full form, for now

                const url = dataset.url
                const urlObj = urlDict[url]

                if (!urlObj) return STR_UNREACHABLE_URL_OBJ

                const meta = urlObj.signal_data?.signals?.meta
                if (!meta) return "No Tranco signal data"
                // TODO: change this to urlObj.signal_data.tranco

                const tranco_number = getNormalizedCount(meta["ws_web_rank"]);
                if (tranco_number < 0) {  // -1 means not undefined or otherwise not provided
                    return "Missing Tranco data"
                }
                const tranco_log_fixed = Math.log10(tranco_number).toFixed(1)
                return <>
                    <span>Tranco number: {formatNumberWithLocale(tranco_number)}</span><br/>
                    <span>Log10: {tranco_log_fixed}</span><br/>
                </>
            },

            renderCell: (urlObj: Object) => {
                if (!urlObj) return STR_UNREACHABLE_URL_OBJ

                const meta = urlObj.signal_data?.signals?.meta
                if (!meta) return STR_MISSING_DATA
                // TODO: change this to use urlObj.signal_data.tranco when available

                const tranco_number = getNormalizedCount(meta["ws_web_rank"]);
                if (tranco_number < 0) {  // -1 means not undefined or otherwise not provided
                    return STR_MISSING_DATA
                }
                return Math.log10(tranco_number).toFixed(1)
            },

        },  // end tranco entry







        "simppl": {
            key: "simppl",

            caption: <>SimPPL<br/>Rating</>,
            label: "SimPPL Rating",

            logo: imgSimPLLLogo,
            logoAlt: "SimPPL Rating",

            sortable: true,
            sortFunction: (a, b, dir: number = 1) => {
                return 0;  // no reason for any judgement right yet...
            },

            ttMarkup: `##### SimPPL Rating

*Description of SimPPL forthcoming.*

${msgClickForMore}`,

            popMarkup: `##### SimPPL Rating
        
*Description of SimPPL forthcoming.*

See the [SimPPL website](https://www.simppl.org/) for more details.)`,

//             popMarkup: `##### SimPPL Rating
//
// Measures a website's ...
//
// Values range from ...
//
// A (good) SimPPL rank means a site is . . .
// . . . doesn't necessarily mean the site is ...
//
// See the [SimPPL website](https://www.simppl.org/) for more details.)`,

            ttCell: (dataset, urlDict) => {
                // shows any thing SimPPL provides for rating.
                // could just be a launching pad to details, esp. if deemed "bad"...

                const url = dataset.url
                const urlObj = urlDict[url]

                // grab simppl ratings...
                // this is from urlObj.signal_data.simppl

                if (!urlObj) return STR_UNREACHABLE_URL_OBJ

                const simppl = urlObj.signal_data?.simppl
                if (!simppl) return "No SimPPL signal data"

                // return <>
                //     <span>SimPPL: {formatNumberWithLocale(simPPL_number)}</span><br/>
                //     <span>Log10: {simPPL_log_fixed}</span><br/>
                // </>
                return `SimPPL:

*not yet*
`},

            renderCell: (urlObj: Object) => {
                if (!urlObj) return STR_UNREACHABLE_URL_OBJ

                const simppl = urlObj.signal_data?.simppl
                if (!simppl) return STR_MISSING_DATA

                return "SIMPPL"
            },





        },  // end simPPL entry


        /* do these still:

           .mbfc.key,

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
