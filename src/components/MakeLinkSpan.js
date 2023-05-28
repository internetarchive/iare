import React from "react";

export default function MakeLinkSpan (props) {href, linkText=null}) {
    return <a href={href} target={"_blank"} rel={"noreferrer"}>{linkText ? linkText : href}</a>
}
