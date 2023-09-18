import React, {useCallback, useEffect, useState} from "react";
import UrlDisplay from "./UrlDisplay";
import RefDisplay from "./RefDisplay";
import FldDisplay from "./FldDisplay";
import Loader from "../Loader";
import {fetchStatusUrls} from "../../utils/iariUtils.js"
import {ConfigContext} from "../../contexts/ConfigContext";
import {URL_FILTER_MAP} from "./filters/urlFilterMaps";

/*
When this component is rendered, it must "process" the pageData. This involves:
- fetching the URL status codes of all the URLS
- process the references
  - reduce reference array by coalescing all named refs together
  - calculate link status of all urls within reference to allow filtering
*/

/*
when we get to this component, we have raw pageData from the
article fetch call, with a few minor decorations added at receive time.

we immediately fetch the URL details for each URL in pageData.urls, creating
urlDict, which is a url-keyed javascript object with the info for each url.
(we may/need/ought to have a urlArray as well, with each entry of the array
pointing to a url object. optimally this object would be a reference to the
one in urlDict.)

we then flatten the Reference list, making only one entry for each multiply-
referenced URL with the number of times reference added as a reference property.

using UrlDict we can check the status of the urls in each reference, appending
each reference array object in pageData.references.
    NB: we should use only "references" property, not "dehydrated_references"

steps to do this:
1. create the reference array property, including only once each multiply-reffed reference;
    set the link_status property of each ref to "0" (will determine format later) as a
    placeholder that will be reified once the URLS all come in
2. pull in url status and place results in urlDict
3. set the link_status for each reference based on status of urls for each link
    (determined by url-keying into urlDict)

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
    const processUrls = useCallback( (pageData, urlResults) => {

        const urlDict = {}

        // turn url array into object dict
        // keyed by url; contains: { status_code: XXX, ref_count: 1 or more }
        // making room for { hasArchive: true/false, isArchive: true/false }
        urlResults.forEach(d => {
            // console.log (d)
            // initialize entry with count 0 if not there
            if (!urlDict[d.data.url]) {
                urlDict[d.data.url] = {
                    status_code: d.data.status_code,
                    url_count: 0,
                    // set archive status? is this archive or not? maybe not...
                }
            }
            // increment count no matter what
            urlDict[d.data.url].url_count++
        })

        // and append to pageData
        pageData.urlDict = urlDict

    }, [])


    // returns a linkStatus array indicating the status of all the links in a reference.
    //
    // there are two "kinds" of link we currently deal with:
    // - those indicated in the template parameters "url" and "archive_url"
    // - all others
    //
    // for those links found in template parameters, the status of the url indicated by the "url" parameter
    // is checked, along with the status of the url indicated by the "archive_url" parameter.
    // TODO: for other templates, the "pure" url is indicated by alternate parameter names
    //
    // All other urls are just checked for good or bad, regardless of whether it is an archive link or not.
    //
    const calcLinkStatus = useCallback( (ref, urlDict) => {

        const linkStatus = []

        // create linkStatus for every url/archive_url pair in templates
        // as each url is processed, save in "used_urls" array
        const templates = ref?.templates ? ref.templates : []
        const usedUrls = {}
        templates.forEach( template => {

            const pureUrl = template.parameters.url
            const archiveUrl = template.parameters.archive_url
            usedUrls[pureUrl] = true
            usedUrls[archiveUrl] = true

            const pureLinkStatusCode = urlDict[pureUrl]?.status_code // need to handle undefined if url not a key in urlDict
            const archiveLinkStatusCode = urlDict[archiveUrl]?.status_code // need to handle undefined if archive url not a key in urlDict

            const pureLinkStatus = (pureLinkStatusCode === undefined) ? 'none'
                : (pureLinkStatusCode >= 200 && pureLinkStatusCode < 400) ? 'good'
                    : 'bad'

            const archiveLinkStatus = (archiveLinkStatusCode === undefined) ? 'none'
                : (archiveLinkStatusCode >= 200 && archiveLinkStatusCode < 400) ? 'good'
                    : 'bad'

            linkStatus.push( pureLinkStatus + '_' + archiveLinkStatus)
        })

        // now go thru the ref.urls, and if there are any that are not in the
        // usedUrls list, process that url

        ref.urls.forEach(url => {
            if (!usedUrls[url]) {
                const urlStatusCode = urlDict[url]?.status_code
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

        return linkStatus

    }, [])


    // reduce any repeated references into one reference with multiple page referrals, and
    // calculate the status of the links in the references by examining the pure and archived
    // urls in the templates in each reference
    // TODO: this should be done with the IARI API, not here at front-end retrieval
    //
    const processReferences = useCallback( (pageData, refResults) => {

        // Process the "named" refs by looping thru each reference
        // if named, make an entry in named_refs or increment already entry
        // if named with no content, pull that reference info, and add it to named_ref entry
        //      - its like an array of links to where in article a reference is referred to
        const namedRefs = {} // collect 'em as we find 'em
        const newRefs = []

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

            // carry over all refs that are not indirect "named" references
            if (!(ref.type === 'footnote' && ref.footnote_subtype === 'named')) {
                ref.reference_count = 1 // will replace counts of multiply referenced refs in next loop
                newRefs.push( ref )
            }
        })

        // For all references that were saved in named references, set reference count of "anchor" refs
        // TODO when we get the page_refs in the reference data, we can save those, too for each named reference
        Object.keys(namedRefs).forEach( refName => {
            const nr = namedRefs[refName]
            nr.origin.reference_count = nr.count
        })

        // process link_status
        newRefs.forEach( ref => {
            ref.link_status = calcLinkStatus(ref, pageData.urlDict)
        })

        // and append to pageData
        pageData.references = newRefs

    }, [calcLinkStatus])


    useEffect( () => { // [myIariBase, pageData, processReferences, processUrls, myStatusCheckMethod]
        const context = 'PageData::useEffect [pageData]'

        const postProcessData = (urlResults, refResults) => {
            processUrls(pageData, urlResults); // creates urlDict
            processReferences(pageData, refResults)
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
                pageData.urlArray = urlResults
                console.log(`${context} fetchStatusUrls.then: after pageData.urlArray set to urlResults`);

                postProcessData(urlResults, null); // creates urlDict

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
                                            urlFilterMap={URL_FILTER_MAP}/>
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
