import React, {useState} from "react";
import {useTranslation} from 'react-i18next';
import MakeLink from "../../../MakeLink.jsx";
import RefSectionHeader from "./RefSectionHeader.jsx";
import {getArchiveStatusInfo} from "../../../../utils/urlUtils.jsx";
import {
    // getColumnHeaderTooltip,
    getColumnTooltip,
    // getUrlLiveStatusClass
} from "../../../../utils/flockUtils.jsx";
import FlockBox from "../../../FlockBox.jsx";
import {urlColumnRegistry} from "../../../../constants/urlColumnRegistry.js";
import IareMarkdown from "../../../IareMarkdown";
import {useTooltip} from "../../../../contexts/TooltipContext";
import FlockHeaderCell from "../../../flock/FlockHeaderCell";
import {renderRoles} from "../../../flock/renderRoles";
import FlockDataCell from "../../../flock/FlockDataCell";
import {collateClasses, collateDatasetProps} from "../../../../utils/generalUtils";


export default function RefUrls({
                            urlArray,
                            pageData,
                            onAction,
                            tooltipId,
                            showDebug=false
}) {

    const { t, i18n } = useTranslation();
    const [urlTooltipHtml, setUrlTooltipHtml] = useState(null);

    // TODO monitoredColumns should come from the global context,
    //  as that will allow ui controls to dynamically change it
    const monitoredColumns = [
        urlColumnRegistry.columns.url_name,
        urlColumnRegistry.columns.live_status,
        urlColumnRegistry.columns.archive_status,
        urlColumnRegistry.columns.ws_score,
        urlColumnRegistry.columns.wayback,
    ]

    const {
        showTooltip,
        pinTooltip,
        closeTooltip,
    } = useTooltip();

                // const urlHeaderRowRef = React.useRef(null);
                // const urlDataRowsRef = React.useRef(null);

    const headerRef = React.useRef(null);
    const bodyRef = React.useRef(null);

    const popoverColDefRef = React.useRef(null);
    const popoverColDefId = "refview-popover-col-def"
    const previousColDefAnchorRef = React.useRef(null)
    const [popoverColDefMarkup, setPopoverColDefMarkup] = useState("--refview-popover-col-def-anchor");


    // dynamic grid column width setting
    const gridTemplateColumns = monitoredColumns
        .map((colDef) => {
            if (!colDef.width) {
                // console.warn(`Undefined column width encountered, applying default width.`);
                return urlColumnRegistry.specs.defaultColumnWidth;
            }
            return colDef.width;
        })
        .join(" ");

    
    React.useEffect(() => {
        // syncs scroll left and right of header row and data rows
        console.log(headerRef.current, bodyRef.current);

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
    
    
    const renderHeaderRow = () => {

        const renderRole = renderRoles.refviewHeader

        return <div className={`flock-header ${renderRole.className}`} ref={headerRef}>

            {Object.entries(monitoredColumns).map( ([key, columnDef]) => {

                if (!columnDef) return null

                return <FlockHeaderCell
                    columnDef={columnDef}
                    renderRole={renderRole}
                />

            })}

        </div>

    }


    const renderDataRows = (urlArray) => {

        const renderRole = renderRoles.refviewCell

        const renderDataRow = (urlObj, i) => {

            // class stuff...

            const rowClass = "flock-row"


            // dataset stuff ror each row...

            const datasetProps = collateDatasetProps(
                {
                    url: urlObj.url,
                    status_code: urlObj.status_code,
                    archive_status: urlObj.archive_status?.hasArchive,
                    is_book: urlObj.isBook,
                }

                // make sure these are covered
                // data-url={urlObj.url}
                // data-status_code={urlObj.status_code}
                // data-archive_status={urlObj.archive_status?.hasArchive}
                // data-live_state={urlObj.archive_status?.live_state}
                // data-actionable={urlObj.actionable ? urlObj.actionable[0] : null}  // return first actionable only (for now)
                // data-is_book={urlObj.isBook}
            )


            // return row

            return <div className={rowClass} key={i}
                        {...datasetProps}
            >

                {/* render a cell for each column within each row */}

                {Object.entries(monitoredColumns).map(([key, columnDef]) => {

                    if (!columnDef) return null

                    // could accumulate dataset values for each column here...

                    return <FlockDataCell
                        columnDef={columnDef}
                        renderRole={renderRole}
                        cellData={urlObj} />
                    }
                )}
            </div>
        }


        // Iterate over the filtered URL objects to generate rendered output for rows.

        return urlArray.map((u, i) => {
            const urlObj = pageData.urlDict[u]
            return renderDataRow(urlObj, i)
        })
    }


                // ``const getDataRow = (u, i) => {  // assumes u is an url object
                //
                //     // if (!u) return <div className={"url-row"} key={i}>Undefined URL encountered. (index {i})</div>
                //     //
                //     // return <div className={"url-row " + getUrlLiveStatusClass(u.status_code)}
                //     //     key={i}
                //     //
                //     //     data-url={u.url}
                //     //     data-status_code={u.status_code}
                //     //     data-archive_status={u.archive_status?.hasArchive}
                //     //     data-live_state={u.archive_status?.live_state}
                //     //     data-is_book={u.isBook}
                //     // >
                //     //     <div className={"url-name"}><MakeLink href={u.url} linkText={u.url}/></div>
                //     //     <div className={"url-live_status"}>{u.status_code}</div>
                //     //     <div className={"url-archive_status"}>{getArchiveStatusInfo(u)}</div>
                //     //
                //     //     <div className={"url-signals"}>
                //     //         <SignalBadges urlObj = {u}
                //     //                       badgeContextKey={BadgeContexts.inline.key}
                //     //                       signalData={u?.signal_data?.signals ?? {}}
                //     //                       monitoredSignals={monitoredSignals}
                //     //                       onAction={onAction}
                //     //         />
                //     //     </div>
                //     //
                //     // </div>
                //
                //     return <div className={"url-row"}>url row here!!!</div>
                //
                // }
``

    const onHoverDataRow = e => {  // handle hover for header and data row
        e.stopPropagation()  // prevents onHover from propagating engaging and erasing tooltip
        showTooltip({content: getColumnTooltip(e, pageData?.urlDict)})
    }

    const onClickDataRow = (e) => {
        e.stopPropagation()

        console.log("onClickFlockRow - RefView")

        let el = null

        // for header row...open infobox when clicked
        el = e.target.closest('.flock-header .flock-col')
        if (el) {
            const columnKey = el.dataset.columnKey;
            const columnDef = urlColumnRegistry.columns[columnKey]
            if (!columnDef) {
                // ...do nothing - no column def to support this column...unlikely!
            } else {
                // render popMarkup of column in a static popover window
                if (columnDef.popMarkup) {
                    openPopover(<IareMarkdown content={columnDef.popMarkup} />, el)
                }
            }
        }

        // do nothing for data row click

    }

    const renderRole = renderRoles.refviewCell


    const flockHeader = renderHeaderRow()
    const dataRows = renderDataRows(urlArray)
    const classNames = collateClasses([
        "flock-rows",
        renderRole.className,
        "ref-view-url-flock-rows"
    ])
    const flockRows = <div className={classNames} ref={bodyRef}>
        {dataRows}
    </div>

    const handleDialogClick = (event) => {
        if (event.target === event.currentTarget) {
            event.currentTarget.close();
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

    return <div className="ref-view-section ref-view-analysis">
            <RefSectionHeader leftPart={<h3>{t('Ratings')}</h3>} >{null}</RefSectionHeader>
            {/*<div className={"ref-view-section-contents flock-container"}*/}
            {/*    // onClick={onClickFlockRow}*/}
            {/*     onClick={null}*/}
            {/*     onMouseOver={onHoverFlockRow}>*/}
            {/*    {flockHeader}*/}
            {/*    {flockRows}*/}
            {/*</div>*/}

        <div className={"ref-view-section-contents"}>

            <FlockBox caption={null} className={"ref-url-flock"}>

                <div className={"flock-container"}
                     data-tooltip-id="master-tooltip"
                     onClick={onClickDataRow}
                     onMouseOver={onHoverDataRow}
                    // onMouseEnter={onHoverFlockRow}

                    // NB Defines "--url-list-grid-columns" for dynamic CSS grid display
                     style={{"--url-list-grid-columns": gridTemplateColumns}}
                >
                    {flockHeader}
                    {flockRows}
                </div>

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

        </div>
    </div>

}
