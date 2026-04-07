import React from "react";
import {BadgeContextEnum} from "../badgeDisplayTypes.jsx";
import Badge from "../../components/Badge.jsx";
import {signalBadgeRegistry} from "./signalBadgeRegistry.jsx";
import {getNormalizedScore} from "../../utils/generalUtils.js";

/**
 * Shared Badge interface
 * @param {Object} props
 * @param {Object} [props.signals]
 * @param {Function} [props.onSignalClick]
 * @param {BadgeContextEnum} [props.badgeContext]*/
export default function ScoreBadge({
                                        signals = {},
                                        onSignalClick,
                                        badgeContext = BadgeContextEnum.INLINE,
                                    }
) {
    const badge = signalBadgeRegistry.score

    if (!signals) {
        return <div className={"signal-badge-error"}
            ><img src={badge.logo_source} alt="Score ERROR"
        /> {'Error: No signal data available'}
        </div>;
    }

    let badgeData = {}  // what to send to dataset for badge element
    let badgeText = null  // what to show patron
    let badgeClass = "score-badge"

    try {
        const meta = signals?.meta || {};
        const score = getNormalizedScore(meta["ws_score"]);
        badgeData = {"score": score}
        badgeText = score < 0  // -1 means not provided
            ? <div>Not provided.</div>
            : <div>WikiSignals Overall Score: {score}</div>
        if (score < 0) badgeClass += " missing-value"

    } catch (e) {
        badgeData = {"error": e.message}
        badgeText = <div>Score Error Encountered: {e.message}</div>
        badgeClass += " missing-value"
    }

    return <Badge
        badgeContext={badgeContext}
        badgeImg={badge.image}
        badgeAlt="Score"
        badgeClass={badgeClass}
        badgeData={badgeData}
        badgeText={badgeText}
    />
}
