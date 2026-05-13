import React, { useContext } from "react";
import {BadgeContexts} from "../constants/badgeContexts.jsx";
import SortBox from "./SortBox.jsx";
import HeaderCell from "./HeaderCell.jsx";
import { ColumnSortContext } from "../contexts/ColumnSortContext"

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
    const columnSort = useContext(ColumnSortContext)
    const mainSortKey = columnSort?.sortBy[0]
    const mySortKey = `signal_${badgeKey}`
    let myDir = 0
    if (mySortKey === mainSortKey) {
        const mySortDef = columnSort.sorts[mySortKey]
        myDir = (mySortDef?.dir ?? 0) * -1
    }

    const debugContent = <div style={{display: "block", fontSize:"50%"}}>
        <div>BK: {badgeKey}</div>
        <div>MSK: {mainSortKey}</div>
    </div>

    const headerContent = (
        <>
            {badgeContext.hasIcon && (
                <div className={"signal-badge-element badge-icon"}>
                    {badgeIcon}
                    {/*{debugContent}*/}
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
        ? <SortBox
            className={"signal-badge-element"}
            direction={myDir}
        />
        : null

    const headerCellClass = [
        // "signal-badge",
        "flock-col",
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