import React from "react";
import RefSectionHeader from "./RefSectionHeader.jsx";

function RefCitationClaim({ reference = null, onAction}) {

    if (!reference) return null

    const claim_text = reference.claim
        ? <div>{reference.claim}</div>
        : <div><i>Claim text not found.</i></div>

    const header = <RefSectionHeader
        leftPart={<h3>Claim</h3>}
        // rightPart={buttonCopy}
    >
        {/* nothing to see here */}
    </RefSectionHeader>

    return <div className="ref-view-section ref-view-claim">
        {header}
        <div className={"ref-view-section-contents raw-claim"}>{claim_text}</div>
    </div>

}

export default RefCitationClaim
