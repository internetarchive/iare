import React, {useCallback, useEffect, useState} from "react";
import UrlDisplay from "./UrlDisplay";
import RefDisplay from "./RefDisplay";
import FldDisplay from "./FldDisplay";
import Loader from "../Loader";
import {fetchStatusUrls} from "../../utils/iariUtils.js"
import {ConfigContext} from "../../contexts/ConfigContext";
import {
    ARCHIVE_STATUS_FILTER_MAP,
    URL_STATUS_FILTER_MAP
} from "./filters/urlFilterMaps";

/*
When this component is rendered, it must "process" the pageData. This involves:
- fetching the URL status codes of all the URLS
- process the urls into urlArray
- process the references
  - reduce reference array by coalescing all named refs together
  - calculate link status of all urls within reference to allow filtering
*/

/*
when we get to this component, we have raw pageData from the
article fetch call, with a few minor decorations added at receive time.

we immediately fetch the URL details for each URL in pageData.urls, creating
urlDict, which is a url-keyed javascript object with the info for each url.
we have a urlArray as well, with each entry of the array pointing to a url
object in urlDict.

we then flatten the Reference list, making only one entry for each multiply-
referenced URL with the number of times reference added as a reference property.

using UrlDict we can check the status of the urls in each reference, appending
each reference array object in pageData.references.
    NB: we should use only "references" property, not "dehydrated_references"
    TODO: deprecate "dehydrated_references" and use a "dehydrated" flag instead
*/

