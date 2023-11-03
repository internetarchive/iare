import React, {useCallback, useEffect, useState} from "react";
import package_json from "../package.json";
import PathNameFetch from "./components/PathNameFetch";
import Loader from "./components/Loader";
import PageDisplay from "./components/PageDisplay";
import MakeLink from "./components/MakeLink";
//// import TestRefModal from "./components/vTest/TestRefModal";
import Dropdown from "./components/Dropdown";
import {IariSources, UrlStatusCheckMethods} from "./constants/endpoints";
import {ConfigContext} from "./contexts/ConfigContext"


export default function App({env, myPath, myRefresh, myMethod, myIariSourceId, myDebug}) {

    const [isDebug, setDebug] = useState(myDebug);

    // params settable from from address url
    const [targetPath, setTargetPath] = useState(myPath);
    const [refreshCheck, setRefreshCheck] = useState(myRefresh);
    const [statusMethod, setStatusMethod] = useState(myMethod);
    //const [xxiariSourceId, setIariSourceId] = useState(myIariSourceId);

    const [endpointPath, setEndpointPath] = useState('');

    const [pageData, setPageData] = useState(null);
    const [myError, setMyError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const toggleDebug = () => {
        setDebug(!isDebug);
    }

    // production mode shows limited shortcuts, vs. staging which allows for more testing
    const shortcuts = env === 'env-production'
        ? ['easterIslandFilename', 'internetArchiveFilename', 'pdfCovid',]
        : env === 'env-staging'
            ? ['easterIslandFilename', 'internetArchiveFilename', 'short_test', 'pdfOneLink']
            : ['easterIslandFilename', 'internetArchiveFilename', 'karen_bakker', 'short_test', 'pdfDesantis', 'pdfOneLink'];


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


    // fetch article reference data
    //
    // TODO: account for error conditions, like wrong file format, not found, etc
    const fetchArticleData = useCallback((pathName, refresh = false) => {

        // mediaType is "pdf", "html", "wiki", or anything else we come up with
        const convertPathToEndpoint = (path = '', mediaType = 'wiki', refresh = false) => {

            const iariBase = IariSources[myIariSourceId]?.proxy
            // TODO: error if ia
            //  riBase is undefined or otherwise falsey
            console.log(`convertPathToEndpoint: myIariSourceId = ${myIariSourceId}, iariBase = ${iariBase}`)
            if (mediaType === "wiki") {
                const sectionRegex = '&regex=bibliography|further reading|works cited|sources|external links'; // for now... as of 2023.04.09
                const options = '&dehydrate=false'
                return `${iariBase}/statistics/article?url=${path}${sectionRegex}${options}${refresh ? "&refresh=true" : ''}`;

            } else if (mediaType === "pdf") {
                return `${iariBase}/statistics/pdf?url=${path}${refresh ? "&refresh=true" : ''}`;

            } else {
                // do general case...

                return `${iariBase}/statistics/analyze?url=${path}${refresh ? "&refresh=true"
                    : ''}${mediaType ? `&media_type=${mediaType}` : ''}`;

                // this will produce and error right now, as IARI does not support
                // ...i (mojomonger) think we should have the generic analyze endpoint
            }
        };



        // handle null pathName
        if (!pathName) {
            console.log("APP::referenceFetch: pathName is null-ish");
            setPageData(null);
            // TODO: use setMyError(null); // ??
            return;
        }

        const myMediaType = getMediaType(pathName);
            // TODO: idea: respect a "forceMediaType",
            // where it can force a media type endpoint, no matter what getMediaType thinks it is.
            // If so, passes it in to convertPathToEndpoint, where the endpoint is determined
            // by passed in mediaType rather than mediaType interpolated from pathName.

        const myEndpoint = convertPathToEndpoint(pathName, myMediaType, refresh);
        console.log("APP::fetchArticleData: endpoint = ", myEndpoint)

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
                data.iariSource = IariSources[myIariSourceId]?.proxy;
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
                } else if (err.name === "TypeError" && err.message === "Failed to fetch") {
                    setMyError(err.message + " - Possible IARI service failure.");
                } else {
                    // ?? should we extract HTTP status code from string? (1st 3 characters, if number? without number, next?)
                    setMyError(err.message + " - No further info available");
                }
                setPageData(null);

            })

            .finally(() => {
                // console.log("fetch finally")
                setIsLoading(false);
            });

    }, [myIariSourceId]);


    // callback for PathNameFetch component
    // pathResults[0] = pathName (string)
    // pathResults[1] = refreshCheck (boolean)
    const handlePathResults = (pathResults) => {

        refreshPageResults(
            {
                url: pathResults[0],
                refresh: pathResults[1],

                iari_source: myIariSourceId,
            }
        )

    }

    // set up new url with appropriate "command line args", and refresh page
    const refreshPageResults = (
        {
            url = '',
            refresh=false,
            iari_source = IariSources.iari_prod.key
        } ) => {

        const newUrl = window.location.protocol + "//"
            + window.location.host
            + window.location.pathname
            + `?url=${url}`
            + (refresh ? '&refresh=true' : '')
            + (statusMethod ? `&method=${statusMethod}` : '')
            + (myIariSourceId ? `&iari-source=${iari_source}` : '')
            + (isDebug ? '&debug=true' : '')

        // window.location.href = newUrl;
        console.log("refreshPageResults: new url path = ", newUrl)

        // setting the page url forces page to refresh, thus a "new  component render",
        // kicking off the following useEffect
        window.location.href = newUrl;

    }


    // fetch initial article specified on address bar with url param
    useEffect(() => {

        console.log(`APP:::useEffect[myPath, myRefresh]: calling handlePathName: ${myPath}, ${myRefresh}`)

        // set these states only for debugging, essentially
        setTargetPath(myPath);
        setRefreshCheck(myRefresh);

        // and do the fetching for the path specified (pulled from URL address)
        fetchArticleData(myPath, myRefresh)

    }, [myIariSourceId, myPath, myRefresh, fetchArticleData])


    const handleCheckMethodChange = (methodId) => {
        // console.log(`handleStatusMethodChange: new method is: ${methodId}`)
        setStatusMethod(methodId);
    };
    const methodChoices = Object.keys(UrlStatusCheckMethods).filter(f => !["IARI", "IABOT_SEARCHURL"].includes(f)).map( key => {
        return { caption: UrlStatusCheckMethods[key].caption, value: UrlStatusCheckMethods[key].key }
    })
    const methodChoiceSelect = <div className={"check-method-wrapper"}>
        <Dropdown choices={methodChoices} label={'Check Method:'} onSelect={handleCheckMethodChange} defaultChoice={statusMethod}/>
    </div>


    const handleIariSourceIdChange = (sourceId) => {
        // console.log(`handleIariSourceChange: new iari source is: ${sourceId}`)
        refreshPageResults( {
            url : targetPath,
            refresh : refreshCheck,
            iari_source: sourceId,
        })
        // setIariSourceId(sourceId);
    };
    const iariChoices = Object.keys(IariSources).map( key => {
        return { caption: IariSources[key].caption, value: IariSources[key].key }
    })
    const iariChoiceSelect = <div className={"iari-source-wrapper"}>
        <Dropdown choices={iariChoices} label={'Iari Source:'} onSelect={handleIariSourceIdChange} defaultChoice={myIariSourceId}/>
    </div>

    const versionDisplay = `version ${package_json.version}`
    const siteDisplay = ` STAGING SITE `
    const showHideDebugButton = <button // this is the 'show/hide debug' button
        className={"utility-button debug-button"}
        onClick={toggleDebug} >{isDebug ? "hide" : "show"} debug</button>

    const heading = <div className={"header-contents"}>
        <h1>Internet Archive Reference Explorer</h1>
        <div className={"header-aux1"}>
            <span className={"non-production"}>{versionDisplay}{siteDisplay
            }{showHideDebugButton}</span></div>
    </div>

    const debug = <div className={"debug-section " + (isDebug ? "debug-on" : "debug-off")}>
        <div className={"choice-wrapper"}>{iariChoiceSelect}{methodChoiceSelect}</div>
        <p><span className={'label'}>IARI Source:</span> {myIariSourceId} ({IariSources[myIariSourceId]?.proxy})</p>
        <p><span className={'label'}>Check Method:</span> {statusMethod}</p>
        <p><span className={'label'}>pathName:</span> <MakeLink href={targetPath}/></p>
        <p><span className={'label'}>endpointPath:</span> <MakeLink href={endpointPath}/></p>
        <p><span className={'label'}>inline target URL:</span> {myPath}</p>
        <p><span className={'label'}>Force Refresh:</span> {refreshCheck ? "TRUE" : "false"}</p>
    </div>

    // set config for config context
    const config = {
        iariSource: IariSources[myIariSourceId]?.proxy,
        urlStatusMethod: statusMethod,
        isDebug: !!isDebug,
    }

    console.log(`rendering App component:`, {
        path: targetPath,
        refreshCheck: refreshCheck,
        statusMethod: statusMethod,
        iari_source: myIariSourceId,
        config: config
    })


    return <>

        <ConfigContext.Provider value={config}>

            <div className="iare-view">

                <div className={"header"}>
                    {heading}
                    {debug}
                </div>


                <PathNameFetch pathInitial={targetPath} checkInitial={refreshCheck}
                               placeholder={"Enter a Wikipedia article or PDF url here"}
                               shortcuts={true && shortcuts}
                               handlePathResults={handlePathResults}
                />

                {myError ? <div className={myError ? "error-display" : "error-display-none"}>
                    {myError}
                </div> : ""}

                {isLoading
                    ? <Loader message={"Analyzing Page References..."}/>
                    : <>
                        { /* component is re-rendered when pageData changes, which is
                         only once per URL invocation, really */}
                        <PageDisplay pageData={pageData}/>
                        { /* TODO: pass in an error callback here? */}
                    </>
                }
            </div>

        </ConfigContext.Provider>

    </>
}
