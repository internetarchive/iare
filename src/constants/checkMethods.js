export const UrlStatusCheckMethods = {
    IABOT: {
        key: 'IABOT',
        caption: 'IA Bot',
        endpoint: '',
    },

    WAYBACK: {
        key: 'WAYBACK',
        caption: 'Live Web Check',
        endpoint: 'https://iabot-api.archive.org/livewebcheck',
        // must use parameters in the form: ...?url=archive.org
        // don't forget to URL encode the url param value
    },

    IARI: {
        key: 'IARI',
        caption: 'IARI',
        endpoint: ''
    },

    CORENTIN: {
        key: 'CORENTIN',
        caption: 'Corentin',
        endpoint: 'https://iabot-api.archive.org/undertaker/'
    },



    IABOT_SEARCHURL: {
        key: 'IABOT_SEARCHURL',
        caption: 'IA Bot SearchUrlData',
        endpoint: '',
        hide: true
    },
}