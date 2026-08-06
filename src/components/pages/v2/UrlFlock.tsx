import React, {useState} from 'react';
import { useTooltip } from "../../../contexts/TooltipContext";
import Markdown from "react-markdown";
import {
    collateClasses,
    collateDatasetProps,
    convertToCSV,
    copyToClipboard,
    iareAlert,
    iareDebug
} from "../../../utils/generalUtils.js";
import {
    getColumnTooltip,
    getSortKeyForColumn
} from "../../../utils/flockUtils.jsx";

import {ACTIONS_IARE} from "../../../constants/actionsIare.jsx";

import FlockBox from "../../FlockBox";
import FlockHeaderCell from "../../flock/FlockHeaderCell";
import FlockDataCell from "../../flock/FlockDataCell";
import "../../css/flock.css"
import "../../css/popover.css"

// context to provide global flag for sorting value
// TODO move this sort info into main config context, i think??
import { ColumnSortContext } from "../../../contexts/ColumnSortContext"

import { renderRoles } from "../../flock/renderRoles.js";
import { urlColumnRegistry } from "../../../constants/urlColumnRegistry";

/*
assumes urlArray is an array of url objects:
    [
        {
            url : <url>,
            status_code : <status_code>,
            <other url info>
        },
        ...
    ]

and filterDef property is a filter object definition of the form:

    {
        caption: "caption here",
        desc: "", // ? tooltip text?
        filterFunction: () => { <return callback function to filter> }
    }

example filterDef element:
    {
        caption: "General",
        desc: "",
        filterFunction: () => (d) => {return d.type === "general"},
    }

*/
const urlFlock = React.memo(function UrlFlock({
                                                  urlDict,
                                                  urlArray,
                                                  urlFilters = {},  // keyed object of filter definitions to apply to urlArray for final url list display
                                                  onAction,
                                                  options = {showRefs: true},
                                                  selectedUrl = '',
                                                  fetchMethod = "",
                                                  tooltipId = ''
                                              }) {
    // TODO maybe should not/don't have to use memo here??
    //  making it a memo seemed to reduce the re-renders of the flock when the tooltip text was updated

    const monitoredColumns = [
        urlColumnRegistry.columns.url_name,
        urlColumnRegistry.columns.live_status,
        urlColumnRegistry.columns.archive_status,
        urlColumnRegistry.columns.ws_score,
        urlColumnRegistry.columns.wayback,

        // urlColumnRegistry.columns.actionable,
    ]

            // const [feedbackText, setFeedbackText] = useState("")

            // const [urlTooltipHtml, setUrlTooltipHtml] = useState('<div>ToolTip' +
            //     '<br>UrlFlock<br />second line');
            // TODO there is a bug where sort re-renders list every time tooltip text/html property is updated
            // TODO maybe fix using React.useRef somehow???

    /**
     * State for column sorting configuration.
     *
     * - sorts: An object that keeps track of the sort status for each column type (e.g., status, signal_score).
     *          Each key represents a column name, and its value is another object with the following properties:
     *              - name: Name of the sort key.
     *              - dir: Direction of sorting: 1 = ascending, -1 = descending, 0 = none.
     *
     *          Example:
     *          {
     *              "status": {name: "status", dir: 1},  // dir: 1 is ascending
     *              "signal_score": {name: "signal_score", dir: -1},  // dir: -1 is descending
     *          }
     *
     * - sortBy: An array indicating the order of sorts to be applied. For now, it supports only single-column sorting.
     *
     *          Example:
     *          ["status"]  // Only the 'status' column is sorted.
     */
    const [columnSort, setColumnSort] = useState({
        sorts: {},  // holds sort defs: {columnKey, dir}
        sortBy: []  // holds ordered list of columns to sort (currently only one...will enhance later)
            // NB for now, sort just respects first item in list
            // TODO fix this by implementing chained sorts
    })

            // const monitoredSignals = [
            //     signalBadgeRegistry.score.key,
            //     signalBadgeRegistry.wayback.key,
            //     signalBadgeRegistry.enwiki.key,
            //     signalBadgeRegistry.mbfc.key,
            //     signalBadgeRegistry.tranco.key,
            // ]

    // dynamic column width grid setting
    const gridTemplateColumns = monitoredColumns
        .map((colDef) => {
            if (!colDef.width) {
                // console.warn(`Undefined column width encountered, applying default width.`);
                return urlColumnRegistry.specs.defaultColumnWidth;
            }
            return colDef.width;
        })
        .join(" ");

    // refs used for header and rows of url flock

    const headerRef = React.useRef(null);
    const bodyRef = React.useRef(null);

    // tooltip hook
    const {
        showTooltip,
        pinTooltip,
        closeTooltip,
    } = useTooltip();

    // const canSupportPopovers = "popover" in HTMLElement.prototype
    const popoverColDefRef = React.useRef(null);
    const popoverColDefId = "popover-col-def"
    const previousColDefAnchorRef = React.useRef(null)
    const [popoverColDefMarkup, setPopoverColDefMarkup] = useState("--popover-col-def-anchor");

    const updateFlockSort = (sortKey) => {
        // set new sort State:
        // - toggle sort direction of specified sort
        // - set new sort state with setSort

        console.log(`[${new Date().toISOString()}] updateFlockSort: sortKey = ${sortKey}`)

        // NB TODO what happens if null sortKey?

        // selectively change the specified sort type
        // https://stackoverflow.com/questions/43638938/updating-an-object-with-setstate-in-react
        setColumnSort(prevState => {

            // guarantee sorts object has new "sort" entry in it
            if (!(prevState.sorts[sortKey])) {
                prevState.sorts[sortKey] = {name: sortKey, dir: 0}
            }

            // do a 3-state sort state round-robin style

            const prevDir = prevState.sorts[sortKey].dir
            const sortDir = ({ 1: -1, '-1': 0 }[prevDir] ?? 1); // 1=asc, -1=desc, 0=none
            // if 1 (asc), then next is -1 (desc)
            // if -1 (desc), then next is 0 (none)
            // if 0 (none), then next is 1 (asc)

            return {
                sorts: {
                    ...prevState.sorts,
                    // change just the sortKey specified
                    [sortKey]: {
                        ...prevState.sorts[sortKey],
                        // dir: -1 * prevState.sorts[sortKey].dir
                        dir: sortDir
                    }
                },

                sortBy: sortDir === 0 ? [] : [sortKey]  // sort by at most one column for now...
                // if sortDir is 0, remove all sorting
                // TODO implement so that sortBy contains an array of a list of sortKey's, not just one
            }
        })
    }


    const sortByNative = (a, b) => {
        // sort by original index as it was received
        const indexA = a.index
        const indexB = b.index
        return indexA - indexB  // neg, 0, or pos
    }


    const onHoverDataRow = e => {
        e.stopPropagation()  // prevents onHover from propagating engaging and erasing tooltip
        const tooltip = getColumnTooltip(e, urlDict)
        //// console.log(`onHoverFlockRow: tooltip = ${JSON.stringify(tooltip)}`)
        showTooltip({content: tooltip})
    }



    const onClickHeaderRow = (e) => {

        // if clicked in sort element, sort by that column
        const elSort = e.target.closest('.header-cell-sort')
        if (elSort) {
            const sortKey = getSortKeyForColumn(e)
            console.debug(`[${new Date().toISOString()}] onClickFlockHeaderRow: sortKey = ${sortKey}`)
            updateFlockSort(sortKey)
            return
        }

        // if clicked in header icon or text, invoke popover
        const el = e.target.closest('.flock-col')
        if (el) {
            const columnKey = el.dataset.columnKey;
            const columnDef = urlColumnRegistry.columns[columnKey]
            if (!columnDef) {
                // ...do nothing - no column def to support this column...unlikely!
            } else {
                // render popMarkup of column in a static popover window
                if (columnDef.popMarkup) {
                    openPopover(<Markdown
                        // rehypePlugins={[rehypeRaw]}
                        components={{
                            a: ({ node, ...props }) => (
                                <a
                                    {...props}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                />
                            ),
                        }}
                    >
                        {columnDef.popMarkup}
                    </Markdown>, el)
                }
            }
        }
    }


    const openPopover = (markup, anchorElement) => {
        if (!anchorElement || !popoverColDefRef.current) {
            return;
        }

        // Remove anchor from previous element
        if (previousColDefAnchorRef.current) {
            previousColDefAnchorRef.current.style.anchorName = "";
            previousColDefAnchorRef.current.style.backgroundColor = "initial";
        }

        // Give the supplied element a CSS anchor name
        anchorElement.style.anchorName = "--active-popover-anchor";

        previousColDefAnchorRef.current = anchorElement;
        setPopoverColDefMarkup(markup);

        closeTooltip()

        // requestAnimationFrame(() => {
        //     popover.showPopover();
        // });
        // popoverColDefRef.current.showPopover();
        popoverColDefRef.current.showModal();

    }


    const closePopover = () => {
        if (previousColDefAnchorRef.current) {
            previousColDefAnchorRef.current.style.anchorName = "";
            previousColDefAnchorRef.current = null;
        }
        popoverColDefRef.current?.close();

    }


    const handleDialogClick = (event) => {
        if (event.target === event.currentTarget) {
            event.currentTarget.close();
        }
    };


    const onClickFlockRow = (e) => {
        e.stopPropagation()

        console.log(`[${new Date().toISOString()}] onClickFlockRow`)

        let rowEl = null

        // for header row...
        rowEl = e.target.closest('.flock-header')
        if (rowEl) {
            onClickHeaderRow(e)
        }

        // for data row...opens up reference detail view for that row's url
        rowEl = e.target.closest('.flock-row')
        if (rowEl) {
            // get the url associated with the row of the clicked element
            const url = rowEl?.dataset.url

            // send action up component tree to co-filter references list
            onAction({
                "action": ACTIONS_IARE.SHOW_REFERENCE_VIEW_FOR_URL.key,
                "value": url,
            })
        }

    }


    const renderHeaderRow = () => {

        const renderRole = renderRoles.header

        return (
            <ColumnSortContext.Provider value={columnSort}>  {/* provides current sort scenario */}

                <div className={"flock-header"} ref={headerRef}>

                    {Object.entries(monitoredColumns).map( ([key, columnDef]) => {

                        if (!columnDef) return null

                        return <FlockHeaderCell
                            columnDef={columnDef}
                            renderRole={renderRole}
                        />

                    })}

                </div>

            </ColumnSortContext.Provider>
        )

    }

    // <ColumnSortContext.Provider value={columnSort}>  {/* provides current sort scenario */}
    // </ColumnSortContext.Provider>

    /**
     * Processes and renders rows of URL data for the flock component.
     *
     * @param {Array} urlArray - Array of URL objects, each containing details like URL, status, archive status, etc.
     * @param {Object} flockFilters - Object containing filter definitions to apply to the URL data.
     * @returns {[Array, Array]} - An array of rendered rows and the corresponding filtered URL objects.
     */
    const renderDataRows = (urlArray, flockFilters) => {

        // Return a default message if the input URL array is empty or undefined.
        if (!urlArray || urlArray.length === 0) {
            return [<h4 style={{padding:".3rem"}}>No URL Links to show</h4>, []]
        }

        // Ensure filters object is initialized to prevent null errors.
        if (!flockFilters) flockFilters = {}
            // TODO what to do if flockFilters is not an object of keyed FlockFilter's?
            //  Can we make flockFilters a custom "FlockFilters" type?


        // Filter URLs based on filters designated in flockFilters
        // NB: Currently, only supports one filter; future enhancement can handle multiple filters.

        let filteredUrls = urlArray  // initialize with all urls

        // Apply each filter from flockFilters to the filteredUrls array.
        Object.keys(flockFilters).forEach(filterName => {
            const f = flockFilters[filterName]
            if (f) {  // only process if filter is non-null

                if (Array.isArray(f.filterFunction)) {  // f is an array of filters
                    // interpret f.filterFunction as an array of filters,
                    //    and apply all filters one at a time
                    // TODO turn this into an effective recursive loop
                    f.filterFunction.forEach(oneFilter => {
                        if (oneFilter.filterFunction) {
                            filteredUrls = filteredUrls.filter((oneFilter.filterFunction)())
                        }  // NB: Note self-calling function
                    })

                } else {  // f is one filter
                    if (f.filterFunction) {
                        filteredUrls = filteredUrls.filter((f.filterFunction)())
                    }  // NB: Note self-calling function
                }
            }
        })

        // Sort the filtered URLs if specified in the columnSort global state.

        if (columnSort.sortBy?.length > 0) {
            const sortKey = columnSort.sortBy[0] ?? "native"
            const sortDir = columnSort.sorts[sortKey]?.dir
            const columnDef = urlColumnRegistry.columns[sortKey]
            const sortFunction = columnDef.sortFunction ?? sortByNative
            console.log(`[${new Date().toISOString()}] sorting rows by: ${sortKey}, ${sortDir}`)
            // filteredUrls.sort(sortFunction)
            // filteredUrls.sort((a,b) => sortDir * sortFunction(a,b))
            filteredUrls.sort((a,b) => sortFunction(a,b,sortDir))
        } else {
            // do nothing???
            filteredUrls.sort(sortByNative)
        }


        const renderRole = renderRoles.cell

        const renderDataRow = (urlObj, i) => {

            const rowClass = collateClasses([
                "flock-row",
                (urlObj.url === selectedUrl ? ' url-selected' : '')
            ])


            // dataset stuff...

            const datasetProps = collateDatasetProps(
                {
                    url: urlObj.url,
                    status_code: urlObj.status_code,
                    archive_status: urlObj.archive_status?.hasArchive,
                    is_book: urlObj.isBook,
                }
            )
            // data-live_state={urlObj.archive_status?.live_state}
            // data-actionable={urlObj.actionable ? urlObj.actionable[0] : null}  // return first actionable only (for now)
            //
            return <div className={rowClass}
                        key={i}
                        {...datasetProps}
            >

                {/* render each column */}
                {Object.entries(monitoredColumns).map(([key, columnDef]) => {

                        if (!columnDef) return null

                        // could accumulate dataset values for each column here...

                        return <FlockDataCell
                            columnDef={columnDef}
                            renderRole={renderRole}
                            cellData={urlObj}
                        />
                    }
                )
                }
            </div>
        }

        // Render a row for displaying errors (e.g., missing or malformed URL objects).
        const renderErrorRow = (u, i, errText) => {
            return <div className={`url-row url-row-error`} key={i}
                        data-url={u.url}
                        data-err-text={errText}
                        // onMouseOver={onHoverErrorRow}
                        onMouseLeave={() => showTooltip({})}
            >
                {/*
                 for each column, output a cell, even tho with errors
                 not sure we even need to do this
                 not sure we even have errors anymore!
                 */}
                <div>Row data for error here...</div>

            </div>
        }


        // Iterate over the filtered URL objects to generate rendered output for rows.

        const dataRows = filteredUrls.map((u, i) => {

            // if u (our url object) is problematic, return as error row
            // if (!u || u.url === undefined || u.status_code === undefined) {
            //
            //     const errText = !u
            //         ? `URL data not defined for index ${i}`
            //         : !u.url
            //             ? `URL missing for index ${i}`
            //             : u.status_code === undefined
            //                 ? `URL status code undefined (try Force Refresh)`
            //                 : 'Unknown error'  // this last case should not happen
            //
            //     return renderErrorRow(u, i, errText)
            // }

            return renderDataRow(u, i)

        })

        return [dataRows, filteredUrls]  // dataRows is markup for filteredUrls array

    }  // end getUrlRows


    /* Copy functions */  // NB TODO retool to be in an IARE tools module: copyUrlDetails( urlArray )

    const handleCopyUrlDetails = () => {

        const urlArrayData = [...flockArray].sort(   // NB "..." used so that copy of array is sorted, not original flock array
            (a, b) => (a.url > b.url) ? 1 : (a.url < b.url) ? -1 : 0  // sort by url

        ).map(u => {  // get one row per line:
            return [
                u.url,
                u.status_code,
                u.archive_status?.hasArchive,
                u.reference_info?.templates ? u.reference_info?.templates.join(",") : null,
                u.status_code_errors?.reason ? u.status_code_errors.reason : null,
                u.status_code_errors?.message ? u.status_code_errors.message : null,
            ]
            // TODO output archive status and maybe iabot live stuff
        })

        const numItems = urlArrayData.length

        // add column labels
        urlArrayData.unshift([
            'URL',
            `${fetchMethod} status`,
            `Has Archive`,
            `Templates`,
            `Error reason`,
            `Error message`
        ])

        copyToClipboard(convertToCSV(urlArrayData), `${numItems} URL Data Rows`, handleFeedback)

    }

    const handleCopyUrlList = () => {

        const urlArrayData = [...flockArray].sort(   // NB used "..." so that copy of array is sorted, not original flock array
            (a, b) => (a.url > b.url) ? 1 : (a.url < b.url) ? -1 : 0  // sort by url

        ).map(u => {  // get one row per line:
            return u.url
        })

        copyToClipboard(urlArrayData.join("\n"), `${urlArrayData.length} URLs`, handleFeedback)

    }

    
    const buttonCopyList =
        <button onClick={handleCopyUrlList} className={'btn utility-button small-button'}><span>Copy URL List</span>
        </button>

    const buttonCopyDetails =
        <button onClick={handleCopyUrlDetails} className={'btn utility-button small-button'}>
            <span>Copy URL Details</span></button>

    const buttonShowHideRefs =
        <button onClick={() => onAction({action: ACTIONS_IARE.TOGGLE_SHOW_REFS.key})}
                className={'btn utility-button small-button'}
        >
            <span>{options.showRefs ? "Hide Refs" : "Show Refs"}</span>
        </button>

    const buttonShowHideFilters =
        <button onClick={() => onAction({action: ACTIONS_IARE.TOGGLE_SHOW_FILTERS.key})}
                className={'btn utility-button small-button'}
        >
            <span>{options.showFilters ? "Hide Filters" : "Show Filters"}</span>
        </button>


    /* flock info */

    const [flockDataRows, flockArray] = renderDataRows(urlArray, urlFilters);
        // flockDataRows is array of row markup; flockArray is array of url data that markup represents

    const flockInfo = `${flockDataRows.length} ` +
        `${flockDataRows.length === 1 ? 'URL' : 'URLs'}`

    const flockCaption = <>

        <div className={"main-caption"}>
            <div>URL Links</div>
            <div>
                <div style={{position: "relative", top: ".2rem"}}>{buttonShowHideFilters}{buttonShowHideRefs}{buttonCopyList}{buttonCopyDetails}</div>
            </div>
        </div>

        <div className={"sub-caption"}>
            <div>{flockInfo}</div>
        </div>
    </>

    const flockHeader = renderHeaderRow()
    const flockRows = <div className={"flock-rows"} ref={bodyRef}>
        {flockDataRows}
    </div>


    const flock = (
        <div className={"flock-container"}
             data-tooltip-id="master-tooltip"
             onClick={onClickFlockRow}

             onMouseOver={onHoverDataRow}
             // onMouseEnter={onHoverFlockRow}

             // NB Defines "--url-list-grid-columns" for header and rows CSS to pick up
             style={{"--url-list-grid-columns": gridTemplateColumns}}

        >
            {flockHeader}
            {flockRows}
        </div>
    )


    React.useEffect(() => {
        // syncs scroll left and right of header row and data rows

        const header = headerRef.current;
        const body = bodyRef.current;

        if (!header || !body) return;

        let syncing = false;

        const syncFromHeader = () => {
            if (syncing) return;
            syncing = true;
            body.scrollLeft = header.scrollLeft;
            requestAnimationFrame(() => syncing = false);
        };

        const syncFromBody = () => {
            if (syncing) return;
            syncing = true;
            header.scrollLeft = body.scrollLeft;
            requestAnimationFrame(() => syncing = false);
        };

        header.addEventListener('scroll', syncFromHeader);
        body.addEventListener('scroll', syncFromBody);

        return () => {
            header.removeEventListener('scroll', syncFromHeader);
            body.removeEventListener('scroll', syncFromBody);
        };

    }, []);


    return <>

        <FlockBox caption={flockCaption} className={"url-flock"}>
            {flock}
        </FlockBox>

        <dialog  // Popover for Column Definition Details
            ref={popoverColDefRef}
            id={popoverColDefId}
            popover={"manual"}
            className="pop-col-def-container"
            onClick={handleDialogClick}
        >
            <div className="pop-col-def-content">
                {popoverColDefMarkup}
                <button className="btn close-button"
                        onClick={closePopover}
                >
                    ×
                </button>
            </div>
        </dialog>
    </>
})

export default urlFlock
