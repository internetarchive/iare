import React from 'react';

// make clickable horizontal barchart for data
export default function BarChart ({data, id}) {
    return <>
        {!data ? <h3 className={"error-viz"}>Bar Chart data is invalid</h3>
        : <div id={id}>
            <p>d3 bar chart goes here; there are {Object.keys(data).length} types</p>
            {Object.keys(data).map( (key, i) => {
                    return <p>{key} : {data[key]}</p>
                }
            )}
        </div>}
    </>
}
