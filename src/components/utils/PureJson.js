import React from "react";

export default function PureJson( { data, caption= "Raw Json Data"}) {

    return <>
        { caption ? <h3>{caption}</h3> : null }
        <pre>{JSON.stringify(data, null, 2)}</pre>
    </>

}
