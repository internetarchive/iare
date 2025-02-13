// ParseMethods dictate how the article is parsed.
// Each parsing method makes a different IARI endpoint call
export const ParseMethods = {
    ARTICLE_V1: {
        // Uses original, dennis method to extract refs and citations from wikipedia article.
        // Extracts all <ref> tags (with their containing template data), as well as
        //  "free citations" that occur in other sections with a leading asterisk.
        key: 'ARTICLE_V1',
        caption: 'Parse Method Version 1 (/statistics/article)',
        endpoint: '/statistics/article',
    },
    ARTICLE_V2: {
        // Same extraction methods as ARTICLE_V1, and adds context links extracted from HTML.
        //  Does its best to match HTML version of citations with wikitext versions
        key: 'ARTICLE_V2',
        caption: 'Parse Method Version 2 (/article)',
        endpoint: '/article',
    },
    ARTICLE_XREF: {
        // uses Jame's extraction methods
        // This is under construction, but is the most promising
        key: 'ARTICLE_XREF',
        alternate_keys: ['XREF'],
        caption: 'Parse Method Version ExtractRefs (/extract_refs)',
        endpoint: '/extract_refs',
        params: 'page_title,domain,as_of,wikitext',
    },

}