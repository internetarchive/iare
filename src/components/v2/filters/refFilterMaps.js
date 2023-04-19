export const REF_FILTER_DEFS = {
    // Plain: {
    //     caption: "Show Refs with Plain Text",
    //     desc: "plain_text_in_reference = true",
    //     filterFunction: (d) => d.plain_text_in_reference,
    // },
    NamedTemplate: {
        caption: "Named Templates",
        desc: 'Citations containing any named template',
        filterFunction: () => (d) => {return d.template_names.length > 0},
    },
    CiteWeb: {
        caption: "{{cite web}} templates",
        desc: "Citations containing a {{cite web}} template",
        filterFunction: () => (d) => {
            return d.template_names.includes("cite web");
        },
    },
    CiteMap: {
        caption: "{{cite map}} templates",
        desc: "Citations containing a {{cite map}} template",
        filterFunction: () => (d) => {
            return d.template_names.includes("cite map");
        },
    },
    CiteJournal: {
        caption: "{{cite journal}} templates",
        desc: "Journal articles linked to",
        filterFunction: () => (d) => {
            return d.template_names.includes("cite journal");
        },
    },
    // Cs1: {
    //     caption: "Show Refs using cs1 template",
    //     desc: "what is condition?",
    //     filterFunction: () => (d) => 0,
    // },
    ISBN: {
        /*
        ISBN references I would define as: references with a template name "isbn" aka
        naked isbn or references with a cite book + parameter isbn that is not none.
         */
        caption: "Has ISBN",
        desc: "Citations containing an ISBN",
        filterFunction: () => (d) => {
            return d.template_names.includes("cite book") || d.template_names.includes("isbn");
        },
    },

    archiveBook: {
        caption: "Books linked to archive.org",
        desc: "Citations containing a link to a book hosted at archive.org",
        filterFunction: () => (d) => {
            return !!d.urls.find((url) => url.includes("https://archive.org/details/"))
        }
    },

    googleBook: {
        caption: "Books linked to Google Books",
        desc: "Citations containing a link to a book hosted at googlebooks",
        filterFunction: () => (d) => {
            return !!d.urls.find((url) => url.includes("https://books.google.com/"))
        }
    },

    journalArchive: {
        caption: "Journal Article linked to archive.org",
        desc: "Citations linking to a journal article in archive.org",
        filterFunction: () => (d) => {
            return d.template_names.includes("cite journal")
                && !!d.urls.find((url) => url.includes("https://web.archive.org/"))
        }
    },

    NoTemplate: {
        caption: "No Template",
        desc: "Citations without a CS1|2 template (free form)",
        filterFunction: () => (d) => d.template_names.length < 1,
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
        caption: "All",
        desc: "All citations",
        filterFunction: () => () => {return true},
    },
    general: {
        caption: "General",
        desc: "General Citations",
        filterFunction: () => (d) => {return d.type === "general"},
    },

    footnote: {
        caption: "Footnote",
        desc: "Footnote Citations",
        filterFunction: () => (d) => {return d.type === "footnote"},
    },

    content: {
        caption: "Content",
        desc: "Content Citations",
        filterFunction: () => (d) => {return d.footnote_subtype === "content"},
    },

    named: {
        caption: "Named",
        desc: "Named Citations",
        filterFunction: () => (d) => {return d.footnote_subtype === "named"},
    },

};
