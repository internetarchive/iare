import {UrlStatusCheckMethods} from "../constants/checkMethods.jsx";
import {IariSources} from "../constants/endpoints.jsx";
import {ParseMethods} from "../constants/parseMethods.jsx";
import {IariMethods} from "../constants/iariMethods.js";
import {ProbeDefs} from "../constants/probeDefs.jsx";


export const getPagePathEndpoint = ({
                                        iariSourceId =IariSources['iari'].key,
                                        path = '',
                                        as_of = '',
                                        cacheData = '',
                                        mediaType = 'wiki',
                                        refresh = false,
                                        parseMethod = "",  // NB should default to something useful
                                    }) => {

    const iariBase = IariSources[iariSourceId]?.proxy
    // TODO: error if iariBase is undefined or otherwise falsey
    console.log(`getPagePathEndpoint: myIariSourceId = ${iariSourceId}, iariBase = ${iariBase}, mediaType = ${mediaType}, articleVersion = ${parseMethod}`)

    if (cacheData) {
        // use cached article result data if specified
        // this is used (mainly?only?) for development
        console.log(`getPagePathEndpoint: cacheData is true.`)
        return `${iariBase}/article_cache?iari_id=${cacheData}`;
    }

    else if (mediaType === "wiki") {

        console.log(`getPagePathEndpoint: wiki:article version: ${parseMethod}`)

        if (parseMethod === ParseMethods.WIKIPARSE_V1.key) {
            // this is the old, "original" IARI parsing method
            const sectionRegex = '&sections=references|bibliography|further reading|works cited|sources|external links';
            const options = '&dehydrate=false'
            return `${iariBase}${ParseMethods.WIKIPARSE_V1.endpoint}?url=${path}${sectionRegex}${options}${refresh ? "&refresh=true" : ''}`;
        }

        else if (parseMethod === ParseMethods.WIKIPARSE_V2.key) {
            // this is the new, improved parsing method
            const options = ''
            return `${iariBase}${ParseMethods.WIKIPARSE_V2.endpoint}?url=${path}${options}${refresh ? "&refresh=true" : ''}`;
        }

        else if (parseMethod === ParseMethods.WIKIPARSE_XREF.key) {
            // this is James version (i believe)

            // Extract the page title
            const pageTitleMatch = path.match(/\/wiki\/([^?#]+)/);
            const pageTitle = pageTitleMatch ? pageTitleMatch[1] : null;

            // Extract the domain
            const domainMatch = path.match(/https?:\/\/([^/]+)/);
            const domain = domainMatch ? domainMatch[1] : null;

            return `${iariBase}${ParseMethods.WIKIPARSE_XREF.endpoint}?` +
                `page_title=${pageTitle}` +
                `${domain ? "&domain=" + domain : ""}` +
                `${as_of ? "&as_of=" + as_of : ""}`;
        }

    } else if (mediaType === "pdf") {
        console.log(`getPagePathEndpoint: pdf`)
        return `${iariBase}/statistics/pdf?url=${path}${refresh ? "&refresh=true" : ''}`;

    }

    console.log(`getPagePathEndpoint: Unknown mediaType - returning default endpoint!`)

    // do general case...TODO make default parser endpoint a config
    // this will produce an error right now, as IARI does not support "analyze"
    // i (mojomonger) think we _should_ have a generic "analyze" endpoint
    return `${iariBase}/statistics/analyze?url=${path}${
        refresh
            ? "&refresh=true"
            : ''}${
        mediaType
            ? `&media_type=${mediaType}`
            : ''}`;

}


export const getProbeEndpoint = (
    {
        url = '',
        probes = '',
        iariSourceId = IariSources['iari'].key,
        refresh = false
    }) =>
{
    const iariBase = IariSources[iariSourceId]?.proxy
    return `${iariBase}${IariMethods.PROBE.endpoint}?probes=${probes}&url=${url}${refresh?"&refresh=true":""}`;
}


const getArchiveStatusFromData = (data) => {  // return dict of success or failure
    /*
            hasArchive: (true|false),
            (* if hasArchive) archive_url = urlInfo.archive  // this is the archive link as it is in iabot database - most likely a wayback? but not necessarily?
            (* if hasArchive) live_state = iabot_livestatus_convert(urlInfo.live_state)
            (* if error) error_reason: "missing iabot_archive_results",
            (* if error) error_details: "missing iabot_archive_results"
     */
    /* sample of archive status results from iabot::
    archive_status: {
        arguments: {
            wiki: "enwiki",
            action: "searchurldata",
            urls: "http://www.citypopulation.de/Pitcairn.html"
        },
        urls: {
            7385206: {
                id: "7385206",
                url: "http://www.citypopulation.de/Pitcairn.html",
                normalizedurl: "http://www.citypopulation.de/Pitcairn.html",
                accesstime: "2013-11-08 00:00:00",
                hasarchive: true,
                live_state: "whitelisted",
                state_level: "domain",
                lastheartbeat: "2021-11-10 12:08:10",
                assumedarchivable: true,
                archived: true,
                attemptedarchivingerror: null,
                reviewed: false,
                archive: "https://web.archive.org/web/20200424154123/http://www.citypopulation.de/Pitcairn.html",
                snapshottime: "2020-04-24 15:41:23"
            }
        },
        loggedon: false,
        servetime: 0.25
        },

    OR, if url not in iabot db:

    archive_status: {
        arguments: {
            wiki: "enwiki",
            action: "searchurldata",
            urls: "https://mojomonger.com"
        },
        requesterror: "404",
        errormessage: "The requested query didn't yield any results.  They're may be an issue with the DB or the requested parameters don't yield any values.",
        loggedon: false,
        servetime: 0.1918
    },
 */

    const iabot_livestatus_convert = (s => {
        return s === "whitelisted"
            ? 'permalive'
            : s === "blacklisted"
                ? "permadead"
                : s
    })

    // error if "archive_status" not in data
    if (!data?.archive_status) {
        return {
            hasArchive: false,
            error_reason: "missing iabot_archive_results",
            error_details: "missing iabot_archive_results"
        }
    }

    const output = {
        "archive_status_method": data.archive_status_method
    }

    // NB assumes "iabot searchurldata" used for archive status

    if (data.archive_status.hasOwnProperty("urls")) {  // process if entry for this url
        const urlIdKeys = Object.keys(data.archive_status.urls)
        if (urlIdKeys.length > 0) {
            const myUrl = data.archive_status.urls[urlIdKeys[0]]
            // NB assumes first url in list is the only one we want
            // TODO: find cases where this is not true
            output.hasArchive = (myUrl.archived === "true" || !!myUrl.archived)  // NB: makes sure not null
            output.archive_url = myUrl.archive  // this is the archive link as it is in iabot database - most likely a wayback? but not necessarily?
            output.live_state = iabot_livestatus_convert(myUrl.live_state)
        }
    }

    else if (data.archive_status.hasOwnProperty("requesterror")) {
        // there is no entry for this url in iabot's database
        output.hasArchive = false
        output.error_reason = "No archive in database"
        output.error_details = data.archive_status.errormessage

    }

    else {

    }

    return output
}


// calls iari check-url endpoint
// archive status is included in results
// returns a promise with the fetch results
const fetchUrl = async ({iariBase, url, refresh=false, timeout=0, method=''}) => {

    const endpoint = `${iariBase}/check-url`
        + `?url=${encodeURIComponent(url)}`
        + (refresh ? "&refresh=true" : '')
        + (timeout > 0 ? `&timeout=${timeout}` : '')
        + `&method=${method}`

    let endpoint_status_code = 0;

    const resolveStatusResults = (data) => {
        // "data" includes all url fields from iari check-url endpoint
        return {
            url: url,
            netloc: data.netloc,
            pay_level_domain: data.first_level_domain,
            status_code: data.status_code,
            status_code_method: data.status_code_method,
            status_code_error_details: data.status_code_error_details,
            archive_status: getArchiveStatusFromData(data)
        }
    }

    const resolveErrorResults = (response) => {
        return {
            url: url,
            netloc: null,
            pay_level_domain: null,
            status_code: 0,
            status_code_method: method,
            status_code_error_details: response.statusText ? response.statusText : "error from server",
            archive_status: null,

            error_code: response.status,
            error_text: response.statusText ? response.statusText : "error from server",
            // TODO: would be nice to use response.statusText, but as of 2023.04.08, response.statusText is empty
        }
    }


    // TODO: do we want no-cache, even if no refresh?
    const urlData = await fetch(endpoint, {cache: "no-cache"})

        .then( response => {

            endpoint_status_code = response.status

            if (response.ok) {
                return response.json().then(data => {
                    return Promise.resolve(resolveStatusResults(data))
                })

            } else {
                // we may have a 504 or other erroneous status_code on the check-url call
                console.warn(`fetchUrl: Error fetching url ${url}.`)
                return Promise.resolve(resolveErrorResults(response))

            }
        })

        .catch( (_e) => { // if something bad happened, return fake synthesized url object

                console.warn(`utils::fetchStatusUrl: Something went wrong when fetching url: ${url}`)

                // return fake url data object so URL display interface is not broken
                return Promise.resolve({
                    url: url,
                    status_code: 0,
                    status_code_method: method,
                    status_code_error_details: "Failure with check-url endpoint",
                    error_code: -1, // we don't know why this happened
                    error_text: "Failure during check-url", // is there an error message available here?
                })
            }
        );

    return { data: urlData, status_code: endpoint_status_code };
}


/* fetches iabot's archive data from IARI for specified url, and returns object as such: (* means optional):
{
    url              original url to check archive for
    hasArchive       if true, then archive_url and live_state is set
    archive_url *    full url of archive
    live_state *     iabot's "live_state" status - unclear if this is useful or not
    error_reason *   short reason for error
    error_details *  longer description if available
}
*/
const fetchUrlArchive = async (iariBase, url, refresh=false) => {

    const endpoint = `${iariBase}/check-url-archive`
        + `?refresh=${refresh ? "true" : "false"}`
        + `&url=${encodeURIComponent(url)}`

    let endpoint_status_code = 0;

    const archiveData = await fetch(endpoint, {cache: "no-cache"})

        .then( response => {

            endpoint_status_code = response.status

            if (response.ok) {
                return response.json().then(data => {
                    return Promise.resolve(getArchiveStatusFromData(data))
                })

            } else {
                // we may have a 504 or other erroneous status_code on the check-url-archive call
                console.warn(`fetchStatusUrl: Error fetching url: ${url}`)

                return Promise.resolve({
                    url: url,
                    hasArchive: false,
                    error_reason: response.status,
                    error_details: response.statusText ? response.statusText : "error from server",
                    // TODO: would be nice to use response.statusText, but as of 2023.04.08, response.statusText is empty
                })

            }
        })

        .catch( (_e) => { // if something bad happened, return fake synthesized url object

                console.warn(`utils::fetchUrlArchive: Unknown error when fetching url: ${url}`)

                // return fake data object to not break interface
                return Promise.resolve({
                    url: url,
                    hasArchive: false,
                    error_reason: "unknown",
                    error_details: "Error during check from server",
                    // TODO Fill this out with more accurate information from call
                })
            }
        );

    return { data: archiveData, status_code: endpoint_status_code };
}


// returns a promise containing array of results of checking archive status of urls in irlArray
export const fetchUrlArchives = async ({
                                           iariBase= '',
                                           urlArray=[],
                                           refresh=false,
                                       } = {}) => {

    // return empty array if urlArray is falsey (null, undefined, or 0 length)
    if (!urlArray?.length) return Promise.resolve([])

    const promises = urlArray.map(urlObj => {
        return fetchUrlArchive(iariBase, urlObj, refresh)
    })

    // assumes all promises successful
    // TODO: error trap this promise call with a .catch
    return await Promise.all(promises);

}

const fetchUrlsIari = async (urlLinks, iariBase, method, refresh, timeout) => {
                // // assumes all promises successful
                // // TODO: error trap this promise call with a .catch
                // return await Promise.all(urlArray.map(urlObj => {
                //     return fetchUrl({iariBase:iariBase, url: urlObj, refresh:refresh, timeout:timeout, method:method})
                // }));

    try {
        return await Promise.all(
            urlLinks.map(urlLink =>
                fetchUrl({
                    iariBase,
                    url: urlLink,
                    refresh,
                    timeout,
                    method
                }).catch(error => {
                    console.error(`Error fetching ${urlLink}:`, error);
                    return null; // Prevents entire Promise.all() from failing
                })
            )
        );
    } catch (err) {
        console.error("Failed to fetch URLs:", err);
        return []; // Return empty array in case of failure
    }
}


// eslint-disable-next-line no-unused-vars
const fetchUrlsIabotBulk = async (iariBase, urlArray, refresh, timeout) => {

    const urlsParam = "?url=" + urlArray.map( url => encodeURIComponent(url) ).join("&url=")
    const endpoint = `${iariBase}/check-urls`
        + urlsParam
        + (refresh ? "&refresh=true" : '')
    // + (timeout > 0 ? `&timeout=${timeout}` : '')  // no timeout parameter yet respected

    const urlData = await fetch(endpoint, {cache: "no-cache"})
        .then(response => {
            if (response.ok) {
                return response.json().then(data => {

                    // response has object with url as keys
                    // transform results wrapped in { data: <results> } format so that it matches
                    // what is returned from other IABOT and IARI fetch methods

                    // convert entries in return data to return format of url entries

                    const myUrls = []
                    for (const [urlKey, entry] of Object.entries(data.urls)) {
                        console.log(urlKey, entry);

                        // add entry to return url array
                        myUrls.push( {
                            data: {
                                url: urlKey,
                                status_code: entry.status_code,
                                // TODO: there might ne error, error_details (or other props) in entry...pass them on?
                            }
                        })

                    }

                    return Promise.resolve(myUrls) // remember, we're in a Promise
                })

            } else {
                // we may have a 504 or other erroneous status_code on the check-url call
                console.warn(`fetchUrlsIabotBulk: Error fetching urls`)

                // todo Does this need to pass back an array? test debug
                return Promise.resolve({
                    url: "error.url",
                    ///tags: ['X'],
                    status_code: 0,
                    error_code: 0,
                    error_text: `Error: Server error via check-urls endpoint: ${endpoint}`,
                })
            }
        })

        .catch((_) => { // if something really bad happened, return fake synthesized url object

                console.warn(`fetchUrlsIabot: Something went wrong when fetching urls with: ${endpoint}`)

                // return fake url data object so URL display interface is not broken
                return Promise.resolve({
                    url: "error.url",
                    status_code: 0,
                    error_code: -1,
                    error_text: `Error: Unknown error via check-urls endpoint: ${endpoint}`,
                })
            }
        );

    return urlData;
}

const checkUrlsCorentin = async (urlArray, refresh, timeout) => {

    const endpoint = UrlStatusCheckMethods.CORENTIN.endpoint + "check"

    const urlList = urlArray // do not need to  array

    const requestOptions = {
        method: 'POST',
        body: JSON.stringify({ urls: urlList })
    };

    const urlData = await fetch(endpoint, requestOptions)
        .then(response => {
            if (response.ok) {
                return response.json().then(data => {

                    // transform results wrapped in { data: <results> } format so that it matches
                    // what is returned from other IABOT and IARI fetch methods
                    const myUrls = data.map( entry => {
                        const results = { // NB: url object "wrapped" in data
                            data: {
                                url: entry.url,
                                status_code: entry.http_status_code,
                            }
                        }

                        // handle errors
                        if (entry.http_status_code === -1) {
                            results.data.status_code = 0;
                            results.data.error_code = -1;
                            results.data.error_text = entry.http_status_message;
                        }

                        return results;

                    })

                    return Promise.resolve(myUrls)
                })

            } else {
                // we may have a 504 or other erroneous status_code on the check-url call
                console.warn(`fetchUrlsCorentin: Error fetching urls`)

                // todo Does this need to pass back an array? test debug
                return Promise.resolve({
                    url: "error.url",
                    ///tags: ['X'],
                    status_code: 0,
                    error_code: 0,
                    error_text: `Error: Server error via CORENTIN endpoint: ${endpoint}`,
                })
            }
        })

        .catch((_) => { // if something really bad happened, return fake synthesized url object

                console.warn(`fetchUrlsCorentin: Something went wrong when fetching urls with: ${endpoint}`)

                // return fake url data object so URL display interface is not broken
                return Promise.resolve({
                    url: "error.url",
                    ///tags: ['X'],
                    status_code: 0,
                    error_code: -1,
                    error_text: `Error: Unknown error via CORENTIN endpoint: ${endpoint}`,
                })
            }
        );

    return urlData;
}


// returns a promise, enholding array of urls
export const fetchUrls = async ({
                                    iariBase= '',
                                    urlArray=[],  // list of flat url links (not url objects)
                                    refresh=false,
                                    timeout=10,
                                    method = UrlStatusCheckMethods.IABOT.key
                                } = {}) => {

    console.log(`iariUtils::fetchUrls: iariBase=${iariBase} method=${method} refresh=${refresh}, timeout=${timeout}`)

    if (!urlArray || !urlArray.length)
    {
        return Promise.resolve([])
    }

    // NB Chrome Developer Tools seems to have a problem showing variables imported at the module level.
    // NB By assigning to a local variable 'methods', the variable value can be successfully debugged.
    const methods = UrlStatusCheckMethods

    let urlData = []

    if (methods.CORENTIN.key === method) {  // special case until IARI covers corentin
        urlData = checkUrlsCorentin(urlArray, refresh, timeout)

    } else if ([methods.IABOT.key, methods.LIVEWEBCHECK.key].includes(method)) {
        urlData = fetchUrlsIari(urlArray, iariBase, method, refresh, timeout)

    } else {
        throw new Error(`Unrecognized check method: ${method}`);
    }

    return urlData

}


const getProbeScore = (probe, probeKey) => {
    // calc score for probe - returns integer or
    // null if
    //   errors in probe or
    //   probeKey not recognized
    //   no probe.raw

    let score = 0


    if (probeKey === ProbeDefs.verifyi.key) {
        // calc score for verifyi

        // if probe.errors, return
        if (probe.errors) return null

        // else check various parts:
        /*
        "raw": {
            "MBFC": {
                "bias": "left-center",
                    "credibility": "high-credibility",
                    "name": "New York Times",
                    "reporting": "high"
            },
            "WikipediaEnglishPerennialSources": {
                    "source": {
                        "294": "The New York Times (NYT)"
                    },
                    "status": {
                        "294": "Generally reliable"
                    }
                },
            "Decodex": {
                "credibility": "Generally reliable in principle"
            }
        */
        if (!probe.raw) return null

        Object.keys(probe.raw).forEach( sectionName => {
            const section = probe.raw[sectionName]

            if (sectionName === "MBFC") {
                if (section["credibility"] === "high-credibility") {
                    score += 1
                }
                else if (section["credibility"] === "low-credibility") {
                    score -= 1
                }
            }
            else if (sectionName === "WikipediaEnglishPerennialSources") {
                /*
                "WikipediaEnglishPerennialSources": {
                    "source": {
                        "294": "The New York Times (NYT)"
                    },
                    "status": {
                        "294": "Generally reliable"
                    }
                },
                */
                const entries = Object.entries(section["status"]);
                if (entries.length > 0) {
                    const [firstKey, firstValue] = entries[0];
                    if (firstValue === "Generally reliable") {
                        score += 1
                    }
                }

            }
            else if (sectionName === "Decodex") {
                /*
                "Decodex": {
                    "credibility": "Generally reliable in principle"
                }
                */
                if (section["credibility"] === "Generally reliable in principle") {
                    score += 1
                }
            }
        })

    }

    else if (probeKey === ProbeDefs.iffy.key) {
        // calc score for iffy
        if (probe.errors) return null
    }

    else if (probeKey === ProbeDefs.trust_project.key) {
        // calc score for trust project
        if (probe.errors) return null

    }

    else {
        return null  // unknown key
    }

    return score

}

// NB this should (maybe?) be done in IARI before returning probe data.
// it should calculate the score AFTER retrieved data from cache,
// if score is not provided in results
export const calcProbeScores = (probe_results) => {
    // for each probe in probe_results.probes:
    //  if no "score" field:
    //      calc score for probe
    //      add score field

    if (!probe_results?.probes) return false

    Object.keys(probe_results.probes).forEach( probeKey => {
        const probe = probe_results.probes[probeKey]

        if (!Object.hasOwn(probe, 'score')) {
            // score not defined - add it
            probe["score"] = getProbeScore(probe, probeKey)
        }
    })

    return true  // success
}


const fetchUrlInfo = async ({iariBase, url, refresh=false, timeout=0, probes='', tag = ''}) => {

    // probe?refresh=true&probes=x|y|verifyi&url=www.x.com

    const endpoint = `${iariBase}/probe`
        + `?url=${encodeURIComponent(url)}`
        + (refresh ? "&refresh=true" : '')
        + (timeout > 0 ? `&timeout=${timeout}` : '')
        + `&probes=${probes}`
        + `${tag ? `&tag=${tag}` : '' }`

    let endpoint_status_code = 0;

    const resolveProbeResults = (data) => {
        // "data" includes all url fields from iari check-url endpoint
        return {
            url: url,
            results: (data)
        }
    }

    const resolveErrorResults = (response) => {
        return {
            url: url,

            error_code: response.status,
            error_text: response.statusText ? response.statusText : "error from server",
            // TODO: would be nice to use response.statusText, but as of 2023.04.08, response.statusText is empty
        }
    }

    // console.log(`fetchUrlInfo: endpoint: ${endpoint}`)

    // TODO: do we want no-cache, even if no refresh?
    const urlData = await fetch(endpoint, {cache: "no-cache"})

        .then( response => {

            endpoint_status_code = response.status

            if (response.ok) {
                return response.json().then(data => {
                    return Promise.resolve(resolveProbeResults(data))
                })

            } else {
                // we may have a 504 or other erroneous status_code on the check-url call
                console.warn(`fetchUrl: Error fetching url ${url}.`)
                return Promise.resolve(resolveErrorResults(response))
            }
        })

        .catch( (_e) => { // if something bad happened, return fake synthesized url object

                console.warn(`utils::fetchStatusUrl: Something went wrong when fetching url: ${url}`)

                // return fake url data object so URL display interface is not broken
                return Promise.resolve({
                    url: url,
                    error_code: -1, // we don't know why this happened
                    error_text: "Failure doing probe", // is there an error message available here?
                })
            }
        );

    return { data: urlData, status_code: endpoint_status_code };
}


// returns a promise, holding array of urls with info
export const fetchUrlsInfo = async ({
                iariBase= '',
                urlArray=[],  // list of flat url links (strings, not url objects)
                refresh=false,
                timeout=10,  // seconds
                probes = "verifyi|trust_project|iffy"
                // may want to add "method" parameter eventually
} = {}) => {

    console.log(`iariUtils::fetchUrlsInfo: iariBase=${iariBase} probes=${probes} refresh=${refresh}, timeout=${timeout}`)

    // return empty array if urlArray is empty
    if (!urlArray || !urlArray.length)  // TODO use IsEmpty() utility function here
    {
        return Promise.resolve([])
    }

    try {
        return await Promise.all(
            urlArray.map(urlLink =>
                fetchUrlInfo({
                    iariBase,
                    url: urlLink,
                    refresh,
                    timeout,
                    probes
                }).catch(error => {
                    console.error(`Error fetching url info for ${urlLink}:`, error);
                    return null; // Prevents entire Promise.all() from failing
                })
            )
        );

    } catch (err) {
        console.error("Failed to fetch url info for URLs:", err);
        return []; // Return empty array in case of failure
    }

}


/* calculates things about uURL's that IARI should have already done but doesn't, such as:
    urlObj.isArchive
    urlObj.hasTemplateArchive
    urlObj.tld
    urlObj.pld
    urlObj._3ld
*/
export const iariPostProcessUrl = (urlObj) => {

    if (!urlObj?.url) return  // undefined urlObj or url property

    const regexWayback = new RegExp(/https?:\/\/(?:web\.)archive\.org\/web\/([\d*]+)\/(.*)/);
    const regexArchiveToday = new RegExp(/https?:\/\/archive\.today\/([\d*]+)\/(.*)/);

    const getDomainParts = (url) => {  // TODO should be done in IARI, but isnt yet

        // top-level-domain (TLD), pay-level-domain (PLD), and Third level domain (_3LD) extraction
        // For example, for http://sscl.berkeley.edu/~oal/background/pacislands.htm:
        //
        // tld = edu
        // pld = berkeley.edu
        // _3ld = sscl.berkeley.edu

        const parsedUrl = new URL(url);
        const hostnameParts = parsedUrl.hostname.split('.');

        if (hostnameParts.length >= 2) {
            const tld = hostnameParts[hostnameParts.length - 1];
            const pld = hostnameParts[hostnameParts.length - 2];
            const _3ld = hostnameParts[hostnameParts.length - 3];
            return { pld, tld, _3ld };
        } else {
            return { pld: null, tld: null, _3ld: null };
        }
    }


    const sanitizeUrlForArchive = (targetUrl) => {
        // TODO ongoing, as checking if archive can be tricky
        // TODO Also must consider other archiving services
        // TODO may use IABot's isArchive function...

        // // let inputString = 'http://example.com:http://example2.com:some:text:with:colons';
        // const regexColon = /:(?!\/\/)/g;  // Regular expression to match colons not followed by "//"
        // // const regexEquals = /=/g;  // Regular expression to match equals signs
        // let resultUrl;
        // resultUrl = targetUrl.replace(regexColon, '%3A');  // Replace solo colons with encoded "%3A"
        // // resultUrl = resultUrl.replace(regexEquals, '%3D')
        // return resultUrl
        return targetUrl  // for now - trying to debug and see if it is necessary
    }

    const isArchive = (targetUrl) => {
        // TODO use IABot's isArchive thing that MAX wrote
        return !!(sanitizeUrlForArchive(targetUrl).match(regexWayback))
            ? true
            : !!(sanitizeUrlForArchive(targetUrl).match(regexArchiveToday))
    }

    urlObj.isArchive = isArchive(urlObj.url)
    urlObj.hasTemplateArchive = false  // TODO: this will be recalculated when processing references

    // these should have been parsed by iari, but since wayback is not included in iari yet, we have to do it post-process
    const parts = getDomainParts(urlObj.url)
    urlObj.tld = `${parts.tld ? parts.tld : ''}`
    urlObj.pld = `${parts.pld ? parts.pld : ''}.${parts.tld ? parts.tld : ''}`
    urlObj._3ld = `${parts._3ld ? parts._3ld : ''}.${parts.pld ? parts.pld : ''}.${parts.tld ? parts.tld : ''}`
}



// // return true if url deemed a that points to a book
// // based on regex match of book url patterns
// export const isBookUrl = (url) => {
//
//     const regexBookGoogle = /^https?:\/\/books\.google\.com\/books\//
//     const regexBookArchiveOrg = /^https?:\/\/archive\.org\/details\//;
//
//     if (regexBookGoogle.test(url)) return true
//     if (regexBookArchiveOrg.test(url)) return true
//     return false
// }
