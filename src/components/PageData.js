import React from "react";
import ArrayDisplay from './ArrayDisplay.js';
import RefData from './RefData.js';
import PageOverview from "./PageOverview.js";

// eslint-disable-next-line
const regexVersion1 = new RegExp("\/v1\/");
// eslint-disable-next-line
const regexVersion2 = new RegExp("\/v2\/");

function parseVersion( pageData, fileName ) {
    if (!fileName) return "unknown";
    if (regexVersion1.test(fileName))
        return "v1"
    else if (regexVersion2.test(fileName))
        return "v2"
    else
        return "unknown";
}

export default function PageData( { pageData, fileName}) {

    const jsonVersion = parseVersion(pageData, fileName);
    console.log("PageData called, fileName:", fileName, ", version: ", jsonVersion, ", pageData:", pageData ? "valid" : "not valid");

    const info = [
        {'endpoint' : fileName },
        {'WARI Json version' : jsonVersion },
    ].concat(pageData ?
        [ // valid pageData
            {'wari_id' : pageData.wari_id },
            {'site' : pageData.site },
            {'title' : pageData.title },
            {'page id': pageData.page_id},
            {'timestamp': new Date(pageData.timestamp * 1000).toString()}, // times 1000 b/c of milliseconds
            {'lang': pageData.lang},
            {'has refs': pageData.references ? ( pageData.references.length ? "YES" : "NO" ) : "NO"},
            {'timing': pageData["timing"]},
        ]
        : [ // pageData is falsey: null, blank, empty, etc.
            {'wari_id' : "N/A" },
            {'site': "N/A"},
            {'title': "N/A"},
            {'page id': "N/A"},
            {'timestamp': "N/A"},
            {'lang': "N/A"},
            {'has refs': "N/A"},
            {'timing': "N/A"},
        ])
    ;

    return <>
        <div className="page-data">
            <h3>Page Data</h3>
            <ArrayDisplay arr = {info} styleObj={{marginBottom: "1em"}} />
        </div>

        <PageOverview pageData={pageData} version={jsonVersion} />

        <RefData pageData={pageData} version={jsonVersion}/>

    </>
}

