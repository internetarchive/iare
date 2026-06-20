/* definitions of url list column headers */
export const urlColumnRegistry = {

    // defines tooltip specs for URL list columns

    columns : {  // keys match class names

        "url-name": {
            ttCaption: `<div>URL link text</div>`,
            ttMarkup: `##### Citation URL Link

URL of Citation Source.`,
            ttData: `<div>Link Text of URL</div>`,
            sortable: true,
        },

        // TODO need to pick one of these or the other...!!!

        // NB this looks like it is used in RefView - remove it from there and delete from here
        "url-status": {
            ttCaption: `<div>HTTP Status Code of Primary URL</div>`,
            ttData: `<div>{status_code} : {statusDescription}</div>`
        },

        "url-live_status": {  // NB leaning towards using this one for now...
            ttCaption: `<div>HTTP Status Code of URL</div>`,
            ttMarkup: `##### HTTP Status Code of URL

Most recent status when querying.
Uses LiveWebCheck from Wayback machine.`,
            ttData: `<div>{status_code} : {statusDescription}</div>`,
            sortable: true,
        },

        "url-archive_status": {
            ttCaption: `<div>Archive exists in IABot database</div>`,
            ttMarkup: `##### Archive Status
Archive exists in IABot database`,
            ttData: ``,
            sortable: true,
        },

        "url-citations": {
            ttCaption: `<div>URL Status as indicated by Citation Template "url-status" Parameter</div>`,
            ttData: '<div>Link Status as indicated in Citation</div>',
        },

        "url-templates": {
            ttCaption: `<div>Names of Templates used by Citation</div>`,
            ttData: `<div>Templates used by Citation</div>`,
        },

        "url-actionable": {
            ttCaption: `<div>Actions that can be taken to improve citation</div>`,
            ttMarkup: `##### Actionable
Action can be taken to improve citation`,
            ttData: `<div>Actions that can be taken to improve citation</div>`,
            sortable: true,
        },

        "url-sections": {
            ttCaption: `<div>Section in Wikipedia article where Citation is defined</div>`,
            ttData: `Section in Wikipedia article where Reference originated`,
        },

        "url-perennial": {
            ttCaption: `<div>Reliability Rating of URL, according to Wikipedia Reliable Sources</div>`,
            ttData: `Reliability Rating`,
        },

        "url-signals": {
            ttCaption: `<div>Reliability and Credibility insight via WikiSignals</div>`,
        },
        "wiki-signals-docs": {
            ttCaption: `<div>Show WikiSignals documentation</div>`,
        },
        "wiki-signals-sort": {
            ttCaption: `<div>Show popup window to sort by signal values</div>`,
        },

    }
}
