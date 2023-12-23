import React, { useState } from "react";
// import Draggable from "react-draggable";

/*
expected props:

 */
export default function FilterBox({
                          caption='',
                        showContents = true,
                            children
                           }) {

    const [expanded, setExpanded] = useState(showContents)

    const handleExpand = () => {
        setExpanded( prevState => !prevState )
    }

    return <>
        {/*<Draggable>*/ /* Not sure about this yet */}

            <div className={"filter-box"}>

                <div className={"filter-box-caption"} onClick={handleExpand}>{caption}
                    <div className={`filter-box-show ${expanded ? "closed" : "open" }`}
                        >{expanded ? "hide" : "show"}</div>
                </div>
                {expanded && <div className={"filter-box-contents"}>{children}</div>}

            </div>
        {/*</Draggable>*/}
    </>
}
