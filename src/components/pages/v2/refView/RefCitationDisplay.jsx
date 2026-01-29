import React from "react";
import {ParseMethods} from "../../../../constants/parseMethods.jsx";
import CitationDisplayV1 from "../citations/CitationDisplayV1.jsx";
import CitationDisplayV2 from "../citations/CitationDisplayV2.jsx";
import CitationDisplayInfo from "../citations/CitationDisplayInfo.jsx";


/*
shows as much info for reference in as pleasant a display as possible
 */
export default function RefCitationDisplay({ _ref,
                                               index=0,
                                               pageData= {},
                                               parseMethod="",
                                               onClick,
                                               onAction,
                                               options = {},
                                               showDebug=false }) {

    let parsedCitationInfo = null
    if (_ref) {
        if (parseMethod === ParseMethods.WIKIPARSE_V1.key  ||
            parseMethod === ParseMethods.WIKIPARSE_XREF.key) {  // as of 2025.08.24 WIKIPARSE_XREF is the default
            parsedCitationInfo = <CitationDisplayV1 reference={_ref}
                                          index={index}
                                          options={{ ...options, isSingleUse: true }} />

        } else if (parseMethod === ParseMethods.WIKIPARSE_V2.key) {
            parsedCitationInfo = <CitationDisplayV2 reference={_ref}
                                          index={index}
                                          options={{
                                              hide_actionables:true,
                                              show_extra:true
            }} />

        } else {
            parsedCitationInfo = <div>Unknown article parse method {parseMethod ? parseMethod : "(none)"}</div>
        }
    } else {
        parsedCitationInfo = <div>No reference to show</div>
    }


    return <div className={"ref-view-section reference-info"} onClick={onClick}>

        <div className="ref-view-single-display">
            <div className={"parts-wrapper"}>
                <div className={"parts-title"}>Contents</div>
                {parsedCitationInfo}
            </div>

            <CitationDisplayInfo reference={_ref} pageData={pageData} onAction={onAction} />
        </div>

    </div>

}

