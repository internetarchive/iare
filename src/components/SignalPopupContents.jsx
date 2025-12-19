import React from "react";
import JsonTable from "./JsonTable.jsx";

export default function SignalPopupContents({ urlLink, score, rawSignalData }) {
    const [isFiltered, setIsFiltered] = React.useState(false);

    const popup_title = (
        <>
            <div>Signal results for URL:</div>
            <div style={{ fontWeight: "normal" }}>{urlLink}</div>
        </>
    );

    let signal_content = null;

    if (rawSignalData.error) {
        signal_content = <div>No Signal Content Available</div>;
    } else {
        const signals = rawSignalData.signals.map(s => ({
            signal_name: s.signal_name,
            value: s.signal_data?.value
        }));

        const displayedSignals = isFiltered
            ? signals.filter(s => {
                return s.value != null && s.value !== "False"
            })
            : signals;

        signal_content = <>
            <label>
                <input
                    type="checkbox"
                    checked={isFiltered}
                    onChange={e => setIsFiltered(e.target.checked)}
                />{isFiltered
                ? <span>&nbsp;Remove Filter (Show all Signals)</span>
                : <span>&nbsp;Apply Filter (Hide all null and false Signals)</span>}
            </label>
            <JsonTable data={displayedSignals} />
        </>
    }

    return (
        <>
            {popup_title}
            <div>
                <div className="signal-score">Score: {score}</div>
                <hr />
                {signal_content}
            </div>
        </>
    );
}
