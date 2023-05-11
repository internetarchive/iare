import React from "react";

/*

 */
export default function Templates({ templates }) {
    return !templates ? <p>No Templates to show</p>
        : <div className="ref-detail">
            <h4>Template tabs go here: </h4>
        </div>
}

