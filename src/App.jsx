import React, {useCallback, useEffect, useState, useRef} from "react";
import {Tooltip as AppTooltip} from "react-tooltip";
import package_json from "../package.json";

import { IariError } from "./errors/IariError";

// import {debounce} from "./utils/generalUtils.js";
import {getPagePathEndpoint} from "./utils/iariUtils.js";

import MakeLink from "./components/MakeLink.jsx";
import Dropdown from "./components/Dropdown.jsx";
import Loader from "./components/Loader.jsx";
import PathNameFetch from "./components/PathNameFetch.jsx";
import PageDisplay from "./components/PageDisplay.jsx";

import {IariSources} from "./constants/iariSources.jsx";
import {UrlStatusCheckMethods} from "./constants/checkMethods.jsx";
import {ParseMethods} from "./constants/parseMethods.jsx";

import {ConfigContext} from "./contexts/ConfigContext"
import {ShortcutDefs, envShortcutLists} from "./constants/shortcutDefs.jsx";


export default function App({env, myPath, myCacheData, myRefresh, myCheckMethod, myParseMethod, myIariSourceId, myDebug}) {

    const appTitle = "Internet Archive Reference Explorer"

    const [isDebug, setDebug] = useState(myDebug);
    const [isScrollFix, setIsScrollFix] = useState(() => {
        // // // code for test if local exists or npt
        // const saved = localStorage.getItem('isScrollFix');
        // return saved ? JSON.parse(saved) : false;
        return false;
    });

    // these are config values to show/hide certain UI features, available from debug info box
    const [isShowUrlOverview, setIsShowUrlOverview] = useState(true);
    const [isShowShortcuts, setIsShowShortcuts] = useState(false);
    const [isShowUseCache, setIsShowUseCache] = useState(false);

    const [isShowDebugInfo, setIsShowDebugInfo] = useState(false);
    const [isShowDebugComponents, setIsShowDebugComponents] = useState(false);
    // const [isShowDebugControls, setIsShowDebugControls] = useState(false);

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
    const ERROR_MESSAGES = {
        'NETWORK': 'Failed to fetch - IARI service failure: Service down or CORS issue.',
        'NOT_FOUND': '404 Error finding target page.',
        'SERVER': '502 Server problem (no further info available)',
        'IARI': 'IARI failure: ',
        'DEFAULT': 'Unhandled error'
    };
    const [myError, setMyError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // values of screen elements
    const [scrollY, setScrollY] = useState(0);
    const [windowHeight, setWindowHeight] = useState(window.innerHeight);
    // const lowerSectionElementRef = useRef(null);
    const [lowerSectionTopY, setLowerSectionTopY] = useState(0);
    // const [lowerSectionHeight, setLowerSectionHeight] = useState(0);


    const toggleDebug = () => {
        setDebug(!isDebug);
    }

    const toggleScrollFix = () => {
        // toggles value of isScrollFix, which determines scroll fix mode of screen
        setIsScrollFix(prev => {
            // isScrollFix true allows scrolling without problems screen wide
            // isScrollFix false pegs scrolling to sections, so functionality may crowd
            const newScrollValue = !prev;
            // set style property of about-to-be-new value before setting state value;
            // this ensures the displayed value is in sync with stat-ed value
            document.documentElement.style.setProperty(
                "--iare-ux-body-overflow-y",
                newScrollValue ? "inherit" : "auto"
            );
            localStorage.setItem('isScrollFix', JSON.stringify(newScrollValue));  // so next invocation will remember
            return newScrollValue;
        });

    }

    const handleScroll = () => {
        setScrollY(window.scrollY);
    }

                // // resize components when window size changed
                // const handleResize = useCallback(() => {
                //     setWindowHeight(window.innerHeight);  // for window height display purposes only
                //
                //     if (lowerSectionElementRef.current) {
                //         const rect = lowerSectionElementRef.current.getBoundingClientRect();
                //         setLowerSectionTopY(rect.top); // Get the top Y-coordinate
                //         setLowerSectionHeight(window.innerHeight - rect.top);// Set the new element height
                //     }
                // }, [])


    const myShortcutList = React.useMemo(() => {
        return env === 'env-production'
            ? envShortcutLists.prod
            : env === 'env-staging'
                ? envShortcutLists.stage
                : envShortcutLists.other
    }, [env, envShortcutLists])

    const shortcuts = React.useMemo(() => {
        return myShortcutList
            // output array of objects with label and value props (to send to PathNameFetch)
            ? myShortcutList.map( sKey => {
                return ShortcutDefs[sKey]
                    ? ShortcutDefs[sKey]
                    : {
                        label: "Unknown Shortcut '" + sKey + "'",
                        value: "unknown"
                    }
            }).filter( sc => {return sc.value !== "unknown"}) // filter out the unknown ones
            : []
    }, [myShortcutList, ShortcutDefs]);


    // add environment tag to body element's class list to enable selective environment styling
    useEffect(() => {
        console.log('APP: useEffect[env]: app name: ' + package_json.name, ', version: ' + package_json.version)
        document.body.classList.add(env);

                        // // pull local storage settings
                        // const savedScrollFix = localStorage.getItem('isScrollFix');
                        // if (savedScrollFix !== null) {
                        //     setIsScrollFix(JSON.parse(savedScrollFix));
                        // }
    }, [env])

                // add event listener for scroll and resize events
                // useEffect(() => {
                //
                //     const debounceHandleResize = debounce(() => {
                //         handleResize();
                //     }, 200);
                //
                //     // Update the Y-coordinate when the component mounts
                //     handleResize();
                //
                //     // listen for events on window
                //     window.addEventListener('scroll', handleScroll);
                //     window.addEventListener('resize', debounceHandleResize);
                //
                //     // Clean up the event listener on component unmount
                //     return () => {
                //         window.removeEventListener('scroll', handleScroll);
                //         window.removeEventListener('resize', handleResize);
                //     };
                // }, [handleResize]);

                // // when debug shows/hides, readjust onscreen component sizes
                // useEffect(() => {
                //     handleResize()
                // }, [isDebug, handleResize]);


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
            return 'wiki'  // cacheData always returns a wiki cache for now....

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
    //
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
        const pageEndpoint = getPagePathEndpoint({
            iariSourceId: myIariSourceId,
            path: pathName,
            cacheData: cacheData,
            mediaType: myMediaType,
            refresh: refresh,
            parseMethod: parseMethod
        })

        console.log("APP::fetchArticleData: endpoint = ", pageEndpoint)
        setEndpointPath(pageEndpoint); // for display purposes only

        // TODO: maybe also always clear pageData, so components get
        //  cleared while waiting?
        setMyError(null);
        setIsLoading(true);

        // fetch the article data
        fetch(pageEndpoint, {})

            .then(async (res) => {
                const data = await res.json(); // parse JSON even for 500 errors
                if (!res.ok) {
                    /*
                    "data" variable expected to be like:
                    {
                        errors: [
                            {
                                error: "WikipediaApiFetchError",
                                details: "Error fetching details"
                            }
                        ]
                     }
                    */
                    const details =
                        data?.errors?.[0]?.details ??
                        data?.error?.details ??
                        null;

                    throw new IariError(details);
                }

                return data;
            })

            .then((data) => {

                // decorate the data with some informative fields upon successful data response
                data.pathName = pathName;
                data.endpoint = pageEndpoint;
                data.iariSource = IariSources[myIariSourceId]?.proxy;
                data.iariParseMethod = parseMethod;
                data.checkStatusMethod = checkMethod;
                data.forceRefresh = refresh;
                data.mediaType = myMediaType; // decorate based on mediaType?
                data.version = getIariVersion(data, pageEndpoint);  // version of pageData - determines display components
                data.iari_version = data.iari_version ? data.iari_version : "unknown";

                // and set the new pageData state
                setPageData(data);
            })

            .catch((err) => {
                if (err.name === IariError.name) {
                    setMyError(ERROR_MESSAGES.IARI + err.message);
                } else if (err.message === "404") {
                    setMyError(ERROR_MESSAGES.NOT_FOUND);
                } else if (err.message === "502") {
                    setMyError(ERROR_MESSAGES.SERVER);
                } else if (err.name === "TypeError" && err.message === "Failed to fetch") {
                    setMyError(ERROR_MESSAGES.NETWORK);
                } else {
                    setMyError(`${ERROR_MESSAGES.DEFAULT} ${err.name}: ${err.message}`);
                }
                setPageData(null);
            })

            .finally(() => {
                // console.log("fetch finally")
                setIsLoading(false);
            });

    }, [myIariSourceId, parseMethod])


    const handlePathResults = (pathResults) => {
        // callback for PathNameFetch component
        // pathResults[0] = pathName (string)
        // pathResults[1] = refreshCheck (boolean)

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
    const siteInfo = (env !== 'env-production')  // TODO implement IareEnvironments
        ? (env !== 'env-staging'
            ? ` LOCAL `
            : ` STAGING `)
        : ''
    const iariSourceInfo = IariSources[myIariSourceId]?.caption

    const buttonScrollFix = <div>
        <div>Scroll: <span className={"lock-icon"}
                           onClick={toggleScrollFix}
                           data-tooltip-id="app-tooltip-id"
                           data-tooltip-content={isScrollFix
                               ? "Currently released - Click to peg scroll to sections"
                               : "Currently pegged - Click to release scroll to screen"}>
            {isScrollFix
                ?
                <svg className={"svg-icon-box"} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path
                        d="M11 1a2 2 0 0 0-2 2v4a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h5V3a3 3 0 0 1 6 0v4a.5.5 0 0 1-1 0V3a2 2 0 0 0-2-2z"/>
                </svg>
                :
                <svg className={"svg-icon-box"} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path
                        d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                </svg>
            }
            </span></div>
    </div>


    const buttonShowDebug = (env !== 'env-production') &&
        <button className={"utility-button debug-button small-button"}
                onClick={toggleDebug} >{
            isDebug
                ? <>&#8212;</>
                : "+"  // dash (&#8212;) and plus sign
            // up triangle: <>&#9650;</>
            // dn triangle: <>&#9660;</>
        }</button>


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
        } >{isShowViewOptions ? "Hide" : "Show"} View Options</button>

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

    const debug = <div className={"debug-section " + (isDebug ? "debug-on" : "debug-off")}>
        {/*<div style={{marginBottom:".5rem"}}*/}
        {/*>{iariChoiceSelect} {methodChoiceSelect} {articleVersionChoiceSelect}</div>*/}
        <div>{iariChoiceSelect} {methodChoiceSelect} {articleVersionChoiceSelect}</div>
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
        tooltipIdApp: "app-tooltip-id",
    }

    console.log(`APP: Rendering App component:`, JSON.stringify({
        path: targetPath,
        refreshCheck: refreshCheck,
        statusMethod: checkMethod,
        iari_source: myIariSourceId,
        // config: config,
    }))

    const defaultIfEmpty = "https://en.wikipedia.org/wiki/"
    // TODO candidate for language strings

    const debugStaticDisplay = <div className="debug-static-display">
        Scroll Y: {scrollY}<br/>
        Window H: {windowHeight}<br/>
        LowerSection Top: {lowerSectionTopY}
    </div>


    useEffect( () => {
        // setMyError("Fake Error here!")
    }, [])


    const tooltipApp = <AppTooltip id="app-tooltip-id"
                                   float={true}
                                   closeOnEsc={true}
                                   delayShow={420}
                                   variant={"info"}
                                   noArrow={true}
                                   offset={5}
                                   className={"app-tooltip"}
                                   style={{ zIndex: 999, backgroundColor: "rgba(0,0,255,0.8)" }}
    />


    return <>

        {debugStaticDisplay}

        <ConfigContext.Provider value={config}>

            {/*<div className="iare-view">*/}

                <div className={"iare-ux-container main-container"}>

                    <div className={"iare-ux-header main-header"}>

                        <div className={"main-header-contents"}>
                            <div><h1 className={"app-title"}>{appTitle}</h1></div>
                            <div className={"iare-header-aux1"}>
                                {buttonScrollFix}&nbsp;
                                <div>{versionInfo}{siteInfo} ({iariSourceInfo})&nbsp;</div>
                                {buttonShowDebug}
                            </div>
                        </div>

                        {debug}

                    </div>

                    <div className={"iare-ux-body main-body"}>

                        <div className={"iare-ux-container page-container"}>

                            <div className={"iare-ux-header page-header"}>

                                <PathNameFetch pathInitial={targetPath?.length > 0 ? targetPath : defaultIfEmpty}
                                               className={"iare-path-fetch"}
                                               checkInitial={refreshCheck}
                                               placeholder={"Enter a Wikipedia article or PDF url here"}
                                               shortcuts={shortcuts}
                                               handlePathResults={handlePathResults}
                                               options = {{
                                                   showShortcuts: isShowShortcuts,
                                                   showUseCache: isShowUseCache,
                                               }}

                                />

                                {myError
                                    ? <div className={myError ? "error-display" : "error-display-none"}>
                                        {myError}
                                    </div>
                                    : ""
                                }

                            </div>

                            <div className={"iare-ux-body page-body"}>

                                {/*<div className={"test-contents"} >*/}
                                {/*    <h2>test-contents</h2>*/}
                                {/*    {Array.from({length: 20}, (_, i) => {return <p>Body Here!</p>})}*/}
                                {/*</div>*/}
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

                    </div>

                </div>

            {/*</div>*/}

            {tooltipApp}

        </ConfigContext.Provider>

    </>
}
