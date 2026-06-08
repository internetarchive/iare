import React, {useState} from "react";
import MakeLink from "../../../MakeLink.jsx";
import RefSectionHeader from "./RefSectionHeader.jsx";
import {
    getArchiveStatusInfo,
} from "../../../../utils/urlUtils.jsx";
import {Button} from "react-bootstrap";
import Popup from "../../../Popup.jsx";
import RefUrlProbe from "./RefUrlProbe.jsx";
import SignalDisplay from "../../../SignalDisplay.jsx";
import {BadgeContexts as badgeContext} from "../../../../constants/badgeContexts.jsx";
import {ACTIONS_IARE} from "../../../../constants/actionsIare.jsx";


/*
shows template urls and their status codes in a tabular form
 */
export default function RefUrls({ urls, pageData, onAction, tooltipId, showDebug=false }) {

    // const [isProbePopupOpen, setIsProbePopupOpen] = useState(false)
    // const [probePopupTitle, setProbePopupTitle] = useState(<>Modal Title</>);
    // const [probePopupData, setProbePopupData] = useState(null);

    const handleSignalClick = (e) => {
        return
        // const targetElement = e.target
        //
        // const urlElement = targetElement.closest('.url-row')
        // const urlLink = urlElement.dataset.url
        // const urlObj = pageData.urlDict[urlLink]
        //
        // const urlLinkFromData = targetElement.dataset.url
        // console.log(`Url from Signal Badge data is: ${urlLinkFromData}`)
        //
        // onAction(
        //     {
        //         action: ACTIONS_IARE.POPUP_SIGNALS_DETAILS.key, value: urlLink
        //     }
        // )
    }


    // assumes u is an url object
    const getDataRow = (u, i) => {

        if (!u) return <div className={"url-row"} key={i}>Undefined URL encountered. (index {i})</div>

                // idea:::
                //
                // const urlColumnNames = [
                //     "name",
                //     "status",
                //     "archive_status",
                //     "perennial"
                // ]
                // const urlStatusClassification= [
                //     {
                //         filter: (u) => {return u.status_code >= 200 && u.status_code < 300},
                //         class_name: "url-is-success"
                //     },
                //     {
                //         filter: (u) => {return u.status_code >= 300 && u.status_code < 400},
                //         class_name: "url-is-redirect"
                //     },
                //     {
                //         filter: (u) => {return u.status_code >= 400 && u.status_code < 500},
                //         class_name: "url-is-notfound"
                //     },
                // ]
                // loop thru Classifications in StatusClassification array
                //     when one hits, use that entry's class_name' +
                // '.
        const urlRowTypeClass = (u.status_code === 0
            ? ' url-is-unknown'
            : u.status_code >= 200 && u.status_code < 300
                ? ' url-is-success'
                : u.status_code >= 300 && u.status_code < 400
                    ? ' url-is-redirect'
                    : u.status_code >= 400 && u.status_code < 500
                        ? ' url-is-notfound'
                        : u.status_code >= 500 && u.status_code < 600
                            ? ' url-is-error'
                            : '')

        return <div className={"url-row " + urlRowTypeClass} key={i}

                    data-url={u.url}
                    data-status_code={u.status_code}
                    data-archive_status={u.archive_status?.hasArchive}
                    data-perennial={u.rsp ? u.rsp[0] : null}  // just return first perennial if found for now...dont deal with > 1
                    data-live_state={u.archive_status?.live_state}
                    data-signals={JSON.stringify(u.signals)}
        >
            <div className={"url-name"}><MakeLink href={u.url} linkText={u.url}/></div>

            <div className={"url-live_status"}>{u.status_code}</div>
            <div className={"url-archive_status"}>{getArchiveStatusInfo(u)}</div>

                        {/*<div className={"url-citations"}>{getCitationInfo(u)}</div>*/}
                        {/*<div className={"url-perennial"}>{getPerennialInfo(u)}</div>*/}
                        {/*<div className={"url-probes"}>*/}
                        {/*    <RefUrlProbe urlObj={u} pageData={pageData} onProbeClick={handleProbeClick} />*/}
                        {/*</div>*/}

            <div className={"url-signals"} onClick={handleSignalClick}>
                <SignalDisplay
                    urlObj={u}
                    onSignalClick={handleSignalClick}
                    badgeContext={badgeContext.inline.value}
                />
            </div>

        </div>

    }

    const getHeaderRow = () => {

        return <div className={"url-row url-row-header"} key={0}>
            <div className={"url-row-label url-name"}>Url</div>
            <div className={"url-row-label url-live_status"}>Status</div>
            <div className={"url-row-label url-archive_status"}>Archive</div>

                        {/*/!*<div className={"url-citations"}>{getCitationInfo(u)}</div>*!/*/}
                        {/*<div className={"url-row-label url-perennial"}>Reliability</div>*/}
                        {/*<div className={"url-row-label url-probes"}>Probe Results</div>*/}

            <div className={"url-row-label url-signals"}>
                <SignalDisplay
                    urlObj={null}  // {u}
                    onAction={onAction}
                    badgeContext={badgeContext.refview.value}
                    tooltipId={tooltipId}
                />
            </div>


        </div>

    }

    const getUrlRows = ()=> {
        const dataRows = []

        urls.forEach( (url, i) => {
            const urlObj = pageData.urlDict[url]
            if (!urlObj) return
            // only show url if it is NOT an archive link
            if (!urlObj.isArchive) dataRows.push(getDataRow(urlObj, i))
        })

        if (dataRows.length === 0) {
            dataRows.push(<div className={"url-row"}><div className={"url-info"}>No URLs for this reference.</div></div>)
        }

        const dataHeader = getHeaderRow()

        return <div className={"url-rows-display"}>
            {dataHeader}
            {dataRows}
        </div>
    }

    const urlRows = getUrlRows(urls)

    return <div className="ref-view-section ref-view-urls">
        <RefSectionHeader leftPart={<h3>URLs</h3>}/>
        {urlRows}
    </div>

}

