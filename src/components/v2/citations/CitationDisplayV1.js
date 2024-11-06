import React, {useContext} from "react";
import MakeLink from "../../MakeLink";
import {ConfigContext} from "../../../contexts/ConfigContext";

function CitationDisplayV1({ reference = null, index=0, options ={}}) {

    const myConfig = useContext(ConfigContext);

    if (!reference) return null

    let hasContent = false;
    let spanCount = 0

    // setSpan is a helper method called from within each sub-section of ref display.
    // when setSpan called, hasContent is true, and the spanCOunt is incremented,
    // indicating we have at least some content to display.
    const setSpan = () => {
        hasContent = true
        spanCount++  // spanCount is used to give each span a unique key
    }

    const actionable = (!options?.hide_actionables) && reference.actionable?.length
        ? <span className={'ref-line ref-actionable'} key={spanCount} >Actionable</span>
        : null

    const refTitle = reference.titles?.length
        ? reference.titles.map( (t) => {
            setSpan()
            return <span className={'ref-line ref-title'} key={spanCount} >{t}</span>
        }) : null

    const templates = reference.template_names?.length
        ? <>
            {reference.template_names.map(tn => {
                setSpan()
                return <span className={'ref-line ref-template'} key={spanCount}><span className={'caption'}>Template:</span> {tn}</span>
            })}
        </>
        : null

    const refName = reference.name
        ? <>
            {setSpan()}
            <span className={'ref-line ref-name'} key={spanCount}><span className={'caption'}>Reference Name:</span> {reference.name}</span>
        </>
        : null

    const doiLinks = []
    if (reference.templates) {
        reference.templates.forEach( (t, ti) => {
            // for each template, if there is a "doi" parameter, add it to the display
            if (t.parameters?.doi) {
                setSpan()
                const href = `https://doi.org/${encodeURIComponent(t.parameters.doi)}`
                doiLinks.push(<MakeLink href={href} linkText={`DOI: ${t.parameters.doi}`} key={`${ti}-${t.parameters.doi}`}/> )
            }
        })
    }

    const citationDisplay = hasContent
        ? <>
            {actionable}
            {refTitle}
            {refName}
            {doiLinks}
            {templates}
        </>
        : <span>{reference.wikitext}</span>  // if nothing else to show, show wikitext


    const debugInfo = !!myConfig?.isShowDebugInfo
        ? <div>
            #{index} {reference.id} {reference.type}-{reference.footnote_subtype}
        </div>
        : null

    return <>
        <div className={"ref-citation-button-wrapper"}>

            {citationDisplay}

            {debugInfo}

        </div>

    </>
}

export default CitationDisplayV1;
