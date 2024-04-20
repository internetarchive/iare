import React from "react";

export default function RefSectionHeader({ leftPart, rightPart, children }) {
    return <div className={"header-all-parts"}>

        {leftPart && <div className={"header-left-part"}>
            {leftPart}
        </div>}

        {rightPart && <div className={"header-right-part"}>
            {rightPart}
        </div>}

        {children}

    </div>
}

