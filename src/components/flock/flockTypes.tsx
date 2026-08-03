import * as React from "react";

export type ColumnDef = {
    key: string;         // duplicate of object key index; used for global sort
    priority?: number;   // default column order when displaying

    label: string;              // straight text
    caption: React.ReactNode;   // jsx capable display text

    logo?: string;      // path to logo
    logoAlt?: string;   // alt text for image

    width?: string;

    ttMarkup?: string;   // hover content for column header
    popMarkup?: string;  // md rich description of column, allowing links
    ttCell?: (dataset: Record<string, any>) => React.ReactNode;
        // tooltip display for when data cell itself is hovered.
        // currently uses dataset values passed in...
        // TODO base data from urlObj itself for supporting row and cell display
    renderCell?: (urlObj: Object) => React.ReactNode;
        // returns markup for cell's data display

    sortable: boolean;  // index for global sort scenario ??? may use key for this?
    sortFunction?: (a: any, b: any, dir: number) => number;  // sort function called when this column is sorted

}


export type RenderRole = {
    // NB This is under construction - not sure if i even need it, esp. if we have
    //  separate functions for rendering header cells for normal header and refview header

    //
    // // these specify where the context in which cell is being rendered,
    //    so that changes in display can be made.
    //

    className: string,
    useIcon?: boolean,
    useCaption?: boolean,
    hasSort?: boolean,

    // isHeaderCell: true,  // NB CHANGE THIS! TODO do we need this?

}

/*****
 **
 *

 "urlDict": {
     "https://books.google.com/books?id=ECQY4M13-yoC": {
     "url": "https://books.google.com/books?id=ECQY4M13-yoC",
     "netloc": "books.google.com",
     "pay_level_domain": "google.com",
     "status_code": 200,
     "status_code_method": "LIVEWEBCHECK",
     "status_code_error_details": "",
     "archive_status": {
     "archive_status_method": "iabot_searchurldata",
     "hasArchive": false,
     "live_state": "permalive"
 },


 * *
 * *****/
                // export type RenderArgs = {
                //     content: null;
                //     sort?: null;
                //     headerClass: string;
                //     cellData: {},
                // }
                //
