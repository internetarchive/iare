import React from "react";

export default function RefSectionHeader({ leftPart = null, rightPart = null, children }) {
    return <div className={"header-full-width"}>

        {leftPart && <div className={"header-left-part"}>
            {leftPart}
        </div>}

        {rightPart && <div className={"header-right-part"}>
            {rightPart}
        </div>}

        {children}

    </div>
}

