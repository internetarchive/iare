import React, {useState} from "react";
import {useTranslation} from 'react-i18next';
import MakeLink from "../../../MakeLink.jsx";
import RefSectionHeader from "./RefSectionHeader.jsx";
import {getArchiveStatusInfo} from "../../../../utils/urlUtils.jsx";
import {
    // getColumnHeaderTooltip,
    getColumnTooltip,
    getUrlLiveStatusClass} from "../../../../utils/flockUtils.jsx";
import SignalBadges from "../../../SignalBadges.jsx";
import ColumnBox from "../../../ColumnBox.jsx";
import {ARCHIVE_STATUS_FILTER_MAP as archiveFilterDefs} from "../../../../constants/urlFilterMaps.jsx";
import {BadgeContexts} from "../../../../constants/badgeContexts.jsx";
import signalBadgeRegistry from "../../../../constants/badges/signalBadgeRegistry.jsx";


export default function RefUrls({
                            urlArray,
                            pageData,
                            onAction,
                            tooltipId,
                            showDebug=false
}) {

    const { t, i18n } = useTranslation();
    const [urlTooltipHtml, setUrlTooltipHtml] = useState(null);

    const monitoredSignals = [  // NB could get this from component property or context
        signalBadgeRegistry.score.key,
        signalBadgeRegistry.wayback.key,
        signalBadgeRegistry.enwiki.key,
        signalBadgeRegistry.mbfc.key,
        signalBadgeRegistry.tranco.key,
    ]

    // assumes u is an url object
    const getDataRow = (u, i) => {

        if (!u) return <div className={"url-row"} key={i}>Undefined URL encountered. (index {i})</div>

        return <div className={"url-row " + getUrlLiveStatusClass(u.status_code)}
            key={i}

            data-url={u.url}
            data-status_code={u.status_code}
            data-archive_status={u.archive_status?.hasArchive}
            data-live_state={u.archive_status?.live_state}
            data-is_book={u.isBook}
        >
            <div className={"url-name"}><MakeLink href={u.url} linkText={u.url}/></div>
            <div className={"url-live_status"}>{u.status_code}</div>
            <div className={"url-archive_status"}>{getArchiveStatusInfo(u)}</div>

            <div className={"url-signals"}>
                <SignalBadges urlObj = {u}
                              badgeContextKey={BadgeContexts.inline.key}
                              signalData={u?.signal_data?.signals ?? {}}
                              monitoredSignals={monitoredSignals}
                              onAction={onAction}
                />
            </div>

        </div>

    }


    const getHeaderRow = () => {

        return <div className={"flock-header"} key={0}>

            <ColumnBox
                content={<><br/>URL Link</>}
                columnClass={"url-name flock-col"}
                columnKey={"url-name"}
            />

            <ColumnBox
                content={<>Live<br/>Status</>}
                columnClass={"url-live_status flock-col"}
                columnKey={"url-live_status"}
            />
            <ColumnBox
                content={archiveFilterDefs['iabot']._.name}
                columnClass={"url-archive_status flock-col"}
                columnKey={"url-archive_status"}
            />

            {/* signals column is special... */}
            <div className={"url-signals flock-col"}>
                <div>
                    <SignalBadges badgeContextKey={BadgeContexts.refview.key}
                                  monitoredSignals={monitoredSignals}
                                  onAction={onAction}
                    />
                </div>
            </div>

        </div>

    }

    const getDataRows = (urlArray) => {
        const dataRows = []

        // in refView, we assume ALL urls in array are displayed; i.e. no filtering or sorting

        urlArray.forEach( (url, i) => {
            const urlObj = pageData.urlDict[url]
            if (!urlObj) return
            // only show url if it is NOT an archive link
            if (!urlObj.isArchive) dataRows.push(getDataRow(urlObj, i))
        })

        if (dataRows.length === 0) {
            dataRows.push(<div className={"url-row"}><div className={"url-info"}>No URLs for this reference.</div></div>)
        }

        return dataRows
    }

    const onHoverFlockRow = e => {  // handle hover for header and data row
        e.stopPropagation()  // prevents onHover from propagating engaging and erasing tooltip
        const html = getColumnTooltip(e)
        setUrlTooltipHtml(html)
    }

    const flockHeader = getHeaderRow()
    const dataRows = getDataRows(urlArray)
    const flockRows = <div className={"flock-rows ref-view-url-flock-rows"}>
        {dataRows}
    </div>
    
    return <div
        data-tooltip-id={tooltipId}         // passed in tooltipId for this flock
        data-tooltip-html={urlTooltipHtml}  // set urlTooltipHtml to set tooltip contents
    >
        <div className="ref-view-section ref-view-urls">
            <RefSectionHeader leftPart={<h3>{t('Ratings')}</h3>}/>

            <div className={"ref-view-section-contents flock-container"}
                // onClick={onClickFlockRow}
                 onClick={null}
                 onMouseOver={onHoverFlockRow}>
                {flockHeader}
                {flockRows}
            </div>

        </div>
    </div>


}

