import React from "react";

// undo comment when signalDefs is defined
// import {SignalDefs} from "../constants/signalDefs.jsx";

// import {ProbeDefs} from "../constants/probeDefs.jsx";
// import {isEmpty} from "../utils/generalUtils.js";


export default function SignalsDisplay({
                                          urlObj={},
                                          onSignalClick,
                                      }) {


    /*
    displays a "badge" for each probe found in probes array
    may eventually show the overall "score" of credibility of probe results

    example signalData:


    */

    // const signalData = urlObj?.probe_results

    // const signalBadges = (isEmpty(signalData?.probes))
    //     ? <div className={"lolite"}>N/A</div>
    //
    //     : Object.keys(signalData?.sigbals).map( (signalName, i) => {
    //         const probeDef = ProbeDefs[probeName]  // ProbeDefs is global probe definitions
    //         if (probeDef) {
    //
    //             // get class based on score
    //             const probe = signalData.probes[probeName]
    //             const score = probe["score"] ?? 0
    //             const nodata = probe["nodata"] ?? false
    //             const isError = probe["errors"] ?? false
    //
    //             let badgeClass = ""
    //
    //             if (nodata) {
    //                 badgeClass = "probe-nodata"
    //             } else if (isError) {
    //                 badgeClass = "probe-error"
    //             } else if (score === null) {
    //                 badgeClass = "probe-null"
    //             } else if (score > 0) {
    //                 badgeClass = "probe-good"
    //             } else if (score < 0) {
    //                 badgeClass = "probe-bad"
    //             } else {
    //                 badgeClass = "probe-zero"
    //             }
    //
    //             // display badge for this Probe
    //
    //             return <div className={`probe-badge ${badgeClass}`}
    //                         key={probeDef.key}
    //                         onClick={onProbeClick}
    //                         data-probe-key={probeDef.key}
    //                         data-probe-score={isError
    //                             ? "error"
    //                             : nodata
    //                                 ? "nodata"
    //                                 : score}
    //             >{probeDef.short_caption}</div>
    //
    //         } else {
    //             // Display as Question Mark for unknown probeName
    //             return <div className={"signal-badge"}
    //                         key={`${i}-${signalName}`}
    //                         onClick={onSignalClick}
    //                         data-probe-key={`unknown-${signalName}`}
    //             >{signalName}</div>
    //         }
    //     })


    const signalData = urlObj?.signal_data ?? {}

    const signalDisplay = signalData.error
            ? <div className={"lolite"}>{signalData.error}</div>
            : <div className={"xxxlolite"}>Signals exist for this domain (click to view)</div>

    return <>
        <div className={"signals-results signals-badges"}
             style={{height: "100%"}}
             onClick={onSignalClick}>
            {signalDisplay}
        </div>
    </>


}

