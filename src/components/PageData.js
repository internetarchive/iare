import React from "react";
import ArrayDisplay from './ArrayDisplay.js';
import RefData from './RefData.js';

const regexVersion1 = new RegExp("\/v1\/");

function parseVersion( pageData, fileName ) {
    if (!fileName) return "unknown";
    console.log("parse: fileName is" + fileName);
    if (regexVersion1.test(fileName))
        return "v1"
    else
        return "unknown";
}


/*
expected props:
    pageName
    pageData

 */
function PageData( { pageData, fileName}) {

    const jsonVersion = parseVersion(pageData, fileName);

    const metaInfoArray = [ // pageData
        {'endpoint' : fileName },
        {'WARI Json version' : jsonVersion },
    ];

    const pageInfoArray = metaInfoArray.concat(
        pageData ? [ // valid pageData
            {'site' : pageData.site },
            {'title' : pageData.title },
            {'page id' : pageData.page_id},
            {'timestamp' : new Date(pageData.timestamp * 1000).toString() }, // times 1000 b/c of milliseconds
            {'lang' : pageData.lang},
            {'has refs' : pageData.has_references ? "YES" : "NO" },
            {'timing' : pageData["timing"] },
        ]
        : [ // pageData is falsey: null, blank, empty, etc.
            {'site' : "N/A" },
            {'title' : "N/A" },
            {'page id' : "N/A"},
            {'timestamp' : "N/A" },
            {'lang' : "N/A"},
            {'has refs' : "N/A" },
            {'timing' : "N/A" },
        ])
    ;

    return <>
        <div className="j-view-page-info">
        <h3>Page Info:</h3>
            <ArrayDisplay arr = {pageInfoArray} styleObj={{marginBottom: "1em"}} />
        </div>
        <div>
            <RefData refData={pageData ? pageData.references : null} />
        </div>
    </>
}

export default PageData;
