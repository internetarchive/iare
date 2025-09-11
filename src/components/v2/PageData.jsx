import React, {useCallback, useEffect, useState} from "react";
import {
    fetchUrls,
    iariPostProcessUrl,
    fetchUrlsInfo,
    calcProbeScores,
    isBookUrl,
    bookTemplates, noBookLink
} from "../../utils/iariUtils.js"

import Loader from "../Loader.jsx";
import UrlDisplay from "./UrlDisplay.jsx";
import RefDisplay from "./RefDisplay.jsx";
import StatsDisplay from "./StatsDisplay.jsx";

import {ConfigContext} from "../../contexts/ConfigContext.jsx";
import {ACTIONABLE_FILTER_MAP} from "../../constants/actionableMap.jsx";
import {URL_STATUS_FILTER_MAP} from "../../constants/urlFilterMaps.jsx";
import {REF_FILTER_DEFS} from "../../constants/refFilterMaps.jsx";
import {categorizedDomains, reliabilityMap} from "../../constants/perennialList.jsx";
import {UrlStatusCheckMethods} from "../../constants/checkMethods.jsx";
import {testPageData} from "../../utils/testUtils.jsx";
import DomainDisplay from "./pages/DomainDisplay.jsx";

/*
When this component is rendered, it must "process" the pageData. This involves:
- fetching the status codes of all the URLS
- process the urls into urlArray
- process the references
  - reduce reference array by coalescing all named refs together
  - associate reference to url items that are "owned" by each reference
*/


