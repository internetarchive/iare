import React, {useCallback, useContext} from "react";
import {ConfigContext} from "../../../contexts/ConfigContext";
import {ACTIONS_IARE} from "../../../constants/actionsIare";

function CitationDisplayInfo({ reference = null,
                                  options = {},
                                  onAction}) {

    const myConfig = useContext(ConfigContext);

    const handleClick = useCallback((e) => {
        e.stopPropagation()
        const refElement = e.target.closest('a')
        const href = refElement ? refElement.href : ""
        onAction( {
            "action": ACTIONS_IARE.GOTO_CITE_REF.key,
            "value" : href
        })
    }, [onAction]);

    if (!reference) return null

    const pageRefLinks = reference.citeRef?.page_refs
    const pageRefLinkDisplay = pageRefLinks
        ? pageRefLinks.map( (pr, i) => {
            const citeRefLink = pr.href.replace( /^\.\//, myConfig?.wikiBaseUrl)
            return <a href={citeRefLink} target={"_blank"} rel={"noreferrer"} key={i}
                      onClick={handleClick}>
                <span className={"cite-ref-jump-link"}></span>
            </a>
        })
        : null  // <div>No Citation Refs!</div>

    return <div className={"ref-button ref-citation-button-wrapper"}>
        <div className={"cite-ref-links"}><span className={"ref-citation-links"}>Jump to Citation Location in Article: </span>{pageRefLinkDisplay}</div>
        <div className={"ref-meta article-info"}>Citation Origin Article Section: {reference.section === 'root' ? 'Lead' : reference.section}</div>
    </div>

}

export default CitationDisplayInfo;
