import React from "react";
import wikiLogo from './images/badge.logo.wiki.png';

function trimifyNumber(n) {
    return n >= 1000000 ?
        `${(n / 1000000).toFixed(1)}M` :
        `${Math.round(n / 1000)}K`
}

export default function EnwikiBadge({
                                        signals = {},
                                        onSignalClick
                                    }
) {


    let badge = null

    if (!signals) {
        badge = <div>No Signal Data provided</div>

    } else {

        try {
            const meta = signals?.meta || {};
            const wikiCount = trimifyNumber(meta["ws_wiki_cite_en"] ?? 0)
            badge = <div>Wiki Count: {wikiCount}</div>

        } catch (e) {
            badge = <div>En Wiki: Error encountered ({e.message})</div>
        }
    }


    return <div className={"badge-enwiki signal-badge"}>
        <div className={"signal-badge-element"}>
            <img src={wikiLogo} alt="Wikipedia" className={"logo-image"}/>
        </div>
        <div className={"signal-badge-element"}>
            {badge}
        </div>
    </div>

}
