import React from "react";
import { BadgeContexts } from "../constants/badgeContexts.jsx";

export default function SortBox({
                                    sortKey = "",
                                    className = "",
                                    context = null,
                                    direction = 0,
                                    label = "",

                                    caption = "",
                                    description = "",
                                    disabled = false,
                                    onClick = null,
                                    children = null,
                                }) {

    const dir = direction === 1
        ? "asc"
        : (direction === -1 ? "desc" : "none");

    const sortBoxClassName = [
        "sort-box",
        className,
        context ? `sort-box-${context}` : "",
        `sort-${dir}`,
    ]
        .filter(Boolean)
        .join(" ");


    return (
        <div className={sortBoxClassName}>
            <div className="sort-indicator" aria-hidden="true">
                <span className="triangle-up">▲</span>
                <span className="triangle-down">▼</span>
            </div>
            {/*{label && <div className="sort-label">{label}</div>}*/}
            {/*<div style={{fontSize:"8pt"}}>sort: {dir}</div>  /!* temporary for devdebug *!/*/}
        </div>
    );
}
