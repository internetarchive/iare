export const ArticleVersions = {
    ARTICLE_V1: {
        key: 'ARTICLE_V1',
        caption: 'Version 1 (/statistics/article)',
        endpoint: '/statistics/article',
    },
    ARTICLE_V2: {
        key: 'ARTICLE_V2',
        caption: 'Version 2 (/article)',
        endpoint: '/article',
    },
    ARTICLE_XREF: {
        key: 'ARTICLE_XREF',
        alternate_keys: ['XREF'],
        caption: 'Version ExtractRefs (/extract_refs)',
        endpoint: '/extract_refs',
        params: 'page_title,domain,as_of,wikitext',
    },

}