export default function PageData({pageData = {}}) {

    const [selectedViewType, setSelectedViewType] = useState('urls');
    const [isLoadingUrls, setIsLoadingUrls] = useState(false);
    const [dataReady, setDataReady] = useState(false);

    // set up iariBase and statusMethod from global config
    let myConfig = React.useContext(ConfigContext);
    myConfig = myConfig ? myConfig : {} // prevents undefined.<param> errors
    const myIariBase = myConfig.iariSource;
    const myStatusCheckMethod = myConfig.urlStatusMethod;

    // process url results and create a urlDict from it
    //
    // called upon useEffect of new url status data
    const processUrls = useCallback( (pageData) => {

        const urlDict = {}
        const regexWayback = new RegExp(/https?:\/\/(?:web\.)archive\.org\/web\/([\d*]+)\/(.*)/);

        const sanitizeUrlForWayback = (targetUrl) => {
            // let inputString = 'http://example.com:http://example2.com:some:text:with:colons';
            const regexColon = /:(?!\/\/)/g;  // Regular expression to match colons not followed by "//"
            const regexEquals = /=/g;  // Regular expression to match equals signs
            let resultUrl
            resultUrl = targetUrl.replace(regexColon, '%3A');  // Replace solo colons with encoded "%3A"
            // resultUrl = resultUrl.replace(regexEquals, '%3D')
            return resultUrl
        }

        const isArchive = (targetUrl) => {
            return !!(sanitizeUrlForWayback(targetUrl).match(regexWayback))
        }

        // create url dict from returned results
        pageData.urlResults && pageData.urlResults.forEach(d => {
            const myUrl = encodeURI(d.data.url)
            // const myUrl = encodeURI(d.data.url)
            // console.log(myUrl)
            if (!urlDict[myUrl]) {
                // add entry for url if not there yet
                urlDict[myUrl] = d.data  // initialize with result data
                urlDict[myUrl].urlCount = 0
                urlDict[myUrl].isArchive = isArchive(myUrl)
                urlDict[myUrl].hasTemplateArchive = false  // TODO: this will be recalculated when processing references
            }
            urlDict[myUrl].urlCount++  // increment count to keep track of repeats
        })

        const archiveUrls = Object.keys(urlDict).filter(urlKey => {
            return (urlDict[urlKey].isArchive)
        })
        const primaryUrls = Object.keys(urlDict).filter(urlKey => {
            return !(urlDict[urlKey].isArchive)
        })

        // create sanitizedUrls array of strings.
        // NB: this is specifically for Wayback Machine link patterns...for now...others may vary
        // sanitizeToPrimaryDict is a dict crosslinking sanitized links with the primary "original"
        // ones. It's sort of de-normalizing the wayback rescued url into it's original form.
        const sanitizeToPrimaryDict = {}
        const sanitizedPrimaryUrls = primaryUrls.map( u => {
            let s = sanitizeUrlForWayback(u)
            sanitizeToPrimaryDict[s] = u
            return s
        })

        // test if this archive link rescues(d) one of our primary urls
        archiveUrls.forEach(archiveUrl => {
            const results = archiveUrl.match(regexWayback)  // is archiveUrl a possible archive?
            if (results) {  // if a match, extract pattern parts

                /* must see if rescued url, in wayback encoding, is matchy to ONE of our
                 * wayback-enhanced primary urls.
                 */
                let rescueUrl = results[2]

                if (sanitizedPrimaryUrls.includes(rescueUrl)) {
                    // ge un-sanitized original primaryUrl from crossRef dict
                    const primaryUrl = sanitizeToPrimaryDict[rescueUrl]
                    // and we use the original url to key into the "master" urlDict, saving the archiveUrl with it
                    urlDict[primaryUrl].hasArchive = archiveUrl
                }

                // if rescueUrl not found in primaryurls, then try again with protocoal changed in rescue url
                // for instance, if first-pass rescue url is:
                // http://www.bbc.co.uk/news/world-latin-america-12378736, and that doesnt match any urls in primaryurls,
                // then try changing protocol and retesting with:
                // https://www.bbc.co.uk/news/world-latin-america-12378736

                else {
                    // if rescue has http://, then change to https://
                    // if rescue has https://, then change to http://
                    const rescueUrlMod = rescueUrl.startsWith("http://")
                        ? rescueUrl.replace(/^http:\/\//i, "https://")
                        : rescueUrl.replace(/^https:\/\//i, "http://")

                    if (sanitizedPrimaryUrls.includes(rescueUrlMod)) {
                        // get un-sanitized original primaryUrl from crossRef dict
                        const primaryUrl = sanitizeToPrimaryDict[rescueUrlMod]
                        // and we use that to key into the "master" urlDict, saving the archiveUrl as its value
                        urlDict[primaryUrl].hasArchive = archiveUrl
                    }


                }

            }
        })

        // append urlDict and urlArray to pageData
        pageData.urlDict = urlDict
        pageData.urlArray = primaryUrls.map(urlKey => {
            return urlDict[urlKey]
        })

    }, [])


    // sets the ref[linkStatus] property to an array containing a list of the status
    // relationship between the primary and archived links in a reference. These can
    // be indicated through template parameters, as in the properties "url" and
    // "archive_url", or, exist in the reference as a "wild" link, not connected to
    // anything. These are often in special "link collection" segments such as External Links, e.g.
    //
    // The status of the links found represented with the "url" template parameter are checked,
    // and the status of the links indicated by the "archive_url" parameter are also checked.
    //
    // NB: some other templates (as in not standard...not CS1?) indicate the primary url with
    // NB  parameter names other than 'url'
    //
    // All other urls (non-template) are checked for "good"ness or "bad"ness, regardless of
    // whether it is an archive link or not.
    //
    const processReference = useCallback( (ref, urlDict) => {

        const linkStatus = []

        // create linkStatus for every url/archive_url pair in templates
        // as each url is processed, save in "used_urls" array
        const templates = ref?.templates ? ref.templates : []
        const templateUrls = {}
        templates.forEach( template => {

            const primaryUrl = template.parameters.url
            const archiveUrl = template.parameters.archive_url
            templateUrls[primaryUrl] = true
            templateUrls[archiveUrl] = true

            const primaryLinkStatusCode = urlDict[primaryUrl]?.status_code // need to handle undefined if url not a key in urlDict
            const archiveLinkStatusCode = urlDict[archiveUrl]?.status_code // need to handle undefined if archive url not a key in urlDict

            const pureLinkStatus = (primaryLinkStatusCode === undefined) ? 'none'
                : (primaryLinkStatusCode >= 200 && primaryLinkStatusCode < 400) ? 'good'
                    : 'bad'

            const archiveLinkStatus = (archiveLinkStatusCode === undefined) ? 'none'
                : (archiveLinkStatusCode >= 200 && archiveLinkStatusCode < 400) ? 'good'
                    : 'bad'

            linkStatus.push( pureLinkStatus + '_' + archiveLinkStatus)

            // if archived url exists and archiveLinkStatus is good,
            // set the hasTemplateArchive property of the primaryUrl to true
            if (archiveUrl && urlDict[primaryUrl]) {
                urlDict[primaryUrl].hasTemplateArchive = true
            }
        })

        // now go thru the ref.urls, and if there are any that are not in the
        // templateUrls list, process that url

        ref.urls.forEach(url => {
            if (!templateUrls[url]) {
                const urlStatusCode = urlDict[url]?.status_codeed
                const urlLinkStatus = (urlStatusCode === undefined) ? 'no_template_bad'
                    : (urlStatusCode >= 200 && urlStatusCode < 400) ? 'no_template_good'
                        : 'no_template_bad'
                linkStatus.push(urlLinkStatus)
            }
        })

        // if link_status still empty, then we have no links at all
        if (linkStatus.length < 1) {
           linkStatus.push('no_links')
        }

        ref.link_status = linkStatus

    }, [])


    // * reduce any repeated references into one reference with multiple page referrals
    // * calculate the status of the links in the references by examining the pure and archived
    //   urls in the templates in each reference
    //
    // TODO: this should be done with the IARI API, not here after front-end retrieval
    //
    const processReferences = useCallback( pageData => {

        // Process the "named" refs by looping thru each reference
        // if named, make an entry in named_refs or increment already entry
        // if named with no content, pull that reference info, and add it to named_ref entry
        //      - its like an array of links to where in article a reference is referred to
        const namedRefs = {} // collect 'em as we find 'em
        const uniqueRefs = []

        // for refs, if dehydrated=true, use pageData.dehydrated_references, else use pageData.references
        const refs = (pageData?.dehydrated_references?.length)
            ? pageData.dehydrated_references
            : (pageData?.references?.length) ? pageData.references
            : []

        // reduce references by eliminating repeats and collecting page referrals
        refs.forEach(ref => {
            // "named" references point to another "anchor" reference
            // handle named ref by making entry into namedRef dict
            if (ref.name) {
                // initialize if first time
                if (!namedRefs[ref.name]) namedRefs[ref.name] = { count : 0 }
                // increment count
                namedRefs[ref.name].count++
                // if named ref is anchor (footnote subtype === content), save it in our namedRefs dict
                if (ref.type ==='footnote' && ref.footnote_subtype === 'content') {
                    namedRefs[ref.name].origin = ref
                }
            }

            // carry over refs that are NOT indirect "named" references
            if (!(ref.type === 'footnote' && ref.footnote_subtype === 'named')) {
                ref.reference_count = 1 // will replace counts of multiply referenced refs in next loop
                uniqueRefs.push( ref )
            }
        })

        // For all references that were saved in named references, set reference count of "anchor" refs
        // TODO when we get the cite_refs in the reference data, we can save those, too for each named reference
        Object.keys(namedRefs).forEach( refName => {
            const nr = namedRefs[refName]
            nr.origin.reference_count = nr.count
        })

        // process all anchor references
        uniqueRefs.forEach( ref => {
            // ref.link_status = processReference(ref, pageData.urlDict)
            processReference(ref, pageData.urlDict)
        })

        // TODO while processing refs, set template archive property for primary url of template

        // and append to pageData
        pageData.references = uniqueRefs

    }, [processReference])


    useEffect( () => { // [myIariBase, pageData, processReferences, processUrls, myStatusCheckMethod]
        const context = 'PageData::useEffect [pageData]'

        const postProcessData = (pageData) => {
            processUrls(pageData); // creates urlDict and urlArray
            processReferences(pageData)
            pageData.statusCheckMethod = myStatusCheckMethod;
        }

        setIsLoadingUrls(true);

        fetchStatusUrls( {
            iariBase: myIariBase,
            urlArray: pageData.urls,
            refresh: pageData.forceRefresh,
            timeout: 60,
            method: myStatusCheckMethod
            })

            .then(urlResults => {
                console.log(`${context} fetchStatusUrls.then: urlResults has ${urlResults.length} elements`);

                // TODO check erroneous results here -
                pageData.urlResults = urlResults

                postProcessData(pageData); // creates urlDict and urlArray

                // let the system know all is ready
                setDataReady(true);

            })

            .catch(error => {
                console.error(`${context} fetchStatusUrls.catch: ${error}`);
                // TODO: what shall we do for error here?
            })

            .finally(() => {
                // turn off "Loading" icon
                setIsLoadingUrls(false);
            })

        }, [myIariBase, pageData, processReferences, processUrls, myStatusCheckMethod]

    )

    const handleViewTypeChange = (event) => {
        setSelectedViewType(event.target.value);
    };

    const viewTypes = {
        "urls": {
            caption: "URLs"
        },
        "domains": {
            caption: "Domains"
        },
        "stats": {
            caption: "Reference Types"
        },
    }

    const viewOptions = Object.keys(viewTypes).map(viewType => {
        return <div key={viewType} >
            <label>
                <input
                    type="radio"
                    value={viewType}
                    checked={selectedViewType === viewType}
                    onChange={handleViewTypeChange}
                /> {viewTypes[viewType].caption}
            </label>
        </div>
    })


    if (!pageData) return null;


    return <>

        {isLoadingUrls ? <Loader message={"Retrieving URL status codes..."}/>
            : (dataReady ? <div className={"page-data"}>

                        <div className={"ref-filter-types"}>
                            <div>View References by</div>
                            {viewOptions}
                        </div>

                        <div className={`display-content`}>
                            {selectedViewType === 'domains' &&
                                <FldDisplay pageData={pageData}/>
                            }

                            {selectedViewType === 'urls' &&
                                <UrlDisplay pageData={pageData} options={{refresh: pageData.forceRefresh}}
                                            urlStatusFilterMap={URL_STATUS_FILTER_MAP}
                                            urlArchiveFilterDefs={ARCHIVE_STATUS_FILTER_MAP}
                                />
                            }

                            {selectedViewType === 'stats' &&
                                <RefDisplay pageData={pageData} options={{}}/>
                            }
                        </div>

                    </div>
                    : <p>Data Not Ready</p>
            )
        }
    </>
}
