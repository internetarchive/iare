import React, {useEffect, useState} from "react";
import ArrayDisplay from './ArrayDisplay.js';

/*
    expects props.detail
 */
function RefDetail(props) {

    const d = props.detail;

    const dArr = [];

    if (d.wikitext) {
        dArr.push ( {wikitext: d.wikitext} )
    }

    if (d.urls) {
        d.urls.map( (u) => dArr.push( {url: u.url} ));
    }

    if (d.flds) {
        d.flds.map( (fld) => dArr.push( {fld: fld} ));
    }

    return <>
        <ArrayDisplay arr={dArr} className = {"single-detail"} />
        <pre>{JSON.stringify(props.detail, null, 2)}</pre>
    </>

}

export default RefDetail;
