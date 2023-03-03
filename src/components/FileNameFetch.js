import React,{ useState } from "react";
import GlobalVars from './GlobalVars.js';

/*
expected props
    fileName            string file name to put in input field
    handleFileName      callback function to call when Fetch button clicked

 */
function FileNameFetch(props) {

    const [myFileName, setMyFileName] = useState(props.fileName); // init with passed in name

    const handleChange = (event) => {
        setMyFileName(event.target.value); // set component-local version of fileName
    };

    // interpret Enter as submit button
    const handleKeyPress = (event) => {
        let key = event.key;
        if (key === "Enter") {
            console.log("FileNameFetch: submitting via enter-key")
            props.handleFileName(myFileName)
        }
    };

    // submit form by calling passed in event handler for fileName
    const handleSubmit = (event) => {
        console.log("FileNameFetch: submitting; myFileName is:" + myFileName)
        props.handleFileName(myFileName); // callback up to caller
    };


    return (
        <div className={"j-view-file-info"}>
            <input
                type="text"
                id="fileName"
                name="fileName"
                value={myFileName}
                onChange={handleChange}
                onKeyPress={handleKeyPress} // TODO deprecated - should change to onKeyDOwn
            />

            <button onClick={handleSubmit} style={{marginLeft:"10px"}}>
                <span>{"Fetch"}</span>
            </button>

            <button onClick={() => {setMyFileName(GlobalVars.easterIsland.value)}} className={"file-shortcut"}>
                <span>{GlobalVars.defaultFile.label}</span>
            </button>

            <button onClick={() => {setMyFileName(GlobalVars.internetArchive.value)}} className={"file-shortcut"}>
                <span>{GlobalVars.internetArchive.label}</span>
            </button>

            <h3>File to process: {props.fileName}</h3>

        </div>
    );

}

export default FileNameFetch;