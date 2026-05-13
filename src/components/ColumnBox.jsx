import React, { useContext } from "react";
import {BadgeContexts} from "../constants/badgeContexts.jsx";
import SortBox from "./SortBox.jsx";
import HeaderCell from "./HeaderCell.jsx";
import {urlColumnDefs} from "../constants/urlColumnDefs.jsx";
import { ColumnSortContext } from "../contexts/ColumnSortContext"

const convertColumnToSort = {
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


    const columnDef = urlColumnDefs.columns[columnKey] ?? {}
    const columnSort = useContext(ColumnSortContext)
    const mainSortKey = columnSort.sortBy[0]

    const mySortKey = convertColumnToSort[columnKey]
    let myDir = 0
    if (mySortKey === mainSortKey) {
        const mySortDef = columnSort.sorts[mySortKey]
        myDir = (mySortDef?.dir ?? 0)
    }

    const headerSort = columnDef.sortable
        ? <SortBox className={"signal-badge-element"}
                   label={mainSortKey}
                   direction={myDir}/>
        : null

    const headerCellClass = [
        // "signal-badge",
        columnClass
    ]
        .filter(Boolean).join(" ")

    const debugContent = <div style={{display: "block", fontSize:"50%"}}>
        <div>CK: {columnKey}</div>
        <div>MSK: {mainSortKey}</div>
    </div>

    return <HeaderCell
        content={<>
            {/*{debugContent}*/}
            {content}
        </>}
        sort={headerSort}
        headerClass={headerCellClass}
        cellData={{
            "columnKey": columnKey,
        }}
    />
}