import React from "react";
import {ArticleVersions} from "../../../constants/articleVersions";
import CitationDisplayV1 from "../citations/CitationDisplayV1";
import CitationDisplayV2 from "../citations/CitationDisplayV2";
import CitationDisplayInfo from "../citations/CitationDisplayInfo";


/*
shows as much info for reference in as pleasant display as possible
 */
export default function RefCitationDisplay({ _ref,
                                               index=0,
                                               pageData= {},
                                               articleVersion="",
                                               onClick,
                                               onAction,
                                               options = {},
                                               showDebug=false }) {

    let asParsed = null
    if (_ref) {
        if (articleVersion === ArticleVersions.ARTICLE_V1.key  ||
            articleVersion === ArticleVersions.ARTICLE_XREF.key) {
            asParsed = <CitationDisplayV1 reference={_ref} index={index} options={{ ...options, isSingleUse: true }} />
        } else if (articleVersion === ArticleVersions.ARTICLE_V2.key) {
            asParsed = <CitationDisplayV2 reference={_ref} options={{hide_actionables:true, show_extra:true}} index={index} />
        } else {
            asParsed = <div>Unknown article version {articleVersion ? articleVersion : "(none)"}</div>
        }
    } else {
        asParsed = <div>No reference to show</div>
    }


    return <div className={"ref-view-section reference-info"} onClick={onClick}>

        <div className="ref-view-single-display">
            <button key={index} className={"ref-button"}>{asParsed}</button>
            <CitationDisplayInfo reference={_ref} pageData={pageData} onAction={onAction} />
        </div>

    </div>

}

