import {UrlStatusCheckMethods} from "../constants/checkMethods";

// calls iari check-url endpoint
//
// NB for now, this is only valid for iabot.
// NB soon it will be valid for wayback as well
//
// archive status is separately fetched with check-url-archive (in fetchUrlArchive/fetchUrlArchives?)
const fetchUrl = async (iariBase, url, refresh=false, timeout=0, method='') => {

    const endpoint = `${iariBase}/check-url`
        + `?url=${encodeURIComponent(url)}`
        + (refresh ? "&refresh=true" : '')
        + (timeout > 0 ? `&timeout=${timeout}` : '')
        + `&method=${method}`

    let endpoint_status_code = 0;

    const resolveResults = (data, method) => {
        // interpret data from iabot's testdeadlink endpoint

        const results = {
            url: url,
            status_code_method: method
        }

        if (method === UrlStatusCheckMethods.IABOT.key) {

            results.status_code = data.testdeadlink_status_code
            results.status_code_error_details = data.testdeadlink_error_details

                    // } else if (method === UrlStatusCheckMethods.IARI.key) {
                    //     // TODO Deprecate? its nice to have a default status_code value...
                    //     // TODO maybe have results.status_code, and additional properties such as
                    //     //  results.status_code_origin or results.status_details, etc
                    //     results.status_code = data.status_code

        } else {
            // the method is unhandled
            results.status_code = -1
            results.status_code_error_details = `Unknown Link Status Check method "${method}" )`
        }

        return results
    }


    // TODO: do we want no-cache, even if no refresh?
    const urlData = await fetch(endpoint, {cache: "no-cache"})

        .then( response => {

            endpoint_status_code = response.status

            if (response.ok) {
                return response.json().then(data => {
                    return Promise.resolve(resolveResults(data, method))
                })

            } else {
                // we may have a 504 or other erroneous status_code on the check-url call
                console.warn(`fetchStatusUrl: Error fetching url: ${url}`)

                return Promise.resolve({
                    url: url,
                    status_code: 0,
                    error_code: response.status,
                    error_text: response.statusText ? response.statusText : "error from server",
                    // TODO: would be nice to use response.statusText, but as of 2023.04.08, response.statusText is empty
                })

            }
        })

        .catch( (_e) => { // if something bad happened, return fake synthesized url object

                console.warn(`utils::fetchStatusUrl: Something went wrong when fetching url: ${url}`)

                // return fake url data object so URL display interface is not broken
                return Promise.resolve({
                    url: url,
                    status_code: 0,
                    status_code_method: method,
                    error_code: -1, // we don't know why this happened
                    error_text: "Failure during check-url", // is there an error message available here?
                })
            }
        );

    return { data: urlData, status_code: endpoint_status_code };
}

