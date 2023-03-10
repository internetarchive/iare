import React, {useEffect, useState} from "react";
// import BarChart from './BarChart.js';
import References from './References.js';
import Urls from './Urls.js';
import Flds from './Flds.js';
import * as Constants from '../../constants/endpoints'
import './refs.css';


/*
    extract wariID from references data
    and use that to fetch the references for that ID

 */
function RefDataV2( { pageData }) {

    const [refs, setRefs] = useState([]);
    // const [isLoading, setIsLoading] = useState(false);
    const [myError, setMyError] = useState(null);

    const wariID = pageData ? pageData.wari_id : null;

    // attempt to fetch refs based on info in pageData, namely wari_id
    useEffect(()=> {

        // handle null pageData
        if (!pageData) {
            setRefs(null);
            return;
        }

        const fetchUrl = Constants.URLPART_STATS_REFS.replace("{WARI_ID}", wariID)

        // fetch the data
        fetch(fetchUrl, {
            })

            .then((res) => {
                if(!res.ok) throw new Error(res.status);
                return res.json();
            })

            .then((data) => {
                setRefs(data.references);
            })

            .catch((err) => {
                setMyError(err.toString())
                setRefs(null);
            })

            .finally(() => {
                // console.log("fetch finally")
                // setIsLoading(false);
            });

    }, [wariID]) // run this when fileName or refreshTime changes

    if (!pageData) return <p>Page data is missing.</p>;


    return  <div className="reference-data">
        {myError ? <div className={myError ? "error-display" : "error-display-none"}>
            Error: {myError}
        </div> : ""}
        <References refs={refs} wariID={pageData.wari_id} />
        <Urls urls={pageData.urls} />
        <Flds flds={pageData.fld_counts} />
    </div>

}

export default RefDataV2;
