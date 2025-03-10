import React from "react";
import TR from './TR.js';

/*
    Displays object containing key:value pairs as table

    expected props:
        map     object containing { key : value } pairs

    TODO use a better React-List Key algorithm

 */

function MapDisplay( { map }) {
    // return <pre>{JSON.stringify(props.map, null, 2)}</pre>;

    return <table className={"tight"}>
        <tbody>
        {Object.keys(map).map((keyName, i) => {
            return <TR label={keyName} value={map[keyName]} key={keyName.replace(" ","_")} />
        })}
        </tbody>
    </table>

}

export default MapDisplay;