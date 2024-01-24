import React, {useState} from "react";
import RefTemplateLink from "./RefTemplateLink";
import RefParameters from "./RefParameters";

/*
shows tabs of template params if there; 1 tab for each template
 */
export default function RefTemplate({ template }) {

    const [showParams, setShowParams] = useState(false)

                    // function Parameters({parameters}) {
                    //     if (!parameters) {
                    //         return <p>xx No parameters for Template!</p>
                    //     }
                    //     const displayParameterValue= (key) => {
                    //         if (key === "doi") {
                    //             const href = `https://doi.org/${encodeURIComponent(parameters.doi)}`
                    //             return <MakeLink href={href} linkText={`${parameters.doi}`}/>
                    //         }
                    //         return parameters[key]
                    //     }
                    //
                    //     const keyNames = Object.keys(parameters).filter(name => name !== "template_name")
                    //     // // keyNames.sort();
                    //
                    //     // Sort items as: title, url, archive_url, url_status on top;
                    //     // template_name on bottom,
                    //     // rest alpha...
                    //
                    //     keyNames.sort((keyA,keyB) => {
                    //         // ensure first ones sort in this order at the top...
                    //         if (keyA === "title" || keyB === "title") return (keyA === "title" ? -1 : 1)
                    //         if (keyA === "url" || keyB === "url") return (keyA === "url" ? -1 : 1)
                    //         if (keyA === "archive_url" || keyB === "archive_url") return (keyA === "archive_url" ? -1 : 1)
                    //         if (keyA === "url_status" || keyB === "url_status") return (keyA === "url_status" ? -1 : 1)
                    //         if (keyA === "doi" || keyB === "doi") return (keyA === "doi" ? -1 : 1)
                    //
                    //         // ensure template_name always places last
                    //         if (keyA === "template_name" || keyB === "template_name") return (keyA === "template_name" ? 1 : -1)
                    //
                    //         // if (keyA > keyB) return 1;
                    //         // if (keyB > keyA) return -1;
                    //         return 0;
                    //     })
                    //
                    //     return keyNames.map((key, i) => {
                    //         // show with styling for param name and value
                    //         return <div className={`param-row`} key={i}>
                    //             <div className={"col-3 param-name"}>{key}</div>
                    //             <div className={"col-9 param-value"}>{displayParameterValue(key)}</div>
                    //         </div>
                    //     })
                    //
                    // }

    const toggleParams = () => {
        setShowParams(prevState => !prevState);
    }

    const plusMinusButton = <button className={"utility-button small-button"}
                                    onClick={toggleParams} >{
        showParams ? <>&#8212;</> : "+"  // dash and plus sign
    }</button>

    const getTemplateUrls = (template) => {
        return template.parameters.url
    }

    // collect url's from this template
    const url = getTemplateUrls(template)

    return <div className="ref-view-template">
        <h3 className={"template-header"}>Template: {template.parameters.template_name} {plusMinusButton}</h3>
        {showParams && <RefParameters parameters={template.parameters} />}
        <RefTemplateLink url={url} />
    </div>
}

