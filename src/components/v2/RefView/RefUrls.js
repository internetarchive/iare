import React, {useState, useEffect, useCallback} from "react";
import MakeLink from "../../MakeLink";
import {convertUrlArray} from "../../../utils/utils";
import {fetchStatusUrls} from "../../../utils/iariUtils";
// import {UrlStatusCheckContext} from "../../../contexts/UrlStatusCheckContext"
import {ConfigContext} from "../../../contexts/ConfigContext";

/*
shows template urls and their status codes in a tabular form
 */
export default function RefUrls({ urls }) {
    const [urlArray, setUrlArray] = useState( [] )
    const [urlRows, setUrlRows] = useState( [] )

    const myConfig = React.useContext(ConfigContext);
    const myIariBase = myConfig?.iariSource;
    const myStatusMethod = myConfig?.urlStatusMethod;


    // create display components (table, tr, and td) for array of url objects
    const urlsToRows = useCallback( (urlObjects=[]) => {
        return urlObjects
            ? urlObjects.map( u => {
                const classes = (u.status_code === 0 ? ' url-is-unknown'
                        : u.status_code >= 200 && u.status_code < 300 ? ' url-is-success'
                        : u.status_code >= 300 && u.status_code < 400 ? ' url-is-redirect'
                        : u.status_code >= 400 && u.status_code < 500 ? ' url-is-notfound'
                        : u.status_code >= 500 && u.status_code < 600 ? ' url-is-error'
                        : '')

                return <tr key={u.url} className={classes}>
                    <td><MakeLink href={u.url} /></td>
                    <td><div>{u.status_code}</div></td>
                </tr>
                }
            )

            // if urlObjects is undefined...TODO this NOT a good way to present errors to the user!
            : <tr>
            <td>URL data undefined</td>
            <td>-</td>
            </tr>

    }, [])

    useEffect( () => {
        setUrlRows(urlsToRows(urlArray))
    }, [urlArray, urlsToRows] )

    // fetch status codes for all URLs in urls array
    useEffect( () => {
        if (!urls) {
            setUrlArray( [] )
            return
        }

        // fetchData(urls)
        fetchStatusUrls({
            iariBase: myIariBase,
            urlArray: urls,
            refresh: false,
            timeout: 10,
            method: myStatusMethod
            })

            .then( results => {
                const bareUrls = convertUrlArray(results) // currently results come "decorated" with surrounding "data : {...}"
                setUrlArray(bareUrls)
                }
            )

            .catch( error => {
                    setUrlArray( [] )
                }
            )
            .finally( () => {

                }
            )

    }, [urls, myStatusMethod])


    const urlsDisplay =
        <table className={'ref-view-urls'}>
            <thead>
            <tr>
                <th className={'ref-view-url-name'}><h3 className={"urls-header"}>Urls</h3></th>
                <th className={'ref-view-url-status'}>Status</th>
            </tr>
            </thead>
            <tbody>
            {urlRows}
            </tbody>
        </table>

    return <div className="ref-view-urls-wrapper">
        {urlsDisplay}
    </div>
}

