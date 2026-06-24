import {urlColumnRegistry} from "../constants/urlColumnRegistry.jsx";
import signalBadgeRegistry, {signalBadgePrefix} from "../constants/badges/signalBadgeRegistry.jsx";
import {marked} from "marked";
import {httpStatusCodes, iabotLiveStatusCodes} from "../constants/httpStatusCodes.jsx";
import {ACTIONABLE_FILTER_MAP} from "../constants/actionableMap.jsx";


const getSignalColumnTooltip = (columnClass) => {

    if (!columnClass) return null

    const badgeKey = columnClass.split('signal-')[1] // Extract badgeKey from columnClass
    const badgeDef = signalBadgeRegistry[badgeKey]

    if (badgeDef?.tooltipHtml) return badgeDef.tooltipHtml

    if (badgeDef?.tooltipMarkup) {
        // const markupTemp = marked(badgeDef.tooltipMarkup)
        return marked(badgeDef.tooltipMarkup)
    }

    if (badgeDef?.description) return `<div>${badgeDef.description}</div>`

    return `<div>tooltip for ${columnClass}</div>`
}


const getUrlColumnTooltip = (columnClass) => {

    if (!columnClass) return null
    const columnDef = urlColumnRegistry.columns[columnClass]
    if (!columnDef) return null

    if (columnDef.ttHtml) return columnDef.ttHtml
    if (columnDef.ttMarkup) return marked(columnDef.ttMarkup)
    if (columnDef.ttCaption) return `<div>${columnDef.ttCaption}</div>`

    return `<div>tooltip for ${columnClass}</div>`  // this shouldn't happen - there's an unhandkled column
}


export const getColumnTooltip = (e) => {
    let el = null

    // if header row show tooltip for that column...
    let rowEl = e.target.closest('.flock-header')
    if (rowEl) {
        let columnClass = ""

        el = e.target.closest('.signal-badge')
        if (el) {
            columnClass = 'signal-' + el.dataset.badgekey
        } else {
            el = e.target.closest('.flock-col')
            if (el) {
                // if normal column, get from dataset columnKey
                columnClass = el.dataset.columnKey;
            }
        }

        // else get from signal hierarchy
        let html = getColumnHeaderTooltip(columnClass)
        console.log(`UrlFlock onHoverFlockRow: in .flock-header columnClass: ${columnClass}`)

        // if sub-element of sort hovered, add the sort message to tooltip text
        const elSorted = e.target.closest('.header-cell-sort')
        if (elSorted) {
            html = `<div>${html}Click to Sort</div>`
        }
        return html
    }

    // for error row...
    rowEl = e.target.closest('.url-row-error')
    if (rowEl) {
        return rowEl.currentTarget.getAttribute('data-err-text');
    }

    // for data row...
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
        return `<div>Live Status:<br/>${d.status_code}: ${statusDescription}</div>`
    }

    if (columnClass === "url-archive_status") {
        if (d.is_book === "true") {
            return `<div>Book</div>`
        }

        return d.live_state
            ? `<div>${d.archive_status === "true"
                ? 'Archived'
                : 'Not Archived'}` +
            `<br/>` +
            `IABot live_state: ${d.live_state} - ${iabotLiveStatusCodes[d.live_state]}</div>`

            : `Archive status = ${d.archive_status}<br/>IABot live_state is undefined`
    }

    if (columnClass === "url-citations") {
        return d.citation_status && d.citation_status !== '--'
            ? `<div>Link Status ${'"' + d.citation_status + '"'} as indicated in Citation</div>`
            : `<div>No Link Status defined in Citation</div>`

    }

    if (columnClass === "url-actionable" || columnClass === "yes-actionable") {
        const actionableKey = d.actionable
        const desc = ACTIONABLE_FILTER_MAP[actionableKey]?.desc
        return desc
            ? `<div>Actionable Item:<br/>${desc}<br/>Click to fix.</div>`
            : ""

    }

    if (columnClass === "url-signals") {
        return null
        // return "signal data not yet implemented"
    }

    // if not a special case column, show tooltip from column definition
    return urlColumnRegistry.columns[columnClass]?.ttCaption
}

export const getColumnHeaderTooltip = (columnClass) => {
    // if (!columnClass) return null

    if (columnClass?.startsWith('signal-') ) return getSignalColumnTooltip(columnClass)
    // else ...
    return getUrlColumnTooltip(columnClass)

}


export const getUrlLiveStatusClass = (u = null) => {
    if (!u) return null
    return (u.status_code === 0 ? ' url-is-unknown'
            : u.status_code >= 300 && u.status_code < 400 ? ' url-is-redirect'
                : u.status_code >= 400 && u.status_code < 500 ? ' url-is-notfound'
                    : u.status_code >= 500 && u.status_code < 600 ? ' url-is-error'
                        : '')
}