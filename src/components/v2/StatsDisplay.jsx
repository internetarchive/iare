import React from 'react';
import { JsonEditor } from 'json-edit-react'

import '../css/components.css';
// import RawJson from "../RawJson.jsx";

// <JsonEditor
//     data={ jsonData }
//     setData={ setJsonData } // optional
//     { ...otherProps } />

export default function StatsDisplay ({ pageData, options } ) {

    const topElementRef = React.useRef(null);
    const [remainingHeight, setRemainingHeight] = React.useState(0);

    React.useEffect(() => {
        function updateJsonHeight() {
            // console.log("updating json height...");
            if (topElementRef.current) {
                const rect = topElementRef.current.getBoundingClientRect()
                const bottomY = rect.bottom
                const windowHeight = window.innerHeight
                const finalHeight = windowHeight - bottomY - 20
                console.log(`updating json height to...${finalHeight}`);
                setRemainingHeight(finalHeight);
            }
        }

        updateJsonHeight(); // Initial
        window.addEventListener('resize', updateJsonHeight); // Responsive
        return () => window.removeEventListener('resize', updateJsonHeight);

    }, []);


    return <>
        <div className={"stats-display section-box"}>

            {true && <h3>Statistics</h3>}

        </div>

        <div className={"section-box"}>
            <div style={{fontStyle: "italic", padding:".2rem 0 .5rem"}}>JSON Things like LAMP and IABot stats</div>

            <div>
                <div ref={topElementRef} className="section-caption">PageData</div>
                <div
                    style={{
                        height: remainingHeight,
                        overflowY: 'auto'
                }}
                    className="page-data-json">
                    <JsonEditor data={pageData}/>
                </div>
            </div>

            {/*<RawJson obj={pageData} />*/}
        </div>


    </>
}
