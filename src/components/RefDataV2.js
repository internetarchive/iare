import React from "react";
import BarChart from './d3/BarChart.js';
import PureJson from './utils/PureJson.js';

function RefDataV2( { pageData }) {


    return  <div className="j-view-refs">

        {(pageData && pageData.references) ? <>
            <div className={"ref-data-viz"}>
                <h3>Version v2 data visualization </h3>
                <BarChart data={pageData.reference_statistics}/>
            </div>

            <div className={"raw-json-data"} >
                <PureJson data={pageData} caption={"Raw Json Data"} />
            </div>
            </>

            : <h3>No Reference Data to show</h3>
        }

    </div>

}

export default RefDataV2;
