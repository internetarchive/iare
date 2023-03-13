import React,{ useState } from "react";
import ButtonFetch from './ButtonFetch.js';

/*
expected props
    fileName            string file name to put in input field
    handleFileName      callback function to call when Fetch button clicked


 */
function FileNameFetch(props) {

        // const [myFileName, setMyFileName] = useState(props.fileName); // init with passed in name
    const [wikiUrl, setWikiUrl] = useState(props.wikiUrl); // init with passed in name

    const handleFileName = {

        handleChange: (event) => {
            setMyFileName(event.target.value); // set component-local version of fileName
        },

        // interpret Enter as submit button
        handleKeyPress: (event) => {
            let key = event.key;
            if (key === "Enter") {
                console.log("FileNameFetch: submitting via enter-key")
                props.handleFileName(myFileName)
            }
        },

        // submit form by calling passed in event handler for fileName
        handleSubmit: (event) => {
            // console.log("FileNameFetch: submitting; myFileName is:" + myFileName)
            props.handleFileName(myFileName); // callback up to caller
        }
    }
    const handleWiki = {
        handleChange : (event) => {
            setWikiUrl(event.target.value); // set component-local version of fileName
        },

        // interpret Enter as submit button
        handleKeyPress : (event) => {
            let key = event.key;
            if (key === "Enter") {
                console.log("FileNameFetch: submitting via enter-key")
                props.handleWikiUrl(wikiUrl)
            }
        },

        // submit form by calling passed in event handler for fileName
        handleSubmit : (event) => {
            console.log("FileNameFetch:handleWiki.handleSubmit, wikiUrl is:" + wikiUrl)
            props.handleWikiUrl(wikiUrl); // callback up to caller
        }
    };


    return (
        <div className={"file-fetch"}>

            {/*<div style={{ display: "inline-flex", flexDirection: "row" , flexWrap : "wrap"}}>*/}
            {/*    <div style={{marginBottom : ".5rem"}}><input*/}
            {/*        type="text"*/}
            {/*        id="fileName"*/}
            {/*        name="fileName"*/}
            {/*        value={myFileName}*/}
            {/*        onChange={handleChange}*/}
            {/*        onKeyPress={handleKeyPress} // TODO deprecated - should change to onKeyDOwn*/}
            {/*    /></div>*/}

            {/*    <div style={{display:"block"}}>*/}
            {/*        <button onClick={handleSubmit} style={{marginLeft:"10px"}}>*/}
            {/*            <span>{"Fetch"}</span>*/}
            {/*        </button>*/}
            {/*        <ButtonFetch buttonKey={"easterIsland2"} onClick={setMyFileName} />*/}
            {/*        <ButtonFetch buttonKey={"internetArchive2"} onClick={setMyFileName} />*/}
            {/*    </div>*/}
            {/*</div>*/}
            {/*<h3>File to process: {props.fileName}</h3>*/}

            <div className={"wiki-fetch-wrap"}>

                <div style={{marginBottom : ".5rem"}}><label
                    htmlFor="urlSource">Wiki Url: </label><input
                    type="text"
                    id="urlSource"
                    name="urlSource"
                    value={wikiUrl}
                    onChange={handleWiki.handleChange}
                    onKeyPress={handleWiki.handleKeyPress} // TODO deprecated - should change to onKeyDOwn
                /></div>

                <div style={{display:"block"}}>
                    <button onClick={handleWiki.handleSubmit} style={{marginLeft:"10px"}}>
                        <span>{"Fetch Ref Data"}</span>
                    </button>
                    <ButtonFetch buttonKey={"easterIslandFilename"} onClick={setWikiUrl}/>
                </div>
            </div>


        </div>
    );

}

export default FileNameFetch;