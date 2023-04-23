import React from "react";
import UrlDisplay from "../shared/UrlDisplay.js";
import {URL_FILTER_MAP} from "./filters/urlFilterMaps";

export default function PageData( { pageData = {} }) {

    return <>
        <div className={"page-data"}>
            <UrlDisplay urlFlock={pageData.links} options={{refresh:pageData.refresh}} filterMap={URL_FILTER_MAP}/>
        </div>
    </>
}

