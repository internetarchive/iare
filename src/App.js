import React, {useCallback, useEffect, useMemo, useState} from "react";
import package_json from "../package.json";
import {IARI_V2_URL_BASE, UrlStatusCheckMethods} from "./constants/endpoints";
import PathNameFetch from "./components/PathNameFetch";
import Loader from "./components/Loader";
import PageDisplay from "./components/PageDisplay";
import MakeLink from "./components/MakeLink";
import TestRefModal from "./components/vTest/TestRefModal";
import {UrlStatusCheckContext} from "./contexts/UrlStatusCheckContext"


export default function App( {env, myPath, myRefresh, myMethod} ) {

    const [isDebug, setDebug] = useState(false);
    const [isDebugAlerts, setDebugAlerts] = useState(false);

    // transfer params from address line
    const [targetPath, setTargetPath] = useState(myPath);
    const [refreshCheck, setRefreshCheck] = useState(myRefresh);
    const [statusMethod, setStatusMethod] = useState(myMethod);

    const [endpointPath, setEndpointPath] = useState('');

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
            return `${IARI_V2_URL_BASE}/statistics/article?url=${path}${sectionRegex}${refresh ? "&refresh=true" : ''}`;

        } else if (mediaType === "pdf") {
            return `${IARI_V2_URL_BASE}/statistics/pdf?url=${path}${refresh ? "&refresh=true" : ''}`;

        } else {
            // do general case...

            return `${IARI_V2_URL_BASE}/statistics/analyze?url=${path}${refresh ? "&refresh=true"
                : ''}${mediaType ? `&media_type=${mediaType}` : ''}`;

            // this will produce and error right now, as IARI does not support
            // ...i (mojomonger) think we should have the generic analyze endpoint
        }
    };



    // fetch article reference data
    //
    // TODO: account for error conditions, like wrong file format, not found, etc
    const referenceFetch = useCallback((pathName, refresh=false) => {

        // handle null pathName
        if (!pathName) {
            console.log ("APP::referenceFetch: pathName is null-ish");
            setPageData(null);
            // TODO: use setMyError(null); // ??
            return;
        }

        const myMediaType = getMediaType(pathName); // TODO: idea: respect a "forceMediaType",
        // where it can force a media type endpoint, no matter what getMediaType thinks it is.
        // If so, passes it in to convertPathToEndpoint, where the endpoint is determined
        // by passed in mediaType rather than mediaType interpolated from pathName.

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

                // decorate the data with some informative fields upon successful data response
                data.pathName = pathName;
                data.endpoint = myEndpoint;
                data.forceRefresh = refresh;
                data.mediaType = myMediaType; // decorate based on mediaType?

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
    const handlePathResults = (pathResults) => {

        const newUrl = window.location.protocol + "//"
            + window.location.host
            + window.location.pathname
            + "?url=" + pathResults[0]
            + (pathResults[1] ? "&refresh=true" : '')
            + (statusMethod ? `&method=${statusMethod}` : '')

        // window.location.href = newUrl;
        console.log("handlePathResults: new url path = ", newUrl)

        // debugAlert(`APP::handlePathResults: newUrl=${newUrl}`)
        console.log(`---------\nAPP::handlePathResults: newUrl=${newUrl}`)

        // setting the page url forces page to refresh, thus a "new  component render",
        // kicking off the following useEffect
        window.location.href = newUrl;
        // console.log("REFRESH URL WITH: ", newUrl);

    }

    // fetch initial article if specified on address bar with url param
    useEffect(() => {
        debugAlert(`APP:::useEffect[myPath, myRefresh]: calling handlePathName: ${myPath}, ${myRefresh}`)
        console.log(`APP:::useEffect[myPath, myRefresh]: calling handlePathName: ${myPath}, ${myRefresh}`)

        // set these states only for debugging, essentially
        setTargetPath(myPath);
        setRefreshCheck(myRefresh);

        // and do the fetching for the path specified (pulled from URL address)
        referenceFetch(myPath, myRefresh)

    }, [myPath, myRefresh, debugAlert, referenceFetch])


    const shortcuts = env === 'env-production'
        ? ['easterIslandFilename', 'internetArchiveFilename', 'pdfCovid', ]
        : ['easterIslandFilename', 'internetArchiveFilename', 'pdfCovid', 'pdfDesantis', 'pdfOneLink'];

    const handleStatusMethodChange = (event) => {
        const myMethod2 = event.target.value // NB: had trouble with name being method...
        // console.log(`handleStatusMethodChange: new method is: ${myMethod2}`)
        setStatusMethod(myMethod2);
    };

    const statusMethodOptions = <>
        <div className={"status-check-methods-wrapper"}>
            <div className={"status-check-methods"}>
                <div>URL Status Check Method:</div>
                {Object.keys(UrlStatusCheckMethods).map(method => {
                    return <div key={method}>
                        <label>
                            <input
                                type="radio"
                                value={method}
                                checked={statusMethod === method}
                                onChange={handleStatusMethodChange}
                            /> {UrlStatusCheckMethods[method].caption}
                        </label>
                    </div>
                })}
            </div>
        </div>
    </>

    const heading = <div className={"header-contents"}>
        <h1>Internet Archive Reference Explorer <span
            className={"version-display"}> version {package_json.version}
            <span className={"non-production"}
            > STAGING SITE <
                button onClick={toggleDebug} className={"debug-button"}
            >{isDebug ? "hide" : "show"} debug</button
            ></span></span></h1>
        {/*<Clock />*/}

        {statusMethodOptions}
    </div>

    const debug = <div className={ isDebug ? "debug-on" : "debug-off" }>
        <div>
            <button onClick={toggleDebugAlert} className={"debug-button"}>{ isDebugAlerts ? "hide" : "show" } alerts
            </button>{isDebugAlerts ? <span className={"debug-info"}> user alerts will be engaged for certain tasks</span>
            : ''}</div>
        <p>pathName : <MakeLink href={targetPath}/></p>
        <p>endpointPath: <MakeLink href={endpointPath}/></p>
        <p>inline target URL: {myPath}</p>
        <p>Force Refresh: {refreshCheck ? "TRUE" : "false"}</p>
        <p>Check Method: {statusMethod}</p>
        {/*<p>window.location:</p>*/}
        {/*<pre>{JSON.stringify(window.location,null,2)}</pre>*/}
        <TestRefModal />
    </div>


    console.log(`rendering App component ${targetPath} ${refreshCheck} ${statusMethod}`)
    // render component
    return <>

        <UrlStatusCheckContext.Provider value={statusMethod}>

            <div className="iare-view">

                <div className={"header"}>
                    {heading}
                    {debug}
                </div>


                <PathNameFetch pathInitial={targetPath} checkInitial={refreshCheck}
                               placeholder={"Enter a Wikipedia article or PDF url here"}
                               shortcuts={shortcuts}
                               handlePathResults={handlePathResults}
                />

                {myError ? <div className={myError ? "error-display" : "error-display-none"}>
                    {myError}
                </div> : ""}

                {isLoading ? <Loader message={"Analyzing Page References..."}/> : <>
                    { /* component is re-rendered when pageData changes, which is
                     only once per URL invocation, really */}
                    <PageDisplay pageData={pageData}/>
                    { /* TODO: pass in an error callback here? */}
                </>
                }
            </div>

        </UrlStatusCheckContext.Provider>
    </>
}
