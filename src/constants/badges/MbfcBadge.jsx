import React from "react";
import {BadgeContexts} from "../badgeContexts.jsx";
import Badge from "../../components/Badge.jsx";
import signalBadgeRegistry from "./signalBadgeRegistry.jsx";

/**
 * Shared Badge interface
 * @param {Object} props
 * @param {Object} [props.signals]
 * @param {Function} [props.onSignalClick]
 * @param {BadgeContexts} [props.badgeContext]*/
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

    if (badgeContext.hasText) {
        try {
            // let wsMeta = null  // WikiSignalMeta
            // if (signals?.meta?.ws_mbfc_cats) {
            //     const mbfcData = JSON.parse(signals.meta.ws_mbfc_cats.replace(/'/g, '"'))
            //     wsMeta = `MBFC: ${mbfcData.bias}, ${mbfcData.credibility}, reporting: ${mbfcData.reporting}`
            // }
            //
            // let wsLists = null
            // if (signals.ratings) {
            //     const subSigs = []
            //
            //     if (signals.ratings["mbfc-bias"]) subSigs.push(<div
            //         key="bias">MBFC Bias: {signals.ratings["mbfc-bias"]}</div>)
            //
            //     if (signals.ratings["mbfc-cred"]) subSigs.push(<div
            //         key="cred">MBFC Cred: {signals.ratings["mbfc-cred"]}</div>)
            //
            //     if (signals.ratings["mbfc-Fact"]) subSigs.push(<div
            //         key="fact">MBFC Fact: {signals.ratings["mbfc-Fact"]}</div>)
            //
            //     wsLists = subSigs.length > 0 ? <div>{subSigs}</div> : null
            // }
            //

            const wsMeta = <div>--</div>
            const wsLists = <div>--</div>
            badgeText = <div>
                {wsMeta}
                {wsLists}
            </div>

            badgeData = {"mbfcMeta": "MBFC data (to come)"}
            // for now, since we need to refine MBFC
            //badgeText = "---"
            badgeClass += " missing-value"

        } catch (e) {
            console.error(`Error Encountered: ${e.message}`)
            // badgeText = <div>Error Encountered: {e.message}</div>
            badgeText = <div>Error Encountered</div>
            badgeData = {"error": e.message}
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
        badgeData={badgeData}
    />
}
