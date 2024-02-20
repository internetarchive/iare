import React, {useContext} from "react";
import MakeLink from "../../MakeLink";
import {ConfigContext} from "../../../contexts/ConfigContext";

function CitationDisplay_v1({ reference = null, index=0, showDebug=false}) {

    const myConfig = useContext(ConfigContext);

    if (!reference) return null

    let hasContent = false;
    let spanCount = 0

    const doiLinks = []
    reference.templates.forEach( (t, ti) => {
        // for each template, if there is a "doi" parameter, add it to the display
        if (t.parameters?.doi) {
            hasContent = true
            const href = `https://doi.org/${encodeURIComponent(t.parameters.doi)}`
            doiLinks.push(<MakeLink href={href} linkText={`DOI: ${t.parameters.doi}`} key={`${ti}-${t.parameters.doi}`}/> )
        }
    })

    const setSpan = () => {
        hasContent = true
        spanCount++
    }

    const markup = <>

        {reference.titles
            ? reference.titles.map( (t) => {
                setSpan()
                return <span className={'ref-line ref-title'} key={spanCount} >{t}</span>
            }) : null }

        {reference.name
            ? <>
                {setSpan()}
                <span className={'ref-line ref-name'} key={spanCount}><span className={'caption'}>Reference Name:</span> {reference.name}</span>
            </>
            : null }

        {reference.template_names?.length
            ? <>
                {reference.template_names.map(tn => {
                    setSpan()
                    return <span className={'ref-line ref-template'} key={spanCount}><span className={'caption'}>Template:</span> {tn}</span>
                })}
            </>
            : null}

        {doiLinks}

        { !hasContent ? <span>{reference.wikitext}</span> : null }

        {!!myConfig?.isShowDebugInfo && <div> {/* extra info for debug */}
            #{index} {reference.id} {reference.type}-{reference.footnote_subtype}
        </div>}
    </>

    return markup
}

export default CitationDisplay_v1;
