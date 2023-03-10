import React from "react";

/*

 */
function RefDetails({ details }) {
    return !details ? <p>No details to show</p>
        : <div className={"ref-detail"}>
        <h4>wikitext:</h4>
        <p>{details.wikitext}</p>
        <h4>raw json:</h4>
        <pre className={"raw-detail"}>{JSON.stringify(details, null, 2)}</pre>
    </div>

}

export default RefDetails;
