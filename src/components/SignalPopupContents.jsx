import JsonTable from "./JsonTable.jsx";

export default function SignalPopupContents({ urlLink, score, rawSignalData }) {
    const [isFiltered, setIsFiltered] = useState(false);

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
            ? signals.filter(s => s.value != null)
            : signals;

        signal_content = <>
            <label>
                <input
                    type="checkbox"
                    checked={isFiltered}
                    onChange={e => setIsFiltered(e.target.checked)}
                />
                Filter
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
