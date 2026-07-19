/* definitions of url list column headers */
export const urlColumnRegistry = {

    // defines tooltip specs for URL list columns

    columns : {  // keys match class names

        "url-name": {
            ttCaption: `URL link text`,
            ttMarkup: `##### Citation URL Link

URL of Citation Source.`,
            popMarkup: `##### Citation URL Link

URL of Citation Source.

Click to open Ref Detail View.`,
            ttData: `<div>Link Text of URL</div>`,
            sortable: true,
        },

        // TODO need to pick one of these or the other...!!!

        // NB this looks like it is used in RefView - remove it from there and delete from here
        "url-status": {
            ttCaption: `HTTP Status Code of Primary URL`,
            ttData: `<div>{status_code} : {statusDescription}</div>`,
        },

        "url-live_status": {  // NB leaning towards using this one for now...
            ttCaption: `HTTP Status Code of URL`,
            ttData: `<div>{status_code} : {statusDescription}</div>`,
            sortable: true,

            ttMarkup: `##### HTTP Status Code of URL

Most recent status when querying.
Uses LiveWebCheck from Wayback machine.`,
            popMarkup: `##### HTTP Status code

Live status of URL as of last check.

Uses LiveWebCheck from Wayback machine.

Click to open Ref Detail View.`,
        },

        "url-archive_status": {
            ttCaption: `Archive exists in IABot database`,
            ttMarkup: `##### Archive Status
Archive exists in IABot database`,
            popMarkup: `##### Archive Status
Archive exists in IABot database

Click here for IABot database`,
            ttData: ``,
            sortable: true,
        },

        "url-actionable": {
            ttCaption: `Actions that can be taken to improve citation`,
            ttMarkup: `##### Actionable
Action can be taken to improve citation`,
            ttData: `<div>Actions that can be taken to improve citation</div>`,
            popMarkup: `##### Actionable

When actionable, places have been identified that could use improvement.
  
Click row to open details for Citation Reference link.`,
            sortable: true,
        },


        "url-signals": {
            ttCaption: `Reliability and Credibility insight via WikiSignals`,
        },
        "wiki-signals-docs": {
            ttCaption: `Show WikiSignals documentation`,
        },
        "wiki-signals-sort": {
            ttCaption: `Show popup window to sort by signal values`,
        },

                    // "url-citations": {
                    //     ttCaption: `URL Status as indicated by Citation Template "url-status" Parameter`,
                    //     ttData: '<div>Link Status as indicated in Citation</div>',
                    // },
                    //
                    // "url-templates": {
                    //     ttCaption: `Names of Templates used by Citation`,
                    //     ttData: `<div>Templates used by Citation</div>`,
                    // },
                    //
                    // "url-sections": {
                    //     ttCaption: `Section in Wikipedia article where Citation is defined`,
                    //     ttData: `Section in Wikipedia article where Reference originated`,
                    // },
                    //
                    // "url-perennial": {
                    //     ttCaption: `Reliability Rating of URL, according to Wikipedia Reliable Sources`,
                    //     ttData: `Reliability Rating`,
                    // },

    }
}
