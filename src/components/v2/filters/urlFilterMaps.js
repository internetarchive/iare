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

export const URL_ACTION_FILTER_MAP = {
    all: {
        caption: "Show All",
        desc: "no filter",
        filterFunction: () => () => {return true},
    },
    bad_live: {
        name: "bad_live",
        caption: "Show Original Status bad, Cite Status \"live\"",
        desc: "Tooltip description here",
        filterFunction: () => (d) => {
            return true;
        },
    },
    // status3XX: {
    //     caption: "Status 3XX",
    //     desc: "'",
    //     filterFunction: () => (d) => {
    //         return d.status_code >= 300 && d.status_code < 400;
    //     },
    // },

};


export const ARCHIVE_STATUS_FILTER_MAP = {
    iabot: {
        _: { name: 'IABot'},

        yes: {
            caption: "IABot has archive for URL",
            desc: "IABot has archive for URL.",
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
        all: {
            caption: "IABot archive status for URL is anything",
            desc: "IABot archive status for URL  is anything.",
            default: false,
            filterFunction: () => (url) => {return true},
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
        all: {
            caption: "Archive in page URLs is anything",
            desc: "Archive in page URLs is anything.",
            default: false,
            filterFunction: () => (url) => {return true},
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
        all: {
            caption: "Cite archive status is anything",
            desc: "Cite archive status is anything.",
            default: false,
            filterFunction: () => (url) => {return true},
        },
    },
};