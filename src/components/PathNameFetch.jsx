import React, { useState } from "react";
import ButtonFetch from './ButtonFetch.jsx';
import Checkbox from "./Checkbox.jsx";
import "./shared/pathFetch.css"
import {ShortcutDefs, envShortcutLists} from "../constants/shortcutDefs.jsx";

/*
expected props
    pathInitial            path string to put in input field
    checkInitial           initial checkbox state for "Force Refresh"
    handlePathResults      callback "Load" button clicked; expects 2 element array: [pathName, checked]
    shortcuts              array of ShortcutDefs, describing shortcut buttons to show
 */
export default function PathNameFetch({
        pathInitial='',
        checkInitial= false,
        handlePathResults,
        shortcuts=[],
        showShortcuts=false,
        placeholder='' }) {

    const [pathName, setPathName] = useState(pathInitial); // init with passed in name
    const [checked, setChecked] = React.useState(checkInitial);

    const handleCheckChange = () => {
        setChecked(!checked);
    };

    const returnResults = () => {
        handlePathResults([pathName, checked])
    }

    const myHandlePath = {
        handleChange : (event) => {
            // console.log("PathNameFetch::myHandleFetch.handleChange, event.target.value is:" + event.target.value)
            setPathName(event.target.value); // set component-local version of fileName
        },

        // interpret Enter as submit button
        handleKeyPress : (event) => {
            let key = event.key;
            if (key === "Enter") {
                // console.log("PathNameFetch::myHandleFetch.handleKeyPress: submitting via enter-key")
                returnResults()
            }
        },

        // submit form by calling event handler for pathName, handlePathName
        handleSubmit : (event) => {
            // console.log("PathNameFetch::myHandleFetch.handleSubmit, pathName is:" + pathName)
            returnResults()
        }
    };

    // // only if we want to restrict entry to being in list (subst pathName for text)
    // const disabled = React.useMemo(() => {
    //     return !data.some( d => d.label === text );
    // }, [text]);

    // const shortcutsDisplay = showShortcuts && shortcuts?.length
    //     ? <div style={{display: "block"}}>
    //         &nbsp;
    //         {shortcuts.map ( shortCutDef => {
    //             return <ButtonFetch key={shortCutDef.value} buttonKeyDef={shortCutDef} onClick={setPathName} className={"path-shortcut"}/>
    //         })
    //         }
    //     </div>
    //     : null

    const shortcutsDisplay = showShortcuts && shortcuts?.length
        ? <div style={{display: "block"}}>
            &nbsp;
            {shortcuts.map ( scKey => {
                // const shortCutDef = ShortcutDefs[scKey]
                // return <ButtonFetch key={shortCutDef.value} buttonKeyDef={shortCutDef} onClick={setPathName} className={"path-shortcut"}/>
                return <ButtonFetch key={scKey} buttonKeyDef={scKey} onClick={setPathName} className={"path-shortcut"}/>
            })
            }
        </div>
        : null

    return <div className={"path-fetch"}>

        <div className={"path-fetch-wrap"}>

            <div className={"path-input-wrapper"}><label
                    htmlFor="pathInput" id={'pathInput-label'}>URL: </label
                ><input
                    id="pathInput" name="pathInput"
                    type="search"
                    list="shortcuts-list"
                    autoComplete="on"
                    value={pathName}
                    onChange={myHandlePath.handleChange}
                    onKeyPress={myHandlePath.handleKeyPress} // TODO deprecated - should change to onKeyDown
                    placeholder = {placeholder ? placeholder : ''}
                />
                {/*<datalist id="shortcuts-list">*/}
                {/*    { shortcuts.map( sc => <option key={sc.value} value={sc.value} /> )}*/}
                {/*</datalist>*/}

            </div>

            <div style={{display: "block"}}>
                <button className={"utility-button"} style={{margin: "0 0 0.2rem 10px"}} onClick={myHandlePath.handleSubmit} >
                    <span>{"Load References"}</span>
                </button
                ><Checkbox className={"chk-force-refresh"} label={"Force Refresh"} value={checked} onChange={handleCheckChange}/>
            </div>

            {shortcutsDisplay}

        </div>

    </div>

}
