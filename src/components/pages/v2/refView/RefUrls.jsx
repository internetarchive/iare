import React, {useState} from "react";
import MakeLink from "../../../MakeLink.jsx";
import RefSectionHeader from "./RefSectionHeader.jsx";
import {
    getArchiveStatusInfo,
    getPerennialInfo,
    // getProbeInfo,
    getProbePopupData,
} from "../../../utils/urlUtils.jsx";
import {Button} from "react-bootstrap";
import Popup from "../../../Popup.jsx";
import RefUrlProbe from "./RefUrlProbe.jsx";


/* include for probePopup, maybe

const probePopup = null
    // TODO: need to include popupID, which also mightdetermine z-index
    //
    // <Popup isOpen={isProbeOpen}
    //       onClose={() => { setIsProbeOpen(false) }}
    //       title={"Truth Popup"}>
    // </Popup>


 */


/*
shows template urls and their status codes in a tabular form
 */
export default function RefUrls({ urls, pageData, tooltipId, showDebug=false }) {

    const [isProbePopupOpen, setIsProbePopupOpen] = useState(false)
    const [probePopupTitle, setProbePopupTitle] = useState(<>Modal Title</>);
    const [probePopupData, setProbePopupData] = useState(null);

    const handleProbeClick = (e) => {
        // displays popup describing probe details of url
        // - url determined by row clicked
        // - probe determined by probe badge (small icon) clicked

        const targetElement = e.target

        const urlElement = targetElement.closest('.url-row')
        const urlLink = urlElement.dataset.url
        const urlObj = pageData.urlDict[urlLink]

        const urlLinkFromData = targetElement.dataset.url
        console.log(`Url from ProbeBadge data is: ${urlLinkFromData}`)

        const probeKey = targetElement.dataset.probeKey
        const probeData = urlObj?.probe_results?.probes?.[probeKey] ?? null

        console.log(`Clicked ${probeKey} probe details for url: ${urlLink}, probeData is: ${JSON.stringify(probeData, null, 2 )}`)

        const rawProbeData = <pre>{JSON.stringify(probeData, null, 2)}</pre>
        const score = probeData ? probeData.score : "?"

        const [pTitle, pContents] = getProbePopupData(probeKey, urlLink, score, rawProbeData)

        setProbePopupTitle(pTitle)
        setProbePopupData(pContents)

        //
        //
        // setProbePopupTitle(<>
        //     <div>{probeKey} probe results for URL:</div>
        //     <div style={{fontWeight: "normal"}}> {urlLink}</div>
        // </>)
        //
        // setProbePopupData(<div>
        //     <div className={"probe-score"}>Score: {score}</div>
        //     <div>{rawProbeData}</div>
        // </div>)

        setIsProbePopupOpen(true)

    }

    // assumes u is an url object
    const getUrlRow = (u, i) => {

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
        >
            <div className={"url-name"}><MakeLink href={u.url} linkText={u.url}/></div>

            <div className={"url-status"}>{u.status_code}</div>
            <div className={"url-archive_status"}>{getArchiveStatusInfo(u)}</div>

            {/*<div className={"url-citations"}>{getCitationInfo(u)}</div>*/}
            <div className={"url-perennial"}>{getPerennialInfo(u)}</div>
            <div className={"url-probes"}>
                <RefUrlProbe urlObj={u} pageData={pageData} onProbeClick={handleProbeClick} />
            </div>

        </div>

    }

    const getUrlRowHeader = () => {

        return <div className={"url-row url-row-header"} key={0}>
            <div className={"url-row-label url-name"}>Url</div>
            <div className={"url-row-label url-status"}>Status</div>
            <div className={"url-row-label url-archive_status"}>Archive</div>

            {/*<div className={"url-citations"}>{getCitationInfo(u)}</div>*/}
            <div className={"url-row-label url-perennial"}>Reliability</div>
            <div className={"url-row-label url-probes"}>Probe Results</div>
        </div>

    }

    const getUrlRows = ()=> {
        const urlRows = []

        urls.forEach( (url, i) => {
            const urlObj = pageData.urlDict[url]
            if (!urlObj) return
            // only show url if it is NOT an archive link
            if (!urlObj.isArchive) urlRows.push(getUrlRow(urlObj, i))
        })

        if (urlRows.length === 0) {
            urlRows.push(<div className={"url-row"}><div>No URLs for this reference.</div></div>)
        }

        const urlRowHeader = getUrlRowHeader()

        return <div className={"url-list-rows"}>
            {urlRowHeader}
            {urlRows}
        </div>
    }

    const urlRows = getUrlRows(urls)

    const probeButton = null && <Button
        className={"btn truth-probe-button"}
        // key={pKey}
        onClick={() => alert("will probe for truth and display in URL info below.")}
    ><span>Probe for Truth</span>
    </Button>

    return <>
        <div className="ref-view-section ref-view-urls">

            <RefSectionHeader leftPart={<h3>URLs {probeButton}</h3>} />

            {urlRows}

        </div>

        <Popup isOpen={isProbePopupOpen}
               onClose={() => { setIsProbePopupOpen(false) }}
               title={probePopupTitle}>
            {probePopupData}
        </Popup>

    </>
}

