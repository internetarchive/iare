import React, { useState } from "react";
import './shared/components.css';
// import Draggable from "react-draggable";

/* FilterBox component

- surrounds the children elements with a "filter-box" treatment, which currently includes:
    - stylized mini titlebar with open/close icon
    - (maybe in future:) draggable box

expected props:

 */
export default function FilterBox({
                                      caption = null,
                                      tooltip = '',
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
