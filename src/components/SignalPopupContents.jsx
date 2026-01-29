import React from "react";
import JsonTable from "./JsonTable.jsx";
import {SignalDefs} from "../constants/signalDefs.jsx";

/* sample signal data:

    "signals": {
          "tranco_ranking": 2357.0,
          "in_mbfc": "True",
          "mbfc_ratings": "{'bias': 'pro-science', 'credibility': 'high-credibility', 'name': 'Live Science', 'reporting': 'high'}",
          "first_wayback_machine_snapshot": "2001-04-10 21:40:13",
          "last_wayback_machine_snapshot": "2025-09-17 13:12:21",
          "n_wayback_machine_snapshot": 151049.0,
          "en_wikipedia_external_link_count": 686475.0
        }
 */
export default function SignalPopupContents({urlLink, score, rawSignalData}) {
    const [isFiltered, setIsFiltered] = React.useState(false);
    const [showFilterControls, setShowFilterControls] = React.useState(false);

    const popup_title = (
        <>
            <div>Signal results for URL:</div>
            <div style={{fontWeight: "normal"}}>{urlLink}</div>
        </>
    );

    let signal_content = null;

    if (rawSignalData.error) {
        signal_content = <div>{rawSignalData.error}</div>;
    } else if (!rawSignalData.signals) {
        signal_content = <div>No Signal Content Available</div>;
    } else {
        const signals = Object.entries(rawSignalData.signals).map(([key, value]) => ({
            signal_name: SignalDefs[key]?.caption ?? key,
            value: value
        }));

        const displayedSignals = isFiltered
            ? signals.filter(s => {
                return s.value != null && s.value !== "False" && s.value !== false
            })
            : signals;

        signal_content = <>
            {showFilterControls
                ? <label>
                    <input
                        type="checkbox"
                        checked={isFiltered}
                        onChange={e => setIsFiltered(e.target.checked)}
                    />{isFiltered
                    ? <span>&nbsp;Remove Filter (Show all Signals)</span>
                    : <span>&nbsp;Apply Filter (Hide all null and false Signals)</span>}
                </label>
                : null }
            <JsonTable data={displayedSignals}/>
        </>
    }

    return (
        <>
            {popup_title}
            <div>
                <div className="signal-score">Score: {score}</div>
                <hr/>
                {signal_content}
            </div>
        </>
    );
}
