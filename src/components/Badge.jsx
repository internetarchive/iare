import React from "react";
import {BadgeContexts} from "../constants/badgeContexts.jsx";
import SortBox from "./SortBox.jsx";
import HeaderCell from "./HeaderCell.jsx";

export default function Badge({
                                  badgeKey = "",
                                  badgeClass = "",
                                  badgeContextKey = BadgeContexts.inline.value,

                                  badgeIcon = null,
                                  badgeText = null,
                                  badgeData = {},

                                  onBadgeHover,
                                  onBadgeClick,

                                  signals = {},

                              }
) {

    const badgeContext = BadgeContexts[badgeContextKey] || BadgeContexts.default

    const headerContent = (
        <>
            {badgeContext.hasIcon && (
                <div className={"signal-badge-element badge-icon"}>
                    {badgeIcon}
                </div>
            )}
            {badgeContext.hasText && (
                <div className={"signal-badge-element badge-text"}>
                    {badgeText}
                </div>
            )}
        </>
    );


    const headerSort = badgeContext.value === "sort"
        ? <SortBox className={"signal-badge-element"}/>
        : null

    const headerCellClass = [
        // "signal-badge",
        badgeClass
    ]
        .filter(Boolean).join(" ")

    return <div className={"signal-badge"}
                data-badgedata={JSON.stringify(badgeData)}
                data-badgekey={badgeKey}
                onMouseMove={onBadgeHover}
    >

        {badgeContext.headerCell &&
        <HeaderCell
            content={headerContent}
            sort={headerSort}
            headerClass={headerCellClass}
        />}

        {!badgeContext.headerCell && <>
        {headerContent}
        </>}

    </div>
}