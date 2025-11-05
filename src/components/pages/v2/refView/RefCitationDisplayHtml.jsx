import React from "react";
import DOMPurify from 'dompurify';

function RefCitationDisplayHtml({ reference = null,
                                 onClick,
                                 options = {},
                                 onAction}) {

    if (!reference) return null

    // const cite_html = reference.citeRef?.cite_html
    const citeHTML = reference.citeRef
        ? reference.citeRef.cite_html
        : reference.citeRef?.span_html
            ? reference.citeRef.span_html
            : "<div class='lolite'>Failed to render HTML.</div>"

    const cleanHTML = DOMPurify.sanitize(citeHTML);

    return <div className={"ref-button ref-citation-button-wrapper"} onClick={onClick}>
        { /* NB Note use of DANGEROUS property... */}
        <div dangerouslySetInnerHTML={{__html: cleanHTML}} />
        { /* NB Note use of DANGEROUS property... */}
    </div>

}

export default RefCitationDisplayHtml;
