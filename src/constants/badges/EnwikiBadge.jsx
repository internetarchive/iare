import React from "react";
import wikiLogo from './images/badge.logo.wiki.png';
import {BadgeContextEnum} from "../badgeDisplayTypes.jsx";
import Badge from "../../components/Badge.jsx";
import {trimifyNumber} from "../../utils/generalUtils.js";

/**
 * Shared Badge interface
 * @param {Object} props
 * @param {Object} [props.signals]
 * @param {Function} [props.onSignalClick]
 * @param {BadgeContextEnum} [props.badgeContext]
 */
export default function EnwikiBadge({
                                        signals = {},
                                        onSignalClick,
                                        badgeContext = BadgeContextEnum.INLINE,
                                    }
) {


    if (!signals) {
        return <div className={"signal-badge-error"}><img src={wikiLogo} alt="Wayback ERROR"/> {'Error: No signal data available'}</div>;

    }

    let badgeData = {}
    let badgeText = null

    try {
        const meta = signals?.meta || {}
        const wikiCount = trimifyNumber(meta["ws_wiki_cite_en"] ?? 0)
        badgeData = {"wikicount": wikiCount}
        badgeText = <div>Wiki Count: {wikiCount}</div>
    } catch (e) {
        badgeData = {"error": e.message}
        badgeText = <div>Error Encountered: {e.message}</div>
    }


    return <Badge
        badgeContext={badgeContext}
        badgeImg={wikiLogo}
        badgeAlt="Wikipedia"
        badgeData={badgeData}
        badgeText={badgeText}
        badgeClass={"enwiki-badge"}
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
