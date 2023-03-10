import React from 'react';

export default function Urls( { urls } ) {


    return <>
        <div className={"urls"}>
            <h3>URL's</h3>

            { !urls ? <><p>No urls to show!</p></> :
                urls.map((url, i) => {
                    return <a href={url} target={"_blank"} rel={"noreferrer"} key={i}>{url}</a>
                })
            }
        </div>
    </>
}