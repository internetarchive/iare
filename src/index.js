import React  from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import 'react-tooltip/dist/react-tooltip.css'

import "bootstrap/dist/js/bootstrap.bundle.min";
import './custom.scss'; // includes bootstrap.scss

import './index.css';
import {UrlStatusCheckMethods} from "./constants/endpoints";
import {IariSources} from "./constants/endpoints";

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
const queryParameters = new URLSearchParams(window.location.search)
const env = window.location.host === "archive.org" ? 'env-production' : 'env-other';
const myDebug = queryParameters.has("debug") ? queryParameters.get("debug").toLowerCase() === 'true' : false;
const myPath = queryParameters.has("url") ? queryParameters.get("url") : '';
const myRefresh = queryParameters.has("refresh") ? queryParameters.get("refresh").toLowerCase() === 'true' : false;
const myMethod = queryParameters.has("method") ? queryParameters.get("method") : UrlStatusCheckMethods.IABOT.key;
const myIariSourceId = queryParameters.has("iari-source") ? queryParameters.get("iari-source") : IariSources.iari_stage.key;
    // TODO: will change default to "iari" eventually, when that proxy is stable

root.render(<App env={env} myPath={myPath} myRefresh={myRefresh} myMethod={myMethod} myIariSourceId={myIariSourceId} myDebug={myDebug}/>);

