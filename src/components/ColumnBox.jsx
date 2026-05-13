import React from "react";
import {BadgeContexts} from "../constants/badgeContexts.jsx";
import SortBox from "./SortBox.jsx";
import HeaderCell from "./HeaderCell.jsx";
import {urlColumnDefs} from "../constants/urlColumnDefs.jsx";


export default function ColumnBox({
                                      content = null,
                                      columnClass = "",
                                      columnKey = "",
                              }
) {

    const columnDef = urlColumnDefs.columns[columnKey] ?? {}

    const headerSort = columnDef.sortable
        ? <SortBox className={"signal-badge-element"}/>
        : null

    const headerCellClass = [
        // "signal-badge",
        columnClass
    ]
        .filter(Boolean).join(" ")

    return <HeaderCell
                content={content}
                sort={headerSort}
                headerClass={headerCellClass}
                cellData = {{
                    "columnKey": columnKey,
                }}
    />
}