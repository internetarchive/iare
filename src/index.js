import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import RefData from './components/RefData.js';
import PageData from './components/PageData.js';

function Clock(props) {
    const [time, setTime] = useState(new Date().toLocaleTimeString());

    setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);

    return <p>Current time: {time}</p>
}

function FileData(props) {
    return <div className="j-view-file-info">
        <p>File Name: {props.fileName}</p>
    </div>
}

function JView() {

    const [fileName, setFileName] = useState("/easter_island.json");
    const [pageData, setPageData] = useState({"references" : {}});

    useEffect(()=> {

        fetch(fileName, {
            headers : {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
            .then((res) => { return res.json();})
            .then((data) => {
                console.log("Received Data!") ;
                setPageData(data);
            }
            );

    }, [])

    var {references, ...pageInfo} = pageData;
    // var {details, ...refInfo} = references;

    return <>
        <div className="j-view">
            <h1>JSON Viewer for archive.org wikipedia pages</h1>
            <Clock />
            <FileData fileName = {fileName} />
            <PageData pageData = {pageInfo} />
            <RefData refData = {references} />
        </div>
    </>
}




// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<JView />);

