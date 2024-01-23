import React, {useEffect, useState} from "react";
import DataGrid from "./DataGrid";
import ControlBox from "../../shared/ControlBox";
import {gridDef} from "./GridDefs"
import {ConfigContext} from "../../contexts/ConfigContext";
import {testGridData} from "./TestGridData";
import {nowTime} from "./dataUtils";


export default function ScoreBoard({options = {}}) {

    let myConfig = React.useContext(ConfigContext)
    myConfig = myConfig ? myConfig : {} // prevents undefined myConfig.[param_name] errors

    const gridDef2 = gridDef  // chrome dev tools does not like imported constants - it doesnt show 'em

    /*
    gridData is what is rendered in dashboard grid
    *** for now, it is totes hard-coded. it has a row entry for each item in gridItems, and each
        row has a place to hold information about that row (like fetch status, e.g.), and a column for
        data for each defined column in gridDef
    *** should be initialized with empty values for each entry of gridItems

    gridItems is a list of what the grid shows for each row of gridItems
    *** for now, gridItems is hard coded. eventually this could be fetched from a file,
        local browser data (from last time), a text file described by browser data, or,
        eventually, a list of urls from some source that passes back a list of urls. This could
        be iari/article.links data at some point.

    gridDef is the definition of the item being operated on, along with an array of column data_columns.
     */

    const [gridData, setGridData] = useState(testGridData)
    /*
    todo:

    - make an "initTestGrid from gridDefs, that has placeholders for data
        - setGridDef with  this value
        - for now, use TestGridData
     */

    const gridItems = [
        "https://www.bbc.com/news/business-63953096",
        "https://www.politico.com/amp/news/2022/11/09/crypto-megadonor-sam-bankman-fried-00066062",
    ]

    const testPromises = async () => {
        // const resultss = testPromiseA()
        // console.log("results of testPromiseA: ", results)
        // alert("testPromise: return from testPromiseA")

                // const item = "item1"
                // const promiseArray = [
                //     testPromiseA, testPromiseB, testPromiseC,
                // ]
                //
                // const var2 = "xyz"
                //
                // const myValues = await Promise.allSettled(promiseArray.map(promiseFunc => {
                //     return promiseFunc.call(item, var2)
                // }))
                //
                // console.log("testPromises returned values:", myValues)

        return "test promises results"
    }

    // returns dict of results for each column operation in gridDef for item specified.
    const fetchRowData = async (item, gridDef) => {

        const options = {
            iariBase: myConfig.iariSource,
        }

        const promiseArray = gridDef.column_order.map(column_key => {
            const operation = gridDef.data_columns[column_key].operation
            return (operation)()(item, options)  // NB Note self-calling function
        })

        const resultPromises = await Promise.allSettled(promiseArray);
        const rowData = {}
        resultPromises.forEach( promiseData => {
            const myData = promiseData.value  // this seems to work...
            // myData is assumed to have "key" and "data" properties
            rowData[myData.key] = myData.data
        })
        console.log("[" + nowTime() +  "]fetchRowData returned values:", rowData)
        return rowData
    }

    /*
        newRowData is assumed to be a keyed dict of column keys with their data
     */
    const setItemStatus = (item, newStatus) => {

        setGridData(oldGridData => {
            const newItemState = oldGridData[item]
            newItemState.row_info.fetch_status = newStatus
            return {
                ...oldGridData,
                [item]: newItemState
            }
        })
    }

    const insertRowData = (item, newRowData) => {

        console.log(`inserting new row data for ${item}`)

        // set new gridData state by replacing only new item's data

        setGridData(oldGridData => {

            // if oldGridData[item] exists, pull from it
            const newItemData = oldGridData[item]
                ? {...oldGridData[item]}
                : {
                    row_info: {
                        item_name: item,
                        fetch_status: 0,
                        fetch_timestamp: null,
                    },
                    row_data: {}
                }

            // replace any column data from newRowData in the current item's rowData
            Object.keys(newItemData.row_data).forEach( key => {
                newItemData.row_data[key] = newRowData[key]
            })

            // and set the row status for this item as settled ( 'OK', or 1 )
            newItemData.row_info.fetch_status = 1

            // and return state with new data
            return {
                ...oldGridData,
                [item]: newItemData
            }

        })
    }

    const refreshDataGrid = () => {

        gridItems.forEach( (item, i) => {
            // gets array/or dict of values for each operation as applied to item
                    // const results = fetchRowData(item, gridDef2)

            setItemStatus(item, 0)

            fetchRowData(item, gridDef2)

                .then( rowData => {
                    console.log(`[${nowTime()}] refreshDataGrid: rowData returned for row ${i}: `, rowData)

                    insertRowData(item, rowData)

                })
                .catch( e => {
                    alert(`refreshDataGrid: Encountered error: ${e.message}`)
                })
        })

        // errors should be caught in fetchRowData, and displayed with insertRowData if exists

            // } catch (error) {
            //     console.error('Error fetching data:', error.message);
            //     console.error(error.stack);
            //     setGridData([ {item: `Error encountered (${error.message})`}])
            // }
        console.log("refreshDataGrid: done")

    }


    const handleAction = (result) => {
        // error of not object like: {action: <action>, value: <value>}
        const {action, value} = result;
        console.log (`ScoreBoard:handleAction: action=${action}, value=${value}`);

        if (0) {
            // placebo to make coding easier for adding "else if" conditions
        }

        else if (action === "testPromises") {
            // value is ???
            testPromises().then( response => {

                console.log("ack!")
                alert("Results from testPromises: " + response)
            })  // ignore results
        }

        else if (action === "refreshDataGrid") {

            refreshDataGrid()
        }

        else {
            console.log(`ScoreBoard Action "${action}" not supported.`)
            alert(`Scoreboard Action "${action}" not supported.`)
        }

    }


    return <div className="scoreboard">
        <ControlBox caption={"Controls"} className={""}>
            <div className={"row controls"}>
                <div className={"col"} style={{paddingLeft: "0"}}>
                    <button type={"button"}
                            className={"btn utility-button debug-button"}
                            onClick={() => handleAction({action: "refreshDataGrid"})}>Refresh Data Grid
                    </button>
                    <button type={"button"}
                            className={"btn utility-button debug-button"}
                            onClick={() => handleAction({action:"testPromises"})}>Test Promise
                    </button>
                </div>
            </div>
        </ControlBox>

        <div className="row">
            <div className={"col"}>
                <DataGrid gridData={gridData} gridDef={gridDef2}/>
            </div>
        </div>

    </div>
}
