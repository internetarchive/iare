import React, {useCallback, useEffect, useState} from "react";
import RefViewRefDisplay from "./RefViewRefDisplay";
// eslint-disable-next-line
import RefArticleInfo from "./RefArticleInfo";
import RefTemplates from "./RefTemplates";
import RefActionables from "./RefActionables";
import RefWikitext from "./RefWikitext";

/*

 */
function RefDetails({ refDetails,
                        pageData = {},
                        onAction,
                        tooltipId= null,
                        showDebug=false }) {

    const [wikitext, setWikitext]= useState(null)

    // adds "Escape Key closes modal" feature
    useEffect(() => {
        setWikitext(refDetails?.wikiText)
    }, [refDetails, setWikitext]);


    const handleLocalRefClick = (e) => {
        // console.log("handleClick local ref")
        e.preventDefault()


        let myTagName
        let myHref

        try {
            myTagName = e.target.tagName
        } catch(err) {
            myTagName = "error with tag name"
        }

        if (myTagName === "A") {
            try {
                myHref = e.target.attributes["href"].value
            } catch(err) {
                myHref = "error with link href"
            }


        }

        const myRel = e.target?.attributes["rel"]?.value

        console.log(`ref click, tagName = ${myTagName}`)
        console.log(`ref click, myRel = ${myRel}`)
        // console.log(`ref click, class = ${e.target.classList}`)
        console.log(`ref click, href = ${myHref}`)
    }

    const saveWikitext = useCallback ( (newText) => {
        // for now, we just set local wikitext.
        // soon we will insert/replace into reference data itself and resave the entire article (i think)

        console.log(`wikitext is: ${wikitext}`)
        setWikitext(newText)

        // set details.wikitext OR cause a wholesale refresh of the page,
        // since things could be very much changed
        // //
        // // for now, just change details
        // details.wikitext = newText

    // eslint-disable-next-line
    }, [] )

    const handleRefViewAction = useCallback( (result={}) => {
        // extract action and value from result
        const {action, value} = result;

        console.log(`RefView: handleAction: action=${action}, value=${value}`);

        if (0) {}  // allows easy else if's

        else if (action === "saveWikitext") {
            // this is where we need to asynchronously save the reference/entire page, and reload, basically
            const newText = value
            saveWikitext(newText)
        }

        else if (action === "jumpToCitationRef") {
            const citeRef = value
            alert(`jumpToCitationRef: Coming Soon (citeRef=${citeRef})`)
        }

    }, [saveWikitext])

    return <>
        <div className={"reference-info"} onClick={handleLocalRefClick}>
            <RefViewRefDisplay _ref={refDetails}
               articleVersion={pageData.iariArticleVersion}
               showDebug={showDebug} />
            {/*<RefArticleInfo _ref={refDetails} pageData={pageData}/>*/}
        </div>

        <RefActionables actionables={refDetails?.actionable} />

        <RefTemplates templates={refDetails?.templates} pageData={pageData} tooltipId={tooltipId} />
        {/*<RefWikitext wikitext={wikitext} ref_details={details} onAction={handleRefViewAction} />*/}

        <RefWikitext wikitext={refDetails?.wikitext} ref_details={refDetails} onAction={handleRefViewAction} />

    </>

}

export default RefDetails;
