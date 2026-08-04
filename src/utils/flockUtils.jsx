import {urlColumnRegistry} from "../constants/urlColumnRegistry.tsx";
// import {httpStatusCodes, iabotLiveStatusCodes} from "../constants/httpStatusCodes.jsx";
// import {ACTIONABLE_FILTER_MAP} from "../constants/actionableMap.jsx";
import Markdown from "react-markdown";


/**
 * Determines and returns the tooltip content for a given column or row in a table-like structure.
 *
 * @param {Event} e - The event object used to identify the target element for tooltip generation.
 * @param {Object} urlDict - (Optional) A dictionary mapping URLs to related data, used for tooltips in specific scenarios.
 * @returns {React.ReactNode|null} A React element representing the tooltip's content, or null if no suitable content is found.
 */
export const getColumnTooltip = (e, urlDict = {}) => {
    let el = null

    // for header sort row...
    el = e.target.closest('.header-cell-sort')
    if (el) {
        return <div>Click to Sort</div>
        // TODO: place more specific text here for what is sorting and how and what high and low means
    }

    // for header row...
    el = e.target.closest('.flock-header .flock-col')
    if (el) {
        const columnKey = el.dataset.columnKey;
        const columnDef = urlColumnRegistry.columns[columnKey]
        if (!columnDef) return null

        if (columnDef.ttMarkup) return <Markdown>{columnDef.ttMarkup}</Markdown>
        if (columnDef.caption) return <div>{columnDef.caption}</div>
        return <div>Tooltip for {columnKey}</div>  // unhandled column - we should not get here
    }

    // for data error row...
    el = e.target.closest('.url-row-error')
    if (el) {
        return el.currentTarget.getAttribute('data-err-text');
    }

    // for data row...
    const rowEl = e.target.closest('.flock-row')
    if (rowEl) {
        // get dataset from row's data...
        const dataset = rowEl.dataset

        el = e.target.closest('.flock-col')
        const columnKey = el ? el.dataset.columnKey : null
        const columnDef = urlColumnRegistry.columns[columnKey]
        if (!columnDef) return null
        // return columnDef.ttCell(dataset)
        return columnDef.ttCell(dataset, urlDict)
        // NB TODO *could* get this info directly from urlObj data
    }

    return null
}

            // // export const getColumnDataTooltip = (rowEl, columnClass) => {
            // export const getColumnDataTooltip = (dataset, columnClass) => {
            //
            //     // const dataset = rowEl.dataset
            //
            //     if (columnClass === "url-live_status") {
            //         const statusDescription = httpStatusCodes[dataset.status_code]
            //         return <div>Live Status:<br/>{dataset.status_code}: {statusDescription}</div>
            //     }
            //
            //     if (columnClass === "url-archive_status") {
            //         if (dataset.is_book === "true") {
            //             return <div>Book</div>
            //         }
            //
            //         return dataset.live_state
            //             ? <div>{dataset.archive_status === "true"
            //                 ? 'Archived'
            //                 : 'Not Archived'}
            //             <br/>IABot live_state: {dataset.live_state} - {iabotLiveStatusCodes[dataset.live_state]}</div>
            //
            //             : <div>Archive status = {dataset.archive_status}<br/>
            //                 IABot live_state is undefined</div>
            //     }
            //
            //     if (columnClass === "url-citations") {
            //         return dataset.citation_status && dataset.citation_status !== '--'
            //             ? <div>Link Status {'"' + dataset.citation_status + '"'} as indicated in Citation</div>
            //             : <div>No Link Status defined in Citation</div>
            //
            //     }
            //
            //     if (columnClass === "url-actionable" || columnClass === "yes-actionable") {
            //         const actionableKey = dataset.actionable
            //         const desc = ACTIONABLE_FILTER_MAP[actionableKey]?.desc
            //         return desc
            //             ? <div>Actionable Item:<br/>{desc}<br/>Click to fix.</div>
            //             : null
            //
            //     }
            //
            //     if (columnClass === "url-signals") {
            //         return null
            //         // return "signal data not yet implemented"
            //     }
            //
            //     // if not a special case column, show tooltip from column definition
            //     const ttCaption = urlColumnRegistry.columns[columnClass]?.ttCaption
            //     if (ttCaption) return <div>{ttCaption}</div>
            //
            //     return null
            // }


export const getSortKeyForColumn = (e) => {
    const sortKey = e.target.closest('.flock-col')?.dataset?.columnKey
    console.log(`getSortKeyForColumn: sortKey: ${sortKey}`)
    return sortKey
}




