import React from "react";
import ArrayDisplay from '../ArrayDisplay.js';

/*
    expects props.detail

    displays a reference detail by showing some top-level
    information in table, followed by raw JSON

 */
function RefDetailV1({ detail }) {

    const dArr = [];

    if (detail.wikitext) {
        dArr.push ( {wikitext: detail.wikitext} )
    }

    if (detail.urls) {
        detail.urls.map( (u) => dArr.push( {'url' : u.url} ));
    }

    if (detail.flds) {
        detail.flds.map( (fld) => dArr.push( {'fld' : fld} ));
    }

    return <>
        <ArrayDisplay arr={dArr} className = {"single-detail"} />
        <pre>{JSON.stringify(detail, null, 2)}</pre>
    </>

}

export default RefDetailV1;
