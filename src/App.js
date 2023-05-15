import React, {useCallback, useEffect, useState} from "react";
import package_json from "../package.json";
import {API_V2_URL_BASE} from "./constants/endpoints";
import PathNameFetch from "./components/PathNameFetch";
import Loader from "./components/Loader";
import PageDisplay from "./components/PageDisplay";
import MakeLink from "./components/MakeLink";
import TestRefModal from "./components/vTest/TestRefModal";

export default function App() {

    const env = window.location.host === "archive.org" ? 'env-production' : 'env-other';
    const [isDebug, setDebug] = useState(false);
    const [isDebugAlerts, setDebugAlerts] = useState(false);

    // transfer url and refresh params from address line, if there
    const queryParameters = new URLSearchParams(window.location.search)
    const myUrl = queryParameters.has("url") ? queryParameters.get("url") : '';
    const [targetPath, setTargetPath] = useState(myUrl);
    const myRefresh = queryParameters.has("refresh") ? queryParameters.get("refresh").toLowerCase() === 'true' : false;
    const [refreshCheck, setRefreshCheck] = useState(myRefresh);

    const [endpointPath, setEndpointPath] = useState("");

    const [pageData, setPageData] = useState(null);
    const [myError, setMyError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);


    const toggleDebug = () => {
        setDebug(!isDebug);
    }

    const toggleDebugAlert = () => {
        setDebugAlerts(!isDebugAlerts);
    }

    const debugAlert = useCallback((msg) => {
        if (isDebug && isDebugAlerts) alert(msg)
    }, [isDebug, isDebugAlerts]);

    // add class to body to indicate environment
    useEffect(() => {
        console.log('APP: useEffect[env]: app name: ' + package_json.name, 'version: ' + package_json.version)
        document.body.classList.add(env);
    }, [env])


    function getIariVersion(pageData, endpointPath) {
        // eslint-disable-next-line
        const regexVersion1 = new RegExp("\/v1\/");
        // eslint-disable-next-line
        const regexVersion2 = new RegExp("\/v2\/");
        // eslint-disable-next-line
        const regexVersion2PDF = new RegExp("\/v2\/statistics\/pdf");

        if (!endpointPath) {
            return "unknown";
        }
        if (regexVersion1.test(endpointPath))
            return "v1"
        else if (regexVersion2.test(endpointPath))
            return "v2"
        else if (regexVersion2PDF.test(endpointPath))
            return "v2PDF"
        else
            return "unknown";
    }

    // mediaType is "pdf", "html", "wiki", or anything else we come up with
    const getMediaType = (path = '') => {
        // set media type based on heuristic:

        // if path ends in ".pdf", assume pdf
        // if path contains ".wikipedia.org/wiki/, assume wiki
        // else unknown, for now

        // eslint-disable-next-line
        const regexPdf = new RegExp("\.pdf$");
        // eslint-disable-next-line
        const regexWiki = new RegExp("\.wikipedia.org/wiki/");
        // eslint-disable-next-line

        if (regexPdf.test(path))
            return 'pdf'
        else if (regexWiki.test(path))
            return "wiki"
        else
            return "unknown";

    };


    // mediaType is "pdf", "html", "wiki", or anything else we come up with
    const convertPathToEndpoint = (path = '', mediaType = 'wiki', refresh=false) => {

        if (mediaType === "wiki") {
            const sectionRegex = "&regex=bibliography|further reading|works cited|sources|external links"; // for now... as of 2023.04.09
            return `${API_V2_URL_BASE}/statistics/article?url=${path}${sectionRegex}${refresh ? "&refresh=true" : ''}`;

        } else if (mediaType === "pdf") {
            return `${API_V2_URL_BASE}/statistics/pdf?url=${path}${refresh ? "&refresh=true" : ''}`;

        } else {
            // do general case...

            return `${API_V2_URL_BASE}/statistics/analyze?url=${path}${refresh ? "&refresh=true"
                : ''}${mediaType ? `&media_type=${mediaType}` : ''}`;

            // this will produce and error right now, as IARI does not support
            // ...i (mojomonger) think we should have the generic analyze endpoint
        }
    };



    // fetch article data
    // TODO: account for error conditions, like wrong file format, not found, etc
    const referenceFetch = useCallback((pathName, refresh=false) => {

        // handle null pathName
        if (!pathName) {
            console.log ("APP::referenceFetch: pathName is null-ish");
            setPageData(null);
            // TODO: use setMyError(null); // ??
            return;
        }

        const myMediaType = getMediaType(pathName); // TODO: respect a "forceMediaType", where it can
        // force a media type endpoint, no matter what getMediaType thinks it is?
        // If so, passes it in to convertPathToEndpoint, where the endpoint is determined
        // by forced mediaType value rather than from mediaType interpolated from pathName.

        const myEndpoint = convertPathToEndpoint(pathName, myMediaType, refresh);
        console.log("APP::referenceFetch: endpoint = ", myEndpoint)

        setEndpointPath(myEndpoint); // for display

        // TODO: maybe always clear pageData, so components get cleared while waiting?
        setMyError(null);
        setIsLoading(true);

        // fetch the article data
        fetch(myEndpoint, {})

            .then((res) => {
                if (!res.ok) {
                    throw new Error(res.statusText ? res.statusText : res.status);
                    // throw new Error(res);
                    //return res.text().then(text => { throw new Error({message: }) })
                } // throw error that will be caught in .catch()
                return res.json();
            })

            .then((data) => {
                // decorate based on mediaType?

                // upon successful return of data, decorate the data with some informative fields
                data.pathName = pathName;
                data.endpoint = myEndpoint;
                data.forceRefresh = refresh;
                data.mediaType = myMediaType;

                data.version = getIariVersion(data, myEndpoint);

                // and set the new pageData state
                setPageData(data);
            })

            .catch((err) => {
                // TODO: set false pageData for display?

                // how do we tell if error is from native network cause, or synthesized/augmented by our handling of res != OK above

                if (err.message === "404") {
                // if (err.status_code === "404") {
                    setMyError("404 Error finding target page.")
                } else if (err.message === "502") {
                    setMyError("502 Server problem (no further info available)")
                } else {
                    // setMyError(err.toString())
                    // setMyError(RawJson(err));

                    // extract HTTP status code form string (1st 3 characters, if number? without number next?
                    setMyError(err.message + " - No further info available");
                }
                setPageData(null);

            })

            .finally(() => {
                // console.log("fetch finally")
                setIsLoading(false);
            });

    }, []);

    // callback for PathNameFetch component
    // pathResults[0] = pathName (string)
    // pathResults[1] = refreshCheck (boolean)
    const handlePathResults = useCallback( (pathResults) => {

        const newUrl = window.location.protocol + "//"
            + window.location.host
            + window.location.pathname
            + "?url=" + pathResults[0]
            + (pathResults[1] ? "&refresh=true" : '');

        // window.location.href = newUrl;
        console.log("new url path = ", newUrl)

        debugAlert(`APP::handlePathResults: newUrl=${newUrl}`)
        console.log(`---------\nAPP::handlePathResults: newUrl=${newUrl}`)

        window.location.href = newUrl;

    }, [debugAlert] );


    // fetch initial article if specified on address bar with url param
    useEffect(() => {
        debugAlert(`APP:::useEffect[myUrl, myRefresh]: calling handlePathName: ${myUrl}, ${myRefresh}`)
        console.log(`APP:::useEffect[myUrl, myRefresh]: calling handlePathName: ${myUrl}, ${myRefresh}`)

        // set these states only for debugging, essentially
        setTargetPath(myUrl);
        setRefreshCheck(myRefresh);

        referenceFetch(myUrl, myRefresh)

    }, [myUrl, myRefresh, debugAlert, referenceFetch])


    const shortcuts = ['easterIslandFilename', 'internetArchiveFilename','pdfCovid', 'pdfOneLink'];

    // render component
    return <>

        <div className="iare-view">

            <div className={"header"}>
                {(!env || env !== 'env-production') ? <div className={"environment-tag"}>{"NON-PRODUCTION\u00A0\u00A0".repeat(8)}</div> : null }
                <h1>Internet Archive Reference Explorer <span className={"version-display"}> version {package_json.version}
                    <span className={"non-production"}
                    > STAGING SITE <
                        button onClick={toggleDebug} className={"debug-button"}
                        >{ isDebug ? "hide" : "show" } debug</button
                        ></span></span></h1>
                {/*<Clock />*/}

                <div className={ isDebug ? "debug-on" : "debug-off" }>
                    <div>
                    <button onClick={toggleDebugAlert} className={"debug-button"}>{ isDebugAlerts ? "hide" : "show" } alerts
                    </button>{isDebugAlerts ? <span className={"debug-info"}> user alerts will be engaged for certain tasks</span>
                    : ''}</div>
                    <p>pathName : <MakeLink href={targetPath}/></p>
                    <p>endpointPath: <MakeLink href={endpointPath}/></p>
                    <p>Force Refresh: {refreshCheck ? "TRUE" : "false"}</p>
                    <p>inline target URL: {myUrl}</p>
                    {/*<p>window.location:</p>*/}
                    {/*<pre>{JSON.stringify(window.location,null,2)}</pre>*/}
                    <TestRefModal />
                </div>

            </div>

            <PathNameFetch pathInitial={targetPath} checkInitial={refreshCheck}
                           shortcuts={shortcuts}
                           handlePathResults={handlePathResults} />

            {myError ? <div className={myError ? "error-display" : "error-display-none"}>
                {myError}
            </div> : ""}

            {isLoading ? <Loader message={"Analyzing Page References..."}/> : <>
                <PageDisplay pageData={pageData}/>
                { /* TODO: pass in an error callback here? */}
            </>
            }
        </div>

    </>
}
