import React from "react";
import {signalBadgeRegistry} from "../constants/badges/signalBadgeRegistry.jsx";
import {isEmpty} from "../utils/generalUtils.js";
import {BadgeContextEnum} from "../constants/badgeDisplayTypes.jsx";


export default function SignalBadges({
                                         signals={},  // signal values from url object
                                         onSignalClick,  // what to do if signal clicked
                                         badgeContext = BadgeContextEnum.INLINE,
                                         fromCache = false,
                                         options = {},
                                    }) {

    /*
        for each signal in signalBadgeRegistry, render its badge with
        the appropriate Badge renderer using the signal's data.               
    */

    const getBadges = () => {

        if (isEmpty(signals)) {
            return <div className={"signal-badges-extra-msg"}>Signal data is empty.
            <button className={"fetch-signal-button utility-button small-button"} onClick={() => {}}>Fetch Signal Data</button>
            </div>
        }

        if (signals.error) {return <div className={"lolite"}>{signals.error}</div>}

        // render all the signals in registry, sorted by priority
        const monitoredSignals = Object.keys(signalBadgeRegistry)
            // TODO add .filter capability here
            .sort((a, b) => signalBadgeRegistry[b].priority - signalBadgeRegistry[a].priority)

        return monitoredSignals.map(signalKey => {
            const Badge = signalBadgeRegistry[signalKey].component
                    // TODO what to do if null Badge?
                    //  shouldn't happen as BadgeRegistry is what gave us monitoredSignals
                    //  (but we dont kjnow that...) so, good practice is to check that
                    //  Badge resolves to a valid Badge Handler/Renderer function
            return <Badge signals={signals}
                          onSignalClick={onSignalClick}
                          badgeContext = {badgeContext}
                          key={signalKey} />

        })
    }

    const badges = getBadges()
    const badgeDisplayClass = badgeContext?.className || "signal-badges-default";
    return <>
        <div className={`signal-badges ${badgeDisplayClass}`}>
        {badges}
        </div>
    </>
}

