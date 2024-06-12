import React from "react";

function CitationDisplayHtml({ reference = null,
                                options = {},
                                onAction}) {

    if (!reference) return null

    const cite_html = reference.citeRef?.cite_html
        ? reference.citeRef.cite_html
        : reference.citeRef?.span_html
            ? reference.citeRef.span_html
            : <div>HTML render not found.</div>

    return <div className={"ref-button ref-citation-button-wrapper"}>

        <div dangerouslySetInnerHTML={{__html: cite_html}} />

    </div>

}

export default CitationDisplayHtml;
