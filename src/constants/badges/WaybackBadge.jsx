import React from "react";
import {BadgeContextEnum} from "../badgeDisplayTypes.jsx";
import Badge from "../../components/Badge.jsx";
import {getNormalizedCount, trimifyNumber} from "../../utils/generalUtils.js";
import {signalBadgeRegistry} from "./signalBadgeRegistry.jsx";

/**
 * Shared Badge interface
 * @param {Object} props
 * @param {Object} [props.signals]
 * @param {Function} [props.onSignalClick]
 * @param {BadgeContextEnum} [props.badgeContext]*/
export default function WaybackBadge({
                                         signals = {},
                                         badgeContext = BadgeContextEnum.INLINE,
                                         onAction,
                                     }
) {
    if (!signals) {
        return <div className={"signal-badge-error"}><img src={waybackLogo} alt="Wayback ERROR"/> {'Error: No signal data available'}</div>;
    }

    const badgeDef = signalBadgeRegistry.wayback
    const badgeIcon = <img src={badgeDef.logo} alt={badgeDef.label} className={"logo-image"}/>

    let badgeData = {}
    let badgeText = null
    let badgeClass = "wayback-badge"

    try {
        const meta = signals?.meta || {};
        const count = getNormalizedCount(meta["ws_wbm_total"]);
        const wayback_first = meta["ws_wbm_first"] ?? 'N/A';
        const wayback_last = meta["ws_wbm_last"] ?? 'N/A';

        if (count < 0) {
            badgeText = <div>Not provided.</div>
        } else {
            badgeText = <>
                {trimifyNumber(count)} total snapshots<br/>

                {new Date(wayback_first.split(' ')[0]).toLocaleString('en-US', {
                    month: 'long',
                    year: 'numeric'
                })} to {new Date(wayback_last.split(' ')[0]).toLocaleString('en-US', {month: 'long', year: 'numeric'})}
            </>
        }
        if (count < 0) badgeClass += " missing-value"

        badgeData = {
            wayback_first: wayback_first.split(' ')[0],
            wayback_last: wayback_last.split(' ')[0],
            wayback_total: count,
        }

    } catch (e) {
        badgeData = {"error": e.message}
        badgeText = <div>Wayback Error Encountered: {e.message}</div>
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
