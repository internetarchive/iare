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
