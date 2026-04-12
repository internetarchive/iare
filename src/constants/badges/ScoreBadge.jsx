import React from "react";
import {BadgeContextEnum} from "../badgeDisplayTypes.jsx";
import Badge from "../../components/Badge.jsx";
import {signalBadgeRegistry} from "./signalBadgeRegistry.jsx";
import {getNormalizedScore} from "../../utils/generalUtils.js";

function getTemperatureColor(value) {
    const v = Math.max(0, Math.min(1, value)); // clamp 0–1

    let r, g;

    const greenMax = 210; // darker than 255

    if (v < 0.5) {
        // red → yellow (increase green)
        r = 255;
        g = Math.round(greenMax * (v / 0.5));
    } else {
        // yellow → green (decrease red)
        r = Math.round(255 * (1 - (v - 0.5) / 0.5));
        g = greenMax;
    }

    return `rgb(${r}, ${g}, 0)`;
}

function getTemperatureColor2(value) {
    const v = Math.max(0, Math.min(1, value));

    const hue = v * 120; // red → green
    const lightness = 45; // darker than default 50%

    return `hsl(${hue}, 100%, ${lightness}%)`;
}

/**
 * Shared Badge interface
 * @param {Object} props
 * @param {Object} [props.signals]
 * @param {Function} [props.onSignalClick]
 * @param {BadgeContextEnum} [props.badgeContext]*/
export default function ScoreBadge({
                                        signals = {},
                                        onBadgeClick,
                                        badgeContext = BadgeContextEnum.INLINE,
                                    }
) {
    const badgeDef = signalBadgeRegistry.score

    if (!signals) {
        return <div className={"signal-badge-error"}
            ><img src={badgeDef.logo_source} alt="Score ERROR"
        /> {'Error: No signal data available'}
        </div>;
    }

    let badgeData = {}  // what to send to dataset for badge element
    let badgeText = null  // what to show patron
    let badgeClass = "score-badge"
    let scoreColor = "#888888"

    try {
        const meta = signals?.meta || {};
        const score = getNormalizedScore(meta["ws_score"]);
        badgeData = {"score": score}
        badgeText = score < 0  // -1 means not provided
            ? <div>Not provided.</div>
            : <div>WikiSignals Overall Score: {score}</div>
        if (score < 0) badgeClass += " missing-value"
        if (score > 0) {
            scoreColor = getTemperatureColor(score);
        }

    } catch (e) {
        badgeData = {"error": e.message}
        badgeText = <div>Score Error Encountered: {e.message}</div>
        badgeClass += " missing-value"
    }

    const badgeIcon = <div className={"badge-icon-wrapper"}
                           style={{"--badge-color": scoreColor}}>
        <img src={badgeDef.logo} alt={badgeDef.label} className={"logo-image"}/>
    </div>

    return <Badge
        badgeContext={badgeContext}
        badgeKey={badgeDef.key}
        badgeClass={badgeClass}
        badgeIcon={badgeIcon}
        badgeText={badgeText}
        badgeData={badgeData}
    />
}
