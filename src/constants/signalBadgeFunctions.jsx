/* signalBadgeFunctions
collection of functions to process signal data and return display for badges
 */
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
        
        return <div>
            Wayback: {Math.round(n / 1000)}K snapshots
            from {wayback_first.split(' ')[0]} to {wayback_last.split(' ')[0]}
        </div>

        // TODO put any data in dataset for this element?

    } catch (e) {
        return <div>Wayback: Error displaying snapshot data</div>
    }
}
