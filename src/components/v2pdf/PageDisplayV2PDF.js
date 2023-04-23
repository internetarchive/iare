import React from "react";
import PageInfo from "./PageInfo.js";
import PageData from "./PageData.js";
import './page.css';

export default function PageDisplayV2PDF( { pageData }) {

    return <div className={"iari-v2-pdf"}>
        <PageInfo pageData={pageData} />
        <PageData pageData={pageData} />
    </div>
}

