import React, {useCallback, useState} from 'react';
import UrlFlock from "./UrlFlock";
import RefFlock from "./RefFlock";
import UrlOverview from "./UrlOverview";
import '../shared/urls.css';
import '../shared/filters.css';
import {ACTIONABLE_FILTER_MAP} from "./filterMaps/urlFilterMaps";
import {ConfigContext} from "../../contexts/ConfigContext";
import FilterButtons from "../FilterButtons";
import ChoiceFetch from "../ChoiceFetch";
import RefView from "./RefView/RefView";
import {Tooltip as MyTooltip} from "react-tooltip";

const localized = {
    "url_display_title":"URLs",
    "Actionable": "Actionable",
    "show_links": " - Show Links from Citations that can be improved right now"
}

function ActionFilters( {filterSet= null, filterRender, flock = [], onAction, options = {}, currentFilterName = '', tooltipId='', className = null}) {
    const handleActionable = (actionable) => {
        onAction({
            action: "setUrlActionFilter", value: actionable,
        })
    }


    return <FilterButtons
        flock={flock}  // flock set to count filters against
        filterMap={filterSet}
        onClick={handleActionable}
        caption={null}
        currentFilterName={currentFilterName}  // sets "pressed" default selection
        className={className}
        tooltipId={tooltipId}
        onRender={filterRender}  // how to render each button
    />

}


