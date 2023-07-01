import React, {useCallback, useEffect, useState} from 'react';
import UrlFlock from "./UrlFlock";
import UrlOverview from "./UrlOverview";
import '../shared/urls.css';
import RefFlock from "./RefFlock";


export default function UrlDisplay ({ pageData, options, caption = "URLs", filterMap } ) {

    console.log("UrlDisplay: render");

    const [urlFilter, setUrlFilter] = useState( null ); // filter to pass in to UrlFlock

    // const [urlArray, setUrlArray] = useState([]);
    const [urlStatistics, setUrlStatistics] = useState({});

    const [refFilter, setRefFilter] = useState( null ); // filter to pass in to RefFlock
    const [selectedUrl, setSelectedUrl] = useState('');


    // calculate url stats
    useEffect( () => {

        const urlCounts = (!pageData || !pageData.urlArray)
            ? []
            : Object.keys(filterMap).map( key => {
                const f = filterMap[key];
                const count = pageData.urlArray.filter((f.filterFunction)()).length; // Note the self-evaluating filterFunction!
                return {
                    label: f.caption + " (" + count + ")",
                    count: count,
                    link: key
                }
            })

        setUrlStatistics({urlCounts: urlCounts});

    }, [pageData, filterMap])


    // result is an object: { action: <action name>, value: <param value> }
    const handleAction = useCallback( result => {
        const {action, value} = result;
        console.log (`UrlDisplay: handleAction: action=${action}, value=${value}`);

        // action is setFilter and value is filter key name
        if (action === "setFilter") {
            const f = value ? filterMap[value] : null
            setUrlFilter(f)
        }

        // use selected url to filter references list
        if (action === "setUrlReferenceFilter") {
            // value is url to filter references by
            setRefFilter(getUrlRefFilter(value))
            setSelectedUrl(value)
        }

        // clear filter for references list
        if (action === "removeReferenceFilter") {
            // value is url to filter references by
            setRefFilter(getUrlRefFilter(''))
            setSelectedUrl(null)
        }

        // clear filter for URL list
        if (action === "removeUrlFilter") {
            setUrlFilter(null)
            setSelectedUrl(null)
        }


        // TODO: Action for setReferenceFilter/ShowReference for filtered URLS
    }, [filterMap])


    if (!pageData) return null;



    // TODO candidate for external shared function
    // TODO allow array of Urls in targetUrl(s)
    const getUrlRefFilter = (targetUrl) => {

        if (!targetUrl || targetUrl === '') {
            // return {
            //     caption: `Show All`,
            //     desc: `Show ALl Citations`,
            //     filterFunction: () => (d) => {
            //         return true;
            //     },
            // }
            return null; // no filter means all filter
        }

        return {
            caption: <span>Contains URL: <br/><span className={'target-url'}
                ><a href={targetUrl} target={"_blank"} rel={"noreferrer"}>{targetUrl}</a
                ></span></span>,
            desc: `Citations with URL: ${targetUrl}`,
            filterFunction: () => (d) => {
                return d.urls.includes( targetUrl )
            },
        }
    }


    // eslint-disable-next-line no-unused-vars
    const handleCopyClick = () => {
        const convertToCSV = (json) => {
            const rows = json.map((row) => {

                const myRowItems = row.map( (item) => {
                    // from: https://stackoverflow.com/questions/46637955/write-a-string-containing-commas-and-double-quotes-to-csv
                    // We remove blanks and check if the item contains
                    // other whitespace,`,` or `"`.
                    // In that case, we need to quote the item.


                    if (typeof item === 'string') {
                        if (item.replace(/ /g, '').match(/[\s,"]/)) {
                            return '"' + item.replace(/"/g, '""') + '"';
                        }
                        return item
                    } else {
                        return item
                    }
                })
                return myRowItems.join(',');
            });
            return rows.join('\n');
        };

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

                        // const refArray = (!pageData || !pageData.dehydrated_references)
                        //     ? []
                        //     : pageData.dehydrated_references
                        // // TODO: change this to references
    const refArray = (pageData.references)

    const urlListCaption = <h3>URL List</h3>
    const extraCaption = <h4 style={{fontStyle:"italic",fontWeight:"bold"}}>Click URL below to filter References List</h4>

    return <>

        <div className={"section-box url-overview-column"}>
            <h3>{caption}</h3>
            <UrlOverview statistics={urlStatistics} onAction={handleAction}/>
        </div>

        <div className={"section-box"}>
            {urlListCaption}
            <UrlFlock urlArray={pageData.urlArray} urlFilterDef={urlFilter}
                      onAction={handleAction} selectedUrl={selectedUrl} extraCaption={extraCaption}/>
        </div>

        <div className={"section-box"}>
            <h3>References List</h3>
            <RefFlock refArray={refArray} refFilterDef={refFilter} onAction={handleAction}/>
        </div>

      </>
}
