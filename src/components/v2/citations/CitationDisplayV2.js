import React, {useContext} from "react";
import {ConfigContext} from "../../../contexts/ConfigContext";

function CitationDisplayV2({ reference = null,
                                index=0,
                                options = {},
                                onAction}) {

    const myConfig = useContext(ConfigContext);

    if (!reference) return null

    const actionable = (!options?.hide_actionables) && reference.actionable?.length
        ? <span className={'ref-line ref-actionable'} >Actionable</span>
        : null

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

    return <div className={"ref-citation-button-wrapper"}>

        {actionable}

        {reference.cite_html
            ? <div dangerouslySetInnerHTML={{__html: reference.cite_html}} />
            : reference.span_html
                ? <div dangerouslySetInnerHTML={{__html: reference.span_html}} />
                : null }

        {options?.show_extra && extra_info}

        {!!myConfig?.isShowDebugInfo && <div> {/* protect if myConfig is not defined */}
            #{index} {reference.id} {reference.type}
        </div>}
    </div>

}

export default CitationDisplayV2;
