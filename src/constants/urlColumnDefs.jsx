/* definitions of url list column headers */
export const urlColumnDefs = {

    // defines tooltip specs for URL list columns

    columns : {  // keys match class names

        "url-name": {
            ttCaption: `<div>URL Link Text</div>`,
            ttData: `<div>Link Text of URL</div>`,
            tooltip: {
                header: `<div>URL Link Text</div>`,
                rows: `<div>Link Text of URL</div>`,
            }
        },

        "url-status": {
            ttCaption: `<div>HTTP Status Code of Primary URL</div>`,
            ttData: `<div>{status_code} : {statusDescription}</div>`
        },

        "url-archive_status": {
            ttCaption: `<div>Archive exists in IABot database</div>`,
            ttData: ``,
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
            ttData: `<div>Actions that can be taken to improve citation</div>`,
        },

        "url-sections": {
            ttCaption: `<div>Section in Wikipedia article where Citation is defined</div>`,
            ttData: `Section in Wikipedia article where Reference originated`,
        },

        "url-perennial": {
            ttCaption: `<div>Reliability Rating of URL, according to Wikipedia Reliable Sources</div>`,
            ttData: `Reliability Rating`,
        },

        // "url-iabot_status": {
        //     ttCaption: `<div>URL Status reported by IABot</div>`,
        //     ttData: `placeholder`,
        // },

    }
}
