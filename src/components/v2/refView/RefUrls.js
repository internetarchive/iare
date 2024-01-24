import React, {useState, useEffect, useCallback} from "react";
import MakeLink from "../../MakeLink";
import {normalizeUrlArray} from "../../../utils/utils";
import {fetchUrls} from "../../../utils/iariUtils";
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

//    https://iabot.wmcloud.org/index.php?page=manageurlsingle&url=http%3A%2F%2Findigenouspeoplesissues.com%2Findex.php%3Foption%3Dcom_content%26view%3Darticle%26id%3D14679%3Arapanui-protests-continue-against-the-hotel-hanga-roa%26catid%3D23%3Asouth-america-indigenous-peoples%26Itemid%3D56
    const endpointIabot = 'https://iabot.wmcloud.org/index.php?page=manageurlsingle'

    const getDataRow = (u) => {
        const classes = (u.status_code === 0 ? ' url-is-unknown'
            : u.status_code >= 200 && u.status_code < 300 ? ' url-is-success'
                : u.status_code >= 300 && u.status_code < 400 ? ' url-is-redirect'
                    : u.status_code >= 400 && u.status_code < 500 ? ' url-is-notfound'
                        : u.status_code >= 500 && u.status_code < 600 ? ' url-is-error'
                            : '')

        const endpoint = endpointIabot + `&url=${encodeURIComponent(u.url)}`
        // const endpoint = endpointIabot + `&url=${encodeURI(u.url)}`

        return <tr key={u.url} className={classes}>
            <td><MakeLink href={u.url} /></td>
            <td><div>{u.status_code}</div></td>
            <td><div><MakeLink href={endpoint} linkText={"details"} /></div></td>
        </tr>
    }

    // create display components (table, tr, and td) for array of url objects
    const urlsToRows = useCallback( (urlObjects=[]) => {
        return urlObjects?.length
            ? urlObjects.map( u => getDataRow(u) )

            // if urlObjects is undefined...
            // TODO this NOT a good way to present errors to the user!
            : <tr>
                <td>No URLs in reference</td>
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
        fetchUrls({
            iariBase: myIariBase,
            urlArray: urls,
            refresh: false,
            timeout: 10,
            method: myStatusMethod
            })

            .then( results => {
                const bareUrls = normalizeUrlArray(results) // currently results come "decorated" with surrounding "data : {...}"
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

    }, [urls, myStatusMethod, myIariBase])

    const headerRow = <tr>
        <th className={'url-name'}><h3 className={"urls-header"}>URLs</h3></th>
        <th className={'url-status'}>Status</th>
        <th className={'url-iabotdb_status'}>IABot</th>
    </tr>

    return <div className="ref-view-urls-wrapper">

        <table className={'ref-view-urls'}>
            <thead>
            {headerRow}
            </thead>
            <tbody>
            {urlRows}
            </tbody>
        </table>

    </div>
}

