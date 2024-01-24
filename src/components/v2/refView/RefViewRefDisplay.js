import React from "react";
import MakeLink from "../../MakeLink";


/*
shows as much info for reference in as pleasant display as possible
 */
export default function RefViewRefDisplay({ _ref, index=0, showDebug=false }) {

    const getRefDisplay = (ref, i, showDebugInfo = false) => {

        let hasContent = false;
        let spanCount = 0

        const doiLinks = []
        ref.templates.forEach( (t, ti) => {
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

            {ref.titles
                ? ref.titles.map( (t) => {
                    setSpan()
                    return <span className={'ref-line ref-title'} key={spanCount} >{t}</span>
                }) : null }

            {ref.name
                ? <>
                    {setSpan()}
                    <span className={'ref-line ref-name'} key={spanCount}><span className={'caption'}>Reference Name:</span> {ref.name}</span>
                </>
                : null }

            {false && ref.template_names?.length
                ? <>
                    {ref.template_names.map( tn => {
                        setSpan()
                        return <span className={'ref-line ref-template'} key={spanCount}><span className={'caption'}>Template:</span> {tn}</span>
                    })}
                </>
                : null}

            {doiLinks}

            { !hasContent ? <span>{ref.wikitext}</span> : null }

            {showDebugInfo && <div> {/* extra info for debug */}
                #{i} {ref.id} {ref.type}-{ref.footnote_subtype}
            </div>}
        </>

        return markup
    }

    const display = _ref
        ? getRefDisplay(_ref, index, showDebug)
        : "No ref to show"

    return <div className="ref-view-ref-display">
        <button key={index} className={"ref-button"}
           >{display}</button>
    </div>
}

