import React, {useCallback, useEffect, useState} from 'react';
import UrlFlock from "./UrlFlock";
import RefFlock from "./RefFlock";
import UrlOverview from "./UrlOverview";
import '../shared/urls.css';
import {convertToCSV} from "../../utils/utils";
import {REF_LINK_STATUS_FILTERS} from "./filters/refFilterMaps";


export default function UrlDisplay ({ pageData, options, urlFilterMap = {} } ) {

    console.log("UrlDisplay: render");

    const [urlStatistics, setUrlStatistics] = useState({});
    const [urlFilter, setUrlFilter] = useState( null ); // filter to pass in to UrlFlock
    const [refFilter, setRefFilter] = useState( null ); // filter to pass in to RefFlock
    const [selectedUrl, setSelectedUrl] = useState(''); // currently selected url in url list


    // calculate url stats
    useEffect( () => {

        // calc counts for each filter of urlFilterMaps
        const urlCounts = (!pageData || !pageData.urlArray)
            ? []
            : Object.keys(urlFilterMap).map( key => {
                const f = urlFilterMap[key];
                const count = pageData.urlArray.filter((f.filterFunction)()).length; // Note the self-evaluating filterFunction!
                return {
                    label: f.caption + " (" + count + ")",
                    count: count,
                    link: key
                }
            })

        setUrlStatistics({urlCounts: urlCounts});

    }, [pageData, urlFilterMap])


    // callback from sub-components.
    // result is an object like:
    //  {
    //      action: <action name>,
    //      value: <param value>
    //  }
    const handleAction = useCallback( result => {
        const {action, value} = result;
        console.log (`UrlDisplay: handleAction: action=${action}, value=${value}`);

        if (action === "setFilter") {
            // value is filter key name
            const f = value ? urlFilterMap[value] : null
            setUrlFilter(f)
        }

        if (action === "removeUrlFilter") {
            // clear filter (show all) for URL list
            setUrlFilter(null)
            setSelectedUrl(null)
        }

        if (action === "setUrlReferenceFilter") {
            // filter references list to those that contain a specific.
            // The url is specified by the value parameter
            setRefFilter(getUrlRefFilter(value))
            setSelectedUrl(value)
        }

        if (action === "removeReferenceFilter") {
            // clear filter (show all) for references list
            setRefFilter(null)
            setSelectedUrl(null)
        }

        if (action === "setLinkStatusFilter") {
            // use value as link status to filter references with

            const f = value ? REF_LINK_STATUS_FILTERS[value] : null
            setRefFilter(f)

            // setRefFilter({
            //     desc: `Citations with Link Status: ${value}`,
            //
            //     caption: <span>Link Status is {value}</span>,
            //
            //     filterFunction: () => (d) => {
            //         return d.link_status.includes(value)
            //     }
            // })

            // TODO: some sort of feedback? selected filter?
        }


        // TODO: Action for setReferenceFilter/ShowReference for filtered URLS
        // i.e. show all refs that contain ANY of the URLS in the filtered URL list

    }, [urlFilterMap])


    if (!pageData) return null;



    // TODO candidate for external shared function
    // TODO allow array of Urls in targetUrl(s)
    const getUrlRefFilter = (targetUrl) => {

        if (!targetUrl || targetUrl === '') {
            return null; // no filter means all filter
        }

        return {
            desc: `Citations with URL: ${targetUrl}`,

            caption: <span>Contains URL: <br/><span className={'target-url'}
                ><a href={targetUrl} target={"_blank"} rel={"noreferrer"}>{targetUrl}</a
                ></span></span>,

            filterFunction: () => (d) => {
                return d.urls.includes( targetUrl )
            },
        }
    }


    // eslint-disable-next-line no-unused-vars
    const handleCopyClick = () => { // used to copy url list and status

        // get one row per line:
        const jsonData = pageData.urlArray.sort(
            (a, b) => (a.data.url > b.data.url) ? 1 : (a.data.url < b.data.url) ? -1 : 0
        ).map( u => {
            return [ u.data.url, u.data.status_code ]
        })

        // convert to CSV and send to clipboard
        const csvString = convertToCSV(jsonData);

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

    const urlListCaption = <h3>URL List</h3>
    const extraUrlCaption = <h4 style={{fontStyle:"italic",fontWeight:"bold"}}>Click a URL to show References using that URL</h4>
    const extraRefCaption = <h4 style={{fontStyle:"italic",fontWeight:"bold"}}>Click a Reference to view reference details</h4>

    return <>

        <div className={"section-box url-overview-column"}>
            <h3>Filters</h3>
            <UrlOverview pageData={pageData} statistics={urlStatistics} onAction={handleAction}/>
        </div>

        <div className={"section-box"}>
            {urlListCaption}
            <UrlFlock urlArray={pageData.urlArray} urlFilterDef={urlFilter}
                      onAction={handleAction} selectedUrl={selectedUrl} extraCaption={extraUrlCaption}/>
        </div>

        <div className={"section-box"}>
            <h3>References List</h3>
            <RefFlock refArray={refArray} refFilterDef={refFilter} onAction={handleAction} extraCaption={extraRefCaption} />
        </div>

      </>
}
