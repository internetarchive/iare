import React from "react";
import PageDisplayV2 from "./v2/PageDisplayV2";

export default function PageDisplay( { pageData }) {

    if (!pageData) return <p>No page data</p>;

    if (pageData.version === "v2") return <PageDisplayV2 pageData={pageData} />;

    return <h3>Unsupported version {pageData.version}.</h3>

}

