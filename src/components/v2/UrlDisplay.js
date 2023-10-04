import React, {useCallback, useEffect, useState} from 'react';
import UrlFlock from "./UrlFlock";
import RefFlock from "./RefFlock";
import UrlOverview from "./UrlOverview";
import '../shared/urls.css';
import {convertToCSV} from "../../utils/utils";
import {REF_LINK_STATUS_FILTERS} from "./filters/refFilterMaps";
import {ConfigContext} from "../../contexts/ConfigContext";
import {UrlStatusCheckMethods} from "../../constants/endpoints";


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


    // callback from sub-components.
    // result is an object like:
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
            // value is filter definition itself
            setUrlFilters({ "archive_status" : value })
        }


        if (action === "setUrlReferenceFilter") {
            // filter References to those that contain a url specified by the value parameter
            setRefFilter(getUrlRefFilter(value))
            setSelectedUrl(value)
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


    // eslint-disable-next-line no-unused-vars
    const handleCopyClick = () => { // used to copy url list and status

        // get one row per line:
        const urlArrayData = pageData.urlArray.sort(
            (a, b) => (a.url > b.url) ? 1 : (a.url < b.url) ? -1 : 0
        ).map( u => {
            if (myConfig.urlStatusMethod === UrlStatusCheckMethods.IABOT.key) {
                return [ u.url, u.status_code, u.status_code_error_details, u.searchurldata_status ]
            } else {
                return [ u.url, u.status_code, u.status_code_error_details ]
            }

        })
        if (myConfig.urlStatusMethod === UrlStatusCheckMethods.IABOT.key) {
            urlArrayData.unshift( [ 'URL', `${myConfig.urlStatusMethod} status`, `error details`, "IABOT searchurlstatus" ] )
        } else {
            urlArrayData.unshift( [ 'URL', `${myConfig.urlStatusMethod} status`, `error details` ] )
        }

        // convert to CSV and send to clipboard
        const csvString = convertToCSV(urlArrayData);

        navigator.clipboard.writeText(csvString)
            .then(() => {
                console.log('CSV data copied to clipboard');
                alert(`CSV data copied to clipboard.`);
            })
            .catch((error) => {
                console.error('Failed to copy CSV data to clipboard:', error);
                alert(`Failed to copy CSV data to clipboard: ${error}`);
            });
    }

    const refArray = (pageData.references)

    const copyButton = <button onClick={handleCopyClick} className={'utility-button'} ><span>Copy to Clipboard</span></button>

    const urlListCaption = <h3>URL List{myConfig.isDebug ? copyButton : null }</h3>
    const extraUrlCaption = <h4 style={{fontStyle:"italic",fontWeight:"bold"}}>Click a URL to show References using that URL</h4>
    const extraRefCaption = <h4 style={{fontStyle:"italic",fontWeight:"bold"}}>Click a Reference to view reference details</h4>

    console.log("UrlDisplay: render");

    return <>

        <div className={"section-box url-overview-column"}>
            <h3>Filters</h3>
            <UrlOverview pageData={pageData} statistics={urlStatistics} onAction={handleAction}/>
        </div>

        <div className={"section-box"}>
            {urlListCaption}
            <UrlFlock urlArray={pageData.urlArray} urlFilters={urlFilters}
                      onAction={handleAction} selectedUrl={selectedUrl} extraCaption={extraUrlCaption}
                      fetchMethod={myConfig.urlStatusMethod} />
        </div>

        <div className={"section-box"}>
            <h3>References List</h3>
            <RefFlock refArray={refArray} refFilterDef={refFilter} onAction={handleAction} extraCaption={extraRefCaption} />
        </div>

      </>
}
