export const REF_FILTER_DEFS = {
    // Plain: {
    //     caption: "Show Refs with Plain Text",
    //     desc: "plain_text_in_reference = true",
    //     filterFunction: (d) => d.plain_text_in_reference,
    // },
    NoTemplate: {
        caption: "No Template",
        desc: "Citations without a CS1|2 template (free form)",
        filterFunction: () => (urlDict, ref) => ref.template_names.length < 1,
    },

    NamedTemplate: {
        caption: "Has Template",
        desc: 'Citations containing any template',
        filterFunction: () => (urlDict, ref) => {return ref.template_names.length > 0},
    },
    ManyTemplates: {
        caption: "More than 1 Template",
        desc: 'Citations containing more than 1 template',
        filterFunction: () => (urlDict, ref) => {return ref.template_names.length > 1},
    },
    CiteWeb: {
        caption: "{{cite web}} templates",
        desc: "Citations containing a {{cite web}} template",
        filterFunction: () => (urlDict, ref) => {
            return ref.template_names.includes("cite web");
        },
    },
    CiteMap: {
        caption: "{{cite map}} templates",
        desc: "Citations containing a {{cite map}} template",
        filterFunction: () => (urlDict, ref) => {
            return ref.template_names.includes("cite map");
        },
    },
    CiteJournal: {
        caption: "{{cite journal}} templates",
        desc: "Citations containing a {{cite journal}} template",
        filterFunction: () => (urlDict, ref) => {
            return ref.template_names.includes("cite journal");
        },
    },
    CiteBook: {
        caption: "{{cite book}} templates",
        desc: "Citations containing a {{cite book}} template",
        filterFunction: () => (urlDict, ref) => {
            return ref.template_names.includes("cite book");
        },
    },
    ISBN: {
        /*
        ISBN references I would define as: references with a template name "isbn" aka
        naked isbn or references with a cite book + parameter isbn that is not none.
         */
        caption: "Has ISBN",
        desc: "Citations containing an ISBN",
        filterFunction: () => (urlDict, ref) => {
            return ref.template_names.includes("cite book") || ref.template_names.includes("isbn");
        },
    },

    archiveBook: {
        caption: "Books linked to archive.org",
        desc: "Citations containing a link to a book hosted at archive.org",
        filterFunction: () => (urlDict, ref) => {
            return !!ref.urls.find(url => url.includes("https://archive.org/details/"))
        }
    },

    googleBook: {
        caption: "Books linked to Google Books",
        desc: "Citations containing a link to a book hosted at googlebooks",
        filterFunction: () => (urlDict, ref) => {
            return !!ref.urls.find(url => url.includes("https://books.google.com/"))
        }
    },

    journalArchive: {
        caption: "Journal Article linked to archive.org",
        desc: "Citations linking to a journal article in archive.org",
        filterFunction: () => (urlDict, ref) => {
            return ref.template_names.includes("cite journal")
                && !!ref.urls.find((url) => url.includes("https://web.archive.org/"))
        }
    },

    hasDoi: {
        caption: "Reference contains DOI link",
        desc: "Reference has a DOI link",
        filterFunction: () => (urlDict, ref) => {
            return ref.templates.find(tmplt => {
                return !!tmplt.parameters?.doi
            })
        }
    },

    manyUrls: {
        caption: "More than 2 URLs",
        desc: 'Citations containing more than 2 URLs',
        filterFunction: () => (urlDict, ref) => {return ref.urls.length > 2},
    },

    // archiveAny: {
    //     caption: "Anything with archive.org/details",
    //     rule: "URLs include \"https://archive.org/details/\" snippet",
    //     desc: "urls include snippet: \"https://archive.org/details/\"",
    //     filterFunction: () => (d) => {
    //         return !!d.wikitext.includes("https://archive.org/details/")
    //     },
    // },

};

            // export const REF_FILTER_NAMES = Object.keys(REF_FILTER_MAP);


