import React from "react";
import PageDisplayV2 from "./v2/PageDisplayV2";
import PageDisplayV2PDF from "./v2pdf/PageDisplayV2PDF";

// uses React.memo to prevent unnecessary re-renders
//
// /* from chatGPT */
// const MyComponent = React.memo(({ debug }) => {
//     // Your component code here
// });
// export default MyComponent;


const PageDisplay = React.memo( ({ pageData }) => {
    console.log(`PageDisplay (${pageData ? pageData.version + ' ' + pageData.mediaType : 'null'})`)
    const message = 'Please enter a URL and click "Load References"';

    if (!pageData) return <p style={{marginTop: ".5rem"}} className={'text-primary'}>{message}</p>;

    if (pageData.version === "v2") {
        if (pageData.mediaType === "wiki")
            return <PageDisplayV2 pageData={pageData} />;
        if (pageData.mediaType === "pdf")
            return <PageDisplayV2PDF pageData={pageData} />;
    }

    return <h3>Unsupported version/media type {pageData.version}/{pageData.mediaType}.</h3>

})

export default PageDisplay;