export default function UrlDisplay ({ pageData, options, urlStatusFilterMap= {}, urlArchiveFilterMap = {} } ) {
    // pageData.urlArray displayed with UrlFlock with filter maps applied

    const [urlFilters, setUrlFilters] = useState( null ); // keyed object of url filters to pass in to UrlFlock  TODO: implement UrlFilter custom objects
    const [refFilter, setRefFilter] = useState( null ); // filter to pass in to RefFlock
    const [selectedUrl, setSelectedUrl] = useState(''); // currently selected url in url list
    const [selectedUrlActionFilterName, setSelectedUrlActionFilterName] = useState('')
    const [selectedCitationType, setSelectedCitationType] = useState('')

    const [openModal, setOpenModal] = useState(false)
    const [refDetails, setRefDetails] = useState(null);

    let myConfig = React.useContext(ConfigContext);
    myConfig = myConfig ? myConfig : {} // prevents "undefined.<param>" errors
    const myIariBase = myConfig?.iariSource;


    const fetchReferenceDetail = useCallback( (ref) => {
        // handle null ref
        if (!ref) {
            setRefDetails("Trying to fetch invalid reference");
            return;
        }

        const myEndpoint = `${myIariBase}/statistics/reference/${ref.id}`;
        const data = ref
        data.endpoint = myEndpoint;
        setRefDetails(data);
        setOpenModal(true)
    }, [myIariBase])


    // callback from sub-components that induce actions upon flocks.
    // result is an object:
    //  {
    //      action: <action name>,
    //      value: <param value>
    //  }
    const handleAction = useCallback( result => {
        const {action, value} = result;
        console.log (`UrlDisplay: handleAction: action=${action}, value=${value}`);

        if (action === "setUrlStatusFilter") {
            // value is filter key name
            const f = value ? urlStatusFilterMap[value] : null
            setUrlFilters({ "url_status" : f })
        }

                    // else if (action === "setArchiveStatusFilter") {
                    //     // TODO: this will eventually NOT take a filter index name, but rather a filter itself,
                    //     // TODO similar to action "setUrlReferenceFilter"
                    //     // value is filter key name
                    //     const f = value ? urlArchiveFilterMap[value] : null
                    //     setUrlFilters({ "archive_status" : f })
                    // }
                    //

        else if (action === "showRefsForUrl") {
            // value is url key name
            const myRef = pageData.urlDict[value]?.refs[0] // for now...shall pass entire array soon
            fetchReferenceDetail(myRef)

            // also set Ref filter
            setRefFilter(getUrlRefFilter(value))

            setSelectedUrl(value)
        }

        else if (action === "setArchiveStatusFilters") {
            setUrlFilters({ "archive_status_filter" : value })  // NB: value is filter object
        }


        else if (action === "setUrlReferenceFilter") {
            // filter References to those that contain a url specified by the value parameter
            setRefFilter(getUrlRefFilter(value))
            setSelectedUrl(value)
        }

        else if (action === "setUrlActionFilter") {
            // filter References as determined by action.value as key into actionable filter map
            const f = value ? ACTIONABLE_FILTER_MAP[value] : null
            setUrlFilters( { "action_filter": f } )
            setSelectedUrlActionFilterName(value)
        }

        else if (action === "removeUrlFilter") {
            // clear filter (show all) for URL list
            setUrlFilters(null)
            setSelectedUrl(null)
            setSelectedUrlActionFilterName(null)
        }

        else if (action === "removeReferenceFilter") {
            // clear filter (show all) for references list
            setRefFilter(null)
            setSelectedUrl(null)
        }

        else if (action === "setTemplateFilter") {
            console.log (`UrlDisplay: handleAction: setting templateFilter for ${value}`);
            // filter URLs (and references?) if they include template indicated by "value" argument"
            setUrlFilters({ "url_template_filter" : getUrlTemplateFilter(value) })
            setSelectedUrl(null)

            // and also do the references
            setRefFilter(getRefTemplateFilter(value))

        }

        else if (action === "setTldFilter") {
            console.log (`UrlDisplay: handleAction: setting tld filter for ${value}`);
            // only filter urls (for now)
            setUrlFilters({ "url_tld_filter" : getUrlTldFilter(value) })
            setSelectedUrl(null)
        }

        else if (action === "setPerennialFilter") {
            console.log (`UrlDisplay: handleAction: setting perennialFilter for ${value}`);
            // filter URLs (and references?) if they include perennial indicated by "value" argument"
            setUrlFilters({ "url_perennial_filter" : getUrlPerennialFilter(value) })
            setSelectedUrl(null)

            // and also do the references
            // setRefFilter(getRefPerennialFilter(value))

        }

        else {
            console.log(`Action "${action}" not supported.`)
            alert(`Action "${action}" not supported.`)
        }

        // TODO: Action for setReferenceFilter/ShowReference for filtered URLS
        // i.e. show all refs that contain ANY of the URLS in the filtered URL list

    }, [urlStatusFilterMap, fetchReferenceDetail, pageData.urlDict])


    if (!pageData) return null;  /// NB must be put AFTER useEffect and useCallback, as these hooks cannot after conditional statements


    const handleCitationTypeChange = (e) => {
        const citationType = e.target.value
        console.log("Citation type changed to: " + citationType + ", take appropriate filter action")
        setSelectedCitationType(citationType)
    }



    const renderUrlActionButton = (props) => {
        /*
        callback for button render function of <FilterButton>
        expects:
            props.filter.caption
            props.filter.count
        */

        // TODO put in some element data for tooltip, like filter.desc
        // TODO Question: where does tool tip come from? is it generic tooltip for the page?
        return <>
            <div>{props.filter?.caption}</div>
            <div className={'filter-count'}>{props.filter?.count} items</div>
        </>
    }



    // TODO candidate for external shared function
    // TODO allow targetUrl(s) to be an array of Urls
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

            filterFunction: () => (d) => {
                // TODO make this use an array of targetUrls
                return d.urls.includes( targetUrl )
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
                // loop thru refs
                // if any of those refs contain templateName, return true anf exit
                if (!templateName?.length) return true  // always let URL in if templateName is empty
                return url.refs.some(r => {
                    // if any of the ref's templates contain the target templateName, return true...
                    if (!r.template_names) return false  // if ref does not have template_mames property...
                    return r.template_names.includes(templateName)  // return true of templateName represented
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

    const getUrlPerennialFilter = (perennialKey) => {
        if (!perennialKey || perennialKey === '') {
            return null; // null means "all" filter
        }
        // return synthetic filter showing only URLs that have perennialKey in their rsp array
        return {
            desc: `URLs that contain Perennial "${perennialKey}"`,
            caption: <span>{`Contains Perennial "${perennialKey}"`}</span>,
            filterFunction: () => (url) => {
                // loop thru refs
                // if any of those refs contain templateName, return true anf exit
                if (!perennialKey?.length) return true  // always let URL in if templateName is empty
                if (!url.rsp) return true  // let it through if there is no rsp list
                return url.rsp.includes(perennialKey)
            }
        }
    }

    // eslint-disable-next-line no-unused-vars
    const getRefPerennialFilter = (perennialKey) => {
        if (!perennialKey || perennialKey === '') {
            return null; // null means "all" filter
        }

        return null  // for now, until we settle down with Ref objects

                    // // return synthetic filter showing only Refs that have urls that are associated with perennialKey
                    // return {
                    //
                    //     desc: `References that contain URLs with perennial "${perennialKey}"`,
                    //
                    //     caption: <span>{`Contains URLs with perennial "${perennialKey}"`}</span>,
                    //
                    //     filterFunction: () => (ref) => {
                    //         // loop thru refs
                    //         // if any of those refs contain templateName, return true anf exit
                    //         if (!perennialKey?.length) return true  // always let reference through if templateName is empty
                    //
                    //         // return true if ANY (.some) of the urls include the perennialKey in their rsp array
                    //
                    //         return ref.urlObjs.some(url => {
                    //             // if any of the ref's templates contain the target templateName, return true...
                    //             if (!url.rsp) return true  // let it through if there is no rsp list
                    //             return url.rsp.includes(perennialKey)
                    //         })
                    //
                    //     },
                    // }
    }

    const getRefTemplateFilter = (templateName) => {

        if (!templateName || templateName === '') {
            return null; // null filter means "select all" - show all if templateName is blank
        }

        // return synthetic filter showing only URLs that have templateName in their associated citation templates
        return {

            desc: `References that contain Template "${templateName}"`,

            caption: <span>{`Contains Template "${templateName}"`}</span>,

            filterFunction: () => (ref) => {
                // loop thru refs
                // if any of those refs contain templateName, return true anf exit
                if (!templateName?.length) return true  // always let reference through if templateName is empty

                if (!ref.template_names) return false  // if ref does not have template_mames property...
                return ref.template_names.includes(templateName)  // return true of templateName represented

                            // return url.refs.some(r => {
                            //     // if any of the ref's templates contain the target templateName, return true...
                            //     if (!r.template_names) return false  // if ref does not have template_mames property...
                            //     return r.template_names.includes(templateName)  // return true of templateName represented
                            // })

            },
        }
    }

    const citationTypes = {
        "footnotes": {
            caption: "Footnotes",
            value: "footnotes"
        },
        "sections": {
            caption: "Other Sections",
            value: "sections"
        },
        "all": {
            caption: "All",
            value: "all"
        },
    }

    const refArray = (pageData.references)

    // const copyButton = <button onClick={handleCopyClick} className={'utility-button'} ><span>Copy to Clipboard</span></button>

    // const urlListCaption = <h3>URL List{myConfig.isDebug ? copyButton : null }</h3>
    const extraUrlCaption = <h4 style={{fontStyle:"italic",fontWeight:"bold"}}>Click a URL row to show References using that URL</h4>
    const extraRefCaption = <h4 style={{fontStyle:"italic",fontWeight:"bold"}}>Click on Reference to view details</h4>

    console.log("UrlDisplay: render");

    const showChoiceFetch = false;

    const actionableTooltip = <MyTooltip id="tooltip-actionable"
                               float={true}
                               closeOnEsc={true}
                               delayShow={420}
                               variant={"info"}
                               noArrow={true}
                               offset={5}
                               className={"tooltip-actionable"}
    />

    const actionables = <h4 className={"box-caption"}>{localized.Actionable}<span className={"inferior"}>{localized.show_links}</span></h4>

    const urlFlockHeadMatter = <>
        {false && <h3>{localized.url_display_title}</h3>}

        {showChoiceFetch
            ? <div className={"row"}>
                <div className={"col-9"}>
                    <ActionFilters
                        filterSet={ACTIONABLE_FILTER_MAP}
                        filterRender={renderUrlActionButton}
                        flock={pageData.urlArray}
                        onAction={handleAction}
                        options ={{}}
                        currentFilterName={selectedUrlActionFilterName}
                        className={'url-action-filter-buttons'}
                        tooltipId={'tooltip-actionable'}
                    />
                </div>
                <div className={"col-3"}>
                    <ChoiceFetch
                        choices={citationTypes}
                        selectedChoice={selectedCitationType}
                        options={{
                            caption:<h4>Show Citations from: </h4>,
                            className:"citation-choices"
                        }}
                        onChange={handleCitationTypeChange} />
                </div>
            </div>

            : <ActionFilters
                filterSet={ACTIONABLE_FILTER_MAP}
                filterRender={renderUrlActionButton}
                flock={pageData.urlArray}
                onAction={handleAction}
                options ={{}}
                currentFilterName={selectedUrlActionFilterName}
                className={"url-action-filter-buttons"}
                tooltipId={'tooltip-actionable'}
            />
        }
        </>

    // setup url stats

    // calc counts for each filter of url status filter maps
    const urlCounts = (!pageData?.urlArray?.length)
        ? []
        : Object.keys(urlStatusFilterMap).map(key => {
            const f = urlStatusFilterMap[key];
            const count = pageData.urlArray.filter((f.filterFunction)()).length; // Note the self-evaluating filterFunction!
            return {
                label: f.caption,
                count: count,
                link: key
            }
        })

    pageData.url_status_statistics = {urlCounts: urlCounts}

    return <>

        {myConfig.isShowUrlOverview && <div className={"section-box url-overview-column"}>
            <UrlOverview pageData={pageData} options={{}} onAction={handleAction}/>
        </div>}


        <div className={"section-box"}>
            {actionableTooltip}

            {actionables}

            {urlFlockHeadMatter}

            <UrlFlock urlArray={pageData.urlArray}
                      urlFilters={urlFilters}
                      onAction={handleAction}
                      selectedUrl={selectedUrl}
                      extraCaption={extraUrlCaption}
                      fetchMethod={myConfig.urlStatusMethod} />
        </div>


        {myConfig.isShowReferences && /* References List is tentative - may go away soon... */
        <div className={"section-box"}>
            <h4 className={"box-caption"}>References List</h4>
            <RefFlock refArray={refArray} refFilterDef={refFilter} onAction={handleAction} extraCaption={extraRefCaption} />
        </div>}


        <RefView details={refDetails} open={openModal} onClose={() => setOpenModal(false)} />

    </>
}
