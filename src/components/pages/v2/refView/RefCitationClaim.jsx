import React from "react";
import RefSectionHeader from "./RefSectionHeader.jsx";
import CitationDisplayInfo from "../citations/CitationDisplayInfo.jsx";

function RefCitationClaim({ reference = null, pageData={}, onAction}) {

    if (!reference) return null

    const claim_text = reference.claim
        ? <div>{reference.claim}</div>
        : <div><i>Claim text not provided.</i></div>

    // const header = <RefSectionHeader
    //     leftPart={<h3>Claim</h3>}
    //     // rightPart={buttonCopy}
    // >
    //     {/* nothing to see here */}
    // </RefSectionHeader>

    return <div className="ref-view-section ref-view-claim">
        <RefSectionHeader leftPart={
            <h3>Claim</h3>
        } />

        <div className={"ref-view-section-contents raw-claim"}>{claim_text}</div>

        <CitationDisplayInfo reference={reference} pageData={pageData} onAction={onAction} />

    </div>

}

export default RefCitationClaim
