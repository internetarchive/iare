import {UrlStatusCheckMethods} from "../constants/endpoints";

const fetchStatusUrl = async (iariBase, url, refresh=false, timeout=0, method='') => {

    const endpoint = `${iariBase}/check-url`
        + `?url=${encodeURIComponent(url)}`
        + (refresh ? "&refresh=true" : '')
        + (timeout > 0 ? `&timeout=${timeout}` : '')
        + `&method=${method}`

    let endpoint_status_code = 0;


    const iabot_livestatus_convert = (s => {
        return s === "404"
            ? ''
            : s === "whitelisted"
                ? 'permalive'
                : s === "blacklisted"
                    ? "permadead"
                    : s
    })

    const resolveResults = (data, method) => {
        const results = { url: url }

        if (method === UrlStatusCheckMethods.IABOT.key) {

            // return IABOT testdeadlink results
            results.status_code = data.testdeadlink_status_code
            results.status_code_error_details = data.testdeadlink_error_details

            // return IABOT searchurldata results - error if so

            if (data.searchurldata_results?.hasOwnProperty("requesterror")) {
                results.status_searchurldata = data.searchurldata_results.requesterror  // return value of request error

            } else if (data.searchurldata_results?.hasOwnProperty("urls")) {
                const myKeys = Object.keys(data.searchurldata_results.urls)
                if (myKeys.length > 0) {
                    // use data from first url in list (assumes only one)
                    const myUrlData = data.searchurldata_results.urls[myKeys[0]]
                    results.status_searchurldata = myUrlData.live_state

                    if (myUrlData.archived === "true" || !!myUrlData.archived) {
                        results.status_searchurldata_archived = true
                    } else {
                        results.status_searchurldata_archived = false
                    }
                    // results.status_searchurldata_archived = myUrlData.archived ? myUrlData.archived : false

                    results.status_searchurldata_archive = myUrlData.archive
                    results.status_searchurldata_hasarchive = myUrlData.hasarchive
                } else {
                    results.status_searchurldata = "missing url"
                }

            } else {
                results.status_searchurldata = "unknown"
            }

        } else if (method === UrlStatusCheckMethods.IARI.key) {
            // TODO Deprecate? its nice to have a default status_code value...
            // TODO maybe have status_code and another status_code_origin, or status_details, etc
            results.status_code = data.status_code

        } else {
            // the method is unhandled
            results.status_code = -1
            results.status_code_error_details = `Error Fetching status_code (method "${method}" unknown)`
        }

        results.status_searchurldata = iabot_livestatus_convert(results.status_searchurldata)
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

        .catch( (_) => { // if something really bad happened, still return fake synthesized url object

                console.warn(`utils::fetchStatusUrl: Something went wrong when fetching url: ${url}`)

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


const fetchUrlsIari = async (iariBase, urlArray, refresh, timeout) => {
    const promises = urlArray.map(url => {
        return fetchStatusUrl(iariBase, url, refresh, timeout, UrlStatusCheckMethods.IARI.key)
    })
    // assumes all promises successful
    // TODO: error trap this promise call with a .catch
    return await Promise.all(promises);
}

const fetchUrlsIabot = async (iariBase, urlArray, refresh, timeout) => {

    console.log(`fetchUrlsIabot: ${iariBase} urlArray:(not shown) refresh:${refresh} timeout:${timeout}`)
    const promises = urlArray.map(urlObj => {
        return fetchStatusUrl(iariBase, urlObj, refresh, timeout, UrlStatusCheckMethods.IABOT.key)
    });

    // assumes all promises successful
    // TODO: error trap this promise call with a .catch
    return await Promise.all(promises);

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
                    ///tags: ['X'],
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

export const fetchStatusUrls = async ({
                                          iariBase= '',
                                          urlArray=[],
                                          refresh=false,
                                          timeout=10,
                                          method = UrlStatusCheckMethods.IABOT.key
                                      } = {}) => {

    console.log(`utils::fetchStatusUrls: iariBase=${iariBase} method=${method}): refresh = ${refresh}, timeout = ${timeout}`)

    if (!urlArray || !urlArray.length) //return [];
    {
        return Promise.resolve([])
    }

    // Chrome Developer Tools seems to have a problem showing variables imported at the module level.
    // By assigning to a local variable, the variable value can be successfully debugged.
    const methods = UrlStatusCheckMethods

    let urlData = []
    if (methods.IARI.key === method) {
        urlData = fetchUrlsIari(iariBase, urlArray, refresh, timeout)

    } else if (methods.IABOT.key === method) {
        urlData = fetchUrlsIabot(iariBase, urlArray, refresh, timeout)

    } else if (methods.CORENTIN.key === method) {
        urlData = fetchUrlsCorentin(urlArray, refresh, timeout)
    }
    // TODO: what to do if error or not one of handled methods?

    // return urlData.then( results => results )
    return urlData

}
