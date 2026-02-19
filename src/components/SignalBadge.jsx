import React from "react";
import {SignalDefs} from "../constants/signalDefs.jsx";
import {mbfc_display, wayback_display, wiki_display} from "../constants/signalBadgeFunctions.jsx";
import "../components/css/signals.css";
import {SignalHandlers} from "../constants/signalHandlers.jsx";

/*
return signal badge if signal is a valid Badge to be displayed
If signal is a sub-field that is found in signalDefs and is intended
    to be used to calculate a value for another signal, then skip it
if signal is not found in signalDefs, then return an error Badge

signal is from url object, and has signal_name and signal_value
signalDef is the

 */


                    // function mbfc_display(signalData, signals) {
                    //     // triggered by in_mbfc signal
                    //     // if true then show; if false then abandon
                    //
                    //     if (!signalData) return null
                    //
                    //     // take value form signals[mbfc_ratings] and display
                    //     const value = signals["mbfc_ratings"]
                    //     return <div>MBFC: {value}</div>
                    // }

/*
signals from json:

"https://www.sciencedirect.com/science/article/abs/pii/S0305440306002019": {
      "signal_data": {
        "retrieved_from_cache": true,
        "signals": {
          "tranco_ranking": 231.0,
          "in_mbfc": "True",
          "mbfc_ratings": "{'bias': 'pro-science', 'credibility': 'high-credibility', 'name': 'ScienceDirect', 'reporting': 'high'}",
          "first_wayback_machine_snapshot": "1997-04-18 02:07:38",
          "last_wayback_machine_snapshot": "2025-09-18 17:00:00",
          "n_wayback_machine_snapshot": 94047.0,
          "en_wikipedia_external_link_count": 680660.0
        }
      },
      "archive_data": null
    },

 */
export default function SignalBadge({
                                        signalKey="",
                                        signals={},
                                        onSignalClick,
                                      }) {

    const signalHandler = SignalHandlers[signalKey]
    let signalContents = null
    if (signalHandler === undefined || signalHandler === null) {
        return <div className={"signal-badge"}
                    onClick={onSignalClick}>
            <div>No Signal handler defined for: {signalKey}</div>
        </div>
    }

    // "tranco"
    // "mbfc"
    // "wayback"
    // "enwiki"

    const signalAction = signalHandler?.action

    if (typeof signalAction === "function") {
        // do something like call the function with params
        signalContents = "Call to custom function call for signal: " + signalKey
    }

    else if (signalAction === SignalHandlers.mbfc.action) {
        signalContents = mbfc_display(signals, signals)
    }

    // else if (signalHandler === "wayback_display") {
    //     // base display on mbfc_ratings
    //     signalContents = wayback_display(signalData, signals)
    // }
    //
    // else if (signalHandler === "wiki_display") {
    //     signalContents = wiki_display(signalData, signals)
    // }

    else {
        signalContents = <div>Signal: {signalKey} not yet supported.</div>
    }

    return <div className={"signal-badge"} onClick={onSignalClick}>{signalContents}</div>

}

