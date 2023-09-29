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

export const URL_ARCHIVE_STATUS_FILTER_MAP = {
    yes_archive: {
        caption: "URL has archive",
        desc: "There is an archive link associated with the URL.",
        // lines: ['Original link is OK', 'Archive link is OK'],
        filterFunction: () => (url) => {
            return url.hasArchive
        },
    },
    no_archive: {
        caption: "URL has NO archive",
        desc: "There is no archive link associated with this URL",
        filterFunction: () => (url) => {
            return !url.hasArchive
        },
    },

};
