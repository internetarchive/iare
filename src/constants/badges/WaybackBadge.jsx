import React from "react";
import waybackLogo from "./images/badge.logo.wayback.small.png";

export default function WaybackBadge({
                                         signals = {},
                                         onSignalClick
                                     }
) {
    if (!signals) {
        return <div><img src={waybackLogo} alt="Wayback"/> {'Error: No signal data available'}</div>;
    }

    const meta = signals?.meta || {};
    const n = meta["ws_wbm_total"] ?? 0;
    const wayback_first = meta["ws_wbm_first"] ?? 'N/A';
    const wayback_last = meta["ws_wbm_last"] ?? 'N/A';

    return <div className={"badge-wayback signal-badge"}>
        <div className={"signal-badge-element badge-icon"}>
            <img src={waybackLogo} alt="Wayback" className={"logo-image"}/>
        </div>
        <div className={"signal-badge-element badge-info"}>
            {/* abbreviate number if big */}
            {n >= 1000000
                ? `${(n / 1000000).toFixed(1)}M`
                : (n >= 1000
                    ? `${Math.round(n / 1000)}K`
                    : n)} snapshots<br/>
            {wayback_first.split(' ')[0]} to {wayback_last.split(' ')[0]}
        </div>
    </div>
}
