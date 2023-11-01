import React, {useCallback, useEffect, useState} from 'react';
import UrlFlock from "./UrlFlock";
import RefFlock from "./RefFlock";
import UrlOverview from "./UrlOverview";
import '../shared/urls.css';
// import {convertToCSV, copyToClipboard} from "../../utils/utils";
import {REF_LINK_STATUS_FILTERS} from "./filters/refFilterMaps";
import {URL_ACTION_FILTER_MAP} from "./filters/urlFilterMaps";
import {ConfigContext} from "../../contexts/ConfigContext";
import FilterButtons from "../FilterButtons";
// import {UrlStatusCheckMethods} from "../../constants/endpoints";

const localized = {
    "URLs":"URLs",
    "Actionable": "Actionable",
}

function ActionFilters( {filterSet=null, filterRender, flock = [], onAction, options = {}, className = null}) {
    const handleActionable = (actionable) => {
        onAction({
            action: "setUrlActionFilter", value: actionable,
        })
    }

    return <>
        <h4 style={{fontStyle: "italic", fontWeight: "bold"}}>Actionable</h4>
        <div className={className}>
            <FilterButtons
                flock={flock}
                filterMap={filterSet}
                onClick={handleActionable}
                caption=''
                currentFilterName=''
                onRender={filterRender}
            />
        </div>
    </>

    // return = <>
    //     <h4>{localized.Actionable}<span className={"inferior"}
    //     > - These are the things that can be fixed right now</span></h4>
    //
    //     <button>Show Original Status bad, but Cite status is live</button>
    //     {/*<p>if the original link is dead, this is the action yuou can take</p>*/}
    //     <div>filter for Citations / General / All ?</div>
    //     <div>some more filters here...</div>
    //     <div>&nbsp;</div>
    // </>

}



export default function UrlDisplay ({ pageData, options, urlStatusFilterMap= {}, urlArchiveFilterDefs = {} } ) {
    // pageData.urlArray is filtered and displayed
    // urlStatusFilterMap and urlArchiveFilterDefs describe available filters that we show here

    const [urlStatistics, setUrlStatistics] = useState({});
    const [urlFilters, setUrlFilters] = useState( null ); // keyed object of url filters to pass in to UrlFlock  TODO: implement UrlFilter custom objects
    const [refFilter, setRefFilter] = useState( null ); // filter to pass in to RefFlock
    const [selectedUrl, setSelectedUrl] = useState(''); // currently selected url in url list

    let myConfig = React.useContext(ConfigContext);
    myConfig = myConfig ? myConfig : {} // prevents undefined.<param> errors

    // calculate url stats
    useEffect( () => {

        // calc counts for each filter of urlFilterMaps
        const urlCounts = (!pageData || !pageData.urlArray)
            ? []
            : Object.keys(urlStatusFilterMap).map(key => {
                const f = urlStatusFilterMap[key];
                const count = pageData.urlArray.filter((f.filterFunction)()).length; // Note the self-evaluating filterFunction!
                return {
                    label: f.caption + " (" + count + ")",
                    count: count,
                    link: key
                }
            })

        setUrlStatistics({urlCounts: urlCounts});

    }, [pageData, urlStatusFilterMap, urlArchiveFilterDefs, ])


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

                    // if (action === "setArchiveStatusFilter") {
                    //     // TODO: this will eventually NOT take a filter index name, but rather a filter itself,
                    //     // TODO similar to action "setUrlReferenceFilter"
                    //     // value is filter key name
                    //     const f = value ? urlArchiveFilterMap[value] : null
                    //     setUrlFilters({ "archive_status" : f })
                    // }
                    //

        if (action === "setArchiveStatusFilters") {
            setUrlFilters({ "archive_status" : value })  // NB: value is filter object
        }


        if (action === "setUrlReferenceFilter") {
            // filter References to those that contain a url specified by the value parameter
            setRefFilter(getUrlRefFilter(value))
            setSelectedUrl(value)
        }

        if (action === "setUrlActionFilter") {
            // filter References to those that adhere to certain action conditions
            const f = value ? URL_ACTION_FILTER_MAP[value] : null
            setUrlFilters( { "action_filter": f } )
        }

        if (action === "setLinkStatusFilter") {
            // use value as link status to filter references with

            const f = value ? REF_LINK_STATUS_FILTERS[value] : null
            setRefFilter(f)

            // TODO: some sort of feedback? selected filter?
        }

        if (action === "removeUrlFilter") {
            // clear filter (show all) for URL list
            setUrlFilters(null)
            setSelectedUrl(null)
        }

        if (action === "removeReferenceFilter") {
            // clear filter (show all) for references list
            setRefFilter(null)
            setSelectedUrl(null)
        }


        // TODO: Action for setReferenceFilter/ShowReference for filtered URLS
        // i.e. show all refs that contain ANY of the URLS in the filtered URL list

    }, [urlStatusFilterMap])


    if (!pageData) return null;


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
            <div className={'filter-count'}>{props.filter?.count}</div>
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

    const refArray = (pageData.references)

    // const copyButton = <button onClick={handleCopyClick} className={'utility-button'} ><span>Copy to Clipboard</span></button>

    // const urlListCaption = <h3>URL List{myConfig.isDebug ? copyButton : null }</h3>
    const extraUrlCaption = <h4 style={{fontStyle:"italic",fontWeight:"bold"}}>Click a URL to show References using that URL</h4>
    const extraRefCaption = <h4 style={{fontStyle:"italic",fontWeight:"bold"}}>Click on Reference to view details</h4>

    console.log("UrlDisplay: render");


    return <>

        <div className={"section-box"}>
            <h3>{localized.URLs}</h3>

            <ActionFilters
                filterSet={URL_ACTION_FILTER_MAP}
                filterRender={renderUrlActionButton}
                flock={pageData.urlArray}
                onAction={handleAction}
                options ={{}}
                className={"url-action-filter-buttons"}
            />

            <UrlFlock urlArray={pageData.urlArray}
                      urlFilters={urlFilters}
                      onAction={handleAction}
                      selectedUrl={selectedUrl}
                      extraCaption={extraUrlCaption}
                      fetchMethod={myConfig.urlStatusMethod} />
        </div>

        <div className={"section-box"}>
            <h3>References List</h3>
            <RefFlock refArray={refArray} refFilterDef={refFilter} onAction={handleAction} extraCaption={extraRefCaption} />
        </div>

        <div className={"section-box url-overview-column"}>
            <h3>Filters</h3>
            <UrlOverview pageData={pageData} statistics={urlStatistics} onAction={handleAction}/>
        </div>


    </>
}
