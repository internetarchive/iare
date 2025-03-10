const myCategory = "Reference Stats"
const regexMediaWikiCiteId = new RegExp("^mw[a-zA-Z0-9\\-]{3}$")  // letters, numbers, hyphen, 3 chars

export const REFERENCE_STATS_MAP = {

    has_name: {
        category: myCategory,
        caption: "Has Reference Name",
        desc: "The reference has an explicit name, possibly for multiple citations",
        // filter take a reference, and checks ref_info.ref_name
        refFilterFunction: () => (urlDict, _ref) => {  // NB: must put urlDict as FIRST argument! (see call in RefFlock)
            if (!_ref["ref_info"]) return false
            return !!(_ref["ref_info"]["ref_name"]);  // true if something there
        },
    },

    cite_id_is_something: {
        category: myCategory,
        caption: "cite_id is something",
        desc: "cite_id is something",
        // refName begins with "mw"
        refFilterFunction: () => (urlDict, _ref) => {  // NB: must put urlDict as FIRST argument! (see call in RefFlock)
            if (!_ref["ref_info"]) return false
            // if there, test for pattern "mwXXX"
            return (_ref["ref_info"]["cite_id"])
        },
    },


    cite_id_is_mediawiki: {
        category: myCategory,
        caption: "cite_id is MediaWiki default",
        desc: "cite_id is MediaWiki default",
        // refName begins with "mw"
        refFilterFunction: () => (urlDict, _ref) => {  // NB: must put urlDict as FIRST argument! (see call in RefFlock)
            if (!_ref["ref_info"]) return false
            if (!_ref["ref_info"]["cite_id"]) return false
            // if there, test for pattern "mwAAA", where A is letter,
            return (_ref["ref_info"]["cite_id"])
                ? regexMediaWikiCiteId.test(_ref["ref_info"]["cite_id"])
                : false
        },
    },


    has_no_cite_id: {
        category: myCategory,
        caption: "No cite_id",
        desc: "No cite_id was found for the reference",
        // filter take a reference, and checks ref_info.ref_name
        refFilterFunction: () => (urlDict, _ref) => {  // NB: must put urlDict as FIRST argument! (see call in RefFlock)
            if (!_ref["ref_info"]) return false
            return !(_ref["ref_info"]["cite_id"]);  // true if something there
        },
    },

    has_actionable: {
        category: myCategory,
        caption: "Has ANY Actionable",
        desc: "Any Actionable is applied to Link or Citation",
        // filter take a reference, and checks ref_info.ref_name
        filterFunction: () => (url) => {
            return url.actionable?.length
        },
        refFilterFunction: () => (urlDict, _ref) => {
            return _ref.urls.some( url => {
                const urlObject = urlDict[url]
                if (!urlObject) return false
                return urlObject.actionable?.length
            })
        }

    },

}
