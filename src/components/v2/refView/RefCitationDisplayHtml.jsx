import React from "react";

function RefCitationDisplayHtml({ reference = null,
                                 onClick,
                                 options = {},
                                 onAction}) {

    if (!reference) return null

    // const cite_html = reference.citeRef?.cite_html
    const cite_html = reference.citeRef
        ? reference.citeRef.cite_html
        : reference.citeRef?.span_html
            ? reference.citeRef.span_html
            : "<div class='lolite'>No HTML rendering found.</div>"

    return <div className={"ref-button ref-citation-button-wrapper"} onClick={onClick}>

        <div dangerouslySetInnerHTML={{__html: cite_html}} />

    </div>

}

export default RefCitationDisplayHtml;
