import React from "react";
import {BadgeContexts} from "../badgeContexts.jsx";
import Badge from "../../components/Badge.jsx";
import {getNormalizedCount, getNormalizedScore, getPrettyCount} from "../../utils/generalUtils.js";
import signalBadgeRegistry from "./signalBadgeRegistry.jsx";

const noDataProvidedText = "---"

/**
 * Shared Badge interface
 * @param {Object} props
 * @param {Object} [props.signals]
 * @param {Function} [props.onAction]
 * @param {String} [props.badgeContextKey]*/
export default function TrancoBadge({
                                        signals = {},
                                        badgeContextKey = BadgeContexts.inline.value,
                                        onAction,
                                    }
) {
    if (!signals) {
        return <div className={"signal-badge-error"}><img src={badgeDef.logo}
                                                          alt="Tranco ERROR"/> {'Error: No signal data available'}
        </div>;
    }

    const badgeDef = signalBadgeRegistry.tranco
    const badgeContext = BadgeContexts[badgeContextKey] || BadgeContexts.default

    const badgeIcon = <img src={badgeDef.logo} alt={badgeDef.label} className={"logo-image"}/>

    let badgeData = {}
    let badgeText = null
    let badgeClass = badgeDef.class_name

    if (badgeContext.hasText) {
        // calc badgeText and badgeData
        try {
            const meta = signals?.meta || {};
            // assume tranco rating is from signals.meta.ws_web_rank
            const count = getNormalizedCount(meta["ws_web_rank"]);
            const logCount = Math.log10(count)

            badgeData = {"tranco": count}
            if (count < 0) {  // -1 means not provided
                badgeText = <div>{noDataProvidedText}</div>
                badgeClass += " missing-value"
            } else {
                badgeText = <div>{logCount.toFixed(1)}</div>
            }

        } catch (e) {
            badgeData = {"error": e.message}
            badgeText = <div>Tranco Error Encountered: {e.message}</div>
            badgeClass += " missing-value"
        }
    }

    return <Badge
        badgeContextKey={badgeContextKey}
        badgeKey={badgeDef.key}
        badgeClass={badgeClass}
        badgeIcon={badgeIcon}
        badgeText={badgeText}
        badgeData={badgeData}
    />
}
