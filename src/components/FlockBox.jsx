import React from "react";
import './css/components.css';
import './css/flockbox.css';

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

        <div className={`flock-box${className ? ` ${className}` : ''} iare-ux-container`}
            onKeyDown={onKeyDown}
        >

            <div className={`iare-ux-header`}>
                <div className={"flock-box-caption"} key={"arf1"}>{caption}</div>
            </div>
            <div className={`iare-ux-body`}>
                <div className={"flock-box-contents"} key={"arf2"}>{children}</div>
            </div>

        </div>

    </>
}