export default function PageData({rawPageData = {}, showViewOptions = false, handleClick}) {
    /*
    pageData is the raw data from IARI fetch call, with some decoration properties added for convenience.

    Upon component instantiation, pageData must be processed. This is accomplished with the
    fetchPageData call in the component instantiation useEffect.
        - the URL details are immediately fetched for each URL in pageData.urls, which creates:
            urlDict, a url-keyed javascript object for each url, and
            urlArray, an array with each entry pointing to a urlDict object.

        - The references list is flattened, merging all "named" references into one
            "master" reference, with the number of times a reference is used as a property.

        - Other auxiliary properties are fetched for each reference and link

        NB TODO All this processing should be dome in a processing module,
        NB TODO Ans, this processing module should really be part of IARI API backend

    */

    // const defaultProbesString = "verifyi|trust_project|iffy"
    const defaultProbesString = "verifyi|iffy"

    const [selectedViewType, setSelectedViewType] = useState('urls')
    const [isLoadingUrls, setIsLoadingUrls] = useState(false)
    const [isDataReady, setIsDataReady] = useState(false)

    const [pageErrors, setPageErrors] = useState('')
    const [urlStatusLoadingMessage, setUrlStatusLoadingMessage] = useState(null)

    let myConfig = React.useContext(ConfigContext)
    myConfig = myConfig ? myConfig : {} // prevents myConfig.<undefined param> errors

    const myIariBase = myConfig.iariSource  // TODO: grab from pageData.iariSource
    const myStatusCheckMethod = myConfig.urlStatusMethod  // TODO grab from pageData.checkStatusMethod

                // // const isShowViewOptions = myConfig.isShowViewOptions
                // const [showViewOptions, setShowViewOptions] = useState(myConfig.isShowViewOptions)



    // Google Chrome dev tools does not handle module level imports
    // well, but assigning to a local var seems to make things work
    const rspDomains = categorizedDomains

    const pageData = rawPageData  // TODO ehy this reassign??

    const addProcessError = (pageData, newError) => {
        if (!pageData.process_errors) pageData.process_errors = []
        pageData.process_errors.push( newError )
    }

    // from urlResults, creates:
    //  pageData.urlDict and
    //  pageData.urlArray
    //
    const processUrls = useCallback( (pageData, urlResults) => {
        // callback function defined upon component instantiation
        //
        // called in useEffect when new urlResults received
        //


        // create urlDict from urlResults

        const urlDict = {}

        if (urlResults) {
            urlResults.forEach(d => {

                const myUrl = d.data.url
                    // urlResults arrive from fetch routine surrounded by a "data" element:
                    //
                    // [
                    //  { data: <url data>, status_code: <result of fetch call (not the url status)> },
                    //  . . .
                    // ]
                    //
                    // so we remove that level of indirection here

                // add urlDict entry for url if not yet present
                if (!urlDict[myUrl]) {
                    urlDict[myUrl] = d.data  // initialize with result data
                    urlDict[myUrl].urlCount = 0
                }

                // use iariPostProcessUrl to add data to the url entry
                // TODO make this step obsolete by doing it in IARI rather than here after the fact
                try {
                    iariPostProcessUrl(urlDict[myUrl])  // sets tld, pld, _3ld, and isArchive

                } catch (error) {
                    console.error(`Error processing URL: ${myUrl} (${error.message})`);
                    console.error(error.stack);
                    addProcessError(pageData, `Error processing URL: ${myUrl} (${error.message})`)
                    // try to fix this urlDict entry?
                    urlDict[myUrl].error = error.message
                }

                // increase usage count of this url by 1; keeps track of repeats
                urlDict[myUrl].urlCount++
            })
        }

        // primary urls are all those urls that are NOT archive links
        const primaryUrls = Object.keys(urlDict).filter(urlKey => {
            return !(urlDict[urlKey].isArchive)  // filter OUT urls that are archive links
        })

        // append urlDict and urlArray to pageData
        pageData.urlDict = urlDict
        pageData.urlArray = primaryUrls.map(urlKey => {
            return urlDict[urlKey]
        })

                    // // generate some page-wide statistics
                    // gatherDomainStats(pageData.urlArray)
                    // gatherStatusStats(pageData.urlArray)

    }, [])


    const processUrlStats = useCallback( (pageData) => {

        const gatherDomainStats = (urlArray) => {
            // calculates top level domain and pay level domain stats

            if (!urlArray?.length) {
                pageData.tld_statistics = {}
                pageData.pld_statistics = {}
                return
            } // with empty  {

            const tldDict = {}  // stores count of each tld
            const pldDict = {}  // stores count of each tld
            urlArray.forEach( urlObj => {

                // do top level domain
                if (!tldDict[urlObj.tld]) tldDict[urlObj.tld] = 0
                tldDict[urlObj.tld] = tldDict[urlObj.tld] + 1

                // do pay level domain stats
                if (!pldDict[urlObj.pld]) pldDict[urlObj.pld] = 0
                pldDict[urlObj.pld] = pldDict[urlObj.pld] + 1

            })

            pageData.tld_statistics = tldDict
            pageData.pld_statistics = pldDict
        }

        const gatherStatusStats = (urlArray) => {
            // calc counts for each url status defined in URL_STATUS_FILTER_MAP
            const urlCounts = (urlArray.length)
                ? []
                : Object.keys(URL_STATUS_FILTER_MAP).map(key => {
                    const f = URL_STATUS_FILTER_MAP[key];
                    // get the count of the results of the filter function (f) for iterated status value (key)
                    const count = pageData.urlArray.filter((f.filterFunction)()).length; // Note the self-evaluating filterFunction!
                    return {
                        label: f.caption,
                        count: count,
                        link: key
                    }
                })

            pageData.url_status_statistics = {urlCounts: urlCounts}

        }

        // generate some page-wide statistics
        gatherDomainStats(pageData.urlArray)
        gatherStatusStats(pageData.urlArray)

    }, [])


    const processActionables = useCallback( (pageData) => {
        // for each url in urlResults, check if it is actionable
        // if so, add to url.actionable list

        if (!pageData?.urlArray) return

        pageData.urlArray.forEach(urlObj => {
            // for each url:
            // if url is actionable, add to url.actionable list
            urlObj.actionable = []
            Object.keys(ACTIONABLE_FILTER_MAP).forEach(key => {
                const f = ACTIONABLE_FILTER_MAP[key];
                if ((f.filterFunction)()(urlObj)) {
                    urlObj.actionable.push(key)
                }
            })
        })

        // TODO what if references is nil?
        pageData.references.forEach( _ref => {
            // for each url:
            // if url is actionable, add to url.actionable list
            _ref.actionable = []
            Object.keys(ACTIONABLE_FILTER_MAP).forEach(key => {
                const f = ACTIONABLE_FILTER_MAP[key];

                if ((f.refFilterFunction)()(pageData.urlDict, _ref)) {
                    _ref.actionable.push(key)
                }
            })
        })

    }, [])


    /*
    algorithm:
    for each ref in wikitext:
        for each url in ref.urls
            if url NOT in anchorrefs then skip
            with url:
                for each cite_ref:
                    if url in {cite_ref.urls}
                    set ref.cite_ref = pointer to cite_ref element
     */
    const uniteCiteRefs = useCallback( (pageData) => {

        const wikiRefs = pageData?.references || []  // references from wikitext parsing
        // const htmlRefs = pageData?.cite_refs || []  // references from html parsing

        wikiRefs.forEach( wikiRef => {

            wikiRef.citeRef = null

            wikiRef.urls.forEach( url => {

                //skip if not an anchor link in urlDict
                if (!pageData.urlDict[url]) return

                // check all cite_refs for included url

                const citeRefs = pageData?.cite_refs

                if (citeRefs) {
                    citeRefs.forEach( citeRef => {
                        if (citeRef.urls) {
                            citeRef.urls.forEach( citeUrl => {
                                if (url === citeUrl) {
                                    // match this citeRef to the current wikiRef and return from url search loop
                                    wikiRef.citeRef = citeRef

                                    return

                                }
                            })
                        }
                    })
                }

            })

        })

        // end result : anchor refs are assigned with citeref
    }, [])


    const processReference = useCallback( (ref, urlDict) => {
        // NB TODO Does this do anything useful???

        // sets the "hasTemplateArchive" property to true if archive_url parameter found in template
        // sets url.hasTemplateArchive" of url found in template "ur'"parameter if there

        const templates = ref?.templates ? ref.templates : []
        const templateUrls = {}

        templates.forEach( template => {

            if (!template.parameters) {
                setPageErrors("\"parameters\" property of reference.template missing")
                return
            }

            const primaryUrl = template.parameters.url
            const archiveUrl = template.parameters.archive_url

            // add urls from template to find exotemplate urls later
            templateUrls[primaryUrl] = true
            templateUrls[archiveUrl] = true

            // if link referenced by archive_url exists and archiveLinkStatus is good,
            // set the hasTemplateArchive property of the primaryUrl to true
            if (archiveUrl && urlDict[primaryUrl]) {
                urlDict[primaryUrl].hasTemplateArchive = true
                // TODO this needs fixing, as there can be more than one template where this url is used.
                // TODO maybe this is covered when we attach the associated reference objects to the URL...
            }
        })

        // // turn url string into urlObject property of reference
        // if (!ref.urlObjects) ref.urlObjects = []
        // ref.urls.forEach( url => {
        //     ref.urlObjects.push(urlDict[url])
        // })

    }, [])


    const getAnchorReferences = (pageData) => {
        // reduce references by eliminating repeats and collecting referred references
        // "anchorRefs" refer to references that describes the original content of a reference.
        //  - If it is named, it can be referred to by another reference by that name.
        //  - If it is not named, it is just a single instance of a reference.

        // for refs, if dehydrated=true, use pageData.dehydrated_references, else use pageData.references
        const refs = (pageData?.references?.length) ? pageData.references : []

        const namedRefs = {}
        const anchorRefs = []

        // Process "named" refs by looping thru references
        // if named
        //      - increment reference count for namedRef[name]
        //      - if no content, assume it's a reference to a reference that is already anchored
        refs.forEach(ref => {

            if (ref.name) {
                // "named" references point to another "anchor" reference with the same name
                // namedRef[fef.name] holds the reference count of this name

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
        // * make urlObjects property from urls property via urlDict
        //
        // TODO: this should be IARI API, not front-end post-retrieval
        //

        const processTemplates = (refArray) => {
            // for each template in reference, set template.name tp params[template_name] if there
            if (refArray?.length) {
                refArray.forEach( ref => {
                    if (!ref.templates?.length) return
                    ref.templates.forEach(template => {
                        // console.log(`Another Template found for ref id ${ref.id}: ${templateName}`)

                        // if template.name not set, try to pull it from parameters[template_name]
                        // this is to fix bug in WIKIPARSE_V1 parser that just puts template name in
                        // "template_name" property of parameters object
                        if (!template.name && template.parameters) {
                            template["name"] = template.parameters["template_name"]
                        }
                    })
                })
            }
        }

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

            if (!pageData["stats"]) pageData["stats"] = {}
            pageData.stats["templates"] = templateDict
        }

        const gatherPapersStatistics = (refArray) => {
            // use filter def from references filter def
            const paperFilterDefinitions = ["hasDoi"]
            const papersStats = paperFilterDefinitions.map(key => {
                const myFilter = REF_FILTER_DEFS[key];

                // NB: must use bind here to pass urlDict to filter function
                const count = pageData.references
                    .filter((myFilter.filterFunction)()
                        .bind(null, pageData.urlDict)).length; // Note the self-evaluating filterFunction!
                return {
                    label: myFilter.caption,
                    count: count,
                    link: key
                }
            })

            if (!pageData["stats"]) pageData["stats"] = {}
            pageData.stats["papers"] = papersStats
        }


        // re-define references property as just the anchor references
        pageData.references = getAnchorReferences(pageData)


        // process all "anchor" or primary references
        pageData.references.forEach( (ref, index) => {

            processReference(ref, pageData.urlDict)
            // pretty much just sets "hasTemplateArchive" property of urls found in reference

            // assign dynamic ref_index property to each reference,
            // giving us the ability to index each reference internally.
            ref.ref_index = index

        })

        // associate citeref data with anchorRefs
        uniteCiteRefs(pageData)

        gatherTemplateStatistics(pageData.references)
        gatherPapersStatistics(pageData.references)
        processTemplates(pageData.references)


    }, [processReference, uniteCiteRefs])



    const associateUrlsWithRefs = useCallback( pageData => {
        // for each reference in pageData.references
        //  - for each url link
        //      - add ref to url's refs list

        if (!pageData?.references) return

        pageData.references.forEach(ref => {
            // process each url link in reference
            ref.urls.forEach(url => {
                const urlObj = pageData.urlDict[url]

                if (!urlObj) return  // skip if no entry

                // TODO what to do if url not in urlDict?
                // TODO we should send and display a notice...shouldn't happen
                // TODO add to test case: associateUrlsWithRefs w/ bad urlDict

                // if url does not have current reference in it's associated reference list, add it now

                // create refs and ref_ids array properties if not there
                urlObj.ref_ids = urlObj.ref_ids ?? [];
                urlObj.refs = urlObj.refs ?? [];

                // TODO check and debug here if ref.id will be reliable
                // TODO it might change over time, and then havoc may be introduced
                // TODO but maybe not, as it is unique to each wikitext
                if (!urlObj["ref_ids"].includes(ref.id)) {
                    urlObj["ref_ids"].push(ref.id)
                    urlObj["refs"].push(ref)
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
            if (!myUrl || !myUrl.refs) {
                console.log(`associateUrlsWithRefs: no urlDict for: ${link}`)
                return
            }

            const statuses = []
            const templates = []
            const sections = []

            // traverse each reference this url is associated with
            myUrl.refs.forEach( r => {

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
                    r.template_names.forEach(tName => {
                        if (!templates.includes(tName)) {
                            templates.push(tName)
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

    const processReliabilityStats = useCallback( pageData => {
        // for each url in pageData.urlArray, set rsp[] property of urlDict entry
        // at the same time, keep track of rsp count

        if (!pageData?.urlArray) return

        // create reliabilityStats with nitial counts of 0
        const reliabilityStats = {}
        const reliabilityMapKeys = Object.keys(reliabilityMap)
        reliabilityMapKeys.forEach( key => {
            reliabilityStats[key] = 0
        })

        pageData.urlArray.forEach(urlObj => {
            // for each original url:
            //      if pld or _3ld is in rsp category:
            //          - pull that category into url object's rsp[] property
            //          - increment rsp category count in reliabilityStats

            urlObj.rsp = []  // Reliable Source / Perennial

            // check each rsp to see if this url is included in any of 'em

            reliabilityMapKeys.forEach(key => {
                const rspKey = reliabilityMap[key].rspKey

                if (!rspDomains[rspKey]) {
                    // skip unhandled categories
                    if (rspKey !== "__unassigned") console.error(`rsp domain ${rspKey} not found.`)
                    return
                }

                // if URL's .pld or ._3ld included in this rsp's collection, modify urlObj and reliabilityStats

                if (rspDomains[rspKey].includes(urlObj.pld)
                    ||
                    rspDomains[rspKey].includes(urlObj._3ld)) {

                    urlObj.rsp.push( key )  // add this rsp to this url
                    reliabilityStats[key] = reliabilityStats[key] + 1
                }

            })
            // if not found in any rsp category, assign to "__unassigned"
            if (urlObj.rsp.length === 0) {
                urlObj.rsp.push( "__unassigned" )  // add this rsp to this url
                reliabilityStats["__unassigned"] = reliabilityStats["__unassigned"] + 1
            }
        })

        pageData.rsp_statistics = reliabilityStats

    }, [rspDomains])


    const processBookStats = useCallback( pageData => {
        // come up with books data for URL

        if (!pageData?.urlArray) return

        const bookStats = {}

        // accumulate all url links that are books
        pageData.urlArray.forEach(urlObj => {

            urlObj.isBook = isBookUrl(urlObj)

            if (urlObj.isBook === true) {
                // create or increment netloc entry in bookStats
                const netloc = urlObj.netloc
                if (!bookStats[netloc]) bookStats[netloc] = 0
                bookStats[netloc] = bookStats[netloc] + 1
            }

        })

        // indicate for each ref if it has a book or not.
        // it may be a book reference but not have a book link
        if (pageData.references) {
            pageData.references.forEach( _ref => {

                // true if any of the ref's urls are books
                let hasBook = _ref.urls.some(url => {
                    const urlObj = pageData.urlDict[url]
                    return urlObj?.isBook
                })

                // If none of url's indicate a book reference, check for "book-like"
                // templates in this ref that indicate this is a book citation.
                // If a book template is found, then:
                // - set reference.hasBook = true,
                // - increment bookStats counter for "references with Books but no book links"
                // This allows us to filter citations that have books but is missing book links

                if (!hasBook) {
                    // check if any of the templates are of book type
                    hasBook = _ref.templates?.some( t => {
                        return bookTemplates.includes(t.name)
                    })
                    if (hasBook) {
                        // add to count of books with no url links
                        if (!bookStats[noBookLink]) bookStats[noBookLink] = 0
                        bookStats[noBookLink] = bookStats[noBookLink] + 1

                        console.log(`bookStats added; wikitext: ${_ref.wikitext}`)
                    }
                }

                _ref.hasBook = hasBook

            })
        }

        pageData["stats"] = pageData["stats"] ?? {}
        pageData.stats["books"] = bookStats

    }, [])


    const processProbes = useCallback( (pageData, urlResults) => {
        // urlResults is an array of result objects from get_url_info results
        // we loop through urlResults, and append to corresponding urlDict entries
        //
        // as of 2025.08.24 we are focussing on probe results only
        //  - we also want to process archive data for each urlDict that is a primary link

        if (!pageData?.urlDict) return
        const urlDict = pageData.urlDict

        if (urlResults) {
            urlResults.forEach(result => {

                // NB assumes d.data is valid

                // must account for results "d.data" level of hierarchy
                const myUrl = result.data.url
                const probe_results = result.data.results?.probe_results

                // calc score for each probe in probe
                if (probe_results) {
                    calcProbeScores(probe_results)
                }

                // add probe_data to urlDict entry for url
                const urlObj = urlDict[myUrl]
                if (urlObj) {
                    urlObj["probe_results"] = urlObj.isBook ? null : probe_results
                }

            })
        }


    }, [])


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

        const fetchProbeInfo = (urlDict, probesString="") => {

            const myUrlArray = Object.keys(urlDict)

            return fetchUrlsInfo( {
                iariBase: myIariBase,
                urlArray: myUrlArray,
                refresh: pageData.forceRefresh,
                timeout: 60,
                probes: probesString,
            })
        }

        const fetchPageData = async () => {

            try {

                // setUrlStatusLoadingMessage(`Retrieving URL info status codes with ${UrlStatusCheckMethods[myStatusCheckMethod].caption} method`)
                setUrlStatusLoadingMessage(<>
                    <div>Retrieving URL info.</div>
                    <div>Status code checking with {UrlStatusCheckMethods[myStatusCheckMethod].caption} method</div>
                    <div>Probe status checks: {defaultProbesString}</div>
                </>)
                setIsDataReady(false);
                setIsLoadingUrls(true);

                pageData.statusCheckMethod = myStatusCheckMethod  // decorate pageData a little

                // fetch url data for each url and process received data - TODO this should eventually be done in IARI
                const myUrls = await fetchPageUrls()
                processUrls(pageData, myUrls)  // creates pageData.urlDict and pageData.urlArray; loads pageData.errors
                associateUrlsWithRefs(pageData)  // associates url links with references

                processUrlStats(pageData)  // aggregates statistical info on urls

                processBookStats(pageData)

                const myUrlsInfo = await fetchProbeInfo(pageData.urlDict, defaultProbesString)
                // for each URL in urlDict, fetch probe info and assign to probe property of url
                // this is temporary, as eventually the probe data will be included with the url
                // data when initially retrieved (with get_url_info vs. check_url IARI endpoint)
                processProbes(pageData, myUrlsInfo)

                // now that all info is fetched from IARI API, process local info
                processReferences(pageData)

                // associateUrlsWithRefs(pageData)  // associates url links with references

                processReliabilityStats(pageData)
                processActionables(pageData)

                // if any errors, display
                if (pageData.process_errors?.length > 0) {
                    setPageErrors(pageData.process_errors)
                }

                // announce to UI all is ready
                setIsDataReady(true);
                setIsLoadingUrls(false);

            } catch (error) {
                console.error('Error fetching data:', error.message);
                console.error(error.stack);
                pageData.urlResults = []

                setPageErrors(error.message)
                setIsLoadingUrls(false);
            }

        }

        fetchPageData()

        },   [
            myIariBase,
            pageData,
            myStatusCheckMethod,
            processUrls,
            processUrlStats,
            processReferences,
            associateUrlsWithRefs,
            processReliabilityStats,
            processBookStats,
            processActionables,
    ])


    const handleViewTypeChange = (event) => {
        setSelectedViewType(event.target.value);
    };

    const viewOptions = {
        "urls": {
            key: "urls",
            caption: "URLs"
        },
        "refs": {
            key: "refs",
            caption: "Reference Types"
        },
        "domains": {
            key: "domains",
            caption: "Domains"
        },
        "archives": {
            key: "archives",
            caption: "URL Archives"
        },
        "stats": {
            key: "stats",
            caption: "Statistics",
            enabled: false,
        },
        // "debug": {
        //     caption: "Debug Elements"
        // },
    }

    const viewOptionsDisplay = <div className={"view-options-selection"}>
            <div className={'list-label'}>View Options:</div>
            {Object.entries(viewOptions)
                .filter(([_, opt]) => opt.enabled !== false) // filter out disabled
                .map(([viewOption, opt]) => (
                <div key={viewOption} >
                    <label>
                        <input
                            type="radio"
                            value={viewOption}
                            checked={selectedViewType === viewOption}
                            onChange={handleViewTypeChange}
                        /> <span className={selectedViewType === viewOption ? 'selected-choice' : '' }>{opt.caption}</span>
                    </label>
                </div>
                ))}
        </div>

    if (!pageData) return null;

    const getErrorDisplay = (errors) => {
        if (!errors) return null

        if (typeof errors === "string") {
            return (errors.length > 1) ? <div className={"error-display"}>{errors}</div> : null
        }
        if (Array.isArray(errors)) {
            return <div className={"error-display error-display-many"}>
                {(errors.length === 1)
                    ? errors[0]
                    : <>
                        <div className={"title"}>Errors:</div>
                        {errors.map((s,i) => {
                            return <div key={i}>{i + 1}: {s}</div>
                        })}
                        </>
                }
            </div>
        }
        return null
    }

    const errorDisplay = getErrorDisplay(pageErrors)

    console.log(`PageData: rendering...${new Date().toISOString().slice(11, 23)}`)

    return <>
        {isLoadingUrls
            ? <Loader message={urlStatusLoadingMessage}/>
            : <>
                {errorDisplay}

                {!isDataReady
                    ? <p>Data Not Ready</p>

                    : <div className={"page-data iare-ux-container"}>

                        <div className={`iare-ux-header`}>
                            {showViewOptions && viewOptionsDisplay}
                        </div>

                        <div className={`iare-ux-body`}>
                            <div className={'page-data-wrapper'}>

                                {selectedViewType === viewOptions['urls'].key &&
                                    <UrlDisplay pageData={pageData} options={{refresh: pageData.forceRefresh}} />
                                }

                                {selectedViewType === viewOptions['refs'].key &&
                                    <RefDisplay pageData={pageData} options={{}}/>
                                }

                                {selectedViewType === viewOptions['domains'].key &&
                                    <DomainDisplay pageData={pageData} options={{}}/>
                                }

                                {selectedViewType === viewOptions['stats'].key &&
                                    <StatsDisplay pageData={pageData} options={{}}/>
                                }

                                {selectedViewType === viewOptions['archives'].key &&
                                    <ArchivesDisplay pageData={pageData} options={{}}/>
                                }

                                {/*{selectedViewType === 'debug' &&*/}
                                {/*    <>*/}
                                {/*        {testPageData()}*/}
                                {/*    </>*/}
                                {/*}*/}

                            </div>
                        </div>

                    </div>
                }
            </>
        }
    </>
}
