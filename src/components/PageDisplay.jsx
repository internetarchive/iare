import React from "react";
// import "../constants/mediaTypes.jsx"
import {MEDIA_TYPES} from "../constants/mediaTypes.jsx";
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
    const message = 'Please enter a URL and click "Load References"'

    if (!pageData) return <p className={'text-primary'}>{message}</p>

    if (pageData.version === "v2") {

        if (pageData.mediaType === MEDIA_TYPES.WIKI.key)
            // "wiki")
            return <PageDisplayV2 pageData={pageData} />;

        if (pageData.mediaType === MEDIA_TYPES.PDF.key)
            return <PageDisplayV2PDF pageData={pageData} />;

        if (pageData.mediaType === MEDIA_TYPES.GROK.key)
            return <PageDisplayGrok pageData={pageData} />;

    }

    return <h3>Unsupported version/media type: {pageData.version}/{pageData.mediaType}.</h3>

})

export default PageDisplay;
