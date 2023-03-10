import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import PageData from './components/PageData.js';
import FileNameFetch from './components/FileNameFetch.js';
import Loader from './components/Loader.js';

function Clock(props) {
    const [time, setTime] = useState(new Date().toLocaleTimeString());

    setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);

    return <div className="j-view-clock">Current time: {time}</div>
}


function JView() {

    const [fileName, setFileName] = useState("");
    const [refreshTime, setRefreshTime] = useState(null);
    const [pageData, setPageData] = useState(null);
    const [myError, setMyError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    /*
        callback function to be sent to fetch file name component
     */
    function handleFileName(newFileName) {
        // console.log("old fileName is:" + fileName)
        // console.log("new fileName is:" + newFileName)

        // clear out current pageData and reset refreshTime
        setPageData(null);

        // changing refreshTime or fileName causes useEffect to engage, refreshing the page data
        setRefreshTime( Date() );
        setFileName(newFileName)
    }

    /*
        attempts to fetch json data

        TODO account for error conditions, like wrong file format, not found, etc
     */
    function fileFetch(fileName) {

        // handle null fileName
        if (!fileName) {
            setPageData(null);
            return;
        }

        // show loading feedback
        setIsLoading(true);

        // fetch the data
        fetch(fileName, {
            // headers: {
            //     'Content-Type': 'application/json',
            //     'Accept': 'application/json'
            // }
            // // // hmmm...removing the headers seems to allow this to work...with CORS allowed in browser plugin
            })

            .then((res) => {
                if(!res.ok) throw new Error(res.status);
                return res.json();
            })

            .then((data) => {
                setIsLoading(false);
                setPageData(data);
            })

            .catch((err) => {
                setMyError(err.toString())
                setPageData(null);
                setIsLoading(false);

            })

            .finally(() => {
                // console.log("fetch finally")
            });

    }


    useEffect(()=> {

        // clear error display
        setMyError(null)

        // attempt to fetch new pageData
        fileFetch(fileName)

    }, [fileName, refreshTime]) // run this when fileName or refreshTime changes


    // render component
    return <>
        <div className="j-view">
            <h1>JSON Viewer for archive.org wikipedia refs, version v2</h1>
            <Clock />
            <FileNameFetch handleFileName ={handleFileName} fileName = {fileName} />
            {myError ? <div className={myError ? "error-display" : "error-display-none"}>
                {myError}
            </div> : ""}

            {isLoading ? <Loader /> : <>
                <PageData pageData = {pageData} fileName = {fileName} />
                { /* todo: pass in an error callback here? */ }
            </>
            }
        </div>
    </>
}


// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<JView />);

