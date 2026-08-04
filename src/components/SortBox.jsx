import React from "react";

export default function SortBox({
                                    className = "",
                                    role = null,
                                    direction = 0,
                                }) {

    const dirString = direction === 1
        ? "asc"
        : (direction === -1 ? "desc" : "none");

    const sortBoxClassName = [
        "sort-box",
        className,
        role ? `sort-box-${role}` : "",
        `sort-${dirString}`,
    ]
        .filter(Boolean)
        .join(" ");


    return (
        <div className={sortBoxClassName}>
            <div className="sort-indicator" aria-hidden="true">
                <span className="triangle-down">▼</span>
                <span className="triangle-up">▲</span>
            </div>
        </div>
    );
}
