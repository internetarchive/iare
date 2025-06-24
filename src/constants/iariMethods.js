// IariMethods describe the methods available in the IARI API
export const IariMethods = {
    PROBE: {
        key: 'PROBE',
        caption: 'Probe url for credibility data',
        endpoint: '/probe',
        params: [
            {
                name: "url",
                type: "string",
                desc: "url to apply probes with"
            },
            {
                name: "probes",
                type: "string",
                desc: "pipe delimited strings describing probe methods to execute"
            },
            {
                name: "refresh",
                type: "boolean",
                desc: "whether to pull fresh data or use what is in cache"
            }
        ]
    },
}