import React from "react";
import MakeLink from "../MakeLink";

/*

 */
export default function RefModal({ open, details, source }) {
    return !details ? <p>Click a reference to show details</p>
        : <div className={"ref-detail"}>
        <h4 style={{marginBottom:".25rem"}}>source: </h4>
        <p style={{marginTop:0}} ><MakeLink href={source} linkText={source}/></p>
        <h4>wikitext:</h4>
        <p>{details.wikitext}</p>
        <h4>raw json:</h4>
        <pre className={"raw-detail"}>{JSON.stringify(details, null, 2)}</pre>
    </div>

}

