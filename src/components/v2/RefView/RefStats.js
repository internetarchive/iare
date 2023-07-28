import React from "react";
import RawJson from "../../RawJson";

export default function RefStats( {details} ) {
    return <div className={"ref-view-stats"}>
        {/*<h4>Ref Stats/Scores:</h4>*/}
        <h4>Debug:</h4>
        <p>link_status:</p>
        <RawJson obj={details.link_status} />
        {/*<h4>To do:</h4>*/}
        {/*<p>Template Completion<br/>*/}
        {/*    URL health<br/>*/}
        {/*    archive.org status</p>*/}
    </div>
}

