import React  from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import 'react-tooltip/dist/react-tooltip.css'

import "bootstrap/dist/js/bootstrap.bundle.min";
import './custom.scss'; // includes bootstrap.scss

import './index.css';
import {UrlStatusCheckMethods} from "./constants/endpoints";

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
const queryParameters = new URLSearchParams(window.location.search)
const env = window.location.host === "archive.org" ? 'env-production' : 'env-other';
const myPath = queryParameters.has("url") ? queryParameters.get("url") : '';
const myRefresh = queryParameters.has("refresh") ? queryParameters.get("refresh").toLowerCase() === 'true' : false;
const myMethod = queryParameters.has("method") ? queryParameters.get("method") : UrlStatusCheckMethods.IABOT.key;
root.render(<App env={env} myPath={myPath} myRefresh={myRefresh} myMethod={myMethod}/>);

