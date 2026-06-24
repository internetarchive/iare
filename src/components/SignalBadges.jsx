import React, {useState} from "react";
import signalBadgeRegistry from "../constants/badges/signalBadgeRegistry.jsx";
import {isEmpty} from "../utils/generalUtils.js";
import {BadgeContexts} from "../constants/badgeContexts.jsx";
import {ACTIONS_IARE} from "../constants/actionsIare.jsx";


export default function SignalBadges({ badgeContextKey = BadgeContexts.default.key,
                                         urlObj = {},
                                         signalData={},  // signal values from url object
                                         monitoredSignals = [],
                                         onAction,  // what to do if signal clicked
                                         fromCache = false,
                                         options = {},
                                    }) {

    /*
    show badge for each signal type in signalBadgeRegistry that is being monitored
     */

    const badgeContext = BadgeContexts[badgeContextKey] || BadgeContexts.default

    const onClickFetch = (e) => {
        // e.preventDefault()
        e.stopPropagation()

        const el = e.target.closest('.url-row')
        const url = el?.dataset.url

        // signal to caller to fetch signal data for domain associated with url
        onAction({action: ACTIONS_IARE.FETCH_SIGNAL_DATA.key, value: url})
    }
    const fetchSignalDataButton = <>
        <div className={"signal-badges-extra-msg"}>
            Signal data is empty.
            <button className={"fetch-signal-button utility-button small-button"}
                    onClick={onClickFetch}
                    // TODO
                    //  in parent badgesHover, check if inside this button or its label,
                    //  and, if so, put an appropriate tooltip up
            >Fetch Signal Data</button>
        </div>
    </>


    const getBadges = () => {
        /*
         for each signal in signalBadgeRegistry, render its badge with
            the appropriate Badge renderer using the signal's data.

        render special markup for special conditions like:
        - signals are for a book
        - signals are for a paper
        - there is no signal data
        - signal data has errors
        */


        // If badgeContext is inline, which essentially means data, then check for special conditions
        if (badgeContext.key === BadgeContexts.inline.key) {

            // if no data then provide button to fetch that missing data
            if (isEmpty(signalData)) {
                return fetchSignalDataButton
            }

            // show "error" condition if signalData has errors
            if (signalData.error) {
                return <div className={"lolite"}>{signalData.error}</div>
            }

            // if url is book, no need for Signals
            if (urlObj.isBook) {
                return <div className={"signal-badges-extra-msg"}>No Signal Data for books.</div>
            }

            // check if url uses a "blanket domain", such as goggle.com (possibly a book),
            // or archive.org (we don't want/need to assess archive.org)

        }

        // return <>
        //     <div className={"signal-badges-debug"}>Test Signal Debug Text.</div>
        // </>
        //

        // else return badge components for all monitored signals
        return monitoredSignals.map(signalKey => {
            const BadgeComponent = signalBadgeRegistry[signalKey].component
                    // TODO what to do if null Badge?
                    //  shouldn't happen as BadgeRegistry is what gave us monitoredSignals
                    //  (but we dont know that here...) so, good practice is to check that
                    //  BadgeComponent resolves to a valid Badge Handler/Renderer function

            if (!BadgeComponent) return null

            return <BadgeComponent  // BadgeComponent is actually specific badge component, eventually resolving to Badge.jsx
                        key={signalKey}
                        badgeContextKey = {badgeContextKey}
                        signals={signalData}
                        onAction={onAction}

                        fromCache = {fromCache}
                        options = {options}
            />

        })

    }

    const badges = getBadges()

    return <>
        <div className={`signal-badges ${badgeContext.className}`}>
            {badges}
        </div>
    </>
}

