import React from "react";
import MakeLink from "../../MakeLink";
import {ArticleVersions} from "../../../constants/articleVersions";
import CitationDisplay_v1 from "../citations/CitationDisplay_v1";
import CitationDisplay_v2 from "../citations/CitationDisplay_v2";


/*
shows as much info for reference in as pleasant display as possible
 */
export default function RefViewRefDisplay({ _ref, index=0, articleVersion="", showDebug=false }) {

                    // const getRefDisplay = (ref, i, showDebugInfo = false) => {
                    //
                    //     let hasContent = false;
                    //     let spanCount = 0
                    //
                    //     const doiLinks = []
                    //     ref.templates.forEach( (t, ti) => {
                    //         // for each template, if there is a "doi" parameter, add it to the display
                    //         if (t.parameters?.doi) {
                    //             hasContent = true
                    //             const href = `https://doi.org/${encodeURIComponent(t.parameters.doi)}`
                    //             doiLinks.push(<MakeLink href={href} linkText={`DOI: ${t.parameters.doi}`} key={`${ti}-${t.parameters.doi}`}/> )
                    //         }
                    //     })
                    //
                    //     const setSpan = () => {
                    //         hasContent = true
                    //         spanCount++
                    //     }
                    //
                    //     const markup = <>
                    //
                    //         {ref.titles
                    //             ? ref.titles.map( (t) => {
                    //                 setSpan()
                    //                 return <span className={'ref-line ref-title'} key={spanCount} >{t}</span>
                    //             }) : null }
                    //
                    //         {ref.name
                    //             ? <>
                    //                 {setSpan()}
                    //                 <span className={'ref-line ref-name'} key={spanCount}><span className={'caption'}>Reference Name:</span> {ref.name}</span>
                    //             </>
                    //             : null }
                    //
                    //         {false && ref.template_names?.length
                    //             ? <>
                    //                 {ref.template_names.map( tn => {
                    //                     setSpan()
                    //                     return <span className={'ref-line ref-template'} key={spanCount}><span className={'caption'}>Template:</span> {tn}</span>
                    //                 })}
                    //             </>
                    //             : null}
                    //
                    //         {doiLinks}
                    //
                    //         { !hasContent ? <span>{ref.wikitext}</span> : null }
                    //
                    //         {showDebugInfo && <div> {/* extra info for debug */}
                    //             #{i} {ref.id} {ref.type}-{ref.footnote_subtype}
                    //         </div>}
                    //     </>
                    //
                    //     return markup
                    // }
                    //
                    // function getRefDisplayV2(ref, i, showDebugInfo = false) {
                    //
                    //     let hasContent = false;
                    //     let spanCount = 0
                    //
                    //     const setSpan = () => {
                    //         hasContent = true
                    //         spanCount++
                    //     }
                    //
                    //     const markup = <>
                    //
                    //         {ref.cite_html
                    //             ? <div dangerouslySetInnerHTML={{__html: ref.cite_html}} />
                    //             : <div>No citation html provided!</div> }
                    //
                    //         {showDebugInfo && <div> {/* extra info for debug */}
                    //             #{i} {ref.id} {ref.type}-{ref.footnote_subtype}
                    //         </div>}
                    //     </>
                    //
                    //     return markup
                    // }

    // let display = null
    // if (_ref) {
    //     if (referenceVersion === ArticleVersions.ARTICLE_V1.key) {
    //         display = getRefDisplay(_ref, index, showDebug)
    //     } else if (referenceVersion === ArticleVersions.ARTICLE_V2.key) {
    //         display = getRefDisplayV2(_ref, index, showDebug)
    //     } else {
    //         display = <div> Unknown reference version ${referenceVersion}</div>
    //     }
    // } else {
    //     display = <div>No reference to show</div>
    // }

    let display = null
    if (_ref) {
        if (articleVersion === ArticleVersions.ARTICLE_V1.key) {
            display = <CitationDisplay_v1 reference={_ref} index={index} />
        } else if (articleVersion === ArticleVersions.ARTICLE_V2.key) {
            display = <CitationDisplay_v2 reference={_ref} index={index} />
        } else {
            display = <div>Unknown article version {articleVersion ? articleVersion : "(none)"}</div>
        }
    } else {
        display = <div>No reference to show</div>
    }


                // let referenceCaption = null
                //
                // if (pageData.iariArticleVersion === ArticleVersions.ARTICLE_V1.key) {
                //     referenceCaption = <CitationDisplay_v1 reference={_ref} index={i} />
                //
                // } else if (pageData.iariArticleVersion === ArticleVersions.ARTICLE_V2.key) {
                //     referenceCaption = <CitationDisplay_v2 reference={_ref} index={i} />
                //     // referenceCaption = getReferenceCaptionVersion2(ref, i, isShowDebugInfo)
                // }
                //
                // return <button key={_ref.ref_id}
                //                className={"ref-button"}
                //                onClick={(e) => {
                //                    console.log ('ref clicked')
                //                    showRefView(_ref)
                //                }}>{referenceCaption}</button>



    return <div className="ref-view-ref-display">
        <button key={index} className={"ref-button"}
           >{display}</button>
    </div>
}

