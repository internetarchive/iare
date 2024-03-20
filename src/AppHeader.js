import React from "react";
import {Link} from "react-router-dom";

export default function AppHeader({debug,
                                      appTitle,
                                      versionDisplay,
                                      siteDisplay,
                                      showHideDebugButton}) {

    return <div className={"header"}>
        <div className={"header-contents"}>
            <h1>{appTitle}</h1>
            <div className={"header-aux1"}>{versionDisplay}{siteDisplay}{showHideDebugButton}</div>
        </div>
        <nav>
            <ul>
                <li>
                    <Link to="/">Home</Link>
                </li>
                <li>
                    <Link to="/grid">Data Grid</Link>
                </li>
                <li>
                    <Link to="/command">Command Tester</Link>
                </li>
            </ul>
        </nav>
        {debug}
    </div>

}

