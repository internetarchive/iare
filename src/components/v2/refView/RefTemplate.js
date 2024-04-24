import React, {useState} from "react";
import RefParameters from "./RefParameters";
// import RefTemplateUrl from "./RefTemplateUrl";
import RefSectionHeader from "./RefSectionHeader";

/*
shows tabs of template params if there; 1 tab for each template
 */
export default function RefTemplate({ template, pageData, tooltipId, options }) {

    // default showParams = true if not defined
    const [showParams, setShowParams] = useState(options ? (
        options.hasOwnProperty('showParams') ? !!options.showParams : true)
        : true)

    const toggleParams = () => {
        setShowParams(prevState => !prevState);
    }

    const plusMinusButton = <button
        data-tooltip-id={tooltipId}
        data-tooltip-html={"Click to show/hide template parameters"}
        className={"utility-button small-button"}
        onClick={toggleParams} >{
        // showParams ? <>&#8212;</> : "+"  // dash and plus sign
        showParams ? <>Hide Parameters</> : <>Show Parameters</>
        }</button>

                // const getTemplateUrl = (template) => {
                //     if (!pageData.urlDict) return null
                //     // use the "url" parameter as key for urlDict
                //     const url = template.parameters.url
                //     return pageData.urlDict[url]
                // }

                // get url objects from this template
                // TODO Is there only one url per template?!?
                // const urlObj = getTemplateUrl(template)

    return <div className="ref-view-template">

        <RefSectionHeader leftPart={<h3>Template: <span style={{color:"var(--color-ref-view-text)"}}>{template.name}</span> {plusMinusButton}</h3>} />

        {showParams && <RefParameters parameters={template.parameters} />}
        {/*<RefTemplateUrl url={urlObj} index={0} isSelected={false} />*/}
    </div>
}

