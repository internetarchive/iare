import {UrlStatusCheckMethods} from "../constants/checkMethods";

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

const fetchUrlsIari = async (urlArray, iariBase, method, refresh, timeout) => {
    // assumes all promises successful
    // TODO: error trap this promise call with a .catch
    return await Promise.all(urlArray.map(urlObj => {
        return fetchUrl({iariBase:iariBase, url: urlObj, refresh:refresh, timeout:timeout, method:method})
    }));
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
                urlArray=[],
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

    } else if ([methods.IABOT.key, methods.WAYBACK.key].includes(method)) {
        urlData = fetchUrlsIari(urlArray, iariBase, method, refresh, timeout)

    } else {
        throw new Error(`Unrecognized check method: ${method}`);
    }

    return urlData

}


export const iariPostProcessUrl = (urlObj) => {
    /* does things that IARI should have already done for us but doesn't
        urlObj.isArchive
        urlObj.hasTemplateArchive
        urlObj.tld
        urlObj.sld
        urlObj._3ld
    */

    if (!urlObj?.url) return  // undefined urlObj or url property

    const regexWayback = new RegExp(/https?:\/\/(?:web\.)archive\.org\/web\/([\d*]+)\/(.*)/);
    const regexArchiveToday = new RegExp(/https?:\/\/archive\.today\/([\d*]+)\/(.*)/);

    const getDomainParts = (url) => {  // TODO should be done in IARI
        // top-level-domain (TLD) and second-level-domain (SLD) extraction
        const parsedUrl = new URL(url);
        const hostnameParts = parsedUrl.hostname.split('.');

        if (hostnameParts.length >= 2) {
            const sld = hostnameParts[hostnameParts.length - 2];
            const tld = hostnameParts[hostnameParts.length - 1];
            const _3ld = hostnameParts[hostnameParts.length - 3];
            return { sld, tld, _3ld };
        } else {
            return { sld: null, tld: null, _3ld: null };
        }
    }


    const sanitizeUrlForArchive = (targetUrl) => {
        // TODO ongoing, as checking if archive can be tricky
        // TODO Also must consider other archiving services
        // TODO may use IABot's isArchive function...

        // // let inputString = 'http://example.com:http://example2.com:some:text:with:colons';
        // const regexColon = /:(?!\/\/)/g;  // Regular expression to match colons not followed by "//"
        // // const regexEquals = /=/g;  // Regular expression to match equals signs
        // let resultUrl
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
    urlObj.sld = `${parts.sld ? parts.sld : ''}.${parts.tld ? parts.tld : ''}`
    urlObj._3ld = `${parts._3ld ? parts._3ld : ''}.${parts.sld ? parts.sld : ''}.${parts.tld ? parts.tld : ''}`
}

