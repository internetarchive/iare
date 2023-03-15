import React , { useState, useEffect } from "react";
import PageOverview from "./PageOverview.js";
import References from "./References";
import Urls from "./Urls";
import Flds from "./Flds";
import { API_V2_URL_BASE } from '../../constants/endpoints.js';


export default function PageData( { pageData }) {

    const [endpoint, setEndpoint] = useState("");
    const [refs, setRefs] = useState([]);
    const [filter, setFilter] = useState(null); // filter to apply to displayed refs

    const wariID = pageData ? pageData.wari_id : null;

    // fetch refs based on wariID
    useEffect(()=> {

                        // // handle null pageData
                        // if (!pageData) {
                        //     setRefs(null);
                        //     return;
                        // }

        const endpoint = `${API_V2_URL_BASE}/statistics/references?wari_id=${wariID}`;

        // fetch the data
        fetch(endpoint, {
        })

            .then((res) => {
                if(!res.ok) throw new Error(res.status);
                return res.json();
            })

            .then((data) => {
                setRefs(data.references);
            })

            .catch((err) => {
                //setMyError(err.toString())

                // todo: what to do here on error?

                setRefs(null);
            })

            .finally(() => {
                // console.log("fetch finally")
                // setIsLoading(false);
                setEndpoint(endpoint)
            });

    }, [wariID]) // run this when wariID


    return <>

        <PageOverview pageData={pageData} setFilter={setFilter} />

        <h3>Page Data</h3>

        {/*{ <!-- display endpoint for debugging -->}*/}
        {/*<p>endpoint: {endpoint}</p>*/}
        <p>endpoint: <a href={endpoint} target={"_blank"} rel={"noreferrer"} >{endpoint}</a></p>


        <div className={"page-data"}>
            <References refs={refs} filter={filter}/>
            <Urls urls={pageData.urls}/>
            <Flds flds={pageData.fld_counts}/>
        </div>
    </>
}

