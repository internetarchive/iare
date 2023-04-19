import React, {useCallback, useEffect, useState} from "react";
import package_json from "../package.json";
import {API_V2_URL_BASE} from "./constants/endpoints";
import PathNameFetch from "./components/PathNameFetch";
import Loader from "./components/Loader";
import PageDisplay from "./components/PageDisplay";
import MakeLink from "./components/MakeLink";

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


    function getWariVersion(pageData, endpointPath) {
        // eslint-disable-next-line
        const regexVersion1 = new RegExp("\/v1\/");
        // eslint-disable-next-line
        const regexVersion2 = new RegExp("\/v2\/");

        if (!endpointPath) {
            return "unknown";
        }
        if (regexVersion1.test(endpointPath))
            return "v1"
        else if (regexVersion2.test(endpointPath))
            return "v2"
        else
            return "unknown";
    }

    const convertPathToArticleEndpoint = (path = '', refresh=false) => {
        const sectionRegex = "&regex=bibliography|further reading|works cited|sources|external links"; // for now... as of 2023.04.09
        return`${API_V2_URL_BASE}/statistics/article?url=${path}${sectionRegex}${ refresh ? "&refresh=true":''}`;
    };

    // fetch article data
    // TODO: account for error conditions, like wrong file format, not found, etc
    const articleFetch = useCallback((pathName, refresh=false) => {

        // handle null pathName
        if (!pathName) {
            console.log ("APP::articleFetch: pathName is null-ish");
            setPageData(null);
            return;
        }

        const myEndpoint = convertPathToArticleEndpoint(pathName, refresh);
        console.log("APP::articleFetch: endpoint = ", myEndpoint)
        setEndpointPath(myEndpoint); // for display

        // TODO: ERR: maybe always clear pageData, so components get cleared while waiting?
        setMyError(null);
        setIsLoading(true);

        // fetch the article data
        fetch(myEndpoint, {})

            .then((res) => {
                if (!res.ok) throw new Error(res.status);
                return res.json();
            })

            .then((data) => {
                // upon successful return of data, decorate the data with some informative fields
                data.pathName = pathName;
                data.endpoint = myEndpoint;
                data.version = getWariVersion(data, myEndpoint);
                data.forceRefresh = refresh;

                // and set the new pageData state
                setPageData(data);
            })

            .catch((err) => {
                // TODO: set false pageData for display?
                if (err.message === "404") {
                    setMyError("Error finding target page.")
                } else {
                    setMyError(err.toString())
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

        articleFetch(myUrl, myRefresh)

    }, [myUrl, myRefresh, debugAlert, articleFetch])


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
                </div>

            </div>

            <PathNameFetch pathInitial={targetPath} checkInitial={refreshCheck} handlePathResults={handlePathResults} />

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
