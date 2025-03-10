
// export const IARI_V2_URL_BASE = 'https://archive.org/services/context/iari-prod/v2';
// export const API_V2_STAGE_URL_BASE = 'https://archive.org/services/context/iari/v2stage';

export const IariSources = {
    iari: {
        key: 'iari',
        caption: 'IARI',
        proxy: 'https://archive.org/services/context/iari/v2',
    },
    iari_prod: {
        key: 'iari_prod',
        caption: 'IARI Prod',
        // proxy: 'https://archive.org/services/context/iari-prod/v2',
        proxy: 'https://iabot-api.archive.org/services/context/iari-prod/v2',
    },
    iari_stage: {
        key: 'iari_stage',
        caption: 'IARI Stage',
        // proxy: 'https://archive.org/services/context/iari-stage/v2',
        proxy: 'https://iabot-api.archive.org/services/context/iari-stage/v2',
    },
    iari_test: {
        key: 'iari_test',
        caption: 'IARI Test',
        // proxy: 'https://archive.org/services/context/iari-test/v2',
        proxy: 'https://iabot-api.archive.org/services/context/iari-test/v2',
    },
    iari_local: {
        key: 'iari_local',
        caption: 'IARI Local',
        proxy: 'http://localhost:5000/v2',
    },
}

