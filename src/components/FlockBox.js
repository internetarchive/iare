import React from "react";
import './shared/components.css';
// import Draggable from "react-draggable";

/* FlockBox component

- surrounds the children elements with a "flock-box" treatment, which currently includes:
    - stylized mini titlebar
    - (maybe in future:) draggable box

expected props:

 */
export default function FlockBox({
          caption = null,
          className = null,
          tooltip = '',
          children
      }) {

    return <>

        <div className={`flock-box${className ? ` ${className}` : ''}`}>

            <div className={"flock-box-caption"}>{caption}</div>
            <div className={"flock-box-contents"}>{children}</div>

        </div>

    </>
}
