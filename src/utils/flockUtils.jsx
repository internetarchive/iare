import {urlColumnRegistry} from "../constants/urlColumnRegistry.jsx";
import signalBadgeRegistry, {signalBadgePrefix} from "../constants/badges/signalBadgeRegistry.jsx";
import {marked} from "marked";
import {httpStatusCodes, iabotLiveStatusCodes} from "../constants/httpStatusCodes.jsx";
import {ACTIONABLE_FILTER_MAP} from "../constants/actionableMap.jsx";
import Markdown from "react-markdown";


const getSignalColumnTooltip = (columnClass) => {

    if (!columnClass) return null

    const badgeKey = columnClass.split('signal-')[1] // Extract badgeKey from columnClass
    const badgeDef = signalBadgeRegistry[badgeKey]

                    // if (badgeDef?.tooltipHtml) return badgeDef.tooltipHtml

    if (badgeDef?.tooltipMarkup) {
        // return marked(badgeDef.tooltipMarkup) // marked converts MD (markdown) text to html
        return <Markdown>{badgeDef.tooltipMarkup}</Markdown>

    }

    if (badgeDef?.description) return <div>{badgeDef.description}</div>

    return <div>tooltip for {columnClass}</div>
}


const getUrlColumnTooltip = (columnKey) => {

    if (!columnKey) return null
    const columnDef = urlColumnRegistry.columns[columnKey]
    if (!columnDef) return null

    if (columnDef.ttMarkup) return <Markdown>{columnDef.ttMarkup}</Markdown>
    if (columnDef.ttCaption) return <div>{columnDef.ttCaption}</div>

    return <div>Tooltip for {columnKey}</div>  // unhandled column - we should not get here
}


export const getColumnTooltip = (e) => {
    let el = null

    // if header sort row...
    let rowEl = e.target.closest('.header-cell-sort')
    if (rowEl) {
        return <div>Click to Sort</div>
        // TODO: place more specific text here for what is sorting and how and what high and low means
    }

    // if header row...
    rowEl = e.target.closest('.flock-header')
    if (rowEl) {
        let columnKey = ""

        el = e.target.closest('.signal-badge')
        if (el) {
            columnKey = 'signal-' + el.dataset.badgekey
        } else {
            el = e.target.closest('.flock-col')
            if (el) {
                // if normal column, get from dataset columnKey
                columnKey = el.dataset.columnKey;
            }
        }

        console.log(`flockUtils:: getColumnTooltipHtml: .flock-header columnClass is: ${columnKey}`)

        // else get from signal hierarchy
        return getColumnHeaderTooltip(columnKey)
    }

    // if error row...
    rowEl = e.target.closest('.url-row-error')
    if (rowEl) {
        return rowEl.currentTarget.getAttribute('data-err-text');
    }

    // if data row...
    rowEl = e.target.closest('.url-row')
    if (rowEl) {
        const columnClass = e.target.closest('.url-row > *')?.classList[0]  // get first class in list to get column type
        return getColumnDataTooltip(rowEl, columnClass)
    }

    return null
}

export const getColumnDataTooltip = (rowEl, columnClass) => {

    const d = rowEl.dataset

    if (columnClass === "url-live_status") {
        const statusDescription = httpStatusCodes[d.status_code]
        return <div>Live Status:<br/>{d.status_code}: {statusDescription}</div>
    }

    if (columnClass === "url-archive_status") {
        if (d.is_book === "true") {
            return <div>Book</div>
        }

        return d.live_state
            ? <div>{d.archive_status === "true"
                ? 'Archived'
                : 'Not Archived'}
            <br/>IABot live_state: {d.live_state} - {iabotLiveStatusCodes[d.live_state]}</div>

            : <div>Archive status = {d.archive_status}<br/>IABot live_state is undefined</div>
    }

    if (columnClass === "url-citations") {
        return d.citation_status && d.citation_status !== '--'
            ? <div>Link Status {'"' + d.citation_status + '"'} as indicated in Citation</div>
            : <div>No Link Status defined in Citation</div>

    }

    if (columnClass === "url-actionable" || columnClass === "yes-actionable") {
        const actionableKey = d.actionable
        const desc = ACTIONABLE_FILTER_MAP[actionableKey]?.desc
        return desc
            ? <div>Actionable Item:<br/>{desc}<br/>Click to fix.</div>
            : null

    }

    if (columnClass === "url-signals") {
        return null
        // return "signal data not yet implemented"
    }

    // if not a special case column, show tooltip from column definition
    const ttCaption = urlColumnRegistry.columns[columnClass]?.ttCaption
    if (ttCaption) return <div>{ttCaption}</div>

    return null
}

export const getColumnHeaderTooltip = (columnKey) => {
    // if (!columnClass) return null

    if (columnKey?.startsWith('signal-') ) return getSignalColumnTooltip(columnKey)
    // else ...
    return getUrlColumnTooltip(columnKey)

}

// NB THIS IS TEMPORARY! until we match columnKey with sort keys
const columnKeyAssociation = {
    "url-name": "name",
    "url-live_status": "status",
    "url-archive_status": "archive_status",
    "url-actionable": "actionable",
}

export const getSortKeyForColumn= (e) => {
    let elCol = null
    let sortKey = null

    elCol = e.target.closest('.signal-badge')
    if (elCol) {
        // if Signal Badge column...return sortKey based on badgeKey
        const badgeKey = elCol.dataset.badgekey
        sortKey = `${signalBadgePrefix}${badgeKey}`  // e.g. "signal_wayback"

    } else {
        elCol = e.target.closest('.flock-col')
        if (elCol) {
            // return sortKey based on columnKey
            const columnKey = elCol.dataset.columnKey
            sortKey = columnKeyAssociation[columnKey]

            console.log(`onClickFlockHeaderRow: column sort: ${sortKey}`)
        }
    }

    return sortKey
}


export const getUrlLiveStatusClass = (u = null) => {
    if (!u) return null
    return (u.status_code === 0 ? ' url-is-unknown'
            : u.status_code >= 300 && u.status_code < 400 ? ' url-is-redirect'
                : u.status_code >= 400 && u.status_code < 500 ? ' url-is-notfound'
                    : u.status_code >= 500 && u.status_code < 600 ? ' url-is-error'
                        : '')
}