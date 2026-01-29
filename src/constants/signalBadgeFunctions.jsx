/* signalBadgeFunctions
collection of functions to process signal data and return display for badges
 */
import React from "react";

export function mbfc_display(signalData, signals) {
    // triggered by in_mbfc signal
    // if true then show; if false then abandon

    if (!signalData) return null

    // take value form signals[mbfc_ratings] and display
    const value = signals["mbfc_ratings"]


    try {
        const mbfcData = JSON.parse(value.replace(/'/g, '"'))
        // return <div>
        //     MBFC: {mbfcData.name} (Bias: {mbfcData.bias},
        //     Credibility: {mbfcData.credibility},
        //     Reporting: {mbfcData.reporting})
        // </div>
        return <div>
            MBFC: {mbfcData.bias}, {mbfcData.credibility}, {mbfcData.reporting} reporting
        </div>

        // TODO put the extra data, like mbfcData.name, in element dataset, to be picked up by element click

    } catch (e) {
        return <div>MBFC: {value}</div>
    }
}


import waybackLogo from '../images/wayback.logo.small.png';

function trimifyNumber(n) {
    return n >= 1000000 ?
        `${(n / 1000000).toFixed(1)}M` :
        `${Math.round(n / 1000)}K`
}

export function wayback_display(signalData, signals) {
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

    // take value from signals and display
    const n = signals["n_wayback_machine_snapshot"]
    const wayback_first = signals["first_wayback_machine_snapshot"]
    const wayback_last = signals["last_wayback_machine_snapshot"]

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
