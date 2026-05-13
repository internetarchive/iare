// PageDisplay
/*

redirects to appropriate page display component based on pageData.mediaType

 */
//
import React from "react";
import {KNOWN_MEDIA_TYPES} from "../constants/knownMediaTypes.jsx";
import PageDisplayV2 from "./pages/v2/PageDisplayV2.jsx";
import PageDisplayV2PDF from "./pages/v2pdf/PageDisplayV2PDF.jsx";
import PageDisplayGrok from "./pages/vGrok/PageDisplayGrok.jsx";


// uses React.memo to prevent unnecessary re-renders
//
// /* from chatGPT */
// const MyComponent = React.memo(({ debug }) => {
//     // Your component code here
// });
// export default MyComponent;


const PageDisplay = React.memo( ({ pageData }) => {

    console.log(`PageDisplay (${pageData ? pageData.version + ' ' + pageData.mediaType : 'null'})`)
    let messageNoData;

    messageNoData = `Please enter a URL and click "Load References"`;

    if (!pageData) return <p className={'text-primary'}>{messageNoData}</p>

    if (pageData.version === "v2") {

        if (pageData.mediaType === KNOWN_MEDIA_TYPES.WIKI.key)
            // WIKI gets "normal" V2 display; enwiki assumed.
            return <PageDisplayV2 pageData={pageData} />;

        if (pageData.mediaType === KNOWN_MEDIA_TYPES.PDF.key)
            // PDF gets V2PDFtreatment...needs work!
            return <PageDisplayV2PDF pageData={pageData} />;

        if (pageData.mediaType === KNOWN_MEDIA_TYPES.GROK.key)
            // GROK displays according to known Grok standards
            // NB NOTA BENE!! This is currently not in sync with latest grok parsing (i.e their markup) standards
            return <PageDisplayGrok pageData={pageData} />;

    }

    // else we do not support this version
    return <h3>Unsupported version/media type: {pageData.version}/{pageData.mediaType}.</h3>

})

export default PageDisplay;
