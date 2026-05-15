import React, {useState} from "react";
import signalBadgeRegistry from "../constants/badges/signalBadgeRegistry.jsx";
import {isEmpty} from "../utils/generalUtils.js";
import {BadgeContexts} from "../constants/badgeContexts.jsx";
import {ACTIONS_IARE} from "../constants/actionsIare.jsx";


export default function SignalBadges({
                                         signals={},  // signal values from url object
                                         badgeContextKey = BadgeContexts.default.value,
                                         onAction,  // what to do if signal clicked

                                         // onClick,
                                         onBadgesHover,

                                         tooltipId,

                                         fromCache = false,
                                         options = {},
                                    }) {

    /*
    show badge for each signal type in signalBadgeRegistry that is being monitored
     */

    const onClickFetch = (e) => {
        // e.preventDefault()
        e.stopPropagation()

        const el = e.target.closest('.url-row')
        const url = el?.dataset.url

        // fetch domain from row data, and send that as value
        onAction({action: ACTIONS_IARE.FETCH_SIGNAL_DATA.key, value: url})
    }

    // const onHoverBadge = (e) => {
    //     e.stopPropagation()
    //
    //     const elBadge = e.target.closest('.signal-badge')
    //     const badgeKey = elBadge.dataset.badgekey
    //     const badgeDef = signalBadgeRegistry[badgeKey]
    //
    //     const msg = badgeDef.description
    //
    //     console.log(`Clicked on ${badgeKey}`)
    //
    //     // sends tooltip message back upo so ancestral tooltip can render
    //     onBadgeHover(msg)
    // }
    const badgeContext = BadgeContexts[badgeContextKey] || BadgeContexts.default

    const getBadges = () => {
        // for each signal in signalBadgeRegistry, render its badge with
        // the appropriate Badge renderer using the signal's data.


        if (badgeContext.hasText) {

            // if signals has no data then show "error" condition
            if (isEmpty(signals)) {
                return <>
                    <div className={"signal-badges-extra-msg"}>Signal data is empty.
                        <button className={"fetch-signal-button utility-button small-button"}
                                onClick={onClickFetch}
                                // data-tooltip-id={tooltipId}
                                // data-tooltip-content="Fetch New Signal data for URL"
                                // onMouseMove={onBadgeHover}
                        >Fetch Signal Data</button>
                    </div>
                </>
            } else if (signals.error) {
                return <div className={"lolite"}>{signals.error}</div>
            }
        }

        // render all the signals in registry, sorted by priority
        const monitoredSignals = Object.keys(signalBadgeRegistry)
            // TODO add .filter capability here
            //  - use some algorithm to determine inclusion
            .sort((a, b) => signalBadgeRegistry[b].priority - signalBadgeRegistry[a].priority)


        // return badge component for each monitored signal
        return monitoredSignals.map(signalKey => {
            const BadgeComponent = signalBadgeRegistry[signalKey].component
                    // TODO what to do if null Badge?
                    //  shouldn't happen as BadgeRegistry is what gave us monitoredSignals
                    //  (but we dont know that here...) so, good practice is to check that
                    //  BadgeComponent resolves to a valid Badge Handler/Renderer function
            return <BadgeComponent
                        key={signalKey}

                        // tooltipId = {tooltipId}

                        signals={signals}
                        badgeContextKey = {badgeContextKey}

                        // onBadgeHover={onHoverBadge}
                        onAction={onAction}
                        fromCache = {fromCache}
                        options = {options}
            />

        })
    }

    const badges = getBadges()

    return <>
        <div
            className={`signal-badges ${badgeContext.className}`}
            // data-tooltip-id={tooltipId}
            // data-tooltip-content={tooltipContent}

            onMouseOver={onBadgesHover}
            // onClick={onClick}
        >
        {badges}
        </div>
    </>
}

