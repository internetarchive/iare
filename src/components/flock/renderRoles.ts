import type { RenderRole } from "./flockTypes";

export const renderRoles = {
    header: {
        className: "header-cell",
        useIcon: true,
        useCaption: true,
    },

    cell: {
        className: "data-cell",
        // useIcon: false,
        // useCaption: false,
    },

    refviewHeader: {
        className: "refview-header-cell",
        useIcon: true,
        useCaption: true,
    },

    refviewCell: {
        className: "refview-data-cell",
        // useIcon: false,
        // useCaption: false,
    }

} satisfies Record<string, RenderRole>;