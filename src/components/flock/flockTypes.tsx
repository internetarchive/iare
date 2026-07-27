import * as React from "react";

export type ColumnDef = {
    key: string;         // duplicate of object key index; used for global sort
    priority?: number;   // default column order when displaying

    caption: React.ReactNode;   // jsx capable display text
    label: string;              // straight text
            //// columnClass: string;  // superceded by dataset.columnKey
    width?: string;

    ttMarkup?: string;   // hover content for column header
    popMarkup?: string;  // md rich description of column, allowing links
    ttCell?: (dataset: Record<string, any>) => React.ReactNode;
        // tooltip display for when data cell itself is hovered.
        // uses values placed in cell's dataset...could base it on urlObj instead...
    renderCell?: (urlObj: Object) => React.ReactNode;
        // returns markup for display cell data

    sortable: boolean;  // index for global sort scenario ??? may use key for this?
    sortFunction?: (a: any, b: any, dir: number) => number;  // sort function called when this column is sorted

    logo?: string;      // path to logo
    logoAlt?: string;   // alt text for image

                // // component: ScoreBadge,
                // component: string; // should code or javascript or json?
                // // this will soon be a property of type function that wiull return
                // // the required fields for rendering a column  badge object (at least)


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
    useCaption?: boolean

    // isHeaderCell: true,  // NB CHANGE THIS! TODO do we need this?

}


                // export type RenderArgs = {
                //     content: null;
                //     sort?: null;
                //     headerClass: string;
                //     cellData: {},
                // }
                //
