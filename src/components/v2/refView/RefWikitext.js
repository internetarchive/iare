import React, {useEffect, useState} from "react";
import {copyToClipboard} from "../../../utils/utils";
// import { RichTextarea } from "rich-textarea";
import RefSectionHeader from "./RefSectionHeader";
import {ConfigContext} from "../../../contexts/ConfigContext";  // https://www.npmjs.com/package/rich-textarea
// https://github.com/inokawa/rich-textarea/blob/HEAD/docs/API.md
// https://github.com/inokawa/rich-textarea/tree/fee148effcd29e8c3e5b790774504c0f0fc0a8fe/stories

/*
shows wikitext box with allowance for edit and copy
*/

/*********
 *
 *
 *  This file is under construction...!
 *
 *
 * ********/

export default function RefWikitext({ wikitext, onAction }) {

    const [editable, setEditable]= useState(false)
    // eslint-disable-next-line
    const [originalWikitext, setOriginalWikitext]= useState("")
    const [localWikitext, setLocalWikitext]= useState("")

    let myConfig = React.useContext(ConfigContext);
    // eslint-disable-next-line
    myConfig = myConfig ? myConfig : {} // prevents "undefined.<param>" errors

    useEffect(() => {
        setOriginalWikitext(wikitext);
        setLocalWikitext(wikitext);
    }, [wikitext]); // Adding wikiText to the dependency array

    const handleEditMode = () => {
        if (editable) {
            // /* these comments are for when we REALLY save the changes to the original wikitext */
            // editable true means we were in edit mode and we are
            // indicating to SAVE the changes.
            // We accomplish this by setting the onAction to saveWikitext. That will
            // invoke a change of the reference_details, thereby refreshing the value

                        // alert ("will (but not yet) save changes to wikitext for this reference")
                        //
                        // onAction({action: "saveWikitext", value: localWikitext})

            /*
            send onAction to save new ref contents with newText.
            onAction = "saveWikitextEdits, contents=<new text>"
            that will:
            - save the data (hopefully, or return eith an error)
            - re-render the component with the newly-saved text of the reference details data
            - (maybe?) set the editable property back to false

            that will set the state with new reference details

            ? should we set edit mode here, or, which makes more sense, send back up
            with onAction, and let onAction set the edit mode?

            by using onAction to set mode status, we get for free notion of
            not having to reset the text itself, since it comes directly from the reference details
            and it has not been modified yet, so easy to "reset".

            for now, until we get it working, well just set it
            */

            setEditable(false)  // toggle state to display "Edit"

        } else {  // we are not in edit mode - put us there
            // // save current value for "cancel"
            // setSavedWikitext(localWikitext)

            // set editable
            setEditable(true)  // toggle state to display "Save"
        }
    }

    const handleEditRevert = () => {
        // restore wikitext to value in original citation
        if (!window.confirm("Are you sure you want to revert to the original Wikitext for this Citation?")) return
        setLocalWikitext(originalWikitext)

        // take out of editable mode
        setEditable(false)
    }

    const handleOnComplete = (message) => {
        alert(message)

        // TODO this is where we want to set up a disappearing tooltip
    }

    const buttonEditSave = <button className={`utility-button`} style={{width:"5rem"}}
                                   onClick={handleEditMode}><span>{editable ? "Done Editing" : "Edit Citation"}</span></button>

    const buttonCancel = editable
        ? <button className={`utility-button`} onClick={handleEditRevert}><span>Revert to Original</span></button>
        : null

    const buttonCopy = <button
        onClick={() => {copyToClipboard(localWikitext, 'Wikitext', handleOnComplete)} }
        className={`utility-button`}>
        <span>Copy to Clipboard</span>
    </button>

    const header = <RefSectionHeader
        leftPart={<><h3>Wikitext</h3><span>{buttonEditSave}{buttonCancel}{buttonCopy}</span></>}
        // rightPart={buttonCopy}
        >
        {/* nothing to see here */}
    </RefSectionHeader>



    // show the textarea text using this method: https://dev.to/joshuajee/how-to-fix-defaultvalue-error-while-working-with-textarea-in-react-1a55
    // const editable = false && true
    // console.log(`localWikitext: ${localWikitext}`)

    return <div className="ref-view-section ref-view-wikitext">
        <div className="col-12">
            {header}
            <textarea className={`raw-wikitext ${editable ? "editable" : "non-editable"}`}
                      readOnly={!editable}
                      value={localWikitext}
                      onChange={(e) => setLocalWikitext(e.target.value)}
            />
        </div>
    </div>

                // RichTextarea allows colored sections, delineated by <span>s, to be displayed

                // return (
                //     <RichTextarea
                //         value={localWikitext}
                //         style={{ width: "600px", height: "400px" }}
                //         onChange={(e) => setLocalWikitext(e.target.value)}
                //     >
                //         {(v) => {
                //             return v.split("").map((t, i) => (
                //                 <span key={i} style={{ color: i % 2 === 0 ? "red" : undefined }}>
                //             {t}
                //           </span>
                //             ));
                //         }}
                //     </RichTextarea>
                // )

}