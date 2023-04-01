import React,{ useState } from "react";
import ButtonFetch from './ButtonFetch.js';

/*
expected props
    pathInitial         path string to put in input field
    handlePathName      callback function to call when "Load" button clicked
 */
export default function PathNameFetch({ pathInitial, handlePathName } ) {

    const [pathName, setPathName] = useState(pathInitial); // init with passed in name

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
                handlePathName(pathName)
            }
        },

        // submit form by calling event handler for pathName, handlePathName
        handleSubmit : (event) => {
            // console.log("PathNameFetch::myHandleFetch.handleSubmit, pathName is:" + pathName)
            handlePathName(pathName); // callback up to caller
        }
    };

    return <div className={"path-fetch"}>

        <div className={"path-fetch-wrap"}>

            <div style={{marginBottom: ".5rem"}}><label
                htmlFor="pathInput">Path Url: </label
            ><input
                id="pathInput" name="pathInput"
                type="text"
                value={pathName}
                onChange={myHandlePath.handleChange}
                onKeyPress={myHandlePath.handleKeyPress} // TODO deprecated - should change to onKeyDOwn
            /></div>

            <div style={{display: "block"}}>
                <button onClick={myHandlePath.handleSubmit} style={{marginLeft: "10px"}}>
                    <span>{"Load References"}</span>
                </button>
                <ButtonFetch buttonKey={"easterIslandFilename"} onClick={setPathName}/>
                <ButtonFetch buttonKey={"internetArchiveFilename"} onClick={setPathName}/>
            </div>

        </div>

    </div>

}
