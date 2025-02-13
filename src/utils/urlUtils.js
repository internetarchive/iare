import React from "react";
import {reliabilityMap} from "../constants/perennialList";

export const getArchiveStatusInfo = (u => {
    return <span className={u.isBook
        ? "archive-book"
        : u.archive_status?.hasArchive
            ? "archive-yes"
            : "archive-no" }></span>
} )

export const getPerennialInfo = (u => {
    return !u.rsp
        ? null
        // rsp contains keys into reliabilityMap
        : u.rsp.map( (s,i) => {
            return <div key={i}>{reliabilityMap[s]?.shortCaption ? reliabilityMap[s].shortCaption : ''}</div>
        })
})

export const getCitationInfo = (u => {
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
