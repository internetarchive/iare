import React from "react";

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
        {debug}
    </div>

}

