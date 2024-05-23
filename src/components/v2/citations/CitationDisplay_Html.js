import React, {useCallback, useContext} from "react";
import {ConfigContext} from "../../../contexts/ConfigContext";
import {IARE_ACTIONS} from "../../../constants/iareActions";

function CitationDisplay_Html({ reference = null,
                                options = {},
                                onAction}) {

    const myConfig = useContext(ConfigContext);

    const handleClick = useCallback((e) => {
        e.stopPropagation()
        const refElement = e.target.closest('a')
        const href = refElement ? refElement.href : ""
        onAction( {
            "action": IARE_ACTIONS.GOTO_CITE_REF.key,
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
        : null // <div>No Citation Refs!</div>



    const cite_html = reference.citeRef?.cite_html
        ? reference.citeRef.cite_html
        : reference.citeRef?.span_html
            ? reference.citeRef.span_html
            : <div>HTML render not found.</div>

    return <div className={"ref-citation-button-wrapper"}>

        <div dangerouslySetInnerHTML={{__html: cite_html}} />

        <div className={"cite-ref-links"}><span className={"ref-citation-links"}>Article Citation Locations: </span>{pageRefLinkDisplay}</div>

    </div>

}

export default CitationDisplay_Html;
