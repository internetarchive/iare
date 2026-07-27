/* definitions of url list column headers */
import type {ColumnDef} from "../components/flock/flockTypes";
import * as React from "react";

import {getNormalizedCount} from "../utils/generalUtils";

// import ScoreBadge from "./badges/ScoreBadge.jsx";
import imgScoreLogo from "../images/columns/wikisignals.logo.v1r4.png";
import imgWaybackLogo from "../images/columns/badge.logo.wayback.small.png";
// import imgWaybackLogo from "./images/badge.logo.wayback.small.png"

// import imgScoreLogo from "./images/wikisignals.logo.v1r4.png"
// import imgTrancoLogo from './images/badge.logo.tranco.png'
// import imgMbfcLogo from "./images/badge.logo.mbfc.png";
// import imgEnwikiLogo from "./images/badge.logo.w

type ColumnRegistry = {
    columns: Record<string, ColumnDef>;
    specs: Record<string, any>
};


export const urlColumnRegistry: ColumnRegistry = {
    specs: {  // TODO rename to "defaults"
        defaultColumnWidth: "3.5rem"
    },

    columns: {

        "url_name": {
            key: "url_name",

            caption: <><br/>URL Link</>,
            label: "URL Link",
            width: "11.5rem",

            ttMarkup:
`##### Citation URL Link

URL of Citation Source.`,

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

Uses LiveWebCheck from Wayback machine.`,

            popMarkup:
`##### HTTP Status code

Live status of URL as of last check.

Uses LiveWebCheck from Wayback machine.

Click on row to open Reference Detail view.`,

            ttCell: (dataset) => {
                return <div>{dataset.status_code} : {dataset.status_desc}</div>
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

            ttMarkup:
`##### Archive Status

Archive exists in IABot database`,

            popMarkup:
`##### Archive Status

Archive exists in IABot database

Click here for IABot database.`,

            ttCell: (dataset) => {
                return <div>{dataset.status_code} : {dataset.status_desc}</div>
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

        "ws_score": {
            key: "ws_score",

            caption: <>WikiSignals<br/>Score</>,
            label: "WikiSignals Score",

            ttMarkup:
`##### WikiSignals Score

*Click to know more...*`,

            popMarkup: `
##### WikiSignals Score

A website reliability estimate (0.0 – 1.0) based on evaluations by ratings agencies and other credibility indicators.

A higher score is better, with 1.0 being the highest possible score.

See [WikiSignals.org](https://wikisignals.org) for more details.`,

            ttCell: (dataset) => {  // tooltip when hover data cell
                return <div>UNDER CONSTRUCTION<br/>{dataset.ws_score} : {dataset.ws_score_analysis}</div>
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

Number shows time span between first capture and last capture.

Longer times does not necessarily mean more reliable.`,

            popMarkup:
`##### Wayback Machine History

Number shows time span between first capture and last capture.

Longer times does not necessarily mean more reliable.

See See [Wayback Machine](https://web.archive.org).`,

            ttCell: (dataset) => {  // tooltip when hover data cell
                return <div>UNDER CONSTRUCTION<br/>{dataset.ws_score} : {dataset.ws_score_analysis}</div>
            },
            renderCell: (urlObj: Object) => {

                const badValue = "!"

                let data = ""
                const meta = urlObj.signal_data?.signals?.meta
                if (!meta) return "--"  // TODO make ttCell also indicate no meta data

                const count = getNormalizedCount(meta["ws_wbm_total"]);
                const wayback_first = meta["ws_wbm_first"] ?? 'N/A';
                const wayback_last = meta["ws_wbm_last"] ?? 'N/A';

                if (count < 0) {  // getNormalizedCount returns -1 if NaN
                    return <div>{badValue}</div>  // ttCell returns message also
                } else {
                    return <>
                        <span>{((new Date(wayback_last) - new Date(wayback_first)) /
                            (1000 * 60 * 60 * 24 * 365)).toFixed(1)} y</span>
                    </>
                }
                ///if (count < 0) className += " missing-value"

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

    },
};

