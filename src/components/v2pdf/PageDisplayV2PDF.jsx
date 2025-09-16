import React from "react";
import PageInfo from "./PageInfo.jsx";
import PageDataPdf from "./PageDataPdf.jsx";
import '../css/page.css';

export default function PageDisplayV2PDF( { pageData }) {

    return <div className={"iari-v2-pdf"}>
        <PageInfo pageData={pageData} />
        <PageDataPdf pageData={pageData} />
    </div>
}

