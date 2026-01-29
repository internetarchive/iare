export const URL_FILTER_MAP = {
    all: {
        caption: "All",
        desc: "no filter",
        filterFunction: () => () => {return true},
    },
    status2XX: {
        caption: "Status 2XX",
        desc: "'",
        filterFunction: () => (d) => {
            return d.data.status_code >= 200 && d.data.status_code < 300;
        },
    },
    status3XX: {
        caption: "Status 3XX",
        desc: "'",
        filterFunction: () => (d) => {
            return d.data.status_code >= 300 && d.data.status_code < 400;
        },
    },
    status4XX: {
        caption: "Status 4XX",
        desc: "'",
        filterFunction: () => (d) => {
            return d.data.status_code >= 400 && d.data.status_code < 500;
        },
    },
    status5XX: {
        caption: "Status 5XX",
        desc: "'",
        filterFunction: () => (d) => {
            return d.data.status_code >= 500 && d.data.status_code < 600;
        },
    },
    statusUnknown: {
        caption: "Unknown",
        desc: "'",
        filterFunction: () => (d) => {
            return !d.data.status_code;
        },
    },

};
