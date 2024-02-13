import React from "react";

/*
shows citation links for this reference
 */
export default function RefArticleInfo({ _ref, onAction }) {

    // const linkDisplay = _ref.citationLinks.map(cite => {
    //         return <div className={"ref-citation-link"}>{cite}</div>
    //     })

    // FIXME need to flesh out citation links for real -- WAITING FOR IARI
    const anchorLinkDisplay = <div className={'citation-links'}>
        <button className={`utility-button small-button`}>Go to Citation Definition in Article</button>
    </div>
    const citeLinkDisplay = <div className={'citation-links'}>
        <button className={`utility-button small-button`}>^a</button>
        <button className={`utility-button small-button`}>^b</button>
        <button className={`utility-button small-button`}>^c</button>
    </div>

    return <div className="ref-view-article-info">
        {/*<h3>Article Origin Information</h3>*/}
        <div className={"article-info"}>
            <div>Section of Origin: {_ref.section}&nbsp;&nbsp;</div>
            <div className={'header-right-part'}>
                {anchorLinkDisplay}
                <div>&nbsp;&nbsp;Footnote Occurrences:&nbsp;</div>
                {citeLinkDisplay}
            </div>
        </div>
    </div>
}

