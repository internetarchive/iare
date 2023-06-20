import {IARI_V2_URL_BASE, UrlStatusCheckMethods} from "../constants/endpoints";

const fetchStatusUrl = async (url, refresh=false, timeout=0, method='') => {

    const endpoint = `${IARI_V2_URL_BASE}/check-url`
        + `?url=${encodeURIComponent(url)}`
        + (refresh ? "&refresh=true" : '')
        + (timeout > 0 ? `&timeout=${timeout}` : '')

    let status_code = 0;

    // TODO: do we want no-cache, even if no refresh?
    const urlData = await fetch(endpoint, {cache: "no-cache"})

        .then( response => {

            status_code = response.status

            if (response.ok) {
                return response.json().then(data => {

                    return Promise.resolve({
                        url: url,

                        status_code:
                            method === UrlStatusCheckMethods.IABOT.key
                                ? data.testdeadlink_status_code
                                : method === UrlStatusCheckMethods.IARI.key
                                    ? data.status_code
                                    : -1,
                    })
                })

            } else {
                // we may have a 504 or other erroneous status_code on the check-url call
                console.warn(`fetchOneUrl: Error fetching url: ${url}`)

                return Promise.resolve({
                    url: url,
                    status_code: 0,
                    error_code: response.status,
                    error_text: response.statusText ? response.statusText : "error from server",
                        // TODO: would be nice to use response.statusText, but
                        // as of 2023.04.08, response.statusText is empty
                })

            }
        })

        .catch( (_) => { // if something really bad happened, still return fake synthesized url object

                console.warn(`utils::fetchOneUrl: Something went wrong when fetching url: ${url}`)

                // return fake url data object so URL display interface is not broken
                return Promise.resolve({
                    url: url,
                    status_code: 0,
                    error_code: -1, // we don't know why this happened
                    error_text: "Failure during check-url", // is there an error message available here?
                })
            }
        );

    return { data: urlData, status_code: status_code };
}


const fetchUrlsIari = async (urlArray, refresh, timeout) => {
    const promises = urlArray.map(url => {
        return fetchStatusUrl(url, refresh, timeout, UrlStatusCheckMethods.IARI.key)
    })
    // assumes all promises successful
    // TODO: error trap this promise call with a .catch
    return await Promise.all(promises);
}


const fetchUrlsIabot = async (urlArray, refresh, timeout) => {
    const promises = urlArray.map(urlObj => {
        return fetchStatusUrl(urlObj, refresh, timeout, UrlStatusCheckMethods.IABOT.key)
    });

    // assumes all promises successful
    // TODO: error trap this promise call with a .catch
    return await Promise.all(promises);
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
                        const results = {
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


// we use useCallback so that function can be used as dependency for useEffect
// export const fetchStatusUrls = useCallback( async (urlArray=[], refresh=false) => {
export const fetchStatusUrls = async (urlArray=[], refresh=false, timeout=10, method = UrlStatusCheckMethods.IABOT.key) => {

    console.log(`utils::fetchStatusUrls (${method}): refresh = ${refresh}, timeout = ${timeout}`)

    if (!urlArray || !urlArray.length) //return [];
    {
        return Promise.resolve([])
    }

    // Chrome developer tools seems to have a problem showing variables imported at the top level
    // By assigning to a local variable, the variable value can be successfully debugged
    const methods = UrlStatusCheckMethods

    let urlData = []
    if (methods.IARI.key === method) {
        urlData = fetchUrlsIari(urlArray, refresh, timeout)

    } else if (methods.IABOT.key === method) {
        urlData = fetchUrlsIabot(urlArray, refresh, timeout)

    } else if (methods.CORENTIN.key === method) {
        urlData = fetchUrlsCorentin(urlArray, refresh, timeout)
    }
    // TODO: what to do if error or not one of handled methods?

    // return urlData.then( results => results )
    return urlData

}

export const convertToBareUrls = (urlArray=[], sourceMethod = UrlStatusCheckMethods.IARI.key) => {

    if (!urlArray || !urlArray.length) return [];

    // transform urlArray, which is an array of objects wrapping a url object in a "data" property,
    // into an array of bare url objects
    return urlArray.map( uData => uData.data )

}