export const REF_FILTER_TYPES = {
    all: {
        caption: "Show All",
        desc: "All citations",
        filterFunction: () => () => {return true},
    },
    general: {
        caption: "General",
        desc: "Citations not in Footnotes section",
        filterFunction: () => (urlDict, ref) => {return ref.type === "general"},
    },

    footnote: {
        caption: "Footnote",
        desc: "Citations in Footnote section",
        filterFunction: () => (urlDict, ref) => {return ref.type === "footnote"},
    },

    content: {
        caption: "Content",
        desc: "Citations with Content",
        filterFunction: () => (urlDict, ref) => {return ref.footnote_subtype === "content"},
    },

    named: {
        caption: "Named",
        desc: "Citations referring to an already defined citation",
        filterFunction: () => (urlDict, ref) => {return ref.footnote_subtype === "named"},
    },

};


export const REF_LINK_STATUS_FILTERS = {
    good_good: {
        caption: "Link Status: Good, Good",
        desc: "Template 'url' and 'archive_url' links are OK.",
        lines: ["Original link is OK", "Archive link is OK"],
        filterFunction: () => (d) => {
            return d.link_status && d.link_status.includes('good_good')
        },
    },
    good_bad: {
        caption: "Link Status: Good, Bad",
        desc: "Template 'url' link is OK, 'archive_url' link is not OK.",
        lines: ["Original link is OK", "Archive link is NOT OK"],
        filterFunction: () => (d) => {
            return d.link_status && d.link_status.includes('good_bad')
        },
    },
    good_none: {
        caption: "Link Status: Good, None",
        desc: "Template 'url' link is OK, 'archive_url' is missing.",
        lines: ['Original link is OK', 'Archive link is missing'],
        filterFunction: () => (d) => {
            return d.link_status && d.link_status.includes('good_none')
        },
    },
    bad_good: {
        caption: "Link Status: Bad, Good",
        desc: "Template 'url' link is not OK, 'archive_url' link is OK.",
        lines: ['Original link is NOT OK', 'Archive link is OK'],
        filterFunction: () => (d) => {
            return d.link_status && d.link_status.includes('bad_good')
        },
    },
    bad_bad: {
        caption: "Link Status: Bad, Bad",
        desc: "Template 'url' link is not OK, 'archive_url' link is not OK.",
        lines: ['Original link is NOT OK', 'Archive link is NOT OK'],
        filterFunction: () => (d) => {
            return d.link_status && d.link_status.includes('bad_bad')
        },
    },
    bad_none: {
        caption: "Link Status: Bad, None",
        desc: "Template 'url' link is not OK, 'archive_url' link is missing.",
        lines: ['Original link is NOT OK', 'Archive link is missing'],
        filterFunction: () => (d) => {
            return d.link_status && d.link_status.includes('bad_none')
        },
    },

    none_none: {
        caption: "Link Status: None, None",
        desc: "Template contains no 'url' or 'archive_url' parameters.",
        lines: ['Original link is missing', 'Archive link is missing'],
        filterFunction: () => (d) => {
            return d.link_status && d.link_status.includes('none_none')
        },
    },

    exotemplate_good: {
        caption: "Link Status: No Template, Good link",
        desc: "Non-template link is OK.",
        lines: ["Link found outside of template", 'Link is OK'],
        filterFunction: () => (d) => {
            return d.link_status && d.link_status.includes('exotemplate_good')
        },
    },

    exotemplate_bad: {
        caption: "Link Status: No Template, Bad link",
        desc: "Non-template link is not OK.",
        lines: ['Link found outside of template', 'Link is bad'],
        filterFunction: () => (d) => {
            return d.link_status && d.link_status.includes('exotemplate_bad')
        },
    },

    missing: {
        caption: "Link Status: Missing",
        desc: "Citation contains no links.",
        lines: ['Citation has no templates', 'Citation has no links'],
        filterFunction: () => (d) => {
            return d.link_status && d.link_status.includes('missing')
        },
    },

};
