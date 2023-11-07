export const URL_STATUS_FILTER_MAP = {
    all: {
        caption: "Show All",
        desc: "All URLs are shown",
        filterFunction: () => () => {return true},
    },
    status2XX: {
        caption: "Status 2XX",
        desc: "URL Link HTTP Status code is in the 2XX range.",
        filterFunction: () => (d) => {
            return d.status_code >= 200 && d.status_code < 300;
        },
    },
    status3XX: {
        caption: "Status 3XX",
        desc: "URL Link HTTP Status code is in the 3XX range.",
        filterFunction: () => (d) => {
            return d.status_code >= 300 && d.status_code < 400;
        },
    },
    status4XX: {
        caption: "Status 4XX",
        desc: "URL Link HTTP Status code is in the 4XX range.",
        filterFunction: () => (d) => {
            return d.status_code >= 400 && d.status_code < 500;
        },
    },
    status5XX: {
        caption: "Status 5XX",
        desc: "URL Link HTTP Status code is in the 5XX range.",
        filterFunction: () => (d) => {
            return d.status_code >= 500 && d.status_code < 600;
        },
    },
    statusUnknown: {
        caption: "Unknown Status",
        desc: "URL Link HTTP Status is Unknown, possibly because of non-response.",
        filterFunction: () => (d) => {
            return !d.status_code;
        },
    },

};

export const ACTIONABLE_FILTER_MAP = {
    // all: {
    //     caption: "Show All",
    //     desc: "no filter",
    //     filterFunction: () => () => {return true},  // NB function returns function
    // },
    bad_live: {
        name: "bad_live",
        caption: "URL Status BAD, Citation Status LIVE",
        desc: "URL Status BAD, Citation Status LIVE",
        tooltip: `<div>Original URL Status is NOT 2XX or 3XX<br/>AND<br/>Template Parameter "url_status" is set to "live"</div>`,
        fixit: <div>Set "url-status" parameter in Citation Template to "dead"</div>,
        filterFunction: () => (d) => {
            // reference_info.statuses is an aggregate of
            return (d.status_code < 200 || d.status_code >= 400)
                &&
                (d.reference_info?.statuses?.length && d.reference_info.statuses.includes('live'));
        },
    },
    good_not_live: {
        name: "good_not_live",
        caption: "URL Status GOOD, Citation Status NOT LIVE",
        desc: "URL Status GOOD, Citation Status NOT LIVE",
        tooltip: `<div>Original URL Status IS 2XX or 3XX<br/>AND<br/>Template Parameter "url_status" is NOT set to "live"</div>`,
        fixit: <div>Set "url-status" parameter in Citation Template to "live"</div>,
        filterFunction: () => (d) => {
            return (d.status_code >= 200 && d.status_code < 400)
                &&
                (d.reference_info?.statuses?.length && !d.reference_info.statuses.includes('live') );
        },
    },
    dead_link_no_archive: {
        name: "dead_link_no_archive",
        caption: "URL Status BAD, Archive Status BAD (pending)",
        desc: "URL Status BAD, Archive Status BAD",
        tooltip: `<div>Original URL Status is NOT 2XX or 3XX<br/>AND<br/>No Archive exists in Wayback Machine</div>`,
        fixit: <div>Add Wayback Machine archive for this URL in the citation</div>,
        filterFunction: () => (d) => {
            return (d.status_code < 200 || d.status_code >= 400)
                &&
                (!d.searchurldata_archived)
        },
    },
};


export const ARCHIVE_STATUS_FILTER_MAP = {
    iabot: {
        // _: { name: 'IABot'},
        _: { name: <>Archive<br/>Status</>},

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