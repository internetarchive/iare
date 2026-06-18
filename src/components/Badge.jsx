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
                                  badgeData = {},  // what gets put in data element of element

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

    // const debugContent = <div style={{display: "block", fontSize:"50%"}}>
    //     <div>BK: {badgeKey}</div>
    //     <div>MSK: {mainSortKey}</div>
    // </div>

    const badgeContent = (
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

    const cellClass = [
        "signal-badge",
        badgeClass
    ].filter(Boolean).join(" ")


    return <div className={cellClass}
                data-badgekey={badgeKey}
                data-badgedata={JSON.stringify(badgeData)}
                onMouseMove={onBadgeHover}
    >

        {/* if IS header cell */}
        {badgeContext.headerCell &&
        <HeaderCell
            content={badgeContent}
            sort={headerSort}
            headerClass={"flock-col"}
        />}

        {/* if NOT header cell */}
        {!badgeContext.headerCell && <>
        {badgeContent}
        </>}

    </div>
}