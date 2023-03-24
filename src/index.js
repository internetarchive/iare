import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import PageDisplay from './components/PageDisplay.js';
import FileNameFetch from './components/FileNameFetch.js';
import Loader from './components/Loader.js';
import { API_V2_URL_BASE } from './constants/endpoints.js';
const package_json = require('../package.json');

function Clock(props) {
    const [time, setTime] = useState(new Date().toLocaleTimeString());

    setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);

    return <div className="j-view-clock">Current time: {time}</div>
}


function App() {

    const [wikiUrl, setWikiUrl] = useState("");

    const [pageData, setPageData] = useState(null);
    const [myError, setMyError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    function getWariVersion( pageData, fileName ) {
        // eslint-disable-next-line
        const regexVersion1 = new RegExp("\/v1\/");
        // eslint-disable-next-line
        const regexVersion2 = new RegExp("\/v2\/");

        if (!fileName) {return "unknown";}
        if (regexVersion1.test(fileName))
            return "v1"
        else if (regexVersion2.test(fileName))
            return "v2"
        else
            return "unknown";
    }


    /*
        attempts to fetch json data

        TODO account for error conditions, like wrong file format, not found, etc
     */
    function fileFetch(fileName) {

        console.log("fileFetch: fileName = ", fileName)

        // handle null fileName
        if (!fileName) {
            setPageData(null);
            return;
        }

        // show loading feedback
        setIsLoading(true);

        // fetch the data
        //
        // upon successful return of data, add a "version" field to it
        //
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
                data.fileName = fileName;
                data.version = getWariVersion(data, fileName);
                setPageData(data);
            })

            .catch((err) => {
                setMyError(err.toString())
                setPageData(null);

            })

            .finally(() => {
                // console.log("fetch finally")
                setIsLoading(false);
            });

    }

    const env = window.location.host === "archive.org" ? 'env-production' : 'env-other';

    // add class to body to show environment
    useEffect( () => {
        console.log('name: ' + package_json.name, 'version: ' + package_json.version )
        console.log('host: ' + window.location.host )
        document.body.classList.add(env);
    }, [env])


    function convertWikiToAllEndpoint(wikiUrl='') {
        return `${API_V2_URL_BASE}/statistics/all?url=${wikiUrl}`;
    }

    function handleWikiUrl(wikiUrl) {

        // clear pageData and error
        setPageData(null);
        setMyError(null)

        const myFileName = convertWikiToAllEndpoint(wikiUrl);

        setWikiUrl(wikiUrl);

        // attempt to fetch new pageData
        fileFetch(myFileName)

    }


    // render component
    return <>
        { env !== 'env-production' ? <div className={"environment-tag"}>NON-PRODUCTION&nbsp;&nbsp;NON-PRODUCTION&nbsp;&nbsp;NON-PRODUCTION&nbsp;&nbsp;NON-PRODUCTION&nbsp;&nbsp;NON-PRODUCTION</div> : null}

        <div className="j-view">

            <h1>Wikipedia Article Reference Explorer <span style={{fontSize:".7em", fontWeight:"normal", color:"grey"}}> version {package_json.version}</span></h1>
            <Clock />

            <FileNameFetch
                // handleFileName ={handleFileName} fileName = {fileName}
                handleWikiUrl ={handleWikiUrl} wikiUrl = {wikiUrl}
            />

            {myError ? <div className={myError ? "error-display" : "error-display-none"}>
                {myError}
            </div> : ""}

            {isLoading ? <Loader /> : <>
                <PageDisplay pageData = {pageData} />
                { /* todo: pass in an error callback here? */ }
                </>
           }
        </div>
    </>
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

