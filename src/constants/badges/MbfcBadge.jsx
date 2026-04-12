import React from "react";
import {BadgeContextEnum} from "../badgeDisplayTypes.jsx";
import Badge from "../../components/Badge.jsx";
import {signalBadgeRegistry} from "./signalBadgeRegistry.jsx";

/**
 * Shared Badge interface
 * @param {Object} props
 * @param {Object} [props.signals]
 * @param {Function} [props.onSignalClick]
 * @param {BadgeContextEnum} [props.badgeContext]*/
export default function MbfcBadge({
                                      signals = {},
                                      badgeContext = BadgeContextEnum.INLINE,
                                      onBadgeClick,
                                  }
) {
    if (!signals) {
        return <div className={"signal-badge-error"}><img src={badgeDef.logo}
                                                          alt="Wayback ERROR"/> {'Error: No signal data available'}
        </div>;
    }


    const badgeDef = signalBadgeRegistry.mbfc
    const badgeIcon = <img src={badgeDef.logo} alt={badgeDef.label} className={"logo-image"}/>

    let badgeData = {}
    let badgeText = null
    let badgeClass = "mbfc-badge"

    try {
        let wsMeta = null  // WikiSignalMeta
        if (signals?.meta?.ws_mbfc_cats) {
            const mbfcData = JSON.parse(signals.meta.ws_mbfc_cats.replace(/'/g, '"'))
            wsMeta = `MBFC: ${mbfcData.bias}, ${mbfcData.credibility}, reporting: ${mbfcData.reporting}`
        }

        let wsLists = null
        if (signals.ratings) {
            const subSigs = []

            if (signals.ratings["mbfc-bias"]) subSigs.push(<div
                key="bias">MBFC Bias: {signals.ratings["mbfc-bias"]}</div>)

            if (signals.ratings["mbfc-cred"]) subSigs.push(<div
                key="cred">MBFC Cred: {signals.ratings["mbfc-cred"]}</div>)

            if (signals.ratings["mbfc-Fact"]) subSigs.push(<div
                key="fact">MBFC Fact: {signals.ratings["mbfc-Fact"]}</div>)

            wsLists = subSigs.length > 0 ? <div>{subSigs}</div> : null
        }

        badgeText = <div>
            {wsMeta}
            {wsLists}
        </div>

        badgeData = {"mbfcMeta": "MBFC data (to come)"}

    } catch (e) {
        badgeText = <div>Error Encountered: {e.message}</div>
        badgeData = {"error": e.message}
        badgeClass += " missing-value"
    }

    return <Badge
        badgeContext={badgeContext}
        badgeKey={badgeDef.key}
        badgeClass={badgeClass}
        badgeIcon={badgeIcon}
        badgeText={badgeText}
        badgeData={badgeData}
    />
}
