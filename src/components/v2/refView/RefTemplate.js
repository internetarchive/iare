import React, {useState} from "react";
import RefParameters from "./RefParameters";
import RefTemplateUrl from "./RefTemplateUrl";

/*
shows tabs of template params if there; 1 tab for each template
 */
export default function RefTemplate({ template, pageData, tooltipId }) {

    const [showParams, setShowParams] = useState(false)

    const toggleParams = () => {
        setShowParams(prevState => !prevState);
    }

    const plusMinusButton = <button
        data-tooltip-id={tooltipId}
        data-tooltip-html={"Click to show/hide parameters"}
        className={"utility-button small-button"}
        onClick={toggleParams} >{
        // showParams ? <>&#8212;</> : "+"  // dash and plus sign
        showParams ? <>Hide Parameters</> : <>Show Parameters</>
        }</button>

    const getTemplateUrl = (template) => {
        if (!pageData.urlDict) return null
        // use the "url" parameter as key for urlDict
        const url = template.parameters.url
        return pageData.urlDict[url]
    }

    // get url objects from this template
    // TODO Is there only one url per template?!?
    const urlObj = getTemplateUrl(template)

    return <div className="ref-view-template">
        {/*<h3 className={"template-header"}>Template: {template.parameters.template_name} {plusMinusButton}</h3>*/}
        <h3 className={"template-header"}>Template: {template.name} {plusMinusButton}</h3>
        {showParams && <RefParameters parameters={template.parameters} />}
        <RefTemplateUrl url={urlObj} index={0} isSelected={false} />
    </div>
}

