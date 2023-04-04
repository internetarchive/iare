export const REF_FILTER_MAP = {
    All: {
        caption: "Show All Refs",
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
        caption: "Show Refs with ISBN",
        desc: "d.template_names.includes ['cite book','isbn']",
        filterFunction: () => (d) => {
            return d.template_names.includes("cite book") || d.template_names.includes("isbn");
        },
    },

    // TODO: this algorithm is not returning the number of refs as given in agg[without_a_template]
    NoTemplate: {
        caption: "Refs without a Template",
        desc: "d.template_names.length < 1",
        // filterFunction: () => true,
        filterFunction: () => (d) => d.template_names.length < 1,
    },

    booksArchive: {
        /*
        ISBN or book refs with
         */
        caption: "Show Refs with ISBN",
        desc: "d.template_names.includes ['cite book','isbn']",
        filterFunction: () => (d) => {
            return d.template_names.includes("cite book") || d.template_names.includes("isbn");
        },
    },

};

export const REF_FILTER_NAMES = Object.keys(REF_FILTER_MAP);
