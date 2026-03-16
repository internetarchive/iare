import React from "react";
import trancoLogo from './images/badge.logo.tranco.png';

export default function TrancoBadge({
                                        signals = {},
                                        onSignalClick
                                    }
) {
    /*
        we're gonna assume tranco rating is from signals.meta.ws_web_rank
    */

    let badge = null

    if (!signals) {
        badge = <div>No Signal Data provided</div>

    } else {

        try {
            const meta = signals?.meta || {};
            const tranco = meta["ws_web_rank"] ?? 0;  // placeholder for now
            badge = <div>Tranco rating: {tranco}</div>

        } catch (e) {
            badge = <div>MBFC: Error encountered ({e.message})</div>
        }
    }

    return <div className={"badge-tranco signal-badge"}>
        <div className={"signal-badge-element"}>
            <img src={trancoLogo} alt="Tranco" className={"logo-image"}/>
        </div>
        <div className={"signal-badge-element"}>
            {badge}
        </div>
    </div>
}
