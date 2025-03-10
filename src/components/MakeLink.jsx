import React from "react";

export default function MakeLink ( {href, linkText=null}) {
    return <a href={href} target={"_blank"} rel={"noreferrer"}>{linkText ? linkText : href}</a>
}
