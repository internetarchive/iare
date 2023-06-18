import React from "react";
import PageInfo from "./PageInfo.js";
import PageDataPdf from "./PageDataPdf.js";
import '../shared/page.css';

export default function PageDisplayV2PDF( { pageData }) {

    return <div className={"iari-v2-pdf"}>
        <PageInfo pageData={pageData} />
        <PageDataPdf pageData={pageData} />
    </div>
}

