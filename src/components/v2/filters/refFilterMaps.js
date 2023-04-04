export const REF_FILTER_MAP = {
    All: {
        caption: "Show All",
        desc: "no filter",
        filterFunction: () => () => {return true},
    },
    // Plain: {
    //     caption: "Show Refs with Plain Text",
    //     desc: "plain_text_in_reference = true",
    //     filterFunction: (d) => d.plain_text_in_reference,
    // },
    NamedTemplate: {
        caption: "Named Templates",
        desc: 'template_names[]',
        filterFunction: () => (d) => {return d.template_names.length > 0},
    },
    CiteWeb: {
        caption: "Cite Web",
        desc: "template_names[] contains 'cite web'",
        filterFunction: () => (d) => {
            return d.template_names.includes("cite web");
        },
    },
    CiteMap: {
        caption: "Cite Map",
        desc: "template_names[] contains 'cite map'",
        filterFunction: () => (d) => {
            return d.template_names.includes("cite map");
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
        desc: "d.template_names.includes ['cite book','isbn']",
        filterFunction: () => (d) => {
            return d.template_names.includes("cite book") || d.template_names.includes("isbn");
        },
    },

    archiveBook: {
        /*
        ISBN or book refs with
         */
        caption: "Books with archive.org",
        rule: "d.template_names.includes ['cite book','isbn'] and URLs include \"https://archive.org/details/\"",
        desc: "['cite book'], with \"https://archive.org/details/\"",
        filterFunction: () => (d) => {
            return !!d.urls.find((url) => url.includes("https://archive.org/details/"))
        }
    },

    // TODO: this algorithm is not returning the number of refs as given in agg[without_a_template]
    NoTemplate: {
        caption: "No Template",
        desc: "d.template_names.length < 1",
        // filterFunction: () => true,
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

export const REF_FILTER_NAMES = Object.keys(REF_FILTER_MAP);
