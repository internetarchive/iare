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
        { /* NB Note use of DANGEROUS property... */}
        <div dangerouslySetInnerHTML={{__html: cite_html}} />
        { /* NB Note use of DANGEROUS property... */}
    </div>

}

export default RefCitationDisplayHtml;
