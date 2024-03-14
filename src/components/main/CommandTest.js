import React, {useState} from "react";
import './commandText.css'

/*
display command test for generic command, with response in response box
 */
export default function CommandTest({commandData = null, onAction}) {

    const editable = true
    const [localCommandText, setLocalCommandText]= useState("command text here")
    const localCommandResults = "Results will go here (state variable passed in to component)"

    const engageCommand = () => {

        // may want to set "fetching / waiting" status

        onAction({action: "engageCommand", value: localCommandText})

    }

    const buttonEngageCommand = <button
        className={`utility-button`} style={{width:"7rem"}}
        onClick={engageCommand}><span>{editable ? "Run Command" : "???"}</span></button>

    // const header = <div className={"header-all-parts"}>
    //     <div className={"header-left-part"}>
    //         <h3>Command Text</h3>{buttonEngageCommand}
    //     </div>
    // </div>

    return <>
        <div className="command-window">

            <div className="row command-text">
                <div className="col col-12">

                    <div className={"header-all-parts"}>
                        <div className={"row header-left-part"}>
                            <h3>Command Text</h3>
                        </div>
                        <div className={"row xxheader-right-part"}>
                            {buttonEngageCommand}
                        </div>
                    </div>

                    <textarea className={`command-text ${''/* your code here */}`}
                              readOnly={editable ? false : true}
                              value={localCommandText}
                              onChange={(e) => setLocalCommandText(e.target.value)}/>
                </div>
            </div>

            <div className="row command-results">
                <div className={"row header-left-part"}>
                    <h3>Command results</h3>
                </div>
                <div className="col col-12">
                    <textarea className={`command-results-text ${''/* your code here */}`}
                              readOnly={true}
                              value={localCommandResults} />
                </div>
            </div>


        </div>
    </>
}
