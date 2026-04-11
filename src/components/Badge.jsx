import React from "react";
import {BadgeContextEnum} from "../constants/badgeDisplayTypes.jsx";
import waybackLogo from "../constants/badges/images/badge.logo.wayback.small.png";

export default function Badge({
                            badgeContext = BadgeContextEnum.INLINE,
                            badgeClass = "",
                            badgeKey = "",
                            signals = {},
                            onBadgeClick,
                            onBadgeHover,
                            badgeImg = null,
                            badgeAlt = null,
                            badgeData = {},
                            badgeText = null,}
) {

    return <div className={`signal-badge ${badgeClass}`}
                data-badgedata={JSON.stringify(badgeData)}
                data-badgekey={badgeKey}
    >

        <div className={"signal-badge-element badge-icon"}
             onMouseOver={onBadgeHover}>
            <img src={badgeImg} alt={badgeAlt} className={"logo-image"}/>
        </div>

        {badgeContext !== BadgeContextEnum.INLINE
            ? <div className={"signal-badge-element badge-text"}>{badgeText}</div>
            : null}

    </div>
}