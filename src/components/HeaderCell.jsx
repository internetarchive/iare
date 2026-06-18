import React from "react";
import { BadgeContexts } from "../constants/badgeContexts.jsx";

export default function HeaderCell({
                                       content = null,
                                       sort = null,
                                       badgeKey = "",
                                       headerClass = "",
                                       cellData = {},
                                   }) {

    const headerCellClassName = [
        "header-cell",
        headerClass,
    ].filter(Boolean).join(" ")  // skips headerClass if not defined

    const datasetProps = Object.fromEntries(
        Object.entries(cellData).map(([key, value]) => [
            `data-${key.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`)}`,
            value
        ])
    )

    const sortDisplay = sort
        ? <div className={"header-cell-sort"}>
            {sort}
        </div>

        : null

    return (
        <div className={headerCellClassName}
             {...datasetProps}
        >
            <div className={"header-cell-content"}>
                {content}
                {/*{children}*/}
            </div>
            {sortDisplay}
        </div>
    )
}