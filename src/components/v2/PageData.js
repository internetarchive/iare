import React, {useCallback, useEffect, useState} from "react";
import UrlDisplay from "./UrlDisplay";
import RefDisplay from "./RefDisplay";
import FldDisplay from "./FldDisplay";
import Loader from "../Loader";
// import {fetchUrlArchives, fetchUrls, processForIari} from "../../utils/iariUtils.js"
import {fetchUrls, processForIari} from "../../utils/iariUtils.js"
import {ConfigContext} from "../../contexts/ConfigContext";
import {
    ARCHIVE_STATUS_FILTER_MAP,
    URL_STATUS_FILTER_MAP
} from "./filterMaps/urlFilterMaps";
import {areObjectsEqual} from "../../utils/utils";
import {categorizedDomains, rspMap} from "../../constants/perennialList";

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

        NB TODO we should take all this processing code and place it in a processing module,
        NB AND, this processing logic should really be in the IARI API backend code, once it
        NB is established what needs to happen.
    */

    const [selectedViewType, setSelectedViewType] = useState('urls')
    const [isLoadingUrls, setIsLoadingUrls] = useState(false)
    const [isDataReady, setIsDataReady] = useState(false)
    const [isPageError, setIsPageError] = useState(false)
    const [pageErrorText, setPageErrorText] = useState('')
    const [urlStatusLoadingMessage, setUrlStatusLoadingMessage] = useState('')

    // set up iariBase and statusMethod from global config
    let myConfig = React.useContext(ConfigContext)
    myConfig = myConfig ? myConfig : {} // prevents undefined.<param> errors
    const myIariBase = myConfig.iariSource
    const myStatusCheckMethod = myConfig.urlStatusMethod

    const rspDomains = categorizedDomains

    // create pageData.urlDict and pageData.urlArray from urlResults
    // called in useEffect when new url results received
    const processUrls = useCallback( (pageData, urlResults) => {

        const gatherTldStats = (urlArray) => {
            const tldDict = {}  // stores count of each tld
            if (urlArray?.length) {
                urlArray.forEach( urlObj => {
                    if (!tldDict[urlObj.tld]) tldDict[urlObj.tld] = 0
                    tldDict[urlObj.tld] = tldDict[urlObj.tld] + 1
                })
            }
            pageData.tld_statistics = tldDict
        }

        // create url dict from returned results
        const urlDict = {}
        urlResults && urlResults.forEach(d => {  // results surround url data with a "data" element
            const myUrl = d.data.url

            // add entry for url if not there yet
            if (!urlDict[myUrl]) {
                urlDict[myUrl] = d.data  // initialize with result data
                urlDict[myUrl].urlCount = 0
            }

            processForIari(urlDict[myUrl])

            // increase usage count of this url by 1; keeps track of repeats
            urlDict[myUrl].urlCount++
        })

        // primary urls are all those urls that are NOT archive links
        const primaryUrls = Object.keys(urlDict).filter(urlKey => {
            return !(urlDict[urlKey].isArchive)
        })

        // append urlDict and urlArray to pageData
        pageData.urlDict = urlDict
        pageData.urlArray = primaryUrls.map(urlKey => {
            return urlDict[urlKey]
        })

        gatherTldStats(pageData.urlArray)

    }, [])


    // take the wt:value and put it straight to value:<value>
    const normalizeMediaWikiParams = (oldParams) => {

        const newParams = {}

        // Iterate through keys and build normalized return param object values
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

            // console.log(`processCiteRefs: mwData[${cite.ref_index}] is `, mwData)

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
                    ////console.log(`Found matching ref for citeRef# ${cite.ref_index}`)
                    foundRef.cite_refs = cite.page_refs
                }

            } else {
                // we do not have parts[0].templates - what should we do?
            }

        })

        // end result : anchor refs are assigned with citeref
    }, [])


