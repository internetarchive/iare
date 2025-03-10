import React, {useState} from "react";
import RefParameters from "./RefParameters.jsx";
// import RefTemplateUrl from "./RefTemplateUrl.jsx";
import RefSectionHeader from "./RefSectionHeader.jsx";

/*
shows parameters of Template with Expand/Collapse
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
        showParams ? <>Collapse</> : <>Expand</>
        }</button>

    return <div className="ref-view-template">

        <RefSectionHeader leftPart={<h3>Template: <span style={{color:"var(--color-ref-view-text)"}}>{template.name}</span> {plusMinusButton}</h3>} />

        {showParams && <RefParameters parameters={template.parameters} />}
        {/*<RefTemplateUrl url={urlObj} index={0} isSelected={false} />*/}
    </div>
}

