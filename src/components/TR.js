import React from "react";

const TR = (props) => <>
    <tr>
        <td>{props.label}</td>
        <td className={props.tight ? (props.tight ? "tight" : "") : "" }>{props.value}</td>
    </tr>
</>

export default TR;