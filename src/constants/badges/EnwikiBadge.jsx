import React from "react";
import wikiLogo from './images/badge.logo.wiki.png';
import {BadgeContextEnum} from "../badgeDisplayTypes.jsx";
import Badge from "../../components/Badge.jsx";
import {trimifyNumber, getPrettyCount, getNormalizedScore} from "../../utils/generalUtils.js";
import {signalBadgeRegistry} from "./signalBadgeRegistry.jsx";

/**
 * Shared Badge interface
 * @param {Object} props
 * @param {Object} [props.signals]
 * @param {Function} [props.onSignalClick]
 * @param {BadgeContextEnum} [props.badgeContext]
 */
export default function EnwikiBadge({
                                        signals = {},
                                        badgeContext = BadgeContextEnum.INLINE,
                                        onBadgeClick,
                                    }
) {

    const badgeDef = signalBadgeRegistry.enwiki

    if (!signals) {
        return <div className={"signal-badge-error"}><img src={badgeDef.logo} alt="Enwiki ERROR"/> {'Error: No signal data available'}</div>;

    }

    let badgeData = {}
    let badgeText = null
    let badgeClass = "enwiki-badge"

    try {
        const meta = signals?.meta || {}
        // const wikiCount = trimifyNumber(meta["ws_wiki_cite_en"] ?? 0)
        const count = getPrettyCount(meta["ws_wiki_cite_en"]);
        badgeData = {"wikicount": count}

        if (count < 0) {  // -1 means not provided
            badgeText = <div>Not provided.</div>
            badgeClass += " missing-value"
        } else {
            badgeText = <div>Wiki Count: {count}</div>
        }

    } catch (e) {
        badgeData = {"error": e.message}
        badgeText = <div>Error Encountered: {e.message}</div>
        badgeClass += " missing-value"  // format for error
    }

    return <Badge
        badgeContext={badgeContext}

        badgeKey={badgeDef.key}
        badgeImg={badgeDef.logo}
        badgeAlt={badgeDef.label}
        // badgeImg={wikiLogo}
        // badgeAlt="Wikipedia"

        badgeData={badgeData}
        badgeText={badgeText}
        badgeClass={badgeClass}
    />

    // return <div className={"badge-enwiki signal-badge"}>
    //     <div className={"signal-badge-element"}>
    //         <img src={wikiLogo} alt="Wikipedia" className={"logo-image"}/>
    //     </div>
    //     <div className={"signal-badge-element"}>
    //         {badge}
    //     </div>
    // </div>

}
