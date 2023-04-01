import React, {useEffect, useState} from "react";
import package_json from "../package.json";
import {API_V2_URL_BASE} from "./constants/endpoints";
import PathNameFetch from "./components/PathNameFetch";
import Loader from "./components/Loader";
import PageDisplay from "./components/PageDisplay";

const useDebugAlerts = false;

export default function App() {

    const env = window.location.host === "archive.org" ? 'env-production' : 'env-other';

    /* if there is a url on the request address, then use it as pathName */
    const [pathName, setPathName] = useState(window.location.pathname ? window.location.pathname.replace(/^\/+/g, '') : '');
    const [endpointPath, setEndpointPath] = useState("");

    const [pageData, setPageData] = useState(null);
    const [myError, setMyError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);


    // add class to body to indicate environment
    useEffect(() => {
        console.log('APP: useEffect[env]: app name: ' + package_json.name, 'version: ' + package_json.version)
        document.body.classList.add(env);
    }, [env])


    function getWariVersion(pageData, endpointPath) {
        // eslint-disable-next-line
        const regexVersion1 = new RegExp("\/v1\/");
        // eslint-disable-next-line
        const regexVersion2 = new RegExp("\/v2\/");

        if (!endpointPath) {
            return "unknown";
        }
        if (regexVersion1.test(endpointPath))
            return "v1"
        else if (regexVersion2.test(endpointPath))
            return "v2"
        else
            return "unknown";
    }


    function convertPathToEndpoint(path = '') {
        // TODO: should change this to /article
        return `${API_V2_URL_BASE}/statistics/all?url=${path}`;
    }

    /*
        attempt to fetch json data from endpoint

        TODO account for error conditions, like wrong file format, not found, etc
     */
    const fileFetch = (endpointPath) => {

        console.log("APP::fileFetch: endpointPath = ", endpointPath)

        // handle null endpointPath
        if (!endpointPath) {
            console.log ("APP::fileFetch: endpointPath is null-ish");
            setPageData(null);
            return;
        }

        // show loading feedback
        setIsLoading(true);

        // fetch the data
        //
        // upon successful return of data, decorate the data with some informative fields
        //
        fetch(endpointPath, {})

            .then((res) => {
                if (!res.ok) throw new Error(res.status);
                return res.json();
            })

            .then((data) => {
                // decorate with some values
                data.pathName = pathName;
                data.endpoint = endpointPath;
                data.version = getWariVersion(data, endpointPath);
                // and set the new pageData state
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

    };

    function handlePathName(newPathName) {
        useDebugAlerts && alert("APP::handlePathName: new pathName is:" + newPathName)
        // console.log("APP::handlePathName: before setPathName, pathName = ", newPathName)
        setPathName(newPathName);
    }

    // fetch new data when endpointPath changes
    useEffect(() => {
        useDebugAlerts && alert("APP:::useEffect[pathName]: pathName is:" + pathName)

        const myEndpointPath = convertPathToEndpoint(pathName);
        setEndpointPath(myEndpointPath);

        console.log("APP: useEffect[pathName] AFTER setEndpointPath")

// eslint-disable-next-line
    }, [pathName])


    // fetch new data when endpointPath changes
    useEffect(() => {
        console.log("APP: useEffect[endpointPath] endpointPath:", endpointPath)

        if (endpointPath) {
            console.log("APP: useEffect[endpointPath] fileFetch[endpointPath]")
            fileFetch(endpointPath)
        }

// eslint-disable-next-line
    }, [endpointPath])


    // console.log("APP: pathName:", pathName);

    // render component
    return <>

        <div className="ware-view">

            <div className={"header"}>
                {env === 'env-production' ? null : <div className={"environment-tag"}>{"NON-PRODUCTION\u00A0\u00A0".repeat(8)}</div> }
                <h1>Wikipedia Article Reference Explorer <span className={"version-display"}> version {package_json.version}
                    <span className={"non-production"}> STAGING SITE</span></span></h1>
                {/*<Clock />*/}

                {/*<div className={"debug"}>*/}
                {/*    <p>pathName : {pathName}</p>*/}
                {/*    <p>endpointPath: {endpointPath}</p>*/}
                {/*</div>*/}

            </div>

            <PathNameFetch pathInitial={pathName} handlePathName={handlePathName} />

            {myError ? <div className={myError ? "error-display" : "error-display-none"}>
                {myError}
            </div> : ""}

            {isLoading ? <Loader/> : <>
                <PageDisplay pageData={pageData}/>
                { /* TODO: pass in an error callback here? */}
            </>
            }
        </div>
    </>
}
