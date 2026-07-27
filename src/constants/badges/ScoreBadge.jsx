import React from "react";
import {BadgeContexts} from "../badgeContexts.jsx";
import Badge from "../../../_notes/_archive/Badge.jsx";
import signalBadgeRegistry from "./signalBadgeRegistry.jsx";
import {getNormalizedScore} from "../../utils/generalUtils.js";

const noDataProvidedText = "---"

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
 * @param {BadgeContexts} [props.badgeContext]*/
export default function ScoreBadge({
                                       signals = {},
                                       badgeContextKey = BadgeContexts.inline.key,
                                       onAction,
                                    }
) {
    const badgeDef = signalBadgeRegistry.score
    const badgeContext = BadgeContexts[badgeContextKey] || BadgeContexts.default

    if (!signals) {
        return <div className={"signal-badge-error"}
            ><img src={badgeDef.logo_source} alt="Score ERROR"
        /> {'Error: No signal data available'}
        </div>;
    }

    let badgeData = {}  // what to include in dataset
    let badgeText = null  // what to show patron
    let badgeClass = badgeDef.class_name  // how to style

    let scoreColor = "#888888"
    let badgeSvg = null
    let badgeIcon = null

    if (badgeContext.hasIcon) {

        badgeIcon = <div className={"badge-icon-wrapper"} style={{"--score-color": scoreColor}}>
            <img src={badgeDef.logo} alt={"WikiSignal Score"}/>
        </div>
    }

    if (badgeContext.hasText) {

        try {
            const meta = signals?.meta || {}
            const score = getNormalizedScore(meta["ws_score"])
            const score100 = Math.floor(score * 100)

            badgeData = {"score": score}
            badgeText = score < 0  // -1 means not provided
                ? <div>{noDataProvidedText}</div>
                : <div>{`${score}`}</div>

            // class for missing value
            if (score < 0) badgeClass += " missing-value"

            // set color of bar
            if (score > 0) {
                scoreColor = getTemperatureColor(score);
            }

        } catch (e) {
            badgeData = {"error": e.message}
            badgeText = <div>Score Error Encountered: {e.message}</div>
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
