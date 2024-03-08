import React, {useCallback, useEffect, useState} from "react";
import package_json from "../package.json";
import PathNameFetch from "./components/PathNameFetch";
import Loader from "./components/Loader";
import PageDisplay from "./components/PageDisplay";
import MakeLink from "./components/MakeLink";
import Dropdown from "./components/Dropdown";
import {IariSources} from "./constants/endpoints";
import {UrlStatusCheckMethods} from "./constants/checkMethods";
import {ConfigContext} from "./contexts/ConfigContext"
import {ArticleVersions} from "./constants/articleVersions";


export default function App({env, myPath, myRefresh, myMethod, myArticleVersion, myIariSourceId, myDebug}) {

    const [isDebug, setDebug] = useState(myDebug);

    // these are config values to show/hide certain UI features, available from debug info box
    const [isShowUrlOverview, setIsShowUrlOverview] = useState(true);
    const [isShowShortcuts, setIsShowShortcuts] = useState(true);
    const [isShowDebugInfo, setIsShowDebugInfo] = useState(false);
    const [isShowDebugComponents, setIsShowDebugComponents] = useState(false);
    const [isShowViewOptions, setIsShowViewOptions] = useState(false);

    // params settable from from address url
    const [targetPath, setTargetPath] = useState(myPath);
    const [refreshCheck, setRefreshCheck] = useState(myRefresh);
    const [checkMethod, setCheckMethod] = useState(myMethod);
    const [articleVersion, setArticleVersion] = useState(myArticleVersion);

    // states of page
    const [endpointPath, setEndpointPath] = useState('');
    const [pageData, setPageData] = useState(null);
    const [myError, setMyError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const toggleDebug = () => {
        setDebug(!isDebug);
    }

    // production mode shows limited shortcuts
    // staging shows a little more for testing
    // everything else (my dev env, e.g.) shows lots more
    const shortcuts = env === 'env-production'
        ? ['easterIsland', 'internetArchive', 'pdfCovid',]
        : env === 'env-staging'
                // default staging shortcuts
            ? ['easterIsland', 'internetArchive', 'mlk', 'short_test', ]

                // my development shortcuts
            : ['marcBolan', 'easterIsland', 'mlk', 'internetArchive', 'karen_bakker', 'short_test', 'pdfDesantis', 'pdfOneLink'];


    // add class to body to indicate environment
    useEffect(() => {
        console.log('APP: useEffect[env]: app name: ' + package_json.name, ', version: ' + package_json.version)
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
        const getPagePathEndpoint = (path = '', mediaType = 'wiki', refresh = false) => {

            const iariBase = IariSources[myIariSourceId]?.proxy
            // TODO: error if iariBase is undefined or otherwise falsey
            console.log(`getPagePathEndpoint: myIariSourceId = ${myIariSourceId}, iariBase = ${iariBase}`)
            if (mediaType === "wiki") {

                if (articleVersion === ArticleVersions["ARTICLE_V1"].key) {
                    const sectionRegex = '&regex=references|bibliography|further reading|works cited|sources|external links'; // for now... as of 2023.04.09
                    const options = '&dehydrate=false'
                    return `${iariBase}/statistics/article?url=${path}${sectionRegex}${options}${refresh ? "&refresh=true" : ''}`;
                }

                else if (articleVersion === ArticleVersions["ARTICLE_V2"].key) {
                    const options = ''
                    return `${iariBase}/article?url=${path}${options}${refresh ? "&refresh=true" : ''}`;
                }

            } else if (mediaType === "pdf") {
                return `${iariBase}/statistics/pdf?url=${path}${refresh ? "&refresh=true" : ''}`;

            } else {
                // do general case...TODO make this default parser endpoint a config

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
            // If so, passes it in to getPagePathEndpoint, where the endpoint is determined
            // by passed in mediaType rather than mediaType interpolated from pathName.

        const myEndpoint = getPagePathEndpoint(pathName, myMediaType, refresh);
        console.log("APP::fetchArticleData: endpoint = ", myEndpoint)
        setEndpointPath(myEndpoint); // for display purposes only

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
                data.iariArticleVersion = articleVersion;
                data.forceRefresh = refresh;
                data.mediaType = myMediaType; // decorate based on mediaType?
                data.version = getIariVersion(data, myEndpoint);  // version of pageData - determines display components
                data.iari_version = data.iari_version ? data.iari_version : "unknown";

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
                    setMyError(err.message + " - IARI service failure: Service down or CORS issue.");
                    // TODO: this happens when filename does not exist!
                    // or when CORS error encountered
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

    }, [myIariSourceId, articleVersion])


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
            + window.location.host + window.location.pathname + `?url=${url}`
            + (refresh ? '&refresh=true' : '')
            + (checkMethod ? `&method=${checkMethod}` : '')
            + (myIariSourceId ? `&iari-source=${iari_source}` : '')
            + (articleVersion ? `&article_version=${articleVersion}` : '')
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

        // set these states only for debug display, essentially
        setTargetPath(myPath);
        setRefreshCheck(myRefresh);

        // and do the fetching for the path specified (pulled from URL address)
        fetchArticleData(myPath, myRefresh)

    }, [myIariSourceId, myPath, myRefresh, fetchArticleData])


    const handleCheckMethodChange = (methodId) => {
        // console.log(`handleStatusMethodChange: new method is: ${methodId}`)
        setCheckMethod(methodId);
    }
    const methodChoices = Object.keys(UrlStatusCheckMethods).filter(f => !["IARI", "IABOT_SEARCHURL"].includes(f)).map( key => {
        return { caption: UrlStatusCheckMethods[key].caption, value: UrlStatusCheckMethods[key].key }
    })
    const methodChoiceSelect = <div className={"choice-wrapper check-method-wrapper"}>
        <Dropdown choices={methodChoices} label={'Check Method:'} onSelect={handleCheckMethodChange} defaultChoice={checkMethod}/>
    </div>

    const handleArticleVersionChange = (articleVersionId) => {
        // console.log(`handleStatusMethodChange: new method is: ${methodId}`)
        setArticleVersion(articleVersionId);
    };
    const articleVersionChoices = Object.keys(ArticleVersions).map( key => {
        return { caption: ArticleVersions[key].caption, value: ArticleVersions[key].key }
    })
    const articleVersionChoiceSelect = <div className={"choice-wrapper article-version-wrapper"}>
        <Dropdown choices={articleVersionChoices}
                  label={'Article Parser Version:'}
                  onSelect={handleArticleVersionChange} defaultChoice={articleVersion}/>
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
    const iariChoices = Object.keys(IariSources)
        .filter(key => {
            return env === 'env-staging'
                ? !(key === "iari_local" || key === "iari")  // do not allow iari_local and iari on Staging
                : true
        })
        .map( key => {
            return { caption: IariSources[key].caption, value: IariSources[key].key }
        })

    const iariChoiceSelect = <div className={"choice-wrapper iari-source-wrapper"}>
        <Dropdown choices={iariChoices} label={'Iari Source:'} onSelect={handleIariSourceIdChange} defaultChoice={myIariSourceId}/>
    </div>

    const iareVersion = `${package_json.version}`
    const siteDisplay = (env !== 'env-production') ? ` STAGING SITE ` : ''
    const showHideDebugButton = (env !== 'env-production') && <button className={"utility-button debug-button small-button"}
            onClick={toggleDebug} >{
                isDebug ? <>&#8212;</> : "+"  // dash and plus sign
            }</button>
            // up and down triangles:  onClick={toggleDebug} >{isDebug ? <>&#9650;</> : <>&#9660;</>}</button>

    const heading = <div className={"header-contents"}>
        <h1>Internet Archive Reference Explorer</h1>
        <div className={"header-aux1"}>version {iareVersion}{siteDisplay}{showHideDebugButton}</div>
    </div>

    const debugButtonFilters = <button // this is the 'show urls list' button
        className={"utility-button debug-button"}
        onClick={() => {
            setIsShowUrlOverview(prevState => !prevState )
        }
        } >{isShowUrlOverview ? "Hide" : "Show"} Filters</button>

    const debugButtonShortcuts = <button // this is the 'show shortcuts' button
        className={"utility-button debug-button"}
        onClick={() => {
            setIsShowShortcuts(prevState => !prevState )
        }
        } >{isShowShortcuts ? "Hide" : "Show"} Shortcuts</button>

    const debugButtonViewTypes = <button // this is the 'show view options' button
        className={"utility-button debug-button"}
        onClick={() => {
            setIsShowViewOptions(prevState => !prevState )
        }
        } >{isShowViewOptions ? "Hide" : "Show"} View Types</button>

    const debugButtonDetails = <button // this is the 'show New Features' button
        className={"utility-button debug-button"}
        onClick={() => {
            setIsShowDebugInfo(prevState => !prevState )
        }
        } >{isShowDebugInfo ? "Hide" : "Show"} Debug Details</button>

    const debugButtonComponents = <button // this is the 'show New Features' button
        className={"utility-button debug-button"}
        onClick={() => {
            setIsShowDebugComponents(prevState => !prevState )
        }
        } >{isShowDebugComponents ? "Hide" : "Show"} Debug Components</button>

    const debugButtons = <>
        {debugButtonViewTypes}
        &nbsp;
        {debugButtonDetails}
        &nbsp;
        {debugButtonComponents}
        &nbsp;
        {debugButtonFilters}
        &nbsp;
        {debugButtonShortcuts}
        </>

    const debug = <div className={"debug-section " + (isDebug ? "debug-on" : "debug-off")}>
        <div style={{marginBottom:".5rem"}}
            >{iariChoiceSelect} {methodChoiceSelect} {articleVersionChoiceSelect}</div>
        <p><span className={'label'}>Environment:</span> {env} (host: {window.location.host})</p>
        <p><span className={'label'}>IARE Version:</span> {iareVersion}</p>
        <p><span className={'label'}>IARI Source:</span> {myIariSourceId} ({IariSources[myIariSourceId]?.proxy})</p>
        <p><span className={'label'}>IARI Version:</span> {pageData?.iari_version ? pageData.iari_version : "unknown"} </p>
        <p><span className={'label'}>Article Version:</span> {ArticleVersions[articleVersion].caption}</p>
        <p><span className={'label'}>Check Method:</span> {UrlStatusCheckMethods[checkMethod].caption} ({checkMethod})</p>
        <p><span className={'label'}>URL from address line:</span> {myPath}</p>
        <p><span className={'label'}>Force Refresh:</span> {refreshCheck ? "TRUE" : "false"}</p>
        <div>{debugButtons}</div>
        <p><span className={'label'}>pathName:</span> <MakeLink href={targetPath}/></p>
        <p><span className={'label'}>endpointPath:</span> <MakeLink href={endpointPath}/></p>

    </div>

    // set config for config context
    const config = {
        environment: env,
        iariSource: IariSources[myIariSourceId]?.proxy,
        wikiBaseUrl: "https://en.wikipedia.org/wiki/",
        urlStatusMethod: checkMethod,
        articleVersion: myArticleVersion,
        isDebug: !!isDebug,
        isShowUrlOverview: isShowUrlOverview,
        isShowShortcuts: isShowShortcuts,
        isShowDebugInfo: isShowDebugInfo,
        isShowDebugComponents: isShowDebugComponents,
        isShowViewOptions: isShowViewOptions,
    }

    console.log(`rendering App component:`, JSON.stringify({
        path: targetPath,
        refreshCheck: refreshCheck,
        statusMethod: checkMethod,
        iari_source: myIariSourceId,
        config: config,
    }))

    const defaultIfEmpty = "https://en.wikipedia.org/wiki/"

    return <>

        <ConfigContext.Provider value={config}>

            <div className="iare-view">

                <div className={"header"}>
                    {heading}
                    {debug}
                </div>


                <PathNameFetch pathInitial={targetPath?.length > 0 ? targetPath : defaultIfEmpty}
                               checkInitial={refreshCheck}
                               placeholder={"Enter a Wikipedia article or PDF url here"}
                               shortcuts={shortcuts}
                               showShortcuts={isShowShortcuts}
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
