import {isLinkStatusGood} from "../utils/utils";


export const ACTIONABLE_FILTER_MAP = {

    /* ideas for more:
    * source BAD; no archive present
        - if free reference, then check for webarchive
        * if source from template, check for archive_url and url_status
    * source ANY, no archive protection (either through webarchive or template:archive_url

    * other non-actionable ideas:
    = call the url_status parameter something like "Citation Priority" in user presentation

         */

    // all: {
    //     caption: "Show All",
    //     desc: "no filter",
    //     filterFunction: () => () => {return true},  // NB function returns function
    // },
    bad_live: {
        name: "bad_live",
        caption: <div>Link Status: BAD,<br/>Citation Priority: Live</div>,
        desc: "Link Status: BAD, Citation Priority: Live",
        tooltip: `<div>Original URL Status is NOT 2XX or 3XX<br/>AND<br/>Template Parameter "url_status" is set to "live"</div>`,
        fixit: <div>Set "url-status" parameter in Citation Template to "dead"</div>,
        filterFunction: () => (d) => {
            // reference_info.statuses is an aggregate of
            return (d.status_code < 200 || d.status_code >= 400)
                &&
                (d.reference_info?.statuses?.length && d.reference_info.statuses.includes('live'));
        },
    },
    good_not_live: {
        name: "good_not_live",
        /*
        if their is an archive_url parameter in the template, there should be an "url_status" parameter as well. This
        "url_status" parameter, whose value is generally "live" or "dead", indicates whether to show original link first
        or archive link first in the citation.
        - if an archive_url exists, then must have a "url_status" parameter
        - if original link is BAD, then, url_status should not be "live"
        So, final condition is:
        * WITHIN template: if source GOOD, and archive_url exists, and url_status !== "live"

        anomaly example:

        <ref>[http://travel.nationalgeographic.com/travel/world-heritage/easter-island/ Easter Island]
        {{webarchive|url=https://web.archive.org/web/20140403193826/http://travel.nationalgeographic.com/travel/world-heritage/easter-island/
        |date=3 April 2014 }}. ''National Geographic''.</ref>

        in this case, our raw ref has source link but is "saved" by {{webarchive}} template.
        i suppose this could be a case where we have "BAD source" and no protection, whether it be from an archive_url parameter in the
        reference or an associated {{webarchive}} additional template in the ref that protects the source

        suggestion:
        source-status
        archive-status (WBM only?)
        citation-priority - indicated by url-status

        if link GOOD
        AND (archive exists and citation-priority is ARCHIVE)
        THEN
        the citation-priority should be set to SOURCE (url-status => "live")

        title:
        Source link GOOD, Archive YES, Citation Priority: Archive

        translates to:

        // if link bad, exit with FALSE
        if (d.status_code < 200 || d.status_code >= 400) return false

        // we check all templates of all references
        // if ANY of the templates fulfill the conditions, return TRUE

        // fancy ref loop template loop
        // if (archive-url exists) && (url-status !== live)
         */

        caption: <div>Link Status: GOOD,<br/>Archive Status: GOOD,<br/>Citation Priority: Not Live</div>,
        desc: "Link Status: GOOD, Archive Status: GOOD, Citation Priority: Not Live",
        tooltip: `<div>Original URL Status IS 2XX or 3XX<br/>AND<br/>An archive exists<br/>AND<br/>Template Parameter "url_status" is NOT set to "live"</div>`,
        fixit: <div>Add or change Citation Template Parameter "url-status" to "live"</div>,

        filterFunction: () => (d) => {

            // run through refs and templates
            // if template.url === d.url
            //   if template.archive_url
            //      if template.url_status !== "live"
            //          return TRUE
            //      else return FALSE
            //   else return FALSE;
            // else return FALSE

            if (isLinkStatusGood(d.status_code)) {
                // source link GOOD, check templates for archive and citation status
                return d.refs.some(r => {
                    // if any of the ref's templates return true...
                    return r.templates.some(t => {
                        // if d.url matches the url parameter in this template, continue checking...
                        if (t.parameters && (t.parameters.url === d.url)) {
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
            } else {
                return false
            }



            /* strategy:
            for this url object (as d)

            if d.url is GOOD
                for some refs (as r)
                    for some template (as t):  // return true as soon as any of the consitions are true, i.e., if at least one template has true conditions
                        if d.url === t.url, then:
                            if t.archive_url exists and t.url_status !== live
                                return TRUE
                            else return false
                        else
                            return false

             else
                return false

             */



        },
    },
    dead_link_no_archive: {
        name: "dead_link_no_archive",
        caption: <div>Link Status BAD,<br/>Archive Status BAD</div>,
        desc: "Link Status BAD, Archive Status BAD",
        tooltip: `<div>Original URL Status is NOT 2XX or 3XX<br/>AND<br/>No Archive exists in Wayback Machine</div>`,
        fixit: <div>Add Wayback Machine archive URL to the citation</div>,
        filterFunction: () => (d) => {
            return (d.status_code < 200 || d.status_code >= 400)
                &&
                (!d.archive_status?.hasArchive)
        },
    },
};
