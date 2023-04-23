import React from "react";
import UrlDisplay from "../shared/UrlDisplay";
import RefDisplay from "./RefDisplay";
import FldDisplay from "./FldDisplay";
import {URL_FILTER_MAP} from "./filters/urlFilterMaps";

export default function PageData( { pageData = {} }) {

    return <>
        <div className={"page-data"}>
            <UrlDisplay urlFlock={pageData.urls} options={{refresh:pageData.refresh}} filterMap={URL_FILTER_MAP} />
            <RefDisplay pageData={pageData} options={{}} />
            <FldDisplay flds={pageData.fld_counts}/>
        </div>
    </>
}

