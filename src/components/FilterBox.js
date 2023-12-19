import React, { useState } from "react";
// import Draggable from "react-draggable";

/*
expected props:

 */
export default function FilterBox({
                          caption='',
                        defaultShow=false,
                            children
                           }) {

    const [showContents, setShowContents] = useState(defaultShow)

    const handleShow = () => {
        setShowContents( prevState => !prevState )
    }

    return <>
        {/*<Draggable>*/}

            <div className={"filter-box"}>

                <div className={"filter-box-caption"} onClick={handleShow}>{caption}
                    <div className={`filter-box-show ${showContents ? "closed" : "open" }`}
                        >{showContents ? "hide" : "show"}</div>
                </div>
                {showContents && <div className={"filter-box-contents"}>{children}</div>}

            </div>
        {/*</Draggable>*/}
    </>
}
