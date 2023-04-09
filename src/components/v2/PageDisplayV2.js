import React from "react";
import PageData from "./PageData.js";
import './refs.css';


export default function PageDisplayV2( { pageData }) {

    return <>
        <PageData pageData={pageData} />
    </>
}

