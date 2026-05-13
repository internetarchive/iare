import React from "react";
import {BadgeContexts} from "../badgeContexts.jsx";
import Badge from "../../components/Badge.jsx";
import {getNormalizedCount, trimifyNumber} from "../../utils/generalUtils.js";
import signalBadgeRegistry from "./signalBadgeRegistry.jsx";

const noDataProvidedText = "---"

/**
 * Shared Badge interface
 * @param {Object} props
 * @param {Object} [props.signals]
 * @param {Function} [props.onSignalClick]
 * @param {BadgeContexts} [props.badgeContext]*/
export default function WaybackBadge({
                                         signals = {},
                                         badgeContextKey = BadgeContexts.inline.value,
                                         onAction,
                                     }
) {
    if (!signals) {
        return <div className={"signal-badge-error"}><img src={waybackLogo} alt="Wayback ERROR"/> {'Error: No signal data available'}</div>;
    }

    const badgeDef = signalBadgeRegistry.wayback
    const badgeContext = BadgeContexts[badgeContextKey] || BadgeContexts.default

    let badgeIcon = null
    let badgeData = {}
    let badgeText = null
    let badgeClass = badgeDef.class_name


    if (badgeContext.hasIcon) {
        badgeIcon = <img src={badgeDef.logo} alt={badgeDef.label} className={"logo-image"}/>
    }

    if (badgeContext.hasText) {

        try {
            const meta = signals?.meta || {};
            const count = getNormalizedCount(meta["ws_wbm_total"]);
            const wayback_first = meta["ws_wbm_first"] ?? 'N/A';
            const wayback_last = meta["ws_wbm_last"] ?? 'N/A';

            if (count < 0) {
                badgeText = <div>{noDataProvidedText}</div>
            } else {
                badgeText = <>
                    {/*    /!*{`${trimifyNumber(count)} total snapshots`}<br/>*!/*/}
                    {/*    {`${trimifyNumber(count)}`}<br/>*/}

                    {/*    {new Date(wayback_first.split(' ')[0]).toLocaleString('en-US', {*/}
                    {/*        // month: 'long',*/}
                    {/*        year: 'numeric'*/}
                    {/*    })} to {new Date(wayback_last.split(' ')[0]).toLocaleString('en-US', {*/}
                    {/*    // month: 'long',*/}
                    {/*    year: 'numeric'*/}
                    {/*})}*/}

                    <span>{((new Date(wayback_last) - new Date(wayback_first)) /
                    (1000 * 60 * 60 * 24 * 365)).toFixed(1)} y</span>

                    {/*{new Date(wayback_first.split(' ')[0]).toLocaleString('en-US', {*/}
                    {/*    month: 'long',*/}
                    {/*    year: 'numeric'*/}
                    {/*})} to {new Date(wayback_last.split(' ')[0]).toLocaleString('en-US', {*/}
                    {/*    month: 'long',*/}
                    {/*    year: 'numeric'*/}
                    {/*})}*/}
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
