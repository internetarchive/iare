export const URL_FILTER_MAP = {
    All: {
        caption: "Show All Urls",
        desc: "no filter",
        filter: () => () => {return true},
    },
    status2XX: {
        caption: "Status 2XX",
        desc: "'",
        filter: () => (d) => {
            return [200,201,202,203,204,205,206,207,208,226].includes(d.data.status_code);
        },
    },
    status3XX: {
        caption: "Status 3XX",
        desc: "'",
        filter: () => (d) => {
            return [300,301,302,303,304,305,306,307,308].includes(d.data.status_code);
        },
    },
    status4XX: {
        caption: "Status 4XX",
        desc: "'",
        filter: () => (d) => {
            return d.data.status_code >= 400 && d.data.status_code < 500;
        },
    },
    status5XX: {
        caption: "Status 5XX",
        desc: "'",
        filter: () => (d) => {
            return d.data.status_code >= 500 && d.data.status_code < 600;
        },
    },
    statusUnknown: {
        caption: "Unknown",
        desc: "'",
        filter: () => (d) => {
            return !d.data.status_code;
        },
    },

};

export const URL_FILTER_NAMES = Object.keys(URL_FILTER_MAP);

