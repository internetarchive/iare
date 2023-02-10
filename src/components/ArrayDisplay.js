import React from "react";
import TR from './TR.js';

/*
    Displays array of key : value objects as table

    expected props: arr

 */
function ArrayDisplay(props) {
    // return <pre>{JSON.stringify(props.map, null, 2)}</pre>;

    return <table className={props.className}>
        <tbody>
        {props.arr.map((obj, i) => {
            return <TR label={Object.keys(obj)[0]} value={obj[Object.keys(obj)[0]]} key={Object.keys(obj)[0].replace(" ","_")} />
        })}
        </tbody>
    </table>

}

export default ArrayDisplay;