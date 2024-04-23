import React from "react";
import {rspMap} from "../../../constants/perennialList";


/*
shows template url and its status codes in a tabular form
 */
export default function RefTemplateUrl({ url, index, isSelected=false }) {

    const getArchiveStatusInfo = ( u => {
        return <span className={u.archive_status?.hasArchive ? "archive-yes" : "archive-no" }></span>
    })

    const getCitationInfo = (u => {
        // for now, returns array of statuses from url's associated references
        return !u.reference_info?.statuses
            ? null
            : u.reference_info.statuses.map( (s,i) => {
                const display = s === "--"  // this is what PageData set status to if not there - TODO do this better!
                    ? ""
                    : s.charAt(0).toUpperCase() + s.slice(1)
                return <div key={i}>{display}</div>
            })
    })

    const getPerennialInfo = (u => {
        return !u.rsp
            ? null
            // rsp contains keys into rspMap
            : u.rsp.map( (s,i) => {
                return <div key={i}>{rspMap[s]?.shortCaption ? rspMap[s].shortCaption : ''}</div>
            })
    })

    const getHeaderRow = () => {
        return <div className={"ref-view-url-header"}
            // onClick={onClickHeader}
            // onMouseOver={onHoverHeaderRow}
        >
            <div className={"url-row url-header-row"}>
                <div className={"url-name"}>URL Link</div>
                <div className={"url-status"}>Status</div>
                <div className={"url-archive_status"}>Archive</div>
                <div className={"url-citations"}>Priority</div>
                <div className={"url-perennial"}>Reliability</div>
            </div>

        </div>

    }


    const getErrorRow = (u, i, errText) => {
        return <div className={`url-row url-row-error`} key={i}
                    data-url={u?.url}
                    data-err-text={errText}
        >
            <div className={"url-name"}>{u?.url ? u.url : `ERROR: No url for index ${i}`}</div>
            <div className={"url-status"}>{-1}</div>
            <div className={"url-archive_status"}>?</div>

            <div className={"url-citations"}>&nbsp;</div>
            <div className={"url-perennial"}>&nbsp;</div>

        </div>
    }

    const getDataRow = (u, i, classes) => {

        const citationStatus = !u.reference_info?.statuses?.length
            ? null
            : u.reference_info.statuses[0]  // just return first one

        return <div className={classes} key={i}
                    data-url={u.url}
                    data-status_code={u.status_code}
                    data-archive_status={u.archive_status?.hasArchive}
                    data-citation_status={citationStatus}
                    data-live_state={u.archive_status?.live_state}
                    data-perennial={u.rsp ? u.rsp[0] : null}  // just return first perennial if found for now...dont deal with > 1
        >
            <div className={"url-name"}>{u.url}</div>
            <div className={"url-status"}>{u.status_code}</div>
            <div className={"url-archive_status"}>{getArchiveStatusInfo(u)}</div>

            <div className={"url-citations"}>{getCitationInfo(u)}</div>
            <div className={"url-perennial"}>{getPerennialInfo(u)}</div>

        </div>
    }

    const getUrlRow = (url) => {

        // if url is problematic, display as error row
        if (!url) {

            return <div className={"no-template-url"}>There are no URLs in this template.</div>

        }

        // if url is problematic, display as error row
        if (url.url === undefined || url.status_code === undefined) {

            const errText = !url ? `URL data not defined for index ${index}`
                : !url.url ? `URL missing for index ${index}`
                    : url.status_code === undefined ? `URL status code undefined (try Force Refresh)`
                        : 'Unknown error'; // this last case should not happen

            return getErrorRow(url, index, errText)
        }

        // show as "normal" URL
        const classes = 'url-row '
            + (url.status_code === 0 ? ' url-is-unknown'
                : url.status_code >= 300 && url.status_code < 400 ? ' url-is-redirect'
                    : url.status_code >= 400 && url.status_code < 500 ? ' url-is-notfound'
                        : url.status_code >= 500 && url.status_code < 600 ? ' url-is-error'
                            : '')
            + (isSelected ? ' url-selected' : '')
            + (url.rsp ? ` url-rating-${url.rsp[0]}` : '')

        return getDataRow(url, index, classes)

    }
    const getUrlRows = (url) => {  // NB: using singular url for now - may make an array later on...

        // if url is falsey
        if (!url) {

            return <div className={"url-row no-template-url"}>There are no URLs in this template.</div>

        } else {
            return <>
                {false && getHeaderRow()}
                {getUrlRow(url)}
                </>
        }


    }




    return <div className="ref-view-url">
        {getUrlRows(url)}
    </div>
}

