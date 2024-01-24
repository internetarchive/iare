import React from "react";
import MakeLink from "../../MakeLink";

/*
shows parameters with option to edit via action
 */
export default function RefParameters({ parameters, onAction }) {

    function getParameters(parameters) {
        if (!parameters) {
            return <p>No parameters to show.</p>
        }
        const displayParameterValue= (key) => {
            if (key === "doi") {
                const href = `https://doi.org/${encodeURIComponent(parameters.doi)}`
                return <MakeLink href={href} linkText={`${parameters.doi}`}/>
            }
            return parameters[key]
        }

        const keyNames = Object.keys(parameters).filter(name => {
            if (name === "template_name") return false
            if (name === "url") return false
            if (name === "archive_url") return false
            return true
        })

        // This allows sorting of certain specific parameter names to "float" to the top,
        // as well as force other parameter names to the bottom.
        // If a parameter is not special handled, it just sorts in the order it arrived
        keyNames.sort((keyA,keyB) => {

            // ensure first ones sort in this order at the top...
            if (keyA === "title" || keyB === "title") return (keyA === "title" ? -1 : 1)
            if (keyA === "trans_title" || keyB === "trans_title") return (keyA === "trans_title" ? -1 : 1)
            if (keyA === "url" || keyB === "url") return (keyA === "url" ? -1 : 1)
            if (keyA === "archive_url" || keyB === "archive_url") return (keyA === "archive_url" ? -1 : 1)
            if (keyA === "url_status" || keyB === "url_status") return (keyA === "url_status" ? -1 : 1)
            if (keyA === "doi" || keyB === "doi") return (keyA === "doi" ? -1 : 1)

            // ensure template_name always places last
            if (keyA === "template_name" || keyB === "template_name") return (keyA === "template_name" ? 1 : -1)

            // if (keyA > keyB) return 1;
            // if (keyB > keyA) return -1;
            return 0;
        })

        return keyNames.map((key, i) => {
            // show with styling for param name and value
            return <div className={`param-row`} key={i}>
                <div className={"col-3 param-name"}>{key}</div>
                <div className={"col-9 param-value"}>{displayParameterValue(key)}</div>
            </div>
        })

    }

    const params = getParameters(parameters)

    return <div className="ref-view-parameters">
        {params}
    </div>
}

