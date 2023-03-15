import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import PageDisplay from './components/PageDisplay.js';
import FileNameFetch from './components/FileNameFetch.js';
import Loader from './components/Loader.js';
import { API_V2_URL_BASE } from './constants/endpoints.js';

function Clock(props) {
    const [time, setTime] = useState(new Date().toLocaleTimeString());

    setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);

    return <div className="j-view-clock">Current time: {time}</div>
}


function JView() {

    const [fileName, setFileName] = useState("");
    const [wikiUrl, setWikiUrl] = useState("");

    const [refreshTime, setRefreshTime] = useState(null);
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


    // N.B. this was used before when we specified the entire endpoint. Leaving it here just in case we want that again
    // /*
    //     callback function to be sent to fetch file name component
    //  */
    // function handleFileName(newFileName) {
    //     // console.log("old fileName is:" + fileName)
    //     // console.log("new fileName is:" + newFileName)
    //
    //     // clear out current pageData and reset refreshTime
    //     setPageData(null);
    //
    //     // changing refreshTime or fileName causes useEffect to engage, refreshing the page data
    //     setRefreshTime( Date() );
    //     setFileName(newFileName)
    // }

    function handleWikiUrl(newWikiUrl) {
        // clear out current pageData and reset refreshTime
        setPageData(null);

        // changing refreshTime or fileName causes useEffect to engage, refreshing the page data
        setRefreshTime( Date() );
        setWikiUrl(newWikiUrl)
    }


    // 2023.03.15 mojomonger : seems like not all versions of js like named groups in regular expressions, so avoiding for now
    // const REGEX_WIKIURL = new RegExp(/https?:\/\/(?<lang>\w+)\.(?<site>\w+)\.org\/wiki\/(?<title>\S+)/);
    const REGEX_WIKIURL = new RegExp(/https?:\/\/(\w+)\.(\w+)\.org\/wiki\/(\S+)/);
    // const API_V2_URL_BASE = 'https://archive.org/services/context/wari/v2';

    function convertWikiToEndpoint(wikiUrl='') {
        if (!wikiUrl) return null;
        const matches = wikiUrl.match(REGEX_WIKIURL);
        if(!matches) return null;

        // const [lang, site, title] = [matches[1],matches[2],matches[3]];
// eslint-disable-next-line
        const [url, lang, site, title] = matches;

        return `${API_V2_URL_BASE}/statistics/article?lang=${lang}&site=${site}&title=${title}`;
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
                setIsLoading(false);
                data.fileName = fileName;
                data.version = getWariVersion(pageData, fileName);
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

    // run this when wikiUrl changes
    useEffect(()=> {

        // clear error display
        setMyError(null)

        // attempt to fetch new pageData
        setFileName(convertWikiToEndpoint(wikiUrl)) // triggers fileFetch in other useEffect[fileName, refreshTime]
        // fileFetch(c)

// eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wikiUrl])



    // run when fileName or refreshTime changes
    useEffect(()=> {

        // clear error display
        setMyError(null)

        // attempt to fetch new pageData
        fileFetch(fileName)

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fileName, refreshTime])


    // render component
    return <>

        <div className="j-view">
            <h1>JSON Viewer for archive.org wikipedia refs, version v2</h1>
            <Clock />
            <FileNameFetch
                // handleFileName ={handleFileName} fileName = {fileName}
                handleWikiUrl ={handleWikiUrl} wikiUrl = {wikiUrl}
            />

            {myError ? <div className={myError ? "error-display" : "error-display-none"}>
                {myError}
            </div> : ""}

            {/*{isLoading ? <Loader /> : <>*/}
            {/*    <PageData pageData = {pageData} fileName = {fileName} />*/}
            {/*    { /* todo: pass in an error callback here? */ }
            {/*</>*/}

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
root.render(<JView />);

