import {isLinkStatusGood} from "../utils/generalUtils.js";


export const ACTIONABLE_FILTER_MAP = {

    /*
    ideas for more:
    - source BAD; no archive present
        - if free reference, then check for webarchive
        * if source from template, check for archive_url and url_status
    - source ANY, no archive protection (either through webarchive or template:archive_url

    other non-actionable ideas:
    - call the url_status parameter something like "Citation Priority" in user presentation

    */

    // all: {
    //     caption: "Show All",
    //     desc: "no filter",
    //     filterFunction: () => () => {return true},  // NB function returns function
    // },

    bad_live: {
        category: "Actionable",
        name: "bad_live",
        short_caption: "Broken Link displayed",
        caption: <div>Live Link broken,<br/>Citation Priority: Original</div>,
        desc: "Live link is broken, but is being displayed as the Primary link in a citation.",
        symptom: "The bad link is shown as the primary link in the citation. Since the link is bad, the Archive link should be the primary link.",
        fixit: <div>Set the "url-status" parameter in Citation Template to "dead". This will cause the Archive link to be the Primary link in the citation.</div>,
        tooltip: `<div>Original URL link status is NOT 2XX or 3XX<br/>AND<br/>"url_status" template parameter is set to "live"</div>`,

        filterFunction: () => (u) => {
            // reference_info.statuses is an aggregate of
            return (u.status_code < 200 || u.status_code >= 400)
                &&
                (u.reference_info?.statuses?.length && u.reference_info.statuses.includes('live'));
        },

        refFilterFunction: () => (urlDict, ref) => {  // NB inclusion of urlDict when filter function called with .bind
            return ref.templates.some( template => {
                const url = template.parameters['url']
                if (!url) return false
                const urlObj = urlDict[url]
                if (!urlObj) return false
                return (urlObj.status_code < 200 || urlObj.status_code >= 400)
                    &&
                    (template.parameters['url_status'] === 'live');
            })
        },
    },

    good_not_live: {
        category: "Actionable",
        name: "good_not_live",
        /*
        if there is an "archive_url" parameter in the template, there should be a "url_status" parameter as well. This
        "url_status" parameter, whose value is usually one of "live" or "dead", indicates whether to display the original link
        or the archive link first in the citation.

        - if an archive_url exists, then must have a "url_status" parameter
        - if original link is BAD, then, url_status should not be "live"
        So, final condition is:
        * WITHIN template: if source GOOD, and archive_url exists, and url_status !== "live"

        Example:

            <ref>[http://travel.nationalgeographic.com/travel/world-heritage/easter-island/ Easter Island]
            {{webarchive|url=https://web.archive.org/web/20140403193826/http://travel.nationalgeographic.com/travel/world-heritage/easter-island/
            |date=3 April 2014 }}. ''National Geographic''.</ref>

        In this case, the raw ref has source link but is "saved" by {{webarchive}} template.
        I suppose this could be a case where we have "BAD source" and no protection, whether it be from an archive_url parameter in the
        reference or an associated {{webarchive}} additional template in the ref that protects the source

        suggestion:
        source-status
        archive-status (WBM only?)
        citation-priority - indicated by url-status

        */

        short_caption: "Good Not Live",
        caption: <div>Link Status: GOOD,<br/>Archive Status: GOOD,<br/>Citation Priority: Not Live</div>,
        desc: "Link Status: GOOD, Archive Status: GOOD, Citation Priority: Not Live",
        tooltip: `<div>Original URL Status IS 2XX or 3XX<br/>AND<br/>An archive exists<br/>AND<br/>Template Parameter "url_status" is NOT set to "live"</div>`,
        fixit: <div>Add or change Citation Template Parameter "url-status" to "live"</div>,

        filterFunction: () => (url) => {

            if (!isLinkStatusGood(url.status_code)) return false

            // check templates for archive and citation status
            if (!url.refs) return false

            // return true if ANY of the url's have a ref that meets condition...
            return url.refs.some(r => {

                // return true if any of the ref's have templates that meet condition...
                return r.templates.some(t => {

                    // if d.url matches the url parameter in this template, continue checking...
                    if (t.parameters && (t.parameters.url === url.url)) {

                        // return true if archive_url is there and t.parameters.url_status !== "live"
                        return (t.parameters.archive_url && (
                            (t.parameters.url_status !== undefined)
                            &&
                            (t.parameters.url_status !== "live")
                        ))
                    } else {
                        return false
                    }
                })
            })

        },

        refFilterFunction: () => (urlDict, _ref) => {  // NB inclusion of urlDict when filter function called with .bind

            // console.log(`good_not_live refFilterFunction: _ref: ${_ref.id}, urlDict count: ${urlDict?.length}`)
            return _ref.templates.some(t => {

                const url = t.parameters['url']
                if (!url) return false

                const myUrl = urlDict[url]
                if (!myUrl) return false

                if (!isLinkStatusGood(myUrl.status_code)) return false

                // return true if archive_url is there and t.parameters.url_status !== "live"
                return (t.parameters.archive_url &&
                    (
                        (t.parameters.url_status !== undefined)
                        &&
                        (t.parameters.url_status !== "live")
                    )
                )
            })
        },
    },
        
    dead_link_no_archive: {
        category: "Actionable",
        name: "dead_link_no_archive",
        short_caption: "Broken, No Archive",
        caption: <div>Live Link broken,<br/>Archive Link missing or broken</div>,
        desc: "Live Link is broken, and Archive link is missing or broken.",
        symptom: "There is no valid Archive link to rescue the citation's broken link.",
        tooltip: `<div>Original Status is NOT 2XX or 3XX<br/>AND<br/>No Archive exists in Wayback Machine</div>`,
        fixit: <div>Edit the citation by adding a Wayback Machine Archive URL</div>,

        filterFunction: () => (url) => {
            return (!url.isBook)
                &&
                (url.status_code < 200 || url.status_code >= 400)
                &&
                (!url.archive_status?.hasArchive)
        },

        refFilterFunction: () => (urlDict, ref) => {
            // return true if any urls of this ref match conditions
            return ref.urls.some(myUrl => {  // ref.urls is array of strings
                const url = urlDict[myUrl]  // get urlDict object from url string
                if (!url) return false  // if url not in urlDict, it is probably an archive link, so dont check it
                if (url.isArchive) return false  // if url is an archive, dont check it
                return (!url.isBook)
                    &&
                    (url.status_code < 200 || url.status_code >= 400)  // is it bad?
                    &&
                    (!url.archive_status?.hasArchive)  // and missing an archive?
            })
        },
    },
}
