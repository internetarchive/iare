import React from "react";
import ArrayDisplay from './ArrayDisplay.js';

/*
expected props:
    pageName
    pageData

 */
function PageData( { pageData, fileName}) {

    const dataArray = pageData
        ? [ // valid pageData
            {'site' : pageData.site },
            {'title' : pageData.title },
            {'page id' : pageData.page_id},
            {'timestamp' : new Date(pageData.timestamp * 1000).toString() },
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
        ]
    ;

    // append page name to data array, regardless of page success
    dataArray.unshift({'page name': fileName});

    return <div className="j-view-page-info">
        <h3>Page Data:</h3>
        <ArrayDisplay arr = {dataArray} />
    </div>
}

export default PageData;
