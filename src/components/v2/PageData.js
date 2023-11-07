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
import {areObjectsEqual, getLinkStatus} from "../../utils/utils";

/*
When this component is rendered, it must "process" the pageData. This involves:
- fetching the URL status codes of all the URLS
- process the urls into urlArray
- process the references
  - reduce reference array by coalescing all named refs together
  - assign reference to url items that are "owned" by reference
*/


export default function PageData({pageData = {}}) {
    /*
    pageData arrives with the data from the /article endpoint fetch call,
    with a few minor decoration properties added for convenience.

    we immediately fetch the URL details for each URL in pageData.urls, which
    creates urlDict (a url-keyed javascript object with the info for each url).
    urlArray is created as well, with each entry pointing to a urlDict object.

    we then flatten the Reference list, making only one entry for each multiply-
    referenced URL with the number of times reference added as a reference property.

        NB: we should use only "references" property, not "dehydrated_references"
        TODO: deprecate "dehydrated_references" and use a "dehydrated" flag instead
    */

    const [selectedViewType, setSelectedViewType] = useState('urls');
    const [isLoadingUrls, setIsLoadingUrls] = useState(false);
    const [dataReady, setDataReady] = useState(false);

    // set up iariBase and statusMethod from global config
    let myConfig = React.useContext(ConfigContext);
    myConfig = myConfig ? myConfig : {} // prevents undefined.<param> errors
    const myIariBase = myConfig.iariSource;
    const myStatusCheckMethod = myConfig.urlStatusMethod;

    // called upon useEffect when new url status data received
    const processUrls = useCallback( (pageData) => {
        // process url results and create urlDict from it

        const urlDict = {}
        const regexWayback = new RegExp(/https?:\/\/(?:web\.)archive\.org\/web\/([\d*]+)\/(.*)/);

        const sanitizeUrlForWayback = (targetUrl) => {
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
            return !!(sanitizeUrlForWayback(targetUrl).match(regexWayback))
        }

        // create url dict from returned results
        pageData.urlResults && pageData.urlResults.forEach(d => {
            // const myUrl = encodeURI(d.data.url)
            const myUrl = d.data.url  // try not encoding and see if it still works
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

        // test if this archive link rescued one of our primary urls
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


    // take the wt:value and put it straight to value:<value>
    const normalizeMediaWikiParams = (oldParams) => {

        const newParams = {}

        // Iterate through keys and build normalized retrun param object values
        for (let key of Object.keys(oldParams)) {
            // set newParams value
            newParams[key] = oldParams[key].wt
        }

        return newParams;
    }


    const processCiteRefs = useCallback( (refsArray, pageData) => {

        const citeRefs = pageData?.cite_refs ? pageData.cite_refs : []

        citeRefs.forEach( cite => {

            const mwData = cite.raw_data ? JSON.parse(cite.raw_data) : {}

            console.log(`processCiteRefs: mwData[${cite.ref_index}] is `, mwData)

            // if mwData has parts[0]
                // if parts[0].template

                // save template.target in target_type for citeref

                // for each ref in uniqueRef
                    // if ref.isAssigned then skip
                    // else
                        // if match cite.template.params
                            // attach citeref to that reference
                            // tag that reference as "assigned"

            if (mwData.parts && mwData.parts[0].template) {

                const template = mwData.parts[0].template

                // mark citation as having template type
                cite.template_target = template.target?.wt

                const citeParams = normalizeMediaWikiParams(template.params)

                // see if template.params matches any wikiText ref params; returns undefined if no mathcing ref element found
                const foundRef = refsArray.find( _ref => {  // NB cannot use "ref" as a variable name as "ref" is a keyword in React
                    if (!(_ref.templates && _ref.templates[0])) return false
                    // TODO skip if not a footnote ref
                    // TODO skip if type===footnote and footnote_subtype === named

                    // remove "template_name" parameter from object
                        // TODO this is an IARI bug - should not be adding template_name to wikitext parameters!!
                        // TODO when fixed, must also change RefView parameter display logic
                    const refParams = {..._ref.templates[0].parameters}
                    delete refParams.template_name

                    return areObjectsEqual(refParams, citeParams)
                })

                if (foundRef) {
                    console.log(`Found matching ref for citeRef# ${cite.ref_index}`)
                    foundRef.cite_refs = cite.page_refs
                }

            } else {
                // we do not have parts[0].templates - what should we do?
            }

        })

        // end result : anchor refs are assigned with citeref
    }, [])



    // sets the ref[linkStatus] property to an array containing a list of the status
    // relationship between the primary and archived links in a reference. These can
    // be indicated through template parameters, as in the properties "url" and
    // "archive_url", or, exist in the reference as a "wild" link, not connected to
    // anything. These are often in special "link collection" segments such as External Links, e.g.
    //
    // links represented by the "url" and "archive_url" template parameter values
    // are checked.
    //
    // NB: some other templates (as in not standard...not CS1?) indicate the primary url with
    // NB  parameter names other than 'url'
    //
    // Other url links found outside of a template are deemed "exotemplate", and
    // can be a primary or archive url. They are checked for "good" or "bad" status
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

            const pureLinkStatus = getLinkStatus(primaryLinkStatusCode)
            const archiveLinkStatus = getLinkStatus(archiveLinkStatusCode)

            linkStatus.push( pureLinkStatus + '_' + archiveLinkStatus)

            // if link referenced by archive_url exists and archiveLinkStatus is good,
            // set the hasTemplateArchive property of the primaryUrl to true
            if (archiveUrl && urlDict[primaryUrl]) {
                urlDict[primaryUrl].hasTemplateArchive = true
            }
        })

        // check for exotemplate url links in the reference and process.
        // exotemplate links are links in ref but not in templateUrls array
        ref.urls.forEach(url => {
            if (!templateUrls[url]) {
                const urlStatusCode = urlDict[url]?.status_code
                const urlLinkStatus = (urlStatusCode === undefined) ? 'exotemplate_bad'
                    : (urlStatusCode >= 200 && urlStatusCode < 400) ? 'exotemplate_good'
                        : 'exotemplate_bad'
                linkStatus.push(urlLinkStatus)
            }
        })

        // if linkStatus still empty, we have no links at all in this citation
        if (linkStatus.length < 1) {
           linkStatus.push('missing')
        }

        ref.link_status = linkStatus

    }, [])


    const getAnchorReferences = (pageData) => {
        // reduce references by eliminating repeats and collecting ref referrals

        // for refs, if dehydrated=true, use pageData.dehydrated_references, else use pageData.references
        const refs = (pageData?.dehydrated_references?.length)
            ? pageData.dehydrated_references
            : (pageData?.references?.length) ? pageData.references
                : []

        const namedRefs = {}
        const anchorRefs = []

        // Process the "named" refs by looping thru each reference
        // if named
        //      - increment reference count for namedRef[name]
        //      - if no content, assume its a reference to an anchor reference
        refs.forEach(ref => {

            if (ref.name) {
                // "named" references point to another "anchor" reference with the same name
                // namedRef[fef.name] hold the reference count of this name

                if (!namedRefs[ref.name]) namedRefs[ref.name] = {
                    count : 0,
                    anchor : {}
                }  // if first time, create

                namedRefs[ref.name].count++  // increment "how many times this reference is referenced by name"

                // if this definition of the reference is the "anchor" one, i.e., the citation which
                // defines the reference that is to be referenced by name by other citations, then,
                // save a pointer to this reference in the namedRef[<this ref>].anchor property

                if (ref.type ==='footnote' && ref.footnote_subtype === 'content') {
                    // an "anchor" reference is one labeled as footnote with a subtype of 'content'
                    namedRefs[ref.name].anchor = ref
                    // TODO: bug: if a "named ref" does not contain an "anchor" citation, there is a problem.
                }
            }

            // if this ref is a non-footnote ref, or, is a footnote-anchor (subtype != named) ref, save it in anchorRefs
            if (!(ref.type === 'footnote' && ref.footnote_subtype === 'named')) {
                ref.reference_count = 1 // will replace counts of multiply referenced refs in next loop
                anchorRefs.push( ref )
            }
        })

        // For all references that were saved in named references, set reference count of "anchor" refs
        // TODO when we get the cite_refs in the reference data, we can save those, too for each named reference
        Object.keys(namedRefs).forEach( refName => {
            const nr = namedRefs[refName]
            nr.anchor.reference_count = nr.count
        })

        return anchorRefs
    }

    const processReferences = useCallback( pageData => {
        // * reduce any repeated references into one reference with multiple page referrals
        // * calculate the status of the links in the references by examining the pure and archived
        //   urls in the templates in each reference
        //
        // TODO: this should be done with the IARI API, not here after front-end retrieval
        //

        const anchorRefs = getAnchorReferences(pageData)

        // process all anchor references
        anchorRefs.forEach( ref => {
            processReference(ref, pageData.urlDict)
        })

        // associate citeref data with anchorRefs
        processCiteRefs(anchorRefs, pageData)

        // set achnorRefs as the definitive references property of pageData
        pageData.references = anchorRefs

    }, [processReference, processCiteRefs])



    const associateRefsWithLinks = useCallback( pageData => {
        // for each reference in pageData.references
        //  - for each url link
        //      - add ref to url's refs list

        if (!pageData?.references) return

        pageData.references.forEach(ref => {
            // process each url link
            ref.urls.forEach(url => {
                const myUrl = pageData.urlDict[url]
                // TODO what to do if url not in urlDict?
                // TODO we should send and display a notice...shouldnt happen
                // TODO add to test case: associateRefsWithLinks w/ bad urlDict

                // create refs and ref_ids array properties if not there
                if (!(myUrl["ref_ids"])) myUrl["ref_ids"] = []
                if (!(myUrl["refs"])) myUrl["refs"] = []

                // if url does not have current reference in it's associated reference list, add it now
                // TODO check and debug here if ref.id will be reliable
                // TODO it might change over time, and then havoc may be iontroduced
                // TODO but maybe not, as it is unique to each wikitext
                if (!myUrl["ref_ids"].includes(ref.id)) {
                    myUrl["ref_ids"].push(ref.id)
                    myUrl["refs"].push(ref)
                }

            })
        })


        // for each url, reduce various reference info into the url's reference_info property
        // for now, reference_info contains:
        // - url status from templates
        // - template names
        // - sections where reference came from

        Object.keys(pageData.urlDict).forEach( link => {
            const myUrl = pageData.urlDict[link]
            const statuses = []
            const templates = []
            const sections = []
            myUrl.refs.forEach( r => {  // traverse each reference this url is involved in

                // process url_status's
                if (r.templates) {
                    r.templates.forEach(t => {
                        statuses.push(t.parameters["url_status"]
                            ? t.parameters["url_status"]
                            : "--")
                    })
                } else {
                    statuses.push("no templates")  // only one entry
                }

                // process template names
                if (r.template_names) {
                    r.template_names.forEach(tn => {
                        if (!templates.includes(tn)) {
                            templates.push(tn)
                        }
                    })
                }

                // process sections
                if (r.section) {
                    const hybridSection = (r.type === "general" ? 'General: ' : '') + r.section
                    if (!sections.includes(hybridSection)) {
                        sections.push(hybridSection)
                    }
                }

            })
            myUrl["reference_info"] = {
                "statuses" : statuses,
                "templates" : templates,
                "sections" : sections,
            }
        })

    }, [])


    useEffect( () => { // [myIariBase, pageData, processReferences, processUrls, myStatusCheckMethod]
        const context = 'PageData::useEffect [myIariBase, pageData, processReferences, processUrls, associateRefsWithLinks, myStatusCheckMethod]'

        const postProcessData = (pageData) => {
            processUrls(pageData);  // creates urlDict and urlArray
            processReferences(pageData)  // associates url links with references
            associateRefsWithLinks(pageData)
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

        }, [myIariBase, pageData, processReferences, processUrls, associateRefsWithLinks, myStatusCheckMethod]

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

    const viewOptions = <div className={"view-options-selection"}>
        {/*<div>View by</div>{Object.keys(viewTypes).map(viewType => {*/}
            {Object.keys(viewTypes).map(viewType => {
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
            })}
        </div>

    if (!pageData) return null;

    return <>

        {isLoadingUrls ? <Loader message={"Retrieving URL status codes..."}/>
            : (dataReady ? <div className={"page-data"} xxstyle={{backgroundColor:"grey"}}>

                        {true && viewOptions}

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
