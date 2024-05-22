import React from "react";
import {ArticleVersions} from "../../../constants/articleVersions";
import CitationDisplay_v1 from "../citations/CitationDisplay_v1";
import CitationDisplay_v2 from "../citations/CitationDisplay_v2";
import CitationDisplay_Html from "../citations/CitationDisplay_Html";


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

    let display = null
    if (_ref) {
        if (articleVersion === ArticleVersions.ARTICLE_V1.key) {
            // eslint-disable-next-line react/jsx-pascal-case
            display = <CitationDisplay_v1 reference={_ref} index={index} options={{ ...options, isSingleUse: true }} />
        } else if (articleVersion === ArticleVersions.ARTICLE_V2.key) {
            // eslint-disable-next-line react/jsx-pascal-case
            display = <CitationDisplay_v2 reference={_ref} options={{hide_actionables:true, show_extra:true}} index={index} />
        } else {
            display = <div>Unknown article version {articleVersion ? articleVersion : "(none)"}</div>
        }
    } else {
        display = <div>No reference to show</div>
    }


    const extraInfo = <div className={"ref-citation-html-display"}>
        {/* eslint-disable-next-line react/jsx-pascal-case */}
        <CitationDisplay_Html reference={_ref} onAction={onAction} />
        </div>


    return <div className={"ref-view-section reference-info"} onClick={onClick}>

        <div className={"header-all-parts"}>
            <div className={"header-left-part"}>
                <h3>Citation</h3>
            </div>
        </div>

        <div className="ref-view-single-display">
            <button key={index} className={"ref-button"}
               >{display}</button>

            {extraInfo}

        </div>

    </div>

}

