import React from "react";
import TR from './TR.js';

/*
    Displays key : value pairs in map object as table

    expected props: map

 */
function MapDisplay(props) {
    // return <pre>{JSON.stringify(props.map, null, 2)}</pre>;

    return <table className={"tight"}>
        <tbody>
        {Object.keys(props.map).map((keyName, i) => {
            return <TR label={keyName} value={props.map[keyName]} key={keyName.replace(" ","_")} />
        })}
        </tbody>
    </table>

}

export default MapDisplay;