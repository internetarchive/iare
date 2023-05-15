import React  from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import 'react-tooltip/dist/react-tooltip.css'

// import 'bootstrap/dist/css/bootstrap.css';
import "bootstrap/dist/js/bootstrap.bundle.min";
// import bootstrap from 'bootstrap'
import './custom.scss';

import './index.css';

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

