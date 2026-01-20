import React from "react";
import SignalBadges from "./SignalBadges.jsx";

// undo comment when signalDefs is defined
// import {SignalDefs} from "../constants/signalDefs.jsx";

// import {ProbeDefs} from "../constants/probeDefs.jsx";
// import {isEmpty} from "../utils/generalUtils.js";


export default function SignalsDisplay({
                                          urlObj={},
                                          onSignalClick,
                                      }) {

    const handleSignalClick = (e) => {
        // const targetElement = e.target

        // const urlElement = targetElement.closest('.url-row')
        // const urlLink = urlElement.dataset.url
        // const urlObj = urlDict[urlLink]
        //
        // const probeKey = targetElement.dataset.probeKey
        //
        //
        // const probeData = urlObj?.probe_results?.probes?.[probeKey] ?? null

        // console.log(`Signal clicked`)
        onSignalClick(e)
    }

    const signalData = urlObj?.signal_data ?? {}

    const signalsDisplay = signalData.error
            ? <div className={"lolite"}>{signalData.error}</div>
            // : <div className={"xxxlolite"}>Signals exist for this domain (click to view)</div>
            : <SignalBadges signals={signalData.signals} onSignalClick={handleSignalClick} />

    return <>
        <div className={"signals-results signals-badges"}
             style={{height: "100%"}}>
             {signalsDisplay}
        </div>
    </>

}

