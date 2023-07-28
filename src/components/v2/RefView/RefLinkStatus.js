import React from "react";

/*
shows link status, which is an array of link statii
 */
export default function RefLinkStatus({ linkStatus }) {

    return <div className="ref-view-link-status">
        <h3 className={""}>Link Status</h3>
        {linkStatus?.length
            ? linkStatus.map( ls => {
            return <p>{ls}</p>
            })
            : <p>linkStatus not defined</p>
        }
        </div>
}

