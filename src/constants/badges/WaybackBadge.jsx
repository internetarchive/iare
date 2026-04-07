import React from "react";
import waybackLogo from "./images/badge.logo.wayback.small.png";
import {BadgeContextEnum} from "../badgeDisplayTypes.jsx";
import Badge from "../../components/Badge.jsx";
import {getNormalizedCount, trimifyNumber} from "../../utils/generalUtils.js";

/**
 * Shared Badge interface
 * @param {Object} props
 * @param {Object} [props.signals]
 * @param {Function} [props.onSignalClick]
 * @param {BadgeContextEnum} [props.badgeContext]*/
export default function WaybackBadge({
                                         signals = {},
                                         onSignalClick,
                                         badgeContext = BadgeContextEnum.INLINE
                                     }
) {
    if (!signals) {
        return <div className={"signal-badge-error"}><img src={waybackLogo} alt="Wayback ERROR"/> {'Error: No signal data available'}</div>;
    }

    let badgeData = {}
    let badgeText = null
    let badgeClass = "wayback-badge"


    // // abbreviate number if big
                    // const badgeText = <>
                    //     {n >= 1000000
                    //         ? `${(n / 1000000).toFixed(1)}M`
                    //         : (n >= 1000
                    //             ? `${Math.round(n / 1000)}K`
                    //             : n)} snapshots<br/>
                    //     {wayback_first.split(' ')[0]} to {wayback_last.split(' ')[0]}
                    // </>


    try {
        const meta = signals?.meta || {};
        const count = getNormalizedCount(meta["ws_wbm_total"]);
        const wayback_first = meta["ws_wbm_first"] ?? 'N/A';
        const wayback_last = meta["ws_wbm_last"] ?? 'N/A';

        if (count < 0) {
            badgeText = <div>Not provided.</div>
        } else {
            badgeText = <>
                {trimifyNumber(count)} snapshots<br/>
                {wayback_first.split(' ')[0]} to {wayback_last.split(' ')[0]}
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
        badgeImg={waybackLogo}
        badgeAlt="Wayback"
        badgeData={badgeData}
        badgeText={badgeText}
        badgeClass={badgeClass}
    />

}
