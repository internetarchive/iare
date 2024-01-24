import React from "react";

/*
shows actionables for this reference
 */
export default function RefActionables({ actions, onAction }) {

    const actionDisplay= actions ? actions : "No actionable fixes found."

    return <div className="ref-view-actionables">
        <h3>Actionables</h3>
        {actionDisplay}
    </div>
}

