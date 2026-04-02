import React from "react";
import {BadgeContextEnum} from "../constants/badgeDisplayTypes.jsx";
import waybackLogo from "../constants/badges/images/badge.logo.wayback.small.png";

export default function Badge({
                            badgeContext = BadgeContextEnum.INLINE,
                            badgeClass = "",
                            signals = {},
                            onBadgeClick,
                            badgeImg = null,
                            badgeAlt = null,
                            badgeData = {},
                            badgeText = null,}
) {

    return <div className={`signal-badge ${badgeClass}`}
                data-badgedata={JSON.stringify(badgeData)}>

        <div className={"signal-badge-element badge-icon"}>
            <img src={badgeImg} alt={badgeAlt} className={"logo-image"}/>
        </div>

        {badgeContext !== BadgeContextEnum.INLINE ? badgeText : null}

    </div>
}