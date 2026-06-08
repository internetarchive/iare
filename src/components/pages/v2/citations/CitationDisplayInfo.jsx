import React, {useCallback, useContext} from "react";
import {ConfigContext} from "../../../../contexts/ConfigContext.jsx";
import {ACTIONS_IARE} from "../../../../constants/actionsIare.jsx";
import {useTranslation} from "react-i18next";

function CitationDisplayInfo({ reference = null,
                                 pageData = {},
                                 options = {},
                                 onAction}) {

    if (!reference) return null

    const myConfig = useContext(ConfigContext);

    const { t} = useTranslation();

    const handleClick = useCallback((e) => {
        e.stopPropagation()
        const refElement = e.target.closest('a')
        const href = refElement ? refElement.href : ""
        onAction( {
            "action": ACTIONS_IARE.GOTO_CITE_REF.key,
            "value" : href
        })
    }, [onAction]);


    const handleClickSection = useCallback((e) => {
        e.stopPropagation()
        const refElement = e.target.closest('a')
        const href = refElement ? refElement.href : ""
        onAction( {
            "action": ACTIONS_IARE.GOTO_WIKI_SECTION.key,
            "value" : href
        })
    }, [onAction]);


    const section_label = t('Section') + ": "
    const section_anchor = reference.section === 'root' ? '' : reference.section.replace(/ /g, "_")
    const section_link = <a href={pageData.pathName + '#' + section_anchor} target={"_blank"} rel={"noreferrer"} onClick={handleClickSection}>
        {reference.section === 'root' ? 'Lead' : reference.section}
    </a>


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
    const citationLabel = pageRefLinks
        ? pageRefLinks.length > 1
            ? `Locations (${pageRefLinks.length}): `
            : "Location: "
        :  <>Location: <i>Trouble extracting link</i></>


    // return <div className={"parts-wrapper"}>
    //     <div className={"parts-title"}>Origin</div>
    //     <div className={"cite-ref-links"}><span className={"ref-citation-links"}>{citationLabel}</span>{pageRefLinkDisplay}</div>
    //     <div className={"ref-meta article-info"}>{section_label}{section_link}</div>
    // </div>

    return <div className={"ref-citation-info"}>
        <div className={"ref-meta article-info"}>{section_label}{section_link}</div>
        <div className={"cite-ref-links"}><span className={"ref-citation-links"}>{citationLabel}</span>{pageRefLinkDisplay}</div>
    </div>

}

export default CitationDisplayInfo;
