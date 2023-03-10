import React from 'react';
// import React, {useState} from 'react';
// import * as d3 from 'd3';
// import { useD3 } from '../hooks/useD3';

// make clickable horizontal barchart for data
export default function BarChart ({data, id}) {

    return <>
        {!data ? <h3 className={"error-viz"}>Bar Chart data is invalid</h3>
        : <div id={id}>
            <p>d3 bar chart goes here [{Object.keys(data).length} items]</p>
            {Object.keys(data).map( (key, i) => {
                    return <>
                    <p>{key} : {data[key]}</p>
                    </>
                }
            )}
        </div>}
    </>
}
