/* FilterBox component

- surrounds children elements with a "filter-box" treatment, which currently includes:
    - stylized mini titlebar with open/close icon
    - (maybe in future:) draggable box capabilities

 */
import React from "react";
import './css/filterBox.css';

export default function FilterBox({
                                      name = '',
                                      caption = null,
                                      className = null,
                                      currentState={},
                                      tooltip = '',
                                      showContents = true,
                                      onToggle,
                                      children
                                  }) {

    const isActive = (currentState && currentState.hasOwnProperty(name))
        ? currentState[name]
        : false

    const filterBoxLabel = <div className={`filter-box-label`}>{caption}</div>

    const filterBoxActive = isActive
        ? <img className={`filter-box-active`} alt={"Checked"}
               src={'../images/yes_check.png'} />
        : null

    const filterBoxShow = <div
        className={`filter-box-show ${showContents ? "closed" : "open"}`}>
        {showContents ? "hide" : "show"}
    </div>

    return <>
        {/*<Draggable>*/ /* Not sure about this yet */}

        <div className={`filter-box ${className ? className : ''}`}>
            <div className={"filter-box-caption"} onClick={() => onToggle(name)}>
                {filterBoxLabel}
                {filterBoxActive}
                {filterBoxShow}
            </div>
            {showContents && <div className={"filter-box-contents"}>{children}</div>}

        </div>
        {/*</Draggable>*/}
    </>
}