/* fetches iabot's archive data from IARI, and returns an object with (* means optional):
{
    url              original url to check archive for
    hasArchive       if true, then archive_url and live_state is set
    archive_url*     full url of archive
    live_state*      iabot's "live_state" status - unclear if this is useful or not
    error_reason*    short reason for error
    error_details*   longer description if available
}
*/
const fetchUrlArchive = async (iariBase, url, refresh=false) => {

    const endpoint = `${iariBase}/check-url-archive`
        + `?refresh=${refresh ? "true" : "false"}`
        + `&url=${encodeURIComponent(url)}`

    let endpoint_status_code = 0;

    const iabot_livestatus_convert = (s => {
        return s === "whitelisted"
            ? 'permalive'
            : s === "blacklisted"
                ? "permadead"
                : s
    })

    const resolveData = (data) => {

        /* sample of iabot archive results:
        iabot_archive_results: {
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

            iabot_archive_results: {
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
        const output = {
            url: url  // TODO use data.url instead? that's the one passed back by the check-url-archive routine
        }

        if (!data.iabot_archive_results) {
            // TODO need to check this more carefully:
            // if iabot_archive_results but is null, it may be a problem of the archive system...
            output.hasArchive = false
            output.error = true
            output.error_details = "Missing iabot_archive_results from archive retrieval data"
            return output
        }

        const results = data.iabot_archive_results

        if (results.hasOwnProperty("requesterror")) {
            // there is no entry for this url in iabot's database

            output.hasArchive = false
            output.error_reason = "No archive in database"
            output.error_details = results.errormessage

        } else if (results.hasOwnProperty("urls")) {
            // there is an entry for this url; process it

            const urlIdKeys = Object.keys(results.urls)
            if (urlIdKeys.length > 0) {
                const urlInfo = results.urls[urlIdKeys[0]]
                    // NB assumes first url in list is the only one we want
                    // TODO: find cases where this is not true

                output.hasArchive = (urlInfo.archived === "true" || !!urlInfo.archived)  // NB: makes sure not null
                output.archive_url = urlInfo.archive  // this is the archive link as it is in iabot database - most likely a wayback? but not necessarily?
                output.live_state = iabot_livestatus_convert(urlInfo.live_state)

            } else {
                output.hasArchive = false
                output.error_reason = "Missing URL in archive results"
            }

        } else {
            // there is no "urls" or "requesterror" property
            output.hasArchive = false
            output.error_reason = "No archive information provided"
        }

        return output
    }


    const archiveData = await fetch(endpoint, {cache: "no-cache"})

        .then( response => {

            endpoint_status_code = response.status

            if (response.ok) {
                return response.json().then(data => {
                    return Promise.resolve(resolveData(data))
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

const fetchUrlsIabot = async (iariBase, urlArray, refresh, timeout) => {

    console.log(`fetchUrlsIabot: ${iariBase} urlArray:(not shown) refresh:${refresh} timeout:${timeout}`)
    const promises = urlArray.map(urlObj => {
        return fetchUrl(iariBase, urlObj, refresh, timeout, UrlStatusCheckMethods.IABOT.key)
    });


    // assumes all promises successful
    // TODO: error trap this promise call with a .catch
    return await Promise.all(promises);
}

// this will soon be replaced by IARI::check-url with method pass and caching
const fetchUrlWayback = async (url) => {
    const endpoint = UrlStatusCheckMethods.WAYBACK.endpoint
        + `?impersonate=1`
        + `&skip-adblocker=1`
        + `&url=${encodeURIComponent(url)}`

    let endpoint_status_code = 0

    const resolveData = (data) => {
        const results = {
            url: url,
            status_code: data.status,
            status_code_method: UrlStatusCheckMethods.WAYBACK.key
        }
        if (data.message || data.status_ext) {
            results["status_code_errors"] = {
                message: data.message,
            }
            if (data.status_ext) {
                results["status_code_errors"]["reason"] = data.status_ext
            }
        }
        return results
    }

    const urlData = await fetch(endpoint, {cache: "no-cache"})
        .then( response => {
            endpoint_status_code = response.status
            if (response.ok) {
                return response.json().then(data => {
                    return Promise.resolve(resolveData(data))
                })

            } else {
                // we may have a 504 or other erroneous status_code on the check-url call
                console.warn(`fetchUrlWayback: Error fetching url: ${url}`)

                return Promise.resolve({
                    url: url,
                    status_code: 0,
                    error_code: response.status,
                    error_text: response.statusText ? response.statusText : "error from server",
                })
            }
        })

        .catch( (_e) => { // if something bad happened, return fake synthesized url object

                console.warn(`utils::fetchUrlWayback: Something went wrong when fetching url: ${url}`)

                // return fake url data object so URL display interface is not broken
                return Promise.resolve({
                    url: url,
                    status_code: 0,
                    error_code: -1, // we don't know why this happened
                    error_text: "Failure during check-url", // is there an error message available here?
                })
            }
        );

    return { data: urlData, status_code: endpoint_status_code };
}

const fetchUrlsWayback = async (urlArray) => {

    const promises = urlArray.map(urlObj => {
        return fetchUrlWayback(urlObj)
    })

    // assumes all promises successful
    // TODO: error trap this promise call with a .catch
    return await Promise.all(promises)
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


                    // const myUrls = data.urls.map( entry => {
                    //
                    //     const results = { // NB: url object "wrapped" in data
                    //         data: {
                    //             url: entry.url,
                    //             status_code: entry.http_status_code,
                    //         }
                    //     }
                    //
                    //     // handle errors
                    //     if (entry.http_status_code === -1) {
                    //         results.data.status_code = 0;
                    //         results.data.error_code = -1;
                    //         results.data.error_text = entry.http_status_message;
                    //     }
                    //
                    //     return results; // for each data.map entry
                    //
                    // })

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

const fetchUrlsCorentin = async (urlArray, refresh, timeout) => {

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
    // NB By assigning to a local variable, the variable value can be successfully debugged.
    const methods = UrlStatusCheckMethods

    let urlData = []
    // if (methods.IARI.key === method) {
    //     urlData = fetchUrlsIari(iariBase, urlArray, refresh, timeout)
    //
    // } else
    if (methods.IABOT.key === method) {
        urlData = fetchUrlsIabot(iariBase, urlArray, refresh, timeout)

    } else if (methods.WAYBACK.key === method) {
        urlData = fetchUrlsWayback(urlArray)

    } else if (methods.CORENTIN.key === method) {
        urlData = fetchUrlsCorentin(urlArray, refresh, timeout)

    } else {
        throw new Error(`Unrecognized check method: ${method}`);
    }

    // return urlData.then( results => results )
    return urlData

}

