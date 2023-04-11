import React from "react";
import References from "./References";
import Flds from "./Flds";
import UrlDisplay from "./UrlDisplay";

export default function PageData( { pageData = {} }) {

    // const [refOverview, setRefOverview] = useState({}); // overview statistics for Refs; set in effects, passed to PageOverview
    // const [refFilter, setRefFilter] = useState( null ); // filter to apply to displayed refs
    const refFilter = null;


                    // async function fetchOneRef(refID) {
                    //     const endpoint = `${API_V2_URL_BASE}/statistics/reference/${refID}`;
                    //     console.log("fetchOneRef: ", endpoint)
                    //     const response = await fetch(endpoint);
                    //     const data = await response.json();
                    //     const status_code = response.status;
                    //     return { data, status_code };
                    // }
                    // async function fetchAllRefs(refIDs) {
                    //     const promises = refIDs.map(refID => {
                    //         // console.log("fetchAllRefs: fetching: ", ref)
                    //         return fetchOneRef(refID) // ?? return fetchOneRef(refID).data?
                    //     });
                    //     const results = await Promise.all(promises);
                    //     return results;
                    // }

    // calc ref overview data when pageData changes
    // useEffect( () => {
    //     const refStats = pageData
    //         ? (pageData.reference_statistics
    //             ? pageData.reference_statistics : {} )
    //     : {};
    //     // setRefOverview(refStats);
    // }, [pageData]) // TODO: change deps to [] ?


    // TODO: change this to get references by iterative fetch on refID array
    const references = pageData.reference_details && pageData.reference_details.length
        ? pageData.reference_details // "old" way
        : pageData.dehydrated_references

    return <>

        <div className={"page-data"}>

            <UrlDisplay pageData={pageData} options={{}} />

            <References refs={references} filter={refFilter}/>
            <Flds flds={pageData.fld_counts}/>
        </div>
    </>
}

