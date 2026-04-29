import React from "react";
import {signalBadgeRegistry} from "../constants/badges/signalBadgeRegistry.jsx";
import {isEmpty} from "../utils/generalUtils.js";
import {BadgeContextEnum} from "../constants/badgeDisplayTypes.jsx";
import {ACTIONS_IARE} from "../constants/actionsIare.jsx";


export default function SignalBadges({
                                         signals={},  // signal values from url object
                                         badgeContext = BadgeContextEnum.INLINE,
                                         onAction,  // what to do if signal clicked
                                         onBadgeHover,
                                         tooltipId = null,
                                         fromCache = false,
                                         options = {},
                                    }) {

    const onClickFetch = (e) => {
        // e.preventDefault()
        e.stopPropagation()

        const el = e.target.closest('.url-row')
        const url = el?.dataset.url

        // fetch domain from row data, and send that as value
        onAction({action: ACTIONS_IARE.FETCH_SIGNAL_DATA.key, value: url})
    }


    /*
        for each signal in signalBadgeRegistry, render its badge with
        the appropriate Badge renderer using the signal's data.               
    */

    const getBadges = () => {

        if (isEmpty(signals)) {
            return <>
                <div className={"signal-badges-extra-msg"}>Signal data is empty.
                    <button className={"fetch-signal-button utility-button small-button"}
                            onClick={onClickFetch}
                            data-tooltip-id={tooltipId}
                            data-tooltip-content="Fetch New Signal data for URL"
                    >Fetch Signal Data</button>
                </div>

            </>

        }

        if (signals.error) {return <div className={"lolite"}>{signals.error}</div>}

        // render all the signals in registry, sorted by priority
        const monitoredSignals = Object.keys(signalBadgeRegistry)
            // TODO add .filter capability here
            .sort((a, b) => signalBadgeRegistry[b].priority - signalBadgeRegistry[a].priority)

        return monitoredSignals.map(signalKey => {
            const BadgeComponent = signalBadgeRegistry[signalKey].component
                    // TODO what to do if null Badge?
                    //  shouldn't happen as BadgeRegistry is what gave us monitoredSignals
                    //  (but we dont kjnow that...) so, good practice is to check that
                    //  Badge resolves to a valid Badge Handler/Renderer function
            return <BadgeComponent signals={signals}
                        badgeContext = {badgeContext}
                        onAction={onAction}
                        key={signalKey}
            tooltipId = {tooltipId}
             fromCache = {fromCache}
             options = {options}
            />

        })
    }

    const badges = getBadges()
    const badgeDisplayClass = badgeContext?.className || "signal-badges-default";

    return <>
        <div
            className={`signal-badges ${badgeDisplayClass}`}
            // onMouseOver={onBadgeHover}
        >
        {badges}
        </div>
    </>
}

