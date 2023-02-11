import React from "react";
import TR from './TR.js';

/*
    Displays array of key : value objects as table

    props:
        arr         array of { key : val } items to display
        className   optional class of surrounding table
 */

function ArrayDisplay(props) {

    return <table className={props.className}>
        <tbody>
        {props.arr.map((obj, i) => <TR
            label={Object.keys(obj)[0]}
            value={obj[Object.keys(obj)[0]]}
            key={i} // using index is OK, as we will ALWAYS re-render
        />)}
        </tbody>
    </table>

}

export default ArrayDisplay;