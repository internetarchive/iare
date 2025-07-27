import React from "react";
import PageInfo from "./PageInfo.jsx";
import PageData from "./PageData.jsx";
import '../shared/page.css';

export default function PageDisplayV2( { pageData }) {

    return <div className={"iari-v2-wiki iare-ux-container"}>
        <div className={"iare-ux-header"}>
            <PageInfo pageData={pageData} />
        </div>
        <div className={"iare-ux-body"}>
            <PageData rawPageData={pageData} />
        </div>
    </div>
}

