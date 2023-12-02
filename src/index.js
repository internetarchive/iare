import React  from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import 'react-tooltip/dist/react-tooltip.css'

import "bootstrap/dist/js/bootstrap.bundle.min";
import './custom.scss'; // includes bootstrap.scss

import './index.css';
import {UrlStatusCheckMethods} from "./constants/checkMethods";
import {IariSources} from "./constants/endpoints";

const getEnvironment = () => {
    const host = window.location.host
    if (host === "archive.org") return 'env-production'
    if (host === "internetarchive.github.io") return 'env-staging'
    if (host === "localhost:3000") return 'env-local'
    return "env-other"
}

const getIariSource = (qParams, targetEnvironment) => {
    // TODO: will change default to "iari" eventually, when that proxy is stable

    // hard-set to iari_prod for production
    if (targetEnvironment === 'env-production') return IariSources.iari_prod.key
    // else default to stage if not specified
    const sourceKey = queryParameters.has("iari-source") ? queryParameters.get("iari-source") : IariSources.iari_stage.key

    // if specified source not in our defined choices, default to stage, and error
    if (!IariSources[sourceKey]) {
        console.error(`IARI Source ${sourceKey} not supported.`)
        return IariSources.iari_stage.key
    }
    return sourceKey
}

const getMethod = (qParams, targetEnvironment) => {
    // hard-set to WAYBACK for production
    if (targetEnvironment === 'env-production') return UrlStatusCheckMethods.WAYBACK.key
    // else
    const methodKey = queryParameters.has("method") ? queryParameters.get("method") : UrlStatusCheckMethods.WAYBACK.key

    // if specified mehtod not in our defined choices, default to WAYBACK, and error
    if (!UrlStatusCheckMethods[methodKey]) {
        console.error(`Method ${methodKey} not supported.`)
        return UrlStatusCheckMethods.WAYBACK.key
    }
    return methodKey
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
const queryParameters = new URLSearchParams(window.location.search)
const env = getEnvironment();
const myDebug = queryParameters.has("debug") ? queryParameters.get("debug").toLowerCase() === 'true' : false;
const myPath = queryParameters.has("url") ? queryParameters.get("url") : '';
const myRefresh = queryParameters.has("refresh") ? queryParameters.get("refresh").toLowerCase() === 'true' : false;
const myIariSourceId = getIariSource(queryParameters, env);
const myMethod = getMethod(queryParameters, env);

root.render(<App env={env} myPath={myPath} myRefresh={myRefresh} myMethod={myMethod} myIariSourceId={myIariSourceId} myDebug={myDebug}/>);

