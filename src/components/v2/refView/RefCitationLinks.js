import React from "react";

/*
shows citation links for this reference
 */
export default function RefCitationLinks({ citationLinks, onAction }) {

    const linkDisplay= citationLinks
        ? citationLinks.map(cite => {
            return <div className={"ref-citation-link"}>{cite}</div>
        })

        // fake for now
        // : "Citation links under construction - will have links back to article citation locations."
        : <div className={'citation-links'}>
            <button className={`utility-button`}>Go to Anchor Citation</button>
            <button className={`utility-button`}>^a</button>
            <button className={`utility-button`}>^b</button>
            <button className={`utility-button`}>^c</button>
        </div>

    return <div className="ref-view-citation-links">
        <h3>Citation Links</h3>
        {linkDisplay}
    </div>
}

