import React from "react";
// import ai_img from '../../../images/ai_this.v2r1.redblack.png';

export default function RefActions(props) {
    return <div className="row ref-view-actions">
        <div className={"col-12"}><h3>Actions</h3>

            <p className={"ref-note-alert"}>Items in this column are not yet active.</p>

            <button type="button" className="btn btn-primary">
                <span>Suggest Changes</span>
            </button>

            <button type="button" className="btn btn-primary">
                <span>Save Changes</span>
            </button>

            {/*<img src={ai_img} className="big-button" style={{width: "100%"}} alt="ai this"/>*/}

        </div>
    </div>
}

