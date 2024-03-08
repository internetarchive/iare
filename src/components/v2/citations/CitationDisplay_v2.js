import React, {useCallback, useContext} from "react";
import {ConfigContext} from "../../../contexts/ConfigContext";

function CitationDisplay_v2({ reference = null,
                                index=0,
                                options = {},
                                onAction}) {

    const myConfig = useContext(ConfigContext);

    const handleClick = useCallback((e) => {
        onAction( {
            "action": "goto_cite_ref",
            "value" : e.target.href
        })
    }, [onAction]);

    if (!reference) return null

    const actionable = (!options?.hide_actionables) && reference.actionable?.length
        ? <span className={'ref-line ref-actionable'} >Actionable</span>
        : null


    const citeRefLinks = reference.cite_ref_links
        ? reference.cite_ref_links.map( (cr, i) => {
            const citeRefLink = cr.href.replace( /^\.\//, myConfig?.wikiBaseUrl)
            return <a href={citeRefLink} target={"_blank"} rel={"noreferrer"} key={i}
                      onClick={handleClick}>
                    <span className={"cite-ref-jump-link"}></span>
                </a>
        })
        : null // <div>No Citation Refs!</div>

    // const doiLinks = []
    // ref.templates.forEach( (t, ti) => {
    //     // for each template, if there is a "doi" parameter, add it to the display
    //     if (t.parameters?.doi) {
    //         hasContent = true
    //         const href = `https://doi.org/${encodeURIComponent(t.parameters.doi)}`
    //         doiLinks.push(<MakeLink href={href} linkText={`DOI: ${t.parameters.doi}`} key={`${ti}-${t.parameters.doi}`}/> )
    //     }
    // })

    const wikiRefId = <div className={"cite-display-wiki-ref-id"}><span className={"lolite"}>Wiki Ref ID: </span>{reference["wiki_ref_id"]}</div>

    const refInfo = reference["ref_info"] ? reference["ref_info"] : {}

    const refName = refInfo["ref_name"]
        ? <div className={"cite-display-name"}><span className={"lolite"}>Ref Name: </span>{refInfo["ref_name"]}</div>
        :null

    const citeId = refInfo["cite_id"]
        ? <div className={"cite-display-cite-id"}><span className={"lolite"}>cite_id: </span>{refInfo["cite_id"]}</div>
        : null

    const extra_info = <div className={"cite-display-info"}>
        {wikiRefId}
        <div className={"cite-display-extra"}>
            {refName}
            {citeId}
        </div>
    </div>

    return <div className={"ref-button-wrapper"}>

        {actionable}

        {reference.cite_html
            ? <div dangerouslySetInnerHTML={{__html: reference.cite_html}} />
            : reference.span_html
                ? <div dangerouslySetInnerHTML={{__html: reference.span_html}} />
                : null }

        {options?.show_extra && extra_info}

        {false && citeRefLinks ? <div className={"cite-ref-links"}>{citeRefLinks}</div> : null }

        {!!myConfig?.isShowDebugInfo && <div> {/* protect if myConfig is not defined */}
            #{index} {reference.id} {reference.type}
        </div>}
    </div>

}

export default CitationDisplay_v2;
