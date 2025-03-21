import React from "react";
import PageInfo from "./PageInfo.jsx";
import PageData from "./PageData.jsx";
import '../shared/page.css';

export default function PageDisplayV2( { pageData }) {

    return <div className={"iari-v2-wiki"}>
        <PageInfo pageData={pageData} />
        <PageData rawPageData={pageData} />
    </div>
}

