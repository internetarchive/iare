import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import RefData from './components/RefData.js';
import PageData from './components/PageData.js';
import FileNameFetch from './components/FileNameFetch.js';

function Clock(props) {
    const [time, setTime] = useState(new Date().toLocaleTimeString());

    setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);

    return <div className="j-view-clock">Current time: {time}</div>
}


function JView() {

    // const [fileName, setFileName] = useState("/easter_island.json"); // default easter island
    const [fileName, setFileName] = useState("");
    const [pageData, setPageData] = useState(null);
    const [myError, setMyError] = useState(null);

    /*
        callback function to be sent to fetch file name component
     */
    function handleFileName(newFileName) {
        setFileName(newFileName)
    }

    /*
        attempts to fetch json data

        TODO account for error conditions, like wrong file format, not found, etc
     */
    function fileFetch(fileName) {

        if (!fileName) {
            setPageData(null);
            return;
        }

        fetch(fileName, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
            })

            .then((res) => {
                if(!res.ok) throw new Error(res.status);
                return res.json();
            })

            .then((data) => {
                    console.log("Received Data!");
                    setPageData(data);
                }
            )

            .catch((err) => {
                console.error(err);
                setMyError(err.toString())
                setPageData(null);
            })

            .finally(() => {
                console.log("fetch finally")
            });

    }

    // when fileName changed, this runs
    useEffect(()=> {
        setMyError(null)
        fileFetch(fileName)
    }, [fileName])


    // TODO need better way of faking null references and pageData (should not be re-declaring!)
    if (pageData) {
        // pull references out from page data
        var {references, ...pageInfo} = pageData;
    } else {
        // fakify references and pageInfo so sub-components behave well
        var references = null, pageInfo = null;
    }

    // render component
    return <>
        <div className="j-view">
            <h1>JSON Viewer for archive.org wikipedia refs</h1>
            <Clock />
            <FileNameFetch handleFileName ={handleFileName} fileName = {fileName} />
            {myError ? <div className={myError ? "error-display" : "error-display-none"}>
                {myError}
            </div> : ""}
            <PageData pageData = {pageInfo} fileName = {fileName} />
            <RefData refData = {references} />
        </div>
    </>
}


// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<JView />);