// currently only sets the "hasTemplateArchive" property to true if archive_url parameter found in template
    const processReference = useCallback( (ref, urlDict) => {

        const templates = ref?.templates ? ref.templates : []
        const templateUrls = {}

        templates.forEach( template => {

            const primaryUrl = template.parameters.url
            const archiveUrl = template.parameters.archive_url

            // add urls from template to find exotemplate urls later
            templateUrls[primaryUrl] = true
            templateUrls[archiveUrl] = true

            // if link referenced by archive_url exists and archiveLinkStatus is good,
            // set the hasTemplateArchive property of the primaryUrl to true
            if (archiveUrl && urlDict[primaryUrl]) {
                urlDict[primaryUrl].hasTemplateArchive = true  // this needs work, as there can be more than one template where this url is used.
                // TODO maybe this is covered when we attach the addociated reference objects to the URL...
            }
        })

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
        // * reduce references with multiple citations into one reference with multiple page referrals
        // * calculate the status of the links in the references by examining the primary and
        //   archived urls in the templates in each reference
        // * acquire template statistics
        //
        // TODO: this should be IARI API, not front-end post-retrieval
        //

        const gatherTemplateStatistics = (refArray) => {
            const templateDict = {}  // stores count of each template
            if (refArray?.length) {
                refArray.forEach( ref => {
                    if (!ref.template_names?.length) return
                    ref.template_names.forEach(templateName => {
                        // console.log(`Another Template found for ref id ${ref.id}: ${templateName}`)
                        if (!templateDict[templateName]) templateDict[templateName] = 0
                        templateDict[templateName] = templateDict[templateName] + 1
                    })
                })
            }
            pageData.template_statistics = templateDict
        }

        const anchorRefs = getAnchorReferences(pageData)

        // process all anchor references
        anchorRefs.forEach( ref => {
            processReference(ref, pageData.urlDict)
        })

        // associate citeref data with anchorRefs
        processCiteRefs(anchorRefs, pageData)

        // set anchorRefs as the definitive references property of pageData
        pageData.references = anchorRefs

        gatherTemplateStatistics(pageData.references)

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

    const processRspData = useCallback( pageData => {
        // for each url in pageData.urlArray, set rsp[] property of urlDict entry
        // at the same time, keep track of rsp count

        if (!pageData?.urlArray) return

        // create rspStats with nitial counts of 0
        const rspStats = {}
        const rspMapKeys = Object.keys(rspMap)
        rspMapKeys.forEach( key => {
            rspStats[key] = 0
        })

        pageData.urlArray.forEach(urlObj => {
            // for each original url:
            //      if sld or _3ld is in rsp category:
            //          - pull that category into url object's rsp[] property
            //          - increment rsp category count in rspStats

            urlObj.rsp = []  // Reliable Source / Perennial

            // check each rsp to see if this url is included in any of 'em

            rspMapKeys.forEach(key => {
                const rspKey = rspMap[key].rspKey

                if (!rspDomains[rspKey]) {
                    // skip unhandled categories
                    if (rspKey !== "__unassigned") console.error(`rsp domain ${rspKey} not found.`)
                    return
                }

                // if url's .sld or ._3ld included in this rsp's collection, modify urlObj and rspStats

                if (rspDomains[rspKey].includes(urlObj.sld)
                    ||
                    rspDomains[rspKey].includes(urlObj._3ld)) {
                    urlObj.rsp.push( key )  // add this rsp to this url
                    rspStats[key] = rspStats[key] + 1
                }

            })
            // if not found in any rsp category, assign to "__unassigned"
            if (urlObj.rsp.length === 0) {
                urlObj.rsp.push( "__unassigned" )  // add this rsp to this url
                rspStats["__unassigned"] = rspStats["__unassigned"] + 1
            }
        })

        pageData.rsp_statistics = rspStats

    }, [rspDomains])


    useEffect( () => { // [myIariBase, pageData, processReferences, processUrls, myStatusCheckMethod]

        const fetchPageUrls = () => {
            return fetchUrls( {
                iariBase: myIariBase,
                urlArray: pageData.urls,
                refresh: pageData.forceRefresh,
                timeout: 60,
                method: myStatusCheckMethod
            })
        }

        const fetchPageData = async () => {

            try {

                setUrlStatusLoadingMessage(`Retrieving URL status codes with ${myStatusCheckMethod} method`)
                setIsDataReady(false);
                setIsLoadingUrls(true);

                // fetch info for each url and wait for results before continuing
                const myUrls = await fetchPageUrls()

                // process received data - TODO this should eventually be done in IARI
                processUrls(pageData, myUrls);  // creates pageData.urlDict and pageData.urlArray
                processReferences(pageData)  // associates url links with references
                associateRefsWithLinks(pageData)
                processRspData(pageData)

                // decorate pageData a little
                pageData.statusCheckMethod = myStatusCheckMethod;

                // announce to UI all is ready
                setIsDataReady(true);
                setIsLoadingUrls(false);

            } catch (error) {
                console.error('Error fetching data:', error);
                pageData.urlResults = []
                setPageErrorText(error.message)
                setIsPageError(true)

            }

        }

        fetchPageData()

        },   [myIariBase, pageData, processReferences, processUrls, associateRefsWithLinks, myStatusCheckMethod, processRspData])


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
            {Object.keys(viewTypes).map(viewType => {
                return <div key={viewType} >
                    <label>
                        <input
                            type="radio"
                            value={viewType}
                            checked={selectedViewType === viewType}
                            onChange={handleViewTypeChange}
                        /> <span className={selectedViewType === viewType ? 'selected-choice' : '' }>{viewTypes[viewType].caption}</span>
                    </label>
                </div>
            })}
        </div>

    if (!pageData) return null;

    return <>

        {isLoadingUrls
            ? <Loader message={urlStatusLoadingMessage}/>
            : <>
                {isPageError && <div className={"error-display"}>{pageErrorText}</div>}

                {!isDataReady
                    ? <p>Data Not Ready</p>

                    : <div className={"page-data"} xxstyle={{backgroundColor:"grey"}}>

                        {true && viewOptions}

                        <div className={`display-content`}>

                            {selectedViewType === 'domains' &&
                                <FldDisplay pageData={pageData}/>
                            }

                            {selectedViewType === 'urls' &&
                                <UrlDisplay pageData={pageData} options={{refresh: pageData.forceRefresh}}
                                            urlStatusFilterMap={URL_STATUS_FILTER_MAP}
                                            urlArchiveFilterMap={ARCHIVE_STATUS_FILTER_MAP}

                                />
                            }

                            {selectedViewType === 'stats' &&
                                <RefDisplay pageData={pageData} options={{}}/>
                            }
                        </div>

                    </div>
                }
            </>
        }
    </>
}
