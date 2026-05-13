import React from "react";
import {BadgeContexts} from "../badgeContexts.jsx";
import Badge from "../../components/Badge.jsx";
import {getPrettyCount} from "../../utils/generalUtils.js";
import signalBadgeRegistry from "./signalBadgeRegistry.jsx";

const noDataProvidedText = "---"

/**
 * Shared Badge interface
 * @param {Object} props
 * @param {Object} [props.signals]
 * @param {Function} [props.onSignalClick]
 * @param {BadgeContexts} [props.badgeContext]
 */
export default function EnwikiBadge({
                                        signals = {},
                                        badgeContextKey = BadgeContexts.inline.value,
                                        onAction,
                                    }
) {

    const badgeDef = signalBadgeRegistry.enwiki
    const badgeContext = BadgeContexts[badgeContextKey] || BadgeContexts.default

    let badgeData = {}
    let badgeText = null
    let badgeClass = badgeDef.class_name

    if (badgeContextKey !== BadgeContexts.sort.value && !signals) {
        return <div className={"signal-badge-error"}><img
            src={badgeDef.logo}
            alt="Enwiki ERROR"/> {'Error: No signal data available'}
        </div>;
    }

    if (badgeContext.hasText) {

        try {
            const meta = signals?.meta || {}
            // const wikiCount = trimifyNumber(meta["ws_wiki_cite_en"] ?? 0)
            const count = getPrettyCount(meta["ws_wiki_cite_en"]);
            badgeData = {"wikicount": count}

            if (count < 0) {  // -1 means not provided
                badgeText = <div>{noDataProvidedText}</div>
                badgeClass += " missing-value"
            } else {
                // badgeText = <div>{`Wiki Count: ${count}`}</div>
                badgeText = <div>{`${count}`}</div>
            }

        } catch (e) {
            badgeData = {"error": e.message}
            badgeText = <div>Error Encountered: {e.message}</div>
            badgeClass += " missing-value"  // format for error
        }
    }

    const badgeIcon = <img src={badgeDef.logo} alt={badgeDef.label} className={"logo-image"}/>

    return <Badge
        badgeKey={badgeDef.key}
        badgeContextKey={badgeContextKey}
        badgeClass={badgeClass}
        badgeIcon={badgeIcon}
        badgeText={badgeText}
        badgeData={badgeData}
    />

}
