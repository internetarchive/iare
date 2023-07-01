import React, {useState, useEffect, useCallback} from "react";
import MakeLink from "../../MakeLink";
import {UrlStatusCheckMethods} from "../../../constants/endpoints";
import {fetchStatusUrls, convertToBareUrls} from "../../../utils/utils";

/*
shows template urls and their status codes in a tabular form
 */
export default function RefUrls({ urls }) {
    const [urlArray, setUrlArray] = useState( [] )
    const [urlRows, setUrlRows] = useState( [] )

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

    useEffect( () => {
        if (!urls) {
            setUrlArray( [] )
            return
        }
        fetchData(urls)
            .then( results => {
                const bareUrls = convertToBareUrls(results) // currently results come "decorated" with surrounding "data : {...}"
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

    }, [urls])


    const fetchData = async (myUrls) => {

        const refresh = false;
        const timeout = 10;
        const method = UrlStatusCheckMethods.IABOT.key;
        // const method = UrlStatusCheckMethods.CORENTIN.key;
        // const method = UrlStatusCheckMethods.IARI.key;

        return await fetchStatusUrls({
            urlArray: myUrls,
            refresh: refresh,
            timeout: timeout,
            method: method
        })

    }

    const urlHeaderRow = <>
        <tr>
            <th className={'ref-view-url-name'}><h3 className={"urls-header"}>Urls</h3></th>
            <th className={'ref-view-url-status'}>Status</th>
        </tr>
    </>

    return <div className="ref-view-urls-wrapper">
        <table className={'ref-view-urls'}>
            <thead>
            {urlHeaderRow}
            </thead>
            <tbody>
            {urlRows}
            </tbody>
        </table>


    </div>
}

