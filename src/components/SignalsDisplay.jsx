import React from "react";
import SignalBadges from "./SignalBadges.jsx";

// undo comment when signalDefs is defined
// import {SignalDefs} from "../constants/signalDefs.jsx";

// import {ProbeDefs} from "../constants/probeDefs.jsx";
import {isEmpty} from "../utils/generalUtils.js";


export default function SignalsDisplay({
                                           urlObj = {},
                                           activeSignalKeys = [],
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

        // TODO for now, we are just percolating click handlking up to caller
        //  we may want to do some other custom stuff here within the signal display,...
        //  ...or not! We may pass all we need into this component so change when it changes

        onSignalClick(e)
    }


    const getSignalsDisplay = (sigData) => {
        if (isEmpty(sigData)) {
            return <div className={"lolite"}>No signal data available. (this may change)</div>
        }
        if (sigData.error) {
            return <div className={"lolite"}>{signalData.error}</div>
        }
        if (isEmpty(sigData.signals)) {
            return <div className={"lolite"}>No signals found in signal data.</div>
        }
        return <SignalBadges signals={sigData.signals}
                             activeSignalKeys={activeSignalKeys}
                             onSignalClick={handleSignalClick} />

    }

    const signalData = urlObj?.signal_data ?? {}
    const signalsDisplay = getSignalsDisplay(signalData)
    const cacheDisplay = signalData.retrieved_from_cache
        ? <div className={"signal-badges-from-cache"}>Data retrieved from cache</div>
        : null

    return <>
        <div className={"signals-display"} style={{height: "100%"}}>
            {cacheDisplay}
            {signalsDisplay}
        </div>
    </>

}

