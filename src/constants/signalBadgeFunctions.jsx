/* signalBadgeFunctions
collection of functions to process signal data and return display for badges
 */
import React from "react";

export function mbfc_display(signals) {
    // displays relevant mbfc data

    try {
        let wsMeta = null  // WikiSignalMeta
        if (signals?.meta?.ws_mbfc_cats) {
            const mbfcData = JSON.parse(signals.meta.ws_mbfc_cats.replace(/'/g, '"'))
            wsMeta = `MBFC: ${mbfcData.bias}, ${mbfcData.credibility}, reporting: ${mbfcData.reporting}`
        }

        let wsLists = null
        if (signals.ratings) {
            const ratingEntries = []
            if (signals.ratings["mbfc-bias"]) ratingEntries.push(<div
                key="bias">MBFC Bias: {signals.ratings["mbfc-bias"]}</div>)
            if (signals.ratings["mbfc-cred"]) ratingEntries.push(<div
                key="cred">MBFC Cred: {signals.ratings["mbfc-cred"]}</div>)
            if (signals.ratings["mbfc-Fact"]) ratingEntries.push(<div
                key="fact">MBFC Fact: {signals.ratings["mbfc-Fact"]}</div>)
            wsLists = ratingEntries.length > 0 ? <div>{ratingEntries}</div> : null
        }

        return <div>
            {wsMeta}
            {wsLists}
        </div>

        // TODO put the extra data, like mbfcData.name, in element dataset, to be picked up by element click

    } catch (e) {
        return <div>MBFC: Error encountered ({e.message})</div>
    }
}


import waybackLogo from '../images/wayback.logo.small.png';

function trimifyNumber(n) {
    return n >= 1000000 ?
        `${(n / 1000000).toFixed(1)}M` :
        `${Math.round(n / 1000)}K`
}

export function wayback_display(signals) {
    /*
    signals is signal data from url (or anything that can generate signals, actually)
    */
    if (!signals) {
        return <div><img src={waybackLogo} alt="Wayback"
                         style={{height: '1em', verticalAlign: 'middle'}}/> {'Error: No signal data available'}</div>;
    }

    const meta = signals?.meta || {};
    const n = meta["ws_wbm_total"] ?? 0;
    const wayback_first = meta["ws_wbm_first"] ?? 'N/A';
    const wayback_last = meta["ws_wbm_last"] ?? 'N/A';

    try {
        return <div className={"wayback-badge"}>
            <div className={"wayback-badge-element"}>
                <img src={waybackLogo} alt="Wayback" className={"wayback-logo-image"}/>
            </div>
            <div className={"wayback-badge-element"}>
                {n >= 1000000 ?
                    `${(n / 1000000).toFixed(1)}M` :
                    `${Math.round(n / 1000)}K`} snapshots<br/>
                {wayback_first.split(' ')[0]} to {wayback_last.split(' ')[0]}
            </div>
        </div>

        // TODO put any data in dataset for this element?

    } catch (e) {
        return <div><img src={waybackLogo} alt="Wayback"
                         style={{height: '1em', verticalAlign: 'middle'}}/>{': Error displaying snapshot data'}</div>
    }
}

import wikiLogo from '../images/badge.logo.wiki.png';

export function wiki_display(signalData, signals) {
    /*
    "signals": {
        ...
        "n_wayback_machine_snapshot": 151049.0,
        "first_wayback_machine_snapshot": "2001-04-10 21:40:13",
        "last_wayback_machine_snapshot": "2025-09-17 13:12:21",
        ...
    }

     */
    // triggered by n_wayback_machine_snapshot signal
    // use heuristics to display

    if (!signalData) return null

    // assume signal data is number
    signalData = trimifyNumber(signalData)

    // return <div>{signalDef.caption}: {signalData}</div>

    return <div className={"wiki-badge"} style={{display: 'flex', alignItems: 'center'}}>
        <div className={"wiki-badge-element"} style={{display: 'flex', alignItems: 'center'}}>
            <img src={wikiLogo} alt="Wikipedia" className={"wiki-logo-image"}/>
        </div>
        <div className={"wiki-badge-element"} style={{display: 'flex', alignItems: 'center'}}>
            {signalData}
        </div>
    </div>

}
