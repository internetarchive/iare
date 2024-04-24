import React from "react";
import MakeLink from "../../MakeLink";
import RefSectionHeader from "./RefSectionHeader";
import {getArchiveStatusInfo, getPerennialInfo, getCitationInfo} from "../../../utils/urlUtils";


/*
shows template urls and their status codes in a tabular form
 */
export default function RefUrls({ urls, pageData, tooltipId, showDebug=false }) {

    // const [urlArray, setUrlArray] = useState( [] )
    // const [urlRows, setUrlRows] = useState( [] )
    //
    // const myConfig = React.useContext(ConfigContext);
    // const myIariBase = myConfig?.iariSource;
    // const myStatusMethod = myConfig?.urlStatusMethod;

// //    https://iabot.wmcloud.org/index.php?page=manageurlsingle&url=http%3A%2F%2Findigenouspeoplesissues.com%2Findex.php%3Foption%3Dcom_content%26view%3Darticle%26id%3D14679%3Arapanui-protests-continue-against-the-hotel-hanga-roa%26catid%3D23%3Asouth-america-indigenous-peoples%26Itemid%3D56
//     const endpointIabot = 'https://iabot.wmcloud.org/index.php?page=manageurlsingle'

    // assumes u is an url object
    const getUrlRow = (u, i) => {

        if (!u) return <div className={"url-row"} key={i}>Undefined URL encountered.</div>

        const classes = (u.status_code === 0
            ? ' url-is-unknown'
            : u.status_code >= 200 && u.status_code < 300
                ? ' url-is-success'
                : u.status_code >= 300 && u.status_code < 400
                    ? ' url-is-redirect'
                    : u.status_code >= 400 && u.status_code < 500
                        ? ' url-is-notfound'
                        : u.status_code >= 500 && u.status_code < 600
                            ? ' url-is-error'
                            : '')

        // const endpoint = endpointIabot + `&url=${encodeURIComponent(u.url)}`

        const citationStatus = !u.reference_info?.statuses?.length
            ? null
            : u.reference_info.statuses[0]  // just return first one

        return <div className={"url-row " + classes} key={i}
                    data-url={u.url}
                    data-status_code={u.status_code}
                    data-archive_status={u.archive_status?.hasArchive}
                    data-citation_status={citationStatus}
                    data-live_state={u.archive_status?.live_state}
                    data-perennial={u.rsp ? u.rsp[0] : null}  // just return first perennial if found for now...dont deal with > 1
        >
            <div className={"url-name"}><MakeLink href={u.url} linkText={u.url}/></div>
            <div className={"url-status"}>{u.status_code}</div>
            <div className={"url-archive_status"}>{getArchiveStatusInfo(u)}</div>

            <div className={"url-citations"}>{getCitationInfo(u)}</div>
            <div className={"url-perennial"}>{getPerennialInfo(u)}</div>

        </div>

    }

    const getUrlRows = ()=> {
        const urlRows = []

        urls.forEach( (url, i) => {
            const urlObj = pageData.urlDict[url]
            if (!urlObj) return
            if (!urlObj.isArchive) urlRows.push(getUrlRow(urlObj, i))
        })

        return <div className={"url-list"}>
            {urlRows}
        </div>
    }

    const urlRows = getUrlRows(urls)

    return <div className="ref-view-section ref-view-urls">

        <RefSectionHeader leftPart={<h3>URLs</h3>} />

        {urlRows}

    </div>
}

