import React from "react";
import RawJson from "../RawJson";
// import {ConfigContext} from "../../contexts/ConfigContext"
// import PureJson from "../utils/PureJson";
// import RawJson from "../RawJson";
/*
data is fully resolved by the time it gets here.
each cell of data is rendered according to that cell's type of disply
may be defined in gridDef[column_type]

- for each row
    - if in-progress is true
        - set a wait icon at start of row somehow
            - animation of column cell : left to right - thats kinda cool!
        - set a question mark for each data column, maybe
    - if in-progress is false (interpret as good data)
        - display column data

*/

const displayUrlStatus = (cellData) => {
    // cellData is/should be an array of value dicts:
    // {
    //     value: "?",  // data to show
    //     elapsed: 100,  // time it took for operation
    //     timestamp: null,
    // }

    // return <div><RawJson obj={cellData}/></div>

    const displayData = Array.isArray(cellData) ? cellData : [cellData]

    return displayData.map( (d,i) => {
        // return <div key={i}><RawJson obj={cellData}/></div>

        return <>
            <div className={"url-status-col"} key={i} >
                <div className={"status-code"}>{d?.status_code ? d.status_code : "?"}</div>
                <div>{d?.elapsed ? `${Math.trunc(d.elapsed)} ms` : "~"}</div>
                {d?.status_code_error_details && d.status_code === 0
                    ? d.status_code_error_details
                    : null}
            </div>

        </>

    })
}

export default function DataRow({itemData = null, gridDef = {}}) {
    /*
    do the item caption -
    rowData.row_info.item

    then, display for each column as dictated by gridDefs.column_order as key:
    display data for each column:
        use operation key for order
        use operator_key (or column_key) to get data from row_data:
            - row_data[operator_key].data
            - use first data element, then get .value
            - use gridDef.data_columns[operation_key].display_type to
              determine how to display. if "url_status_array", then
              pass data to that function (or component) and display
              it accordingly. nice!

              NB TODO add display components, which take data, to displayComponent, or
              Operator Components directory.

    rowData.row_data.keys

    ? take from gridDef column_order?

    map , take data from rowData, which is keyed by column_type
     */

    const renderDataCell = (columnType, cellData) => {

        const renderMethod = gridDef.data_columns[columnType].render

        // console.log(`render data cell, columnType = ${columnType}, renderMethod =${renderMethod}`)

        if (0) {}  // allows us to use "else if" indiscriminately for all "else if" options

        // perform one of our stock functions, if we have 'em
        else if (renderMethod === "url_status_array") {  // could use enum constants here
            return displayUrlStatus(cellData)
        }

        // else return raw json of unhandled render method
        else {
            return <RawJson obj={cellData} />
        }

    }


    const cols = gridDef.column_order.map( (columnType, i) => {

        // get data for our column type from row data
        const cellData = itemData?.row_data[columnType]

        return <div className={"col"} key={i}>
            {renderDataCell( columnType, cellData, i )}
        </div>
    })

    const fetchStatusClass = itemData.row_info.fetch_status === 0 ? "fetch-on"
        : itemData.row_info.fetch_status === 1 ? "fetch-off"
            : ""

    // TODO NB could make item's hash the key value here...
    return <div className={"row data-row no-gutter"} key={itemData.key}>

        <div key={1} className={`col col-1 status-col`}><span className={`${fetchStatusClass}`}>{itemData.row_info.fetch_status}</span></div>

        <div key={2} className={"col col-5 item-col"}>{itemData.row_info.item_name}</div>

        <div key={3} className={"col col-6 data-cols"}>{cols}</div>

    </div>

}
