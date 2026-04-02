import React from "react";
import trancoLogo from './images/badge.logo.tranco.png';
import {BadgeContextEnum} from "../badgeDisplayTypes.jsx";
import Badge from "../../components/Badge.jsx";
import mbfcLogo from "./images/badge.logo.mbfc.small.png";

/**
 * Shared Badge interface
 * @param {Object} props
 * @param {Object} [props.signals]
 * @param {Function} [props.onSignalClick]
 * @param {BadgeContextEnum} [props.badgeContext]*/
export default function TrancoBadge({
                                        signals = {},
                                        onSignalClick,
                                        badgeContext = BadgeContextEnum.INLINE,
                                    }
) {
    /*
        we're gonna assume tranco rating is from signals.meta.ws_web_rank
    */

    if (!signals) {
        return <div className={"signal-badge-error"}><img src={mbfcLogo}
                                                          alt="Wayback ERROR"/> {'Error: No signal data available'}
        </div>;
    }

    let badgeData = {}
    let badgeText = null

    try {
        const meta = signals?.meta || {};
        const tranco = meta["ws_web_rank"] ?? 0;  // placeholder for now
        badgeData = {"tranco": tranco}
        badgeText = <div>Tranco rating: {tranco}</div>

    } catch (e) {
        badgeData = {"error": e.message}
        badgeText = <div>MBFC Error Encountered: {e.message}</div>
    }

    return <Badge
        badgeContext={badgeContext}
        badgeImg={trancoLogo}
        badgeAlt="Tranco"
        badgeClass={"tranco-badge"}
        badgeData={badgeData}
        badgeText={badgeText}
    />
}
