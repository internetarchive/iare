import React from "react";
import {BadgeContexts} from "../badgeContexts.jsx";
import Badge from "../../components/Badge.jsx";
import signalBadgeRegistry from "./signalBadgeRegistry.jsx";
import {isEmpty} from "../../utils/generalUtils.js";

/**
 * Shared Badge interface
 * @param {Object} props
 * @param {Object} [props.signals]
 * @param {Function} [props.onAction]
 * @param {String} [props.badgeContextKey]*/
export default function MbfcBadge({
                                      signals = {},
                                      badgeContextKey = BadgeContexts.inline.value,
                                      onAction,
                                  }
) {
    if (!signals) {
        return <div className={"signal-badge-error"}><img src={badgeDef.logo}
                                                          alt="Wayback ERROR"/> {'Error: No signal data available'}
        </div>;
    }


    const badgeDef = signalBadgeRegistry.mbfc
    const badgeContext = BadgeContexts[badgeContextKey] || BadgeContexts.default

    let badgeData = {}
    let badgeText = null
    let badgeClass = badgeDef.class_name
    let mbfcBadgeData = null

    if (badgeContext.hasText) {
        try {

            let mbfcRatings = null

            if (signals.ratings) {
                const subSigs = []

                if (!isEmpty(signals.ratings["mbfc-bias"]))
                    subSigs.push(
                        <div key="bias">Bias: {signals.ratings["mbfc-bias"]}</div>
                    );

                if (!isEmpty(signals.ratings["mbfc-cred"]))
                    subSigs.push(
                        <div key="cred">Cred: {signals.ratings["mbfc-cred"]}</div>
                    );

                if (!isEmpty(signals.ratings["mbfc-fact"]))
                    subSigs.push(
                        <div key="fact">Fact: {signals.ratings["mbfc-fact"]}</div>
                    )
                
                mbfcRatings = subSigs.length > 0 
                    ? <div>{subSigs}</div> 
                    : null

                mbfcBadgeData = [
                    signals.ratings["mbfc-bias"],
                    signals.ratings["mbfc-cred"],
                    signals.ratings["mbfc-fact"],
                ]

            } else {

                mbfcRatings = null
                mbfcBadgeData = [ "No signal.ratings found."]

            }

            const mbfcScore = signals.meta?.ws_mbfc_score
                ? <div>Score: {signals.meta.ws_mbfc_score === "1" ? "1.0" : signals.meta.ws_mbfc_score}</div>
                : (mbfcRatings ? <div>Score: --</div> : <div>--</div>)

            badgeText = <div>
                {mbfcScore}
                {mbfcRatings}
            </div>

        } catch (e) {
            console.error(`Error Encountered: ${e.message}`)
            badgeText = <div>Error Encountered</div>
            mbfcBadgeData = {"error": e.message}
            badgeClass += " missing-value"
        }
    }

    const badgeIcon = <img src={badgeDef.logo} alt={badgeDef.label} className={"logo-image"}/>

    return <Badge
        badgeContextKey={badgeContextKey}
        badgeKey={badgeDef.key}
        badgeClass={badgeClass}
        badgeIcon={badgeIcon}
        badgeText={badgeText}
        badgeData={mbfcBadgeData}
    />
}
