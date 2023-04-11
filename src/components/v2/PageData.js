import React from "react";
import UrlDisplay from "./UrlDisplay";
import RefDisplay from "./RefDisplay";
import FldDisplay from "./FldDisplay";

export default function PageData( { pageData = {} }) {

    return <>
        <div className={"page-data"}>
            <UrlDisplay pageData={pageData} options={{}} />
            <RefDisplay pageData={pageData} options={{}} />
            <FldDisplay flds={pageData.fld_counts}/>
        </div>
    </>
}

