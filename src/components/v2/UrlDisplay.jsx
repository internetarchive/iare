import React, {useCallback, useState} from 'react';
import UrlFlock from "./UrlFlock.jsx";
import RefFlock from "./RefFlock.jsx";
import UrlOverview from "./UrlOverview.jsx";
import '../shared/urls.css';
import '../shared/components.css';
import './urlDisplay.css';
import {LINK_STATUS_MAP} from "../../constants/linkStatusMap.jsx";
import {ACTIONABLE_FILTER_MAP} from "../../constants/actionableMap.jsx";
import {REF_FILTER_DEFS} from "../../constants/refFilterMaps.jsx";
import {ConfigContext} from "../../contexts/ConfigContext.jsx";
import {reliabilityMap} from "../../constants/perennialList.jsx";
import RefView from "./refView/RefView.jsx";
import ConditionsBox from "../ConditionsBox.jsx";

import {Tooltip as MyTooltip} from "react-tooltip";
import {REFERENCE_STATS_MAP} from "../../constants/referenceStatsMap.jsx";
import {ACTIONS_IARE} from "../../constants/actionsIare.jsx";
import {isBookUrl, bookTemplates, noBookLink, bookDefs} from "../../utils/iariUtils.js";

// export default function UrlDisplay ({ pageData, options, urlStatusFilterMap= {}, urlArchiveFilterMap = {} } ) {
export default function UrlDisplay ({ pageData, options } ) {

    const [currentConditions, setCurrentConditions] = useState([])

    const [urlFilters, setUrlFilters] = useState( null ); // keyed object of url filters to pass in to UrlFlock  TODO: implement UrlFilter custom objects
    const [selectedUrl, setSelectedUrl] = useState(''); // currently selected url in url list

    const [refFilter, setRefFilter] = useState( null ); // filter to pass in to RefFlock
    const [selectedRefIndex, setSelectedRefIndex] = useState(null);  // currently selected ref index in RefFlock list
    const [refDetails, setRefDetails] = useState(null);  // which ref is displayed in RefView

    const [currentState, setCurrentState] = useState({})  // aggregate state of filter boxes

    const [isRefViewModalOpen, setIsRefViewModalOpen] = useState(false)  // shows or hides RefView popup


    const filters = {
        actionable: { key: "actionable" },
        reference_stats: { key: "reference_stats" },
        domains: { key: "domains" },
        link_status: { key: "link_status" },
        papers: { key: "papers" },
        perennial: { key: "perennial" },
        tld: { key: "tld" },
        books: { key: "books" },
        templates: { key: "templates" },
    }

    let myConfig = React.useContext(ConfigContext);
    myConfig = myConfig ? myConfig : {} // prevents "undefined.<param>" errors

    /*
    for now, just replaces current condition with passed in condition.
    argument "condition" is assumed to be a filter definition, which, for
    functional purposes, must have a "category" and "desc" field,
    with an optional "fixit" field.  maybe down the line a "tooltip" field.
    */
    const setCondition = (newCondition) => {
        setCurrentConditions(newCondition)
    }

    // sets the current "state of the filters". Each filter has its own
    // state of which it's current "value" is that which it is filtering upon.
    // The filter boxes respond to currentState by adjusting the displayed state.
    // If "whichFilter" is null, all filter states reset to null
    //
    // NB Currently only 1 filter at a time can be active, so, we set the state
    //  of all filters except the one specified to be null. Only 1 filter at a
    //  time will be in a "selected" state
    const setFilterState = (whichFilter, value) => {
        setCurrentState(prevState => {
            const newState = prevState
            Object.keys(prevState).forEach( state => {
                newState[state] = null
            })
            if (whichFilter?.key) newState[whichFilter.key] = value
            return newState
        })
    }

    /*
    show modal refView
    - refFilter should already be set
    - selectedRefIndex should be respected
    - set modal to "show"
     */
    const showRefView = useCallback( (refIndex) => {
        // cancel any current tooltip
        // FIXME

        // handle null refIndex (but retain 0)
        if (!refIndex && refIndex !== 0) {
            alert(`urlDisplay: showRefView, Invalid refIndex!`)
            // TODO alert patron or show modal anyway?
            return;
        }

        // setSelectedRefIndex(refIndex);  // default ref to select in popup

        setIsRefViewModalOpen(true)

    }, [])

    // callback from sub-components when various actions induced.
    //
    // "result" parameter is an object consisting of:
    //  {
    //      action: <action name>,
    //      value: <value to act upon, if any>
    //  }
    //
    // Most actions set the flock filters to a current value.
    // Currently only one filter can be applied at a time.
    // Maybe later the capability of more than one filter will come to be.
    //
    const handleAction = useCallback( result => {
        const {action, value} = result;
        console.log (`UrlDisplay: handleAction: action=${action}, value=${value}`);

        const noneFilter = {
            "filter" : {
                filterFunction: () => () => {return false},
            }
        }

        if (0) {
            // allows for easy addition of "else if"
        }

        else if (action ===
            ACTIONS_IARE.SHOW_REFERENCE_VIEWER.key
        ) {
            showRefView(value)  // value is reference index
        }

        else if (action ===
            ACTIONS_IARE.REMOVE_ALL_FILTERS.key
        ) {
            // clear filters (show all) for URL  and Refs list
            setUrlFilters(null)
            setRefFilter(null)
            setSelectedUrl(null)
            setFilterState(null)
            setCondition(null)
        }

        else if (action ===
            ACTIONS_IARE.SHOW_REFERENCE_VIEWER_FOR_URL.key
        ) {
            // value = url to show in RefView; more accurately, show the ref that "houses" the url
            const refIndex = pageData.urlDict[value]?.refs[0]?.ref_index
            const selectedRef = pageData.references.find(
                r => {  // NB assumes ref_index and ref_index.toString() is valid
                    return r.ref_index.toString() === refIndex.toString()
                })
            setRefDetails(selectedRef)
            setSelectedRefIndex(refIndex)

            showRefView(refIndex)

            setSelectedUrl(value)
        } else if (action ===
            ACTIONS_IARE.FILTER_BY_REFERENCE_STATS.key
        ) {
            // filter REF List by stats specified by REFERENCE_STATS_MAP[ref_stats_key]
            const f = value ? REFERENCE_STATS_MAP[value] : null
            setUrlFilters({"url_filter": f})
            setRefFilter(f?.refFilterFunction
                ? {filterFunction: f.refFilterFunction}
                : null)
            setFilterState(filters.reference_stats, value)  // select reference stat's filter value
            setCondition(f)
        } else if (action ===
            ACTIONS_IARE.CHANGE_REF_VIEW_SELECTION.key
        ) {
            const refIndex = result.value
            const selectedRef = pageData.references.find(
                r => {  // assume ref_index and ref_index.toString() is valid
                    return r.ref_index.toString() === refIndex.toString()
                })
            setRefDetails(selectedRef)
            setSelectedRefIndex(refIndex)
            showRefView(refIndex)  // value is reference index
        } else if (action ===
            ACTIONS_IARE.SET_ACTIONABLE_FILTER.key
        ) {
            // filter URL List by actionable filter determined by value as key
            const f = value ? ACTIONABLE_FILTER_MAP[value] : null

            setUrlFilters({"action_filter": f})
            setRefFilter(f?.refFilterFunction
                ? {
                    desc: f.desc,
                    caption: f.caption,
                    filterFunction: f.refFilterFunction
                }
                : null)
            setFilterState(filters.actionable, value)
            setCondition(f)
        } else if (action ===
            ACTIONS_IARE.SET_PAY_LEVEL_DOMAIN_FILTER.key
        ) {
            // filter URL and Ref list by domain specified in value
            setUrlFilters({"domain_filter": getUrlDomainFilter(value)})
            setRefFilter(getRefDomainFilter(value))
            setFilterState(filters.domains, value)
            setCondition({category: "Pay Level Domains", desc: `Links of domain: "${value}"`})

        } else if (action ===
            ACTIONS_IARE.SET_PAPERS_FILTER.key
        ) {
            // value is filter key name
            const f = value ? REF_FILTER_DEFS[value] : null
            setRefFilter(f)
            setUrlFilters(noneFilter)
            setFilterState(filters.papers, value)
            setCondition({category: "Papers", desc: `References with papers of type "${value}"`})

        } else if (action ===
            ACTIONS_IARE.SET_PERENNIAL_FILTER.key
        ) {
            // value is perennial to filter by
            setUrlFilters({"url_perennial_filter": getUrlPerennialFilter(value)})
            setRefFilter(getRefPerennialFilter(value))
            setSelectedUrl(null)
            setFilterState(filters.perennial, value)
            setCondition({
                category: "Reliability",
                desc: `Links with Reliability Status of: "${reliabilityMap[value].caption}"`
            })

        } else if (action ===
            ACTIONS_IARE.SET_TLD_FILTER.key
        ) {
            // value is tld
            setUrlFilters({"url_tld_filter": getUrlTldFilter(value)})
            setRefFilter(getRefTldFilter(value))
            setSelectedUrl(null)
            setFilterState(filters.tld, value)
            setCondition({category: "Top Level Domain", desc: `Links with Top Level Domain of: "${value}"`})

        } else if (action ===
            ACTIONS_IARE.SET_BOOKS_FILTER.key
        ) {
            // value is netloc associated with Book
            setUrlFilters({"url_book_filter": getUrlBooksFilter(value)})
            setRefFilter(getRefBooksFilter(value))
            setSelectedUrl(null)
            setFilterState(filters.books, value)
            setCondition({
                category: "Books",
                desc: value === noBookLink
                    ? "Citations with no Book links"
                    : (`Links to Books${value === null ? "" : ` from ${value}`}`),
                caption: "Books"
            })

        } else if (action ===
            ACTIONS_IARE.SET_TEMPLATE_FILTER.key
        ) {
            // filter URLs (and references?) by template indicated by "value" argument
            setUrlFilters({"url_template_filter": getUrlTemplateFilter(value)})
            setRefFilter(getRefTemplateFilter(value))
            setSelectedUrl(null)
            setCondition({category: "Template", desc: `Utilizes template "${value}"`})
            setFilterState(filters.templates, value)

        } else if (action ===
            "setLinkStatusFilter"
        ) {
            // value is key into LINK_STATUS_MAP
            const f = value ? LINK_STATUS_MAP[value] : null
            setUrlFilters({"link_status": f})
            setRefFilter(f?.refFilterFunction
                ? {
                    caption: f.caption,
                    desc: f.desc,
                    filterFunction: f.refFilterFunction
                }
                : null)
            setFilterState(filters.link_status, value)
            setCondition(f)

        } else if (action ===
            ACTIONS_IARE.GOTO_CITE_REF.key
        ) {
            // jump to cite ref indicated by "value" argument
            window.open(value, "_blank")

        } else if (action ===
            ACTIONS_IARE.GOTO_WIKI_SECTION.key
        ) {
            // jump to section of wiki article indicated by "value" argument
            window.open(value, "_blank")
        }


        else {
            console.log(`Action "${action}" not supported.`)
            alert(`Action "${action}" not supported.`)
        }

        // TODO: Action for setReferenceFilter/ShowReference for filtered URLS
        // i.e. show all refs that contain ANY of the URLS in the filtered URL list

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showRefView, pageData.urlDict])

    if (!pageData) return null;  // NB must be put AFTER useEffect and useCallback, as those hooks
                                 //    cannot exist after conditional statements

    // eslint-disable-next-line
    const getUrlRefFilter = (targetUrl) => {

        if (!targetUrl || targetUrl === '') {
            return null; // no filter means all filter
        }

        return {
            // TODO: implement UrlFilter custom object

            desc: `Citations with URL: ${targetUrl}`,

            caption: <span>Contains URL: <br/><span
                className={'target-url'}><a target={"_blank"} rel={"noreferrer"}
                                            href={targetUrl} >{targetUrl}</a
            ></span></span>,

            filterFunction: () => (urlDict, ref) => {
                // TODO make this use an array of targetUrls
                return ref.urls.includes( targetUrl )
            },
        }
    }

    const getUrlTemplateFilter = (templateName) => {

        if (!templateName || templateName === '') {
            return null; // no template means all filter
        }

        // return synthetic filter showing only URLs that have templateName in their associated citation templates
        return {

            desc: `URLs from References that contain Template "${templateName}"`,

            caption: <span>{`Contains Template "${templateName}"`}</span>,

            filterFunction: () => (url) => {
                if (!url.refs) return false
                // loop thru refs
                // if any of those refs contain templateName, return true anf exit
                if (!templateName?.length) return true  // always let URL in if templateName is empty
                return url.refs.some(r => {
                    // if any of the ref's templates contain the target templateName, return true...
                    if (!r.template_names) return false  // if ref does not have template_names property...
                    return r.template_names.includes(templateName)  // return true of templateName represented
                })

            },
        }
    }

    const getUrlBooksFilter = (bookDomain) => {

        // null bookDomain means show all url's that are books
        if (bookDomain === null) {
            return {
                desc: `URLs referencing books either alone or in a Cite Book template.`,
                caption: <span>{`Contains Books`}</span>,

                filterFunction: () => (urlObj) => {
                    // return true if this url's netloc matches the bookDomain
                    return (urlObj?.isBook)
                },
            }
        }

        // interpret no bookDomain to mean "all" filter
        if (!bookDomain?.length) {
            return null;
        }

        // return synthetic filter showing URLs that are
        // - "isBookUrl"
        // - url netloc (i.e., top domain) matches bookDomain
        return {

            desc: `URLs referencing books from "${bookDomain}", either alone or in a Cite Book template.`,

            caption: <span>{`Contains Books from "${bookDomain}"`}</span>,

            filterFunction: () => (urlObj) => {
                // return true if this url's netloc matches the bookDomain
                return (urlObj?.isBook && urlObj.netloc === bookDomain)
            },
        }
    }

    const getRefBooksFilter = (bookDomain) => {
        console.log(`getRefBooksFilter for ${bookDomain}`)

        // if bookDomain null, return function that reveals all refs that have books
        if (bookDomain === null) {
            return {
                desc: `References containing books.`,
                caption: <span>{`Contains Books`}</span>,
                filterFunction: () => (urlDict, _ref) => {
                    return _ref.hasBook
                },
            }
        }

        // if bookDomain empty string, indicate "All" filter by returning null for filtyer value
        // TODO when will this ever happen?
        if (!bookDomain?.length) {
            return null;
        }

        // otherwise return function that filters based on bookDomain provided
        return {
            desc: `References that contain "${bookDomain}" in a Cite Book template"`,
            caption: <span>{`Contains Books from "${bookDomain}"`}</span>,

            filterFunction: () => (urlDict, _ref) => {
                console.log(`getRefBooksFilter: bookDomain: ${bookDomain}`)

                if (bookDomain === noBookLink) {

                    if (!_ref.hasBook) return false

                    // if any (some) of the urls for this ref are book links, then exclude this ref
                    // from filter, as this filter wants only those references that do NOT have a book link
                    if (_ref.urls.some( url => {
                        const urlObject = urlDict[url]
                        return isBookUrl(urlObject)  // if isBookUrl true for ANY of the urls, then ".some()" is true
                    })) return false  // has links, so not a candidate for "no book link" inclusion

                    // return true if no template(s), as there are obviously no book links defined if there are no templates
                    // TODO investigate case where there are no templates but possibly ref parameters that indicate links
                    if (!_ref.templates) return true

                    // return true if any of this ref's book templates' "url" parameter is empty or missing
                    return _ref.templates?.some( myTemplate => {
                        if (bookTemplates.includes(myTemplate.name)) {
                            return !myTemplate.parameters?.url;
                        } else {
                            return false  // this is not a book template so dont bother including in "no books link" filter
                        }
                    })
                }

                // else return true if bookDomain matches any of the ref's urls.netloc
                return _ref.urls.some( url => {
                    const urlObj = urlDict[url]
                    // console.log(`filter ref: url is: ${url}, bookDomain:${bookDomain}`)
                    if (!urlObj) return false  // filter out if no urlObject
                    if (!urlObj.isBook) return false
                    // console.log(`filter result: ${urlObj.netloc === bookDomain ? "true" : "false"}`)

                    return (urlObj.netloc === bookDomain)
                })

            },

        }
    }

    const getUrlTldFilter = (tld) => {

        if (!tld || tld === '') {
            return null; // no template means all filter
        }

        // return synthetic filter showing only URLs that have specified tld
        return {
            desc: `URLs with Top Level Domain of "${tld}"`,
            caption: <span>{`Contains Top Level Domain "${tld}"`}</span>,
            filterFunction: () => (url) => {
                return url.tld === tld
            },
        }
    }

    const getRefTldFilter = (tld) => {
        if (!tld?.length) {
            return null; // no template means "all" filter
        }
        return {
            desc: `References with Links with Top Level Domain of "${tld}"`,
            caption: <span>{`Contains Links with Top Level Domain "${tld}"`}</span>,
            filterFunction: () => (urlDict, ref) => {
                return ref.urls.some( url => {
                    const urlObject = urlDict[url]
                    if (!urlObject?.tld) return false  // block if no tld
                    return urlObject.tld === tld
                })
            },
        }
    }

    const getUrlDomainFilter = (targetDomain) => {

        if (!targetDomain?.length) {  // targetDomain is falsey or empty string
            return null; // null means "all" filter
        }

        return {
            desc: `Link contains domain: "${targetDomain}"`,
            caption: `Contains "${targetDomain}" domain`,
            filterFunction: () => (url) => {
                return url?.pay_level_domain === targetDomain
                // return url?.netloc === targetDomain
            },
        }

    }

    const getRefDomainFilter = (targetDomain) => {

        if (!targetDomain?.length) {  // targetDomain is falsey or empty string
            return null; // null means "all" filter
        }

        return {
            caption: `Contains "${targetDomain}" domain`,
            desc: `Reference contains links that contain domain: "${targetDomain}"`,
            filterFunction: () => (urlDict, ref) => {
                return ref.urls.some( url => {
                    // const urlObject = urlDict[url]?
                    // return urlObject?.netloc === targetDomain
                    return urlDict[url]?.pay_level_domain === targetDomain
                })
            },
        }

    }

    const getUrlPerennialFilter = (perennialKey) => {
        if (!perennialKey || perennialKey === '') {
            return null; // null means "all" filter
        }
        // return synthetic filter showing URLs that have specified perennialKey in their rsp array
        return {
            desc: `URLs that contain Perennial "${perennialKey}"`,
            caption: <span>{`Contains Perennial "${perennialKey}"`}</span>,
            filterFunction: () => (url) => {
                // if (!perennialKey?.length) return true  // always let URL in if templateName is empty
                if (!url.rsp) return false  // if no rsp list for url, block it - it does not "belong"
                return url.rsp.includes(perennialKey)
            }
        }
    }

    // eslint-disable-next-line no-unused-vars
    const getRefPerennialFilter = (perennialKey) => {
        if (!perennialKey?.length) {
            return null; // null means "all" filter
        }
        return {
            desc: `References with Links that contain Perennial "${perennialKey}"`,
            caption: <span>{`Contains Links with Perennial "${perennialKey}"`}</span>,
            filterFunction: () => (urlDict, ref) => {
                return ref.urls.some( url => {
                    const urlObject = urlDict[url]
                    if (!urlObject?.rsp) return false  // if no rsp list for url, block it - it does not "belong"
                    return urlObject.rsp.includes(perennialKey)
                })
            },
        }
    }

    const getRefTemplateFilter = (templateName) => {

        if (!templateName || templateName === '') {
            return null; // null filter means "select all" - show all if templateName is blank
        }

        // return synthetic filter showing only URLs that have templateName in their associated citation templates
        return {
            desc: `References that contain Template "${templateName}"`,
            caption: <span>{`Contains Template "${templateName}"`}</span>,
            filterFunction: () => (urlDict, ref) => {
                // loop thru refs
                // if any of those refs contain templateName, return true and exit
                if (!templateName?.length) return true  // always let reference through if templateName is empty

                if (!ref.template_names) return false  // if ref does not have template_mames property...
                return ref.template_names.includes(templateName)  // return true of templateName represented

            },
        }
    }

    const handleRefClick = (result) => {
        // value is reference (or reference id?)(or ref index?)
        // action should be "referenceClicked"
        if (result.action === "referenceClicked") {

            console.log(`UrlDisplay: handleRefClick: result.value: ${result.value}`)
            const refIndex = result.value
            // alert(`Reference clicked - will show RefView with current filter and selected refid of: ${refId}`)
            // pass up to local handler
                    // handleAction({"action":ACTIONS_IARE.SHOW_REFERENCE_VIEWER.key, value:refIndex})
            handleAction({"action":ACTIONS_IARE.CHANGE_REF_VIEW_SELECTION.key, value:refIndex})
            // NB I know this is redundant, but leaving ot this way in case we want to
            //  massage any of the data before passing it to RefView
        }
    }


    const refArray = (pageData.references)

    console.log(`UrlDisplay: render; refFilter.caption = ${refFilter?.caption}`);


    const tooltipForUrlDisplay = <MyTooltip id="url-display-tooltip"
                                    float={true}
                                    closeOnEsc={true}
                                    delayShow={420}
                                    variant={"info"}
                                    noArrow={true}
                                    offset={5}
                                    className={"url-display-tooltip"}
                                    style={{ zIndex: 999 }}
                            />

    const testData = <>
        <div>
            <h2>test-contents</h2>
            {Array.from({length: 20}, (_, i) => {
                return <div style={{
                    display: "inline",
                    padding: ".5rem",
                    border: "1pt solid black",
                    borderRadius: ".35rem",
                    marginRight: ".35rem"
                }}>Spacer</div>
            })}

            {Array.from({length: 20}, (_, i) => {
                return <p>test data test data test data test data test data test data test data test data test data test data test data test data test data test data test data test data test data test data test data test data URL links Here!</p>
            })}
        </div>
        </>

    return <div className={"url-display-container"}>

        <div className={"url-display-header"}>

            {myConfig.isShowUrlOverview &&
                <div className={"section-box url-overview-column"}>
                    <UrlOverview pageData={pageData}
                                 options={{}}
                                 onAction={handleAction}
                                 currentState={currentState}
                                 tooltipId={"url-display-tooltip"}/>
                </div>
            }

        </div>

        <div className={"url-display-contents"}>

            {0
            ? <div className={"section-box"}>
                {testData}
            </div>

            : <div className={"section-box"}
                    style={{ pointerEvents: isRefViewModalOpen ? "none" : "auto" }}>

                <div className={"iare-ux-container"}>

                    <div className={"iare-ux-header"}>

                        <ConditionsBox
                            caption={"Conditions"}
                            conditions={currentConditions}
                            onAction={handleAction}/>

                    </div>

                    <div className={"iare-ux-body"}>

                        <div style={{display: "flex", height:'100%'}}>

                            <UrlFlock urlDict={pageData.urlDict}
                                      urlArray={pageData.urlArray}
                                      urlFilters={urlFilters}
                                      onAction={handleAction}
                                      selectedUrl={selectedUrl}
                                      fetchMethod={myConfig.urlStatusMethod}
                                      tooltipId={"url-display-tooltip"}
                            />

                            <RefFlock pageData={pageData}
                                      refArray={refArray}
                                      refFilter={refFilter}
                                      onAction={handleRefClick}
                                      options={{
                                          show_header: false,
                                          show_filter_description: false,
                                          caption: "References List",
                                      }}
                                      tooltipId={"url-display-tooltip"}
                                      context={"UrlDisplay"}

                            />
                        </div>
                    </div> {/* iare-ux-body */}
                </div> {/* iare-ux-container */}

            </div>}
         </div>

        {/* this is the popup Reference Viewer component */}
        <RefView isOpen={isRefViewModalOpen}
                 onClose={() => {
                     setIsRefViewModalOpen(false)
                 }}
                 onAction={handleAction}

                 pageData={pageData}
                 refDetails={refDetails}

                 selectedRefIndex={selectedRefIndex}
                 refFilter={refFilter}

                 tooltipId={"url-display-tooltip"}/>

        {tooltipForUrlDisplay}

    </div>
}
