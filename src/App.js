import React, {useEffect, useState} from "react";
import package_json from "../package.json";
// import MakeLink from "./components/MakeLink";
import Dropdown from "./components/Dropdown";
import {IariSources} from "./constants/endpoints";
import {UrlStatusCheckMethods} from "./constants/checkMethods";
import {ConfigContext} from "./contexts/ConfigContext"
import ScoreBoard from "./components/main/ScoreBoard";
import AppHeader from "./AppHeader";


export default function App({env, myPath, myRefresh, myMethod, myIariSourceId, myDebug}) {

    const appTitle = "Internet Archive Reference Inventory Dashboard"
    const [isDebug, setDebug] = useState(myDebug);
    const [isShowShortcuts, setIsShowShortcuts] = useState(true);
    const [isShowExpertMode, setIsShowExpertMode] = useState(true);
    const [isShowNewFeatures, setIsShowNewFeatures] = useState(true);

    // params settable from from address url
    const [refreshCheck, setRefreshCheck] = useState(myRefresh);
    const [checkMethod, setCheckMethod] = useState(myMethod);

    const [myError, setMyError] = useState(null);

    const toggleDebug = () => {
        setDebug(!isDebug);
    }

    // add class to body to indicate environment
    useEffect(() => {
        console.log('APP: useEffect[env]: app name: ' + package_json.name, ', version: ' + package_json.version)
        document.body.classList.add(env);
    }, [env])
    // TODO do this up in index.js...


    // initialize
    useEffect(() => {
        setRefreshCheck(myRefresh);
    }, [myRefresh])


    const handleCheckMethodChange = (methodId) => {
        // console.log(`handleStatusMethodChange: new method is: ${methodId}`)
        setCheckMethod(methodId);
    };
    const methodChoices = Object.keys(UrlStatusCheckMethods).filter(f => !["IARI", "IABOT_SEARCHURL"].includes(f)).map( key => {
        return { caption: UrlStatusCheckMethods[key].caption, value: UrlStatusCheckMethods[key].key }
    })
    const methodChoiceSelect = <div className={"check-method-wrapper"}>
        <Dropdown choices={methodChoices} label={'Check Method:'} onSelect={handleCheckMethodChange} defaultChoice={checkMethod}/>
    </div>


    const handleIariSourceIdChange = (sourceId) => {

        // TODO:  what do we do here? change iariSource, i guess, and cause ScoreBoard to re-rerender
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

    const iariChoiceSelect = <div className={"iari-source-wrapper"}>
        <Dropdown choices={iariChoices} label={'Iari Source:'} onSelect={handleIariSourceIdChange} defaultChoice={myIariSourceId}/>
    </div>

    const versionDisplay = `version ${package_json.version}`
    const siteDisplay = (env !== 'env-production') ? ` STAGING SITE ` : ''
    const showHideDebugButton = (env !== 'env-production') && <button className={"utility-button debug-button small-button"}
            onClick={toggleDebug} >{
                isDebug ? <>&#8212;</> : "+"  // dash and plus sign
            }</button>
            // up and down triangles:  onClick={toggleDebug} >{isDebug ? <>&#9650;</> : <>&#9660;</>}</button>


    // set config for config context
    const config = {
        environment: env,
        iariSource: IariSources[myIariSourceId]?.proxy,
        urlStatusMethod: checkMethod,
        isDebug: !!isDebug,
        isShowShortcuts: isShowShortcuts,
        isShowExpertMode: isShowExpertMode,
        isShowNewFeatures: isShowNewFeatures,
    }

    console.log(`rendering App component:`, JSON.stringify({
        refreshCheck: refreshCheck,
        statusMethod: checkMethod,
        iari_source: myIariSourceId,
        config: config,
    }))

    useEffect(() => {
        setMyError(null)  // for now until fixed
    }, [])

    const buttons = <>
        <button // this is the 'show shortcuts' button
            className={"utility-button debug-button"}
            onClick={() => {
                setIsShowShortcuts(prevState => !prevState )
            }
            } >{isShowShortcuts ? "Hide" : "Show"} Shortcuts</button>
        &nbsp;
        <button // this is the 'show Expert Mode' button
            className={"utility-button debug-button"}
            onClick={() => {
                setIsShowExpertMode(prevState => !prevState )
            }
            } >{isShowExpertMode ? "Hide" : "Show"} Clipboard Controls</button>
        &nbsp;
        <button // this is the 'show New Features' button
            className={"utility-button debug-button"}
            onClick={() => {
                setIsShowNewFeatures(prevState => !prevState )
            }
            } >{isShowNewFeatures ? "Hide" : "Show"} New Features</button>
    </>

    const debug = <div className={"debug-section " + (isDebug ? "debug-on" : "debug-off")}>
        <div style={{marginBottom:".5rem"}}>{iariChoiceSelect} {methodChoiceSelect}</div>
        <div>{buttons}</div>
        <p><span className={'label'}>Environment:</span> {env}, ({window.location.host})</p>
        <p><span className={'label'}>IARE version:</span> {package_json.version}</p>
        <p><span className={'label'}>IARI Source:</span> {myIariSourceId} ({IariSources[myIariSourceId]?.proxy})</p>
        <p><span className={'label'}>Check Method:</span> {UrlStatusCheckMethods[checkMethod].caption} ({checkMethod})</p>
        <p><span className={'label'}>URL from address line:</span> {myPath}</p>
        <p><span className={'label'}>Force Refresh:</span> {refreshCheck ? "TRUE" : "false"}</p>

    </div>


    return <>

        <ConfigContext.Provider value={config}>

            <div className="iaridash">
                <AppHeader
                    debug={debug}
                    appTitle={appTitle}
                    versionDisplay={versionDisplay}
                    siteDisplay={siteDisplay}
                    showHideDebugButton={showHideDebugButton}
                    />

                <ScoreBoard options={{}} />

                {myError
                    ? <div className={myError ? "error-display" : "xerror-display-none"}>
                        {myError || "aerf!"}
                    </div>
                    : null}

            </div>

        </ConfigContext.Provider>

    </>
}
