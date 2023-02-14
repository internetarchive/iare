import React,{ useState } from "react";
import GlobalVars from './GlobalVars.js';

/*
expected props
    fileName            string file name to put in input field
    handleFileName      callback function to call when Fetch button clicked

 */
function FileNameFetch(props) {

    const [myFileName, setFileName] = useState(props.fileName); // init with passed in name

    const handleChange = (event) => {
        setFileName(event.target.value); // set component-local version of fileName
    };

    const handleSubmit = (event) => {
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
            />

            <button onClick={handleSubmit} style={{marginLeft:"10px"}}>
                <span>{"Fetch"}</span>
            </button>

            <button onClick={() => {
                setFileName(GlobalVars.defaultFile.value)
            }} style={{marginLeft:"10px"}}>
                <span>{GlobalVars.defaultFile.label}</span>
            </button>

            <h3>File to process: {props.fileName}</h3>

        </div>
    );

}

export default FileNameFetch;