import React, { useContext } from "react";
import {BadgeContexts} from "../constants/badgeContexts.jsx";
import SortBox from "./SortBox.jsx";
import HeaderCell from "./HeaderCell.jsx";
import {urlColumnRegistry} from "../constants/urlColumnRegistry.jsx";
import { ColumnSortContext } from "../contexts/ColumnSortContext"

const convertColumnToSort = {
    // columnKey: columSortKey
    "url-name": "name",
    "url-live_status": "status",
    "url-archive_status": "archive_status",
    "url-actionable": "actionable",
}


export default function ColumnBox({
                                      content = null,
                                      columnClass = "",
                                      columnKey = "",
                              }
) {


    const columnDef = urlColumnRegistry.columns[columnKey] ?? {}
    const columnSort = useContext(ColumnSortContext)
    let headerSort = null

    if (columnSort) {
        const mainSortKey = columnSort.sortBy[0]
        const mySortKey = convertColumnToSort[columnKey]

        let myDir = 0
        if (mySortKey === mainSortKey) {
            const mySortDef = columnSort.sorts[mySortKey]
            myDir = (mySortDef?.dir ?? 0)
        }

        headerSort = columnDef.sortable
            ? <SortBox className={"signal-badge-element"}
                       label={mainSortKey}
                       direction={myDir}/>
            : null
    }

    const headerCellClass = [
        // "signal-badge",
        columnClass
    ]
        .filter(Boolean).join(" ")

    return <HeaderCell
        content={<>
            {content}
        </>}
        sort={headerSort}
        headerClass={headerCellClass}
        cellData={{
            "columnKey": columnKey,
        }}
    />
}