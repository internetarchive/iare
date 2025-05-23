/* FilterBox component

- surrounds children elements with a "filter-box" treatment, which currently includes:
    - stylized mini titlebar with open/close icon
    - (maybe in future:) draggable box capabilities

 */
import React from "react";

export default function FilterBox({
                                      name = '',
                                      caption = null,
                                      className = null,
                                      tooltip = '',
                                      showContents = true,
                                      onToggle,
                                      children
                                  }) {

    return <>
        {/*<Draggable>*/ /* Not sure about this yet */}

            <div className={`filter-box ${className ? className : ''}`}>
                <div className={"filter-box-caption"} onClick={() => onToggle(name)}>{caption}
                    <div className={`filter-box-show ${showContents ? "closed" : "open" }`}
                    >{showContents ? "hide" : "show"}</div>
                </div>
                {showContents && <div className={"filter-box-contents"}>{children}</div>}

            </div>
        {/*</Draggable>*/}
    </>
}
