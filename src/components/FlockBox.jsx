import React from "react";
import './shared/components.css';
import './shared/flockbox.css';

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
          onKeyDown=null,
          children
      }) {

    return <>

        <div className={`flock-box${className ? ` ${className}` : ''}`}
            onKeyDown={onKeyDown}
            >

            <div className={"flock-box-caption"} key={"arf1"}>{caption}</div>
            <div className={"flock-box-contents"} key={"arf2"}>{children}</div>

        </div>

    </>
}
