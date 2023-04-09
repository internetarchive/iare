import React from "react";
import PageInfo from "./PageInfo.js";
import PageData from "./PageData.js";
import './refs.css';


export default function PageDisplayV2( { pageData }) {

    return <>
        <PageInfo pageData={pageData} />
        <PageData pageData={pageData} />
    </>
}

