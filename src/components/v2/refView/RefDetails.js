import React, {useCallback, useEffect, useState} from "react";
import RefCitationDisplay from "./RefCitationDisplay";
// import RefArticleInfo from "./RefArticleInfo";
import RefTemplates from "./RefTemplates";
import RefActionables from "./RefActionables";
import RefWikitext from "./RefWikitext";
import RefUrls from "./RefUrls";

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
        <RefCitationDisplay _ref={refDetails}
                            articleVersion={pageData.iariArticleVersion}
                            showDebug={showDebug}
                            onClick={handleLocalRefClick}
        />

        <RefActionables actionables={refDetails?.actionable} />

        {/*<RefArticleInfo _ref={refDetails} pageData={pageData}/>*/}

        <RefWikitext wikitext={refDetails?.wikitext} ref_details={refDetails} onAction={handleRefViewAction} />

        <RefTemplates templates={refDetails?.templates} pageData={pageData} tooltipId={tooltipId} />

        <RefUrls urls={refDetails?.urls} pageData={pageData} />

    </>

}

export default RefDetails;
