import React, {useCallback, useContext} from "react";
import {ConfigContext} from "../../../contexts/ConfigContext";
import {IARE_ACTIONS} from "../../../constants/iareActions";

function CitationDisplay_Html({ reference = null,
                                options = {},
                                onAction}) {

    const myConfig = useContext(ConfigContext);

    const handleClick = useCallback((e) => {
        onAction( {
            "action": IARE_ACTIONS.GOTO_CITE_REF.key,
            "value" : e.target.href
        })
    }, [onAction]);

    if (!reference) return null

    const actionable = (!options?.hide_actionables) && reference.actionable?.length
        ? <span className={'ref-line ref-actionable'} >Actionable</span>
        : null


    const pageRefLinks = reference.citeRef?.page_refs
    const pageRefLinkDisplay = false && pageRefLinks
        ? pageRefLinks.map( (pr, i) => {
            const citeRefLink = pr.href.replace( /^\.\//, myConfig?.wikiBaseUrl)
            return <a href={citeRefLink} target={"_blank"} rel={"noreferrer"} key={i}
                      xxonClick={handleClick}>
                    <span className={"cite-ref-jump-link"}></span>
                </a>
        })
        : null // <div>No Citation Refs!</div>



    const cite_html = reference.citeRef?.cite_html
        ? reference.citeRef.cite_html
        : reference.citeRef.span_html
            ? reference.citeRef.span_html
            : <div>HTML render not found.</div>

    return <div className={"ref-citation-button-wrapper"}>

        {actionable}

        <div dangerouslySetInnerHTML={{__html: cite_html}} />

        <div className={"cite-ref-links"}>{pageRefLinkDisplay}</div>

    </div>

}

export default CitationDisplay_Html;
