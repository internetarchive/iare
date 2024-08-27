import React, {useEffect, useState} from "react";
import {copyToClipboard} from "../../../utils/utils";
// import { RichTextarea } from "rich-textarea";
import RefSectionHeader from "./RefSectionHeader";
import {ConfigContext} from "../../../contexts/ConfigContext";
import {ACTIONS_IARE} from "../../../constants/actionsIare";
// import refDetails from "./RefDetails";  // https://www.npmjs.com/package/rich-textarea
// https://github.com/inokawa/rich-textarea/blob/HEAD/docs/API.md
// https://github.com/inokawa/rich-textarea/tree/fee148effcd29e8c3e5b790774504c0f0fc0a8fe/stories

/*
shows wikitext box with allowance for edit and copy
*/

/*********
 *
 * Contains wikitext after changes made by editing reference info
 *
 * This may be a stop-gap component, as eventually the wikitext of the article should be changed directly.
 *
 * ********/

export default function RefWikitextNew({ wikitext, onAction }) {  // NB TODO make onAction a typed property

    const [localWikitext, setLocalWikitext]= useState("")

    let myConfig = React.useContext(ConfigContext);
    // eslint-disable-next-line
    myConfig = myConfig ? myConfig : {} // prevents "undefined.<param>" errors

    useEffect(() => {
        setLocalWikitext(wikitext);
    }, [wikitext]); // Adding wikiText to the dependency array


    const handleSaveWikitext = () => {
        onAction({
            action:ACTIONS_IARE.SAVE_WIKITEXT.key,
            value: localWikitext
        })
    }

    const handleOnComplete = (message) => {
        alert(message)

        // TODO NB this is where we want to set up a disappearing tooltip
    }

    const buttonSaveWikitext = <button className={`utility-button`} xxstyle={{width:"8.5rem"}}
                                          onClick={handleSaveWikitext}><span>Save to Wiki Article</span></button>

    const buttonCopyWikitext = <button
        onClick={() => {copyToClipboard(localWikitext, 'Wikitext', handleOnComplete)} }
        className={`utility-button`}
        xxstyle={{width:"8.5rem"}}>
        <span>Copy Wikitext to Clipboard</span>
    </button>

    const header = <RefSectionHeader
        leftPart={<><h3>Modified Wikitext</h3><span>{buttonSaveWikitext}{buttonCopyWikitext}</span></>}
        // rightPart={buttonCopy}
    >
        {/* nothing to see here */}
    </RefSectionHeader>



    // show the localWikitext in textarea using this method: https://dev.to/joshuajee/how-to-fix-defaultvalue-error-while-working-with-textarea-in-react-1a55

    return <div className="ref-view-section ref-view-wikitext-new">
        <div className="col-12">
            {header}
            <textarea className={`raw-wikitext non-editable`}
                      readOnly={true}
                      value={localWikitext}
            />
        </div>
    </div>


}