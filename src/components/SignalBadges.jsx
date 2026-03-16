import React from "react";
import {signalBadgeRegistry} from "../constants/badges/signalBadgeRegistry.jsx";
import {isEmpty} from "../utils/generalUtils.js";


export default function SignalBadges({
                                         signals={},  // signal values from url object
                                         onSignalClick,  // what to do if signal clicked
                                         options = {},
                                    }) {

        
    /*
        for each signal in signalBadgeRegistry, render the badge with
        data from signals with appropriate Badge renderer.
    */

    let badges = null

    if (isEmpty(signals)) {
        badges = <div className={"signal-badges-extra-msg"}>Signal data is empty.</div>
    }

    else if (signals.error) {
        badges = <div className={"lolite"}>{signals.error}</div>

    } else {
        // render all the signals in registry, sorted by priority
        const monitoredSignals = Object.keys(signalBadgeRegistry)
            .sort((a, b) => signalBadgeRegistry[b].priority - signalBadgeRegistry[a].priority)

        console.log(`SignalBadges: monitoredSignals: ${monitoredSignals}`)

        badges = monitoredSignals.map(signalKey => {
            const Badge = signalBadgeRegistry[signalKey].component
            //         // TODO what to do if null Badge?
            //         //  shouldn't happen as BadgeRegistry is what gave us monitoredSignals
            //         //  (but we dont kjnow that...) so, good practice is to check that
            //         //  Badge resolves to a valid Badge Handler/Renderer function
            return <Badge signals={signals}
                          onSignalClick={onSignalClick}
                          key={signalKey} />

        })
    }

    return <>
        <div className={"signal-badges"}>
            {badges}
        </div>
    </>
}

