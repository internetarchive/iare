import React, {useCallback, useEffect, useState, useRef} from "react";
import {Tooltip as MyTooltip} from "react-tooltip";
import package_json from "../package.json";

import {debounce} from "./utils/generalUtils.js";
import {getPagePathEndpoint} from "./utils/iariUtils.js";

import MakeLink from "./components/MakeLink.jsx";
import Dropdown from "./components/Dropdown.jsx";
import Loader from "./components/Loader.jsx";
import PathNameFetch from "./components/PathNameFetch.jsx";
import PageDisplay from "./components/PageDisplay.jsx";

import {IariSources} from "./constants/endpoints.jsx";
import {UrlStatusCheckMethods} from "./constants/checkMethods.jsx";
import {ParseMethods} from "./constants/parseMethods.jsx";

import {ConfigContext} from "./contexts/ConfigContext"


export default function App({env, myPath, myCacheData, myRefresh, myCheckMethod, myParseMethod, myIariSourceId, myDebug}) {

    const appTitle = "Internet Archive Reference Explorer"

    const [isDebug, setDebug] = useState(myDebug);

    // these are config values to show/hide certain UI features, available from debug info box
    const [isShowUrlOverview, setIsShowUrlOverview] = useState(true);
    const [isShowShortcuts, setIsShowShortcuts] = useState(true);
    const [isShowDebugInfo, setIsShowDebugInfo] = useState(false);
    const [isShowDebugComponents, setIsShowDebugComponents] = useState(false);
    const [isShowViewOptions, setIsShowViewOptions] = useState(false);

    // params settable from from address url
    const [targetPath, setTargetPath] = useState(myPath);
    const [cacheData, setCacheData] = useState(myCacheData);
    const [refreshCheck, setRefreshCheck] = useState(myRefresh);
    const [checkMethod, setCheckMethod] = useState(myCheckMethod);
    const [parseMethod, setParseMethod] = useState(myParseMethod);

    // states of page
    const [endpointPath, setEndpointPath] = useState('');
    const [pageData, setPageData] = useState(null);
    const [myError, setMyError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // values of screen elements
    const [scrollY, setScrollY] = useState(0);
    const [windowHeight, setWindowHeight] = useState(window.innerHeight);
    const lowerSectionElementRef = useRef(null);
    const [lowerSectionTopY, setLowerSectionTopY] = useState(0);
    const [lowerSectionHeight, setLowerSectionHeight] = useState(0);

    const toggleDebug = () => {
        setDebug(!isDebug);
    }

    const handleScroll = () => {
        setScrollY(window.scrollY);
    }

    // resize components when window size changed
    const handleResize = useCallback(() => {
        setWindowHeight(window.innerHeight);  // for window height display purposes only

        if (lowerSectionElementRef.current) {
            const rect = lowerSectionElementRef.current.getBoundingClientRect();
            setLowerSectionTopY(rect.top); // Get the top Y-coordinate
            setLowerSectionHeight(window.innerHeight - rect.top);// Set the new element height
        }
    }, [])

    // production mode shows limited shortcuts
    // staging shows a little more for testing
    // everything else (my dev env, e.g.) shows lots more
    const shortcuts = env === 'env-production'
        ? ['easterIsland', 'internetArchive', 'pdfCovid',]
        : env === 'env-staging'
            // default staging shortcuts
            ? ['easterIsland', 'internetArchive', 'mlk', 'short_test', ]

            // shortcuts for my local or any other development
            // : ['marcBolan', 'easterIsland', 'easter_island_short', 'hamas_israel', 'mlk', 'internetArchive', 'karen_bakker', 'short_test', 'pdfDesantis', 'pdfOneLink'];
            : ['marcBolan', 'easterIsland', 'easter_island_short', 'mlk', 'internetArchive', 'short_test'];


    // add environment tag to body element's class list to enable selective environment styling
    useEffect(() => {
        console.log('APP: useEffect[env]: app name: ' + package_json.name, ', version: ' + package_json.version)
        document.body.classList.add(env);
    }, [env])

    // add event listener for scroll and resize events
    useEffect(() => {

        const debounceHandleResize = debounce(() => {
            handleResize();
        }, 200);

        // Update the Y-coordinate when the component mounts
        handleResize();

        // listen for events on window
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', debounceHandleResize);

        // Clean up the event listener on component unmount
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
        };
    }, [handleResize]);

    // when debug shows/hides, readjust onscreen component sizes
    useEffect(() => {
        handleResize()
    }, [isDebug, handleResize]);


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
    const getMediaType = (path = '', cacheData = '') => {
        // set media type based on heuristic:

        // if cacheData, assume wiki

        // if path ends in ".pdf", assume pdf
        // if path contains ".wikipedia.org/wiki/, assume wiki

        // else unknown, for now


        if (cacheData)
            return 'wiki'


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
    const fetchArticleData = useCallback((
        {
            pathName,
            cacheData = '',
            refresh = false
        }) => {

        // handle null pathName
        if (!pathName && !cacheData) {
            console.log("APP::fetchArticleData: pathName is null-ish and no cache-data specified");
            setPageData(null);
            // TODO: use setMyError(null); // ??
            return;
        }

        // mediaType is "pdf", "html", "wiki", or anything else we come up with
        const myMediaType = getMediaType(pathName, cacheData);
        // TODO: idea: respect a "forceMediaType",
        // where it can force a media type endpoint, no matter what getMediaType thinks it is.
        // If so, passes it in to getPagePathEndpoint, where the endpoint is determined
        // by passed in mediaType rather than mediaType interpolated from pathName.

        console.log("APP: fetchArticleData: mediaType = ", myMediaType)

        // const myEndpoint = getPagePathEndpoint(myIariSourceId, pathName, cacheData, myMediaType, refresh);
        const myEndpoint = getPagePathEndpoint({
            iariSourceId: myIariSourceId,
            path: pathName,
            cacheData: cacheData,
            mediaType: myMediaType,
            refresh: refresh,
            parseMethod: parseMethod
        })

        console.log("APP::fetchArticleData: endpoint = ", myEndpoint)
        setEndpointPath(myEndpoint); // for debug display purposes only

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
                data.iariParseMethod = parseMethod;
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
                }
                setPageData(null);

            })

            .finally(() => {
                // console.log("fetch finally")
                setIsLoading(false);
            });

    }, [myIariSourceId, parseMethod])


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
            cache_data = '',
            refresh=false,
            iari_source = IariSources.iari_prod.key
        } ) => {

        const newUrl = window.location.protocol + "//"
            + window.location.host + window.location.pathname
            + `?url=${url}`
            + (cache_data ? `&cache_data=${cache_data}` : '')
            + (refresh ? '&refresh=true' : '')
            + (checkMethod ? `&method=${checkMethod}` : '')
            + (myIariSourceId ? `&iari-source=${iari_source}` : '')
            + (parseMethod ? `&parse_method=${parseMethod}` : '')
            + (isDebug ? '&debug=true' : '')

        console.log("refreshPageResults: new url path = ", newUrl)

        // setting the page url forces page to refresh, thus a "new  component render",
        // kicking off the following useEffect
        window.location.href = newUrl;

    }


    // fetch initial article specified on address bar with url param
    useEffect(() => {

        // set these states for debug display, essentially
        setTargetPath(myPath);
        setCacheData(myCacheData)
        setRefreshCheck(myRefresh);

        console.log(`APP: useEffect[myIariSourceId, myPath, myCacheData, myRefresh, fetchArticleData]: calling fetchArticleData: ${myPath}, ${myCacheData}, ${myRefresh}`)

        // and do the fetching for the path specified (pulled from URL address)
        fetchArticleData({
            pathName: myPath,
            cacheData: myCacheData,
            refresh: myRefresh
        })


    }, [myIariSourceId, myPath, myCacheData, myRefresh, fetchArticleData])


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
        setParseMethod(articleVersionId);
    };
    const articleVersionChoices = Object.keys(ParseMethods).map(key => {
        return { caption: ParseMethods[key].caption, value: ParseMethods[key].key }
    })
    const articleVersionChoiceSelect = <div className={"choice-wrapper article-version-wrapper"}>
        <Dropdown choices={articleVersionChoices}
                  label={'Article Parser Version:'}
                  onSelect={handleArticleVersionChange} defaultChoice={parseMethod}/>
    </div>


    const handleIariSourceIdChange = (sourceId) => {
        // console.log(`handleIariSourceChange: new iari source is: ${sourceId}`)
        refreshPageResults( {
            url : targetPath,
            cache_data : cacheData,
            refresh : refreshCheck,
            iari_source: sourceId,
        })
        // setIariSourceId(sourceId);
    };
    const iariChoices = Object.keys(IariSources)
        .filter(key => {
            return env === 'env-staging'
                ? !(key === "iari_local" || key === "iari")  // filter out iari_local and iari on Staging
                : true
        })
        .map( key => {
            return { caption: IariSources[key].caption, value: IariSources[key].key }
        })

    const iariChoiceSelect = <div className={"choice-wrapper iari-source-wrapper"}>
        <Dropdown choices={iariChoices} label={'Iari Source:'} onSelect={handleIariSourceIdChange} defaultChoice={myIariSourceId}/>
    </div>

    const versionInfo = `version ${package_json.version}`
    const siteInfo = (env !== 'env-production')  // TODO implement IareEnvironments
        ? (env !== 'env-staging'
            ? ` LOCAL `
            : ` STAGING `)
        : ''
    const iariSourceInfo = IariSources[myIariSourceId]?.caption

    // const siteInfo = (env?.key !== IareEnvironments.PROD.key)
    //     ? (env.key !== IareEnvironments.STAGE.key
    //         ? ` LOCAL `
    //         : ` STAGING `)
    //     : ''

                // const iareVersion = `${package_json.version}`
                // const siteDisplay = (env !== 'env-production')
                //     ? (env === 'env-staging'
                //         ? ` STAGING SITE `
                //         : (env === 'env-local'
                //             ? ` LOCAL SITE `
                //             : '' + env + ' SITE')
                //     )
                //     : ''

    const buttonShowDebug = (env !== 'env-production') &&
        <button className={"utility-button debug-button small-button"}
                onClick={toggleDebug} >{
        isDebug
            ? <>&#8212;</>
            : "+"  // dash (&#8212;) and plus sign
            // up triangle: <>&#9650;</>
            // dn triangle: <>&#9660;</>
        }</button>

    const heading = <div className={"header-contents"}>
        <h1>{appTitle}</h1>
        <div className={"header-aux1"}>{versionInfo}{siteInfo} ({iariSourceInfo}) {buttonShowDebug}</div>
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
        <p><span className={'label'}>Environment:</span> {env} <span className={'lolite'}>(host: {window.location.host})</span></p>
        <p><span className={'label'}>IARE Version:</span> {versionInfo}</p>
        <p><span className={'label'}>IARI Source:</span> {myIariSourceId} <span className={'lolite'}>({IariSources[myIariSourceId]?.proxy})</span></p>
        <p><span className={'label'}>IARI Version:</span> {pageData?.iari_version ? pageData.iari_version : "unknown"} </p>
        <p><span className={'label'}>Parse Method:</span> {ParseMethods[parseMethod].caption}</p>
        <p><span className={'label'}>Check Method:</span> {checkMethod} <span className={'lolite'}>({UrlStatusCheckMethods[checkMethod].caption})</span></p>
        <p><span className={'label'}>Target URL from query param:</span> {myPath}</p>
        <p><span className={'label'}>Use Cache Data:</span> {myCacheData ? myCacheData : 'N/A'}</p>
        <p><span className={'label'}>Force Refresh:</span> {refreshCheck ? "TRUE" : "false"}</p>
        <div>{debugButtons}</div>
        <p><span className={'label'}>pathName:</span> <MakeLink href={targetPath}/></p>
        <p><span className={'label'}>endpointPath:</span> <MakeLink href={endpointPath}/></p>
    </div>

    const tooltipConfirm = <MyTooltip id="confirm-tooltip-id"
                                         float={true}
                                         closeOnEsc={true}
                                         delayShow={120}
                                         variant={"info"}
                                         noArrow={true}
                                         offset={5}
                                         className={"confirm-tooltip"}
                                         style={{ zIndex: 999 }}
    />


    // set config for config context
    const config = {
        environment: env,
        iariSource: IariSources[myIariSourceId]?.proxy,
        iariSourceId: myIariSourceId,
        wikiBaseUrl: "https://en.wikipedia.org/wiki/",
        urlStatusMethod: checkMethod,
        articleVersion: myParseMethod,
        isDebug: !!isDebug,
        isShowUrlOverview: isShowUrlOverview,
        isShowShortcuts: isShowShortcuts,
        isShowDebugInfo: isShowDebugInfo,
        isShowDebugComponents: isShowDebugComponents,
        isShowViewOptions: isShowViewOptions,
        tooltipIdConfirm: "confirm-tooltip-id",
    }

    console.log(`APP: Rendering App component:`, JSON.stringify({
        path: targetPath,
        refreshCheck: refreshCheck,
        statusMethod: checkMethod,
        iari_source: myIariSourceId,
        // config: config,
    }))

    const defaultIfEmpty = "https://en.wikipedia.org/wiki/"

    return <>

        <ConfigContext.Provider value={config}>

            <div className="static-display">
                Scroll Y: {scrollY}<br/>
                Window H: {windowHeight}<br/>
                LowerSection Top: {lowerSectionTopY}
            </div>

            <div className="iare-view">

                <div className={"header"}>
                    {heading}
                    {debug}
                </div>

                <div className={"upper_section"}>
                    <PathNameFetch pathInitial={targetPath?.length > 0 ? targetPath : defaultIfEmpty}
                                   checkInitial={refreshCheck}
                                   placeholder={"Enter a Wikipedia article or PDF url here"}
                                   shortcuts={shortcuts}
                                   showShortcuts={isShowShortcuts}
                                   handlePathResults={handlePathResults}
                    />
                </div>


                {myError ? <div className={myError ? "error-display" : "error-display-none"}>
                    {myError}
                </div> : ""}

                <div className={"lower_section"}
                     ref={lowerSectionElementRef}
                     style={{ height: `${lowerSectionHeight}px` }}
                >
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

            </div>

            {tooltipConfirm}

        </ConfigContext.Provider>

    </>
}
