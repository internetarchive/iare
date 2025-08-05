import React, { useState } from "react";
import ButtonFetch from './ButtonFetch.jsx';
import Checkbox from "./Checkbox.jsx";
import "./shared/pathFetch.css"

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
        className= null,
        handlePathResults,
        shortcuts=[],
        placeholder='',

        options = {
            showShortcuts: false,
        }
}) {

    const [pathName, setPathName] = useState(pathInitial); // init with passed in name
    const [checked, setChecked] = React.useState(checkInitial);
    const [showShortcuts, setShowShortcuts] = React.useState(options.showShortcuts ?? false);

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

    const shortcutsButton = <button
        className={"utility-button small-button"}
        style={{margin: "0 0 0.2rem 10px"}}
        onClick={() => {setShowShortcuts(!showShortcuts)}} >
        <span>{showShortcuts ? "Hide Shortcuts" : "Show Shortcuts"}</span>
    </button>

    const shortcutsDisplay = showShortcuts && shortcuts?.length
        ? <div className="shortcuts-display">
            {shortcuts.map ( shortCutDef => {
                return <ButtonFetch key={shortCutDef.value} buttonDef={shortCutDef} onClick={setPathName} className={"path-shortcut"}/>
            })
            }
            {shortcutsButton}
        </div>
        : null

    return <div className={`path-fetch iare-focus-box${className ? ` ${className}` : ''}`}>

        <div className={"path-fetch-wrap"}>

            <div className={"path-input-wrapper"}><label
                    htmlFor="pathInput" id={'pathInput-label'}>URL: </label
                ><input
                    id="pathInput" name="pathInput"
                    type="search"
                    className="iare-input"
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
                {!showShortcuts && shortcutsButton}
            </div>

            {shortcutsDisplay}

        </div>

    </div>

}
