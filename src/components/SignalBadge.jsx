import React from "react";
import {SignalDefs} from "../constants/signalDefs.jsx";

/*
return signal badge if signal is a valid Badge to be displayed
If signal is a sub-field that is found in signalDefs and is intended
    to be used to calculate a value for another signal, then skip it
if signal is not found in signalDefs, then return an error Badge

signal is from url object, and has signal_name and signal_value
signalDef is the

 */


function mbfc_display(signalData, signals) {
    // triggered by in_mbfc signal
    // if true then show; if false then abandon

    if (!signalData) return null

    // take value form signals[mbfc_ratings] and display
    const value = signals["mbfc_ratings"]
    return <div>MBFC: {value}</div>
}

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


    const signalDef = SignalDefs[signalKey]  // signalDef is the "class" of the signal

    // if signalDef not found, return error badge
    // if signalDef.action is explicitly null, return nothing, as this is a
    //      "data-providing" signal value to be used to enhance another signal
    // otherwise, use signalDef.action to determine display of signal

    if (!signalDef) {
        return <div className={"signal-no-support"}>Signal: {signal?.signal_name} not supported.</div>
    }

    // make signalContent based on signal action
    // if action is null or missing, skip
    // if action is default then display name and value
    // else run function based on action value
    //  note: we can maybe define action property as a function value and run that function with the signals array of values


    const signalAction = signalDef?.action

    // skip badge if signal is null
    if (signalAction === null) {
        return null
    }

    const signalData =  signals[signalKey]

    let signalContents = null

    if (signalAction === "default") {
        signalContents = <div>{signalDef.caption}: {signalData}</div>
    }

    else if (typeof signalAction === "function") {
        // do something with signalAction(signal, signalDefs)
    }

    else if (signalAction === "mbfc_display") {
        // base display on mbfc_ratings
        signalContents = mbfc_display(signalData, signals)
    }


    return <div className={"signal-badge"} onClick={onSignalClick}>{signalContents}</div>

}

