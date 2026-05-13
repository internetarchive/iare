import React from "react";
import { BadgeContexts } from "../constants/badgeContexts.jsx";

export default function HeaderCell({
                                       content = null,
                                       sort = null,
                                       badgeKey = "",
                                       headerClass = "",
                                       // columnSort,
                                       //
                                       // headerKey = "",
                                       // headerContextKey = BadgeContexts.inline?.value ?? "",
                                       // headerIcon = null,
                                       // headerText = null,
                                       // headerData = {},
                                       //
                                       // sortKey = "",
                                       // sortDirection = "",
                                       // isSortable = false,
                                       // isActive = false,
                                       // isDisabled = false,
                                       //
                                       // onHeaderHover,
                                       // onHeaderClick,
                                       // onSortClick,
                                       //
                                       // children = null,
                                   }) {

    const headerCellClassName = [
        "header-cell",
        headerClass,
        // isSortable ? "header-cell-sortable" : "",
        // headerContextKey ? `header-cell-context-${headerContextKey}` : "",
        // isActive ? "header-cell-active" : "",
        // sortDirection ? `header-cell-sort-${sortDirection}` : "",
        // isDisabled ? "header-cell-disabled" : "",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={headerCellClassName}>
            <div className={"header-cell-content"}>
                {content}
                {/*{children}*/}
            </div>
            <div className={"header-cell-sort"}>
                {sort}
            </div>
        </div>
    )
}