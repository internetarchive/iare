import React from "react";
import {BadgeContextEnum} from "../badgeDisplayTypes.jsx";
import Badge from "../../components/Badge.jsx";
import {getNormalizedCount, getNormalizedScore, getPrettyCount} from "../../utils/generalUtils.js";
import {signalBadgeRegistry} from "./signalBadgeRegistry.jsx";

/**
 * Shared Badge interface
 * @param {Object} props
 * @param {Object} [props.signals]
 * @param {Function} [props.onSignalClick]
 * @param {BadgeContextEnum} [props.badgeContext]*/
export default function TrancoBadge({
                                        signals = {},
                                        badgeContext = BadgeContextEnum.INLINE,
                                        onAction,
                                    }
) {
    if (!signals) {
        return <div className={"signal-badge-error"}><img src={badgeDef.logo}
                                                          alt="Tranco ERROR"/> {'Error: No signal data available'}
        </div>;
    }

    const badgeDef = signalBadgeRegistry.tranco
    const badgeIcon = <img src={badgeDef.logo} alt={badgeDef.label} className={"logo-image"}/>

    let badgeData = {}
    let badgeText = null
    let badgeClass = "tranco-badge"

    try {
        const meta = signals?.meta || {};
        // assume tranco rating is from signals.meta.ws_web_rank
        const count = getNormalizedCount(meta["ws_web_rank"]);

        badgeData = {"tranco": count}
        badgeText = count < 0  // -1 means not provided
            ? <div>Not provided.</div>
            : <div>Tranco rating: {count}</div>
        if (count < 0) badgeClass += " missing-value"


    } catch (e) {
        badgeData = {"error": e.message}
        badgeText = <div>Tranco Error Encountered: {e.message}</div>
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
