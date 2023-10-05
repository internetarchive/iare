export const URL_STATUS_FILTER_MAP = {
    all: {
        caption: "Show All",
        desc: "no filter",
        filterFunction: () => () => {return true},
    },
    status2XX: {
        caption: "Status 2XX",
        desc: "'",
        filterFunction: () => (d) => {
            return d.status_code >= 200 && d.status_code < 300;
        },
    },
    status3XX: {
        caption: "Status 3XX",
        desc: "'",
        filterFunction: () => (d) => {
            return d.status_code >= 300 && d.status_code < 400;
        },
    },
    status4XX: {
        caption: "Status 4XX",
        desc: "'",
        filterFunction: () => (d) => {
            return d.status_code >= 400 && d.status_code < 500;
        },
    },
    status5XX: {
        caption: "Status 5XX",
        desc: "'",
        filterFunction: () => (d) => {
            return d.status_code >= 500 && d.status_code < 600;
        },
    },
    statusUnknown: {
        caption: "Unknown Status",
        desc: "'",
        filterFunction: () => (d) => {
            return !d.status_code;
        },
    },

};

// export const URL_FILTER_NAMES = Object.keys(URL_STATUS_FILTER_MAP);

// export const URL_ARCHIVE_STATUS_FILTER_MAP = {
//     yes_archive: {
//         caption: "URL has archive",
//         desc: "There is an archive link associated with the URL.",
//         // lines: ['Original link is OK', 'Archive link is OK'],
//         filterFunction: () => (url) => {
//             return url.hasArchive
//         },
//     },
//     no_archive: {
//         caption: "URL has NO archive",
//         desc: "There is no archive link associated with this URL",
//         filterFunction: () => (url) => {
//             return !url.hasArchive
//         },
//     },
//
// };

export const ARCHIVE_STATUS_FILTER_MAP = {
    iabot: {
        _: { name: 'IABot'},

        yes: {
            caption: "IABOT has archive for URL",
            desc: "IABOT has archive for URL.",
            default: false,
            filterFunction: () => (url) => {
                return url.searchurldata_archived
            },
        },
        no: {
            caption: "IABot does not have archive for URL",
            desc: "IABot does not have archive for URL",
            default: false,
            filterFunction: () => (url) => {
                return !(url.searchurldata_archived)
            },
        },
        unknown: {
            caption: "IABOT archive status for URL unknown",
            desc: "IABOT archive status for URL unknown.",
            default: false,
            filterFunction: () => (url) => {
                return url.searchurldata_archived === undefined
            },
        },
    },

    iari: {
        _: { name: 'IARI' },

        yes: {
            caption: "URL has archive in page URLs",
            desc: "Archive link found in page URLs.",
            default: false,
            filterFunction: () => (url) => {
                return !!url.hasArchive
            },
        },
        no: {
            caption: "URL has no archive in page URLs",
            desc: "Archive link not found in page URLs.",
            default: false,
            filterFunction: () => (url) => {
                // return !(url.hasArchive === undefined) && !url.hasArchive
                return !url.hasArchive
            },
        },
        unknown: {
            caption: "Archive in page URLs unknown",
            desc: "Archive in page URLs unknown.",
            default: false,
            filterFunction: () => (url) => {
                return url.hasArchive === undefined
            },
        },
    },

    template: {
        _: { name: 'Cite'},
        yes: {
            caption: "Template has archive URL",
            desc: "Template has archive URL.",
            default: false,
            filterFunction: () => (url) => {
                return url.hasTemplateArchive
            },
        },
        no: {
            caption: "Template does not have archive URL",
            desc: "Template does not have archive URL",
            default: false,
            filterFunction: () => (url) => {
                return !(url.hasTemplateArchive)
            },
        },
        unknown: {
            caption: "Template archive status unknown",
            desc: "Template archive status unknown.",
            default: false,
            filterFunction: () => (url) => {
                return url.hasTemplateArchive === undefined
            },
        },
    },
};