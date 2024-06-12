import React from "react";
import {ArticleVersions} from "../../../constants/articleVersions";
import CitationDisplayV1 from "../citations/CitationDisplayV1";
import CitationDisplayV2 from "../citations/CitationDisplayV2";
import CitationDisplayHtml from "../citations/CitationDisplayHtml";
import CitationDisplayInfo from "../citations/CitationDisplayInfo";


/*
shows as much info for reference in as pleasant display as possible
 */
export default function RefCitationDisplay({ _ref,
                                               index=0,
                                               articleVersion="",
                                               onClick,
                                               onAction,
                                               options = {},
                                               showDebug=false }) {

    let asParsed = null
    if (_ref) {
        if (articleVersion === ArticleVersions.ARTICLE_V1.key) {
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

        <div className={"header-all-parts"}>
            <div className={"header-left-part"}>
                <h3>Citation</h3>
            </div>
        </div>

        <div className="ref-view-single-display">
            <button key={index} className={"ref-button"}>{asParsed}</button>
            <CitationDisplayHtml reference={_ref} onAction={onAction} />
            <CitationDisplayInfo reference={_ref} onAction={onAction} />
        </div>

    </div>

}

