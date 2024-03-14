import React from "react";
import DataRow from "./DataRow";
import './datagrid.css'

/*
display gridData using gridDef as template
 */
export default function DataGrid({gridData = null, gridDef = {}}) {

    // exit with message if no columns to show
    if (!gridDef?.column_order?.length) {
        return <div className="data-grid">
            <p>No columns defined!</p>
        </div>
    }

    // exit with message if no column data to show
    if (!gridData || !Object.keys(gridData).length) {
        return <div className="data-grid">
            <p>No grid data to show!</p>
        </div>
    }

    /*
    headerRow is comprised of first column showing caption from gridDef.item_column,
    followed by captions of data columns from gridDef.data_columns
     */
    const headerRow = <div className={"row header-row"}>
        <div className={"col col-1 status-col"}>{gridDef?.item_status?.caption}</div>
        <div className={"col col-5 item-col"} >{gridDef?.item_column?.caption}</div>
        <div className={"col col-6 data-cols"}>
            {gridDef.column_order.map( (column_type, i) => {
                const caption = gridDef.data_columns[column_type].caption
                return <div className={"col"} data-column_type={column_type} key={i} >{caption}</div>
            })}
        </div>
    </div>

    /*
    data rows from gridData
     */
    const dataRows = Object.keys(gridData).length
        ? Object.keys(gridData).map(itemKey => {
                return <DataRow itemData={gridData[itemKey]} gridDef={gridDef} />
            })
        : "No rows to show! (gridData has no entries)"

    return <>
        <h3>Data Grid</h3>
        <div className="data-grid">
            {headerRow}
            {dataRows}
        </div>
    </>
}
