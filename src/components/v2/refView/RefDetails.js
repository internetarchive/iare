import React, {useCallback, useEffect, useState} from "react";
import RefCitationDisplay from "./RefCitationDisplay";
import RefTemplates from "./RefTemplates";
import RefActionables from "./RefActionables";
import RefWikitext from "./RefWikitext";
import RefUrls from "./RefUrls";
import {ACTIONS_IARE} from "../../../constants/actionsIare";
// import RefWikitextNew from "./RefWikitextNew";
import RefCitationDisplayHtml from "./RefCitationDisplayHtml";
import RefCitationClaim from "./RefCitationClaim";

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


    const handleCitationClick = (eRaw) => {
        // console.log("handleClick local ref")
        eRaw.preventDefault()

        const myCite = {
            tagName: "",
            href: "",
            link: "",
            // rel: "",
        }

        // redefine e to be closest "a" target
        const e = eRaw.target.closest('a')

        if (!e) return  // dont care if click is not on a hot link

        try {
            myCite.TagName = e.tagName
        } catch(err) {
            myCite.TagName = "TagName error"
        }

        if (myCite.TagName === "A") {
            try {
                // href is raw href data; link is href starting with wiki prefix
                // NB TODO must respect wiki language version for replacement link text
                myCite.href = e.attributes["href"].value
                myCite.link = myCite.href.replace(/^\.\//, "https://en.wikipedia.org/wiki/");

            } catch(err) {
                myCite.href = "Href error"
            }
        }

        // myCite.rel = e.attributes["rel"]?.value

        // console.log(`ref click, tagName = ${myCite.tagName}`)
        // console.log(`ref click, myRel = ${myCite.rel}`)
        // // console.log(`ref click, class = ${e.target.classList}`)
        // console.log(`ref click, href = ${myCite.href}`)
        // console.log(`ref click: link: ${myCite.link}`)

        window.open(myCite.link, '_blank')

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

        if (0) {}  // allows easy subsequent else if's

        else if (action === "saveWikitext") {
            // this is where we need to asynchronously save the reference/entire page, and reload, basically
            const newText = value
            saveWikitext(newText)
        }

        else if (action === ACTIONS_IARE.EDIT_WIKI_SECTION.key) {
            // NB not currently functional

            // // jumps to section in article specified and puts in edit mode
            //
            // const section_id = refDetails.section_id
            //
            // // jump to edit mode with section_id
            //
            // /*
            // https://en.wikipedia.org/w/index.php?title=Easter_Island&action=edit&section=2
            //  */
            //
            // const jump_string = `https://${pageData.lang}.${pageData.site}/w/index.php?title=${pageData.title}`
            //     + `&action=edit&section=${section_id}`
            //
            // alert(`will jump to section ${section_id} : ${jump_string}`)

        }

        else if (action === "jumpToCitationRef") {
            const citeRef = value
            alert(`jumpToCitationRef: Coming Soon (citeRef=${citeRef})`)
        }

        // eslint-disable-next-line
    }, [saveWikitext])

    const showWikitext = true  // allows on and off display of wikitext...under experimentation

    return <>

        <div className={"header-all-parts"}>
            <div className={"header-left-part"}>
                <h3>Citation</h3>
            </div>
        </div>


        <RefCitationDisplayHtml reference={refDetails} onClick={handleCitationClick} onAction={onAction} />

        <RefCitationDisplay _ref={refDetails}
                            pageData={pageData}
                            articleVersion={pageData.iariArticleVersion}
                            showDebug={showDebug}
                            onClick={handleCitationClick}
                            options = {{'hide_actionables':true }}
                            onAction={onAction}
        />

        <RefActionables actionables={refDetails?.actionable} />

        {/*<RefArticleInfo _ref={refDetails} pageData={pageData}/>*/}

        <RefCitationClaim reference={refDetails} />

        <RefUrls urls={refDetails?.urls} pageData={pageData} />

        {showWikitext && <RefWikitext wikitext={refDetails?.wikitext} ref_details={refDetails} onAction={handleRefViewAction} />}

        <RefTemplates templates={refDetails?.templates} pageData={pageData} tooltipId={tooltipId} />

        {/*<RefWikitextNew wikitext="" onAction={handleRefViewAction} />*/}

    </>

}

export default RefDetails;
