import React from "react";
import PageInfo from "./PageInfo.js";
import PageData from "./PageData.js";
import '../shared/page.css';

export default function PageDisplayV2( { pageData }) {

    return <div className={"iari-v2-wiki"}>
        <PageInfo pageData={pageData} />
        <PageData pageData={pageData} />
    </div>
}

