import React  from 'react';
import ReactDOM from 'react-dom/client';

import './i18n'; // Import i18n configuration
import 'react-tooltip/dist/react-tooltip.css'
import "bootstrap/dist/js/bootstrap.bundle.min";
import './custom.scss'; // includes bootstrap.scss

import App from './App';

import {UrlStatusCheckMethods} from "./constants/checkMethods.jsx";
import {IariSources} from "./constants/iariSources.jsx";
import {ParseMethods} from "./constants/parseMethods.jsx";

import './index.css';

const getEnvironment = () => {
    const REGEX_PRODUCTION_ENV = new RegExp(/^(?:(?:[\w-]+\.)+)?(?:[\w-]+\.)?archive\.org$/);  // if "(\.?)archive.org" at end of string
    const host = window.location.host
    if (REGEX_PRODUCTION_ENV.test(host)) return 'env-production'
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

const getCheckMethod = (qParams, targetEnvironment) => {
    const tempDefaultKey = UrlStatusCheckMethods.LIVEWEBCHECK.key  // hard-set to LIVEWEBCHECK for production

    if (targetEnvironment === 'env-production') return tempDefaultKey
    // else
    const methodKey = queryParameters.has("method") ? queryParameters.get("method") : tempDefaultKey

    // if specified method not in our defined choices, notify as error and default to tempDefaultKey
    if (!UrlStatusCheckMethods[methodKey]) {
        console.error(`Method ${methodKey} not supported.`)
        return tempDefaultKey
    }
    return methodKey
}

/*
article version determines how the article data is interpreted.
 */
const getParseMethod = (qParams, targetEnvironment) => {
    // const defaultParseMethodKey = ParseMethods.WIKIPARSE_V1.key
    const defaultParseMethodKey = ParseMethods.WIKIPARSE_XREF.key

    // ONLY allow default version for production
    if (targetEnvironment === 'env-production')
        return defaultParseMethodKey

    // else respect query param setting
    const parseMethodKey = queryParameters.has("parse_method")
        ? queryParameters.get("parse_method")
        : defaultParseMethodKey

    // return key if OK
    if (ParseMethods[parseMethodKey]) return parseMethodKey

    // see if specified version key is in alternate keys of defined versions
    let altVersionKey
    Object.keys(ParseMethods).some(versionKey => {
        const altKeys = ParseMethods[versionKey].alternate_keys
        if (altKeys && altKeys.includes(parseMethodKey)) {
            altVersionKey = versionKey
            return true  // slip oyt of "some" loop
        } else {
            return false
        }
    })

    if (altVersionKey) return altVersionKey

    // slipping thru here means specified key is not a valid key or a
    // valid alternate key for article version; return default
    console.error(`Parse Method ${parseMethodKey} not supported.`)
    return defaultParseMethodKey

}

// ========================================

// const root = ReactDOM.createRoot(document.getElementById("root"));
const queryParameters = new URLSearchParams(window.location.search)
const env = getEnvironment();
const myDebug = queryParameters.has("debug") ? queryParameters.get("debug").toLowerCase() === 'true' : false;
const myPath = queryParameters.has("url") ? queryParameters.get("url") : '';
const myCacheData = queryParameters.has("cache_data") ? queryParameters.get("cache_data") : '';
const myRefresh = queryParameters.has("refresh") ? queryParameters.get("refresh").toLowerCase() === 'true' : false;
const myIariSourceId = getIariSource(queryParameters, env);
const myCheckMethod = getCheckMethod(queryParameters, env);
const myParseMethod = getParseMethod(queryParameters, env);

// root.render(<App env={env}
//                  myPath={myPath}
//                  myCacheData={myCacheData}
//                  myRefresh={myRefresh}
//                  myCheckMethod={myCheckMethod}
//                  myParseMethod={myParseMethod}
//                  myIariSourceId={myIariSourceId}
//                  myDebug={myDebug}
// />);

// ReactDOM.createRoot(document.getElementById('root')).render(<App />)

ReactDOM.createRoot(document.getElementById("root")).render(
    // <React.StrictMode>
        <App env={env}
         myPath={myPath}
         myCacheData={myCacheData}
         myRefresh={myRefresh}
         myCheckMethod={myCheckMethod}
         myParseMethod={myParseMethod}
         myIariSourceId={myIariSourceId}
         myDebug={myDebug} />
    // </React.StrictMode>
);

// ReactDOM.createRoot(document.getElementById('root'))
//     .render(<App env={env}
//                  myPath={myPath}
//                  myCacheData={myCacheData}
//                  myRefresh={myRefresh}
//                  myCheckMethod={myCheckMethod}
//                  myParseMethod={myParseMethod}
//                  myIariSourceId={myIariSourceId}
//                  myDebug={myDebug}
// />)
