// ParseMethods dictate how the article is parsed.
// Each parsing method makes a different IARI endpoint call
export const ParseMethods = {
    WIKIPARSE_V1: {
        // Uses original, dennis method to extract refs and citations from wikipedia article.
        // Extracts all <ref> tags (with their containing template data), as well as
        //  "free citations" that occur in other sections with a leading asterisk.
        key: 'WIKIPARSE_V1',
        caption: 'Wiki Parse Version 1',
        endpoint: '/statistics/article',
    },
    WIKIPARSE_V2: {
        // Same extraction methods as WIKIPARSE_V1, and adds context links extracted from HTML.
        //  Does its best to match HTML version of citations with wikitext versions
        key: 'WIKIPARSE_V2',
        caption: 'Wiki Parse Version 2',
        endpoint: '/article',
    },
    WIKIPARSE_XREF: {
        // uses Jame's extraction methods
        // This is under construction, but is the most promising
        key: 'WIKIPARSE_XREF',
        alternate_keys: ['XREF'],
        caption: 'Wiki Parse Version ExtractRefs',
        endpoint: '/extract_refs',
        params: 'page_title,domain,as_of,wikitext',
    },

}