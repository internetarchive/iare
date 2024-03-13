import React, {useCallback, useEffect, useState} from "react";
import UrlDisplay from "./UrlDisplay";
import RefDisplay from "./RefDisplay";
import Loader from "../Loader";
import {fetchUrls, iariPostProcessUrl} from "../../utils/iariUtils.js"
import {ConfigContext} from "../../contexts/ConfigContext";
import {
    // ARCHIVE_STATUS_FILTER_MAP,
    URL_STATUS_FILTER_MAP
} from "../../constants/urlFilterMaps";
import {REF_FILTER_DEFS} from "../../constants/refFilterMaps";
import {areObjectsEqual} from "../../utils/utils";
import {categorizedDomains, rspMap} from "../../constants/perennialList";
import {UrlStatusCheckMethods} from "../../constants/checkMethods";
import {ACTIONABLE_FILTER_MAP} from "../../constants/actionableMap";

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
    const [pageErrors, setPageErrors] = useState('')
    const [urlStatusLoadingMessage, setUrlStatusLoadingMessage] = useState('')

    let myConfig = React.useContext(ConfigContext)
    myConfig = myConfig ? myConfig : {} // prevents undefined myConfig.<param> errors
    const myIariBase = myConfig.iariSource
    const myStatusCheckMethod = myConfig.urlStatusMethod
    const isShowViewOptions = myConfig.isShowViewOptions

    // google dev tools does not handle module level imports well, but assigning to a local var makes things work
    const rspDomains = categorizedDomains


    const addProcessError = (pageData, newError) => {
        if (!pageData.process_errors) pageData.process_errors = []
        pageData.process_errors.push( newError )
    }

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

        const gatherStatusStats = (urlArray) => {
            // calc counts for each url status defined in URL_STATUS_FILTER_MAP
            const urlCounts = (urlArray.length)
                ? []
                : Object.keys(URL_STATUS_FILTER_MAP).map(key => {
                    const f = URL_STATUS_FILTER_MAP[key];
                    const count = pageData.urlArray.filter((f.filterFunction)()).length; // Note the self-evaluating filterFunction!
                    return {
                        label: f.caption,
                        count: count,
                        link: key
                    }
                })

            pageData.url_status_statistics = {urlCounts: urlCounts}

        }
        // create url dict from returned results
        const urlDict = {}

        if (urlResults) {
            urlResults.forEach(d => {
                // urlResults arrive from fetch routine surrounded by a "data" element:
                // [
                //  { data: <url data>, status_code: <result of fetch call (not the url status)> },
                //  . . .
                // ]
                //
                // we remove that level of indirection here

                const myUrl = d.data.url

                // add entry for url if not there yet
                if (!urlDict[myUrl]) {
                    urlDict[myUrl] = d.data  // initialize with result data
                    urlDict[myUrl].urlCount = 0
                }

                // decorate the new url entry with some things that are currently  missing from IARI
                // TODO Add these to iari! the "iariPostProcessUrl" should become obsolete
                try {
                    iariPostProcessUrl(urlDict[myUrl])  // sets tld, sld, _3ld, and isArchive
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
            return !(urlDict[urlKey].isArchive)
        })

        // append urlDict and urlArray to pageData
        pageData.urlDict = urlDict
        pageData.urlArray = primaryUrls.map(urlKey => {
            return urlDict[urlKey]
        })

        gatherTldStats(pageData.urlArray)
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

        pageData.references.forEach(_ref => {
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


    const processReference = useCallback( (ref, urlDict) => {
        // sets the "hasTemplateArchive" property to true if archive_url parameter found in template

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
                urlDict[primaryUrl].hasTemplateArchive = true  // this needs work, as there can be more than one template where this url is used.
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
        // reduce references by eliminating repeats and collecting ref referrals
        // "anchor refs" are defined as a reference that describes the content of a reference.
        // If it is named, it can be referred to by another reference by that name.
        // If it is not named, it is just a single instance of a reference.

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
                        // this is to fix bug in ARTICLE_V1 parser that just puts template name in
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
                const f = REF_FILTER_DEFS[key];

                // NB: must use bind here to pass urlDict to filter function
                const count = pageData.references.filter((f.filterFunction)().bind(null, pageData.urlDict)).length; // Note the self-evaluating filterFunction!
                return {
                    label: f.caption,
                    count: count,
                    link: key
                }
            })

            if (!pageData["stats"]) pageData["stats"] = {}
            pageData.stats["papers"] = papersStats
        }


        const anchorRefs = getAnchorReferences(pageData)

        // process all anchor references
        anchorRefs.forEach( (ref, index) => {
            processReference(ref, pageData.urlDict)

            // assign dynamic ref_index property to each reference.
            // this gives us the ability to index each reference internally.

            ref.ref_index = index

        })

        // associate citeref data with anchorRefs
        processCiteRefs(anchorRefs, pageData)

        // set anchorRefs as the definitive references property of pageData
        pageData.references = anchorRefs

        gatherTemplateStatistics(pageData.references)
        gatherPapersStatistics(pageData.references)
        processTemplates(pageData.references)


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

                if (!myUrl) return  // skip if no entry

                // TODO what to do if url not in urlDict?
                // TODO we should send and display a notice...shouldnt happen
                // TODO add to test case: associateRefsWithLinks w/ bad urlDict

                // if url does not have current reference in it's associated reference list, add it now

                // create refs and ref_ids array properties if not there
                if (!(myUrl["ref_ids"])) myUrl["ref_ids"] = []
                if (!(myUrl["refs"])) myUrl["refs"] = []

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

            if (!myUrl || !myUrl.refs) {
                console.log(`associateRefsWithLinks: no urlDict for: ${link}`)
                return
            }

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

    const processBooksData = useCallback( pageData => {
        // come up with books data for URL

        /*
        from stephen:

        Any URL at books.google.com ...
         harder to tell for archive.org/details since it can be anything besides a book.
          Anything at gutenberg.org

         */

        if (!pageData?.urlArray) return

        const bookStats = {}

        pageData.urlArray.forEach(urlObj => {
            /* for each url:
            if templates contains "cite book", then
            - add or increment entry for bookStats[netloc]
             */
            if (!urlObj.reference_info?.templates) return
            if (!urlObj.reference_info.templates.includes("cite book")) return
            if (!urlObj.netloc) return

            const netloc = urlObj.netloc
            if (!bookStats[netloc]) bookStats[netloc] = 0
            bookStats[netloc] = bookStats[netloc] + 1
        })

        if (!pageData["stats"]) pageData["stats"] = {}
        pageData.stats["books"] = bookStats

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

        // NB TODO make this work for V2
        // const fetchNewRefs = () => {
        //     // return fetchUrls( {
        //     //     iariBase: myIariBase,
        //     //     urlArray: pageData.urls,
        //     //     refresh: pageData.forceRefresh,
        //     //     timeout: 60,
        //     //     method: myStatusCheckMethod
        //     // })
        // }

        const fetchPageData = async () => {

            try {

                setUrlStatusLoadingMessage(`Retrieving URL status codes with ${UrlStatusCheckMethods[myStatusCheckMethod].caption} method`)
                setIsDataReady(false);
                setIsLoadingUrls(true);

                // decorate pageData a little
                pageData.statusCheckMethod = myStatusCheckMethod;

                // fetch info for each url and wait for results before continuing
                const myUrls = await fetchPageUrls()


                // NB TODO: fetch article data from IARI for V2 or article parsing to get array of citerefs
                // const newRefs = await fetchNewRefs()  // grabs article_V2 data from IARI

                // process received data - TODO this should eventually be done in IARI
                processUrls(pageData, myUrls);  // creates pageData.urlDict and pageData.urlArray; loads pageData.errors
                processReferences(pageData)  //
                associateRefsWithLinks(pageData)  // associates url links with references
                processRspData(pageData)
                processBooksData(pageData)

                processActionables(pageData)

                // if any errors, display
                if (pageData.process_errors?.length > 0) setPageErrors(pageData.process_errors)

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
            processReferences,
            processUrls,
            associateRefsWithLinks,
            myStatusCheckMethod,
            processRspData,
            processBooksData,
            processActionables,
        ])


    const handleViewTypeChange = (event) => {
        setSelectedViewType(event.target.value);
    };

    const viewTypes = {
        "urls": {
            caption: "URLs"
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

    return <>
        {isLoadingUrls
            ? <Loader message={urlStatusLoadingMessage}/>
            : <>
                {errorDisplay}

                {!isDataReady
                    ? <p>Data Not Ready</p>

                    : <div className={"page-data"} xxstyle={{backgroundColor:"grey"}}>

                        {isShowViewOptions && viewOptions}

                        <div className={`display-content`}>

                            {selectedViewType === 'urls' &&
                                <UrlDisplay pageData={pageData} options={{refresh: pageData.forceRefresh}} />
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
