import React from "react";
// import ConditionsBox from "../components/ConditionsBox.jsx";
// import RefView from "../components/v2/refView/RefView.jsx";

export const getTestData = () => {
    return <>

        {Array.from({length: 20}, (_, i) => {
            return <div style={{
                display: "inline",
                padding: ".5rem",
                border: "1pt solid black",
                borderRadius: ".35rem",
                marginRight: ".35rem"
            }}>Spacer</div>
        })}

        {Array.from({length: 20}, (_, i) => {
            return <p>test data test data test data test data test data test data test data test data test data test
                data test data test data test data test data test data test data test data test data test data test data
                URL links Here!</p>
        })}

    </>
}


export const testPageData = () => {

    const style_overviewColumn = {
        backgroundColor: 'darkorchid',
        color: 'white',
        padding: '.5rem',
        borderRadius: '.5rem',
        border: '2pt solid blue',
        width: '10rem',
    }

    const style_iareUxContainer = {
        backgroundColor: 'blue',
        color: 'white',
        padding: '.5rem',
        borderRadius: '.5rem',
        border: '2pt solid blue',
    }

    const conditionsBox = <div className="conditions-box"><h3 className="conditions-box-caption">Conditions</h3>
        <div className="condition-box-contents">
            <div className="condition-box">
                <div className="category-row">
                    <div className="cond-data">Showing All Items</div>
                </div>
                <div className="fixit-row">
                    <div className="cond-data">Use filters to narrow selection.</div>
                </div>
            </div>
        </div>
    </div>


    return <div className={"url-display-container"}>

        <div className={"url-display-header"} style={style_overviewColumn}>
            <div>Overview column</div>
        </div>

        <div className={"url-display-contents"}>

            {/*<div style={{ pointerEvents: false ? "none" : "auto" }}>*/}

                <div className={"iare-ux-container"} style={style_iareUxContainer}>

                    <div className={"iare-ux-header"}>

                        {conditionsBox}

                    </div>

                    <div className={"iare-ux-body"}>
                        {getTestData()}
                        {/*{Array.from({length: 20}, (_, i) => {*/}
                        {/*    return <p>body of display</p>*/}
                        {/*})}*/}
                    </div>
                    {/* iare-ux-body */}

                </div> {/* iare-ux-container */}

            {/*</div>*/}

        </div>

        {/*/!* this is the popup Reference Viewer component *!/*/}
        {/*<RefView isOpen={isRefViewModalOpen}*/}
        {/*         onClose={() => {*/}
        {/*             setIsRefViewModalOpen(false)*/}
        {/*         }}*/}
        {/*         onAction={handleAction}*/}

        {/*         pageData={pageData}*/}
        {/*         refDetails={refDetails}*/}

        {/*         selectedRefIndex={selectedRefIndex}*/}
        {/*         refFilter={refFilter}*/}

        {/*         tooltipId={"url-display-tooltip"}/>*/}

        {/*{tooltipForUrlDisplay}*/}

    </div>
}