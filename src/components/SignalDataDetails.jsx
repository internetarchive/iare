import React from "react";
import JsonTable from "./JsonTable.jsx";
import {iareAlert, isEmpty} from "../utils/generalUtils.js";
import './css/signals.css';
import {extractRootDomain} from "../utils/urlUtils.jsx";
import SignalBadges from "./SignalBadges.jsx";
import {BadgeContextEnum as badgeContext} from "../constants/badgeDisplayTypes.jsx";
import {getNormalizedScore} from "../utils/generalUtils.js";
import PureJson from "./PureJson.jsx";

/* sample signal data:

    signal_data: {
        signalValues: {
          id: 4709,
          domain: "nytimes.com",
          slug: "nytimes-com",
          link: "https://wikisignals.org/publication/nytimes-com/",
          meta: {
            ws_web_name: "The New York Times",
            ws_web_url: "https://www.nytimes.com/",
            ws_web_lang: "en",
            ws_web_reg: "1994-01-18 05:00:00+00:00",
            ws_web_rank: "155",
            ws_wbm_first: "1996-11-12 18:15:13+00:00",
            ws_wbm_last: "2025-10-03 09:43:38+00:00",
            ws_wbm_total: "700968",
            ws_wikidata_qid: "Q9684",
            ws_wiki_cite_en: "745487",
            ws_wiki_rsp_en_cats: "['Generally reliable']",
            ws_wiki_spam_hits: "",
            ws_mbfc_cats: "{'bias': 'left-center', 'credibility': 'high-credibility', 'name': 'New York Times', 'reporting': 'high'}",
            ws_mbfc_url: "https://mediabiasfactcheck.com/new-york-times/",
            ws_rate_domainq: "0.8587762907",
            ws_rate_scifeed: "0.85",
            ws_list_usnpl: "2293",
            ws_list_inn: "",
            ws_list_oasis: ""
          },
          lists: {
            press_assoc: [
              "list-aam",
              "list-trusttxt"
            ],
            press_state: [
              "list-state-ny"
            ],
            news_index: [
              "list-googlenews",
              "list-mbfc",
              "list-usnpl",
              "list-wikirsp-en"
            ],
            unreliable: [ ]
          },
          ratings: {
            mbfc-bias: [
              "mbfc-bias-075-ctr-left"
            ],
            mbfc-cred: [
              "mbfc-cred-100-high"
            ],
            mbfc-fact: [
              "mbfc-fact-080-high"
            ],
            wiki-rsp: [
              "wiki-rsp-080-reliable"
            ]
          },
          links: {
            wp-post: "https://wikisignals.org/wp-json/wp/v2/publication/4709",
            tax-list: "https://wikisignals.org/wp-json/wp/v2/list",
            tax-rating: "https://wikisignals.org/wp-json/wp/v2/rating"
          }
        }
      }
    }

   */
export default function SignalDataDetails({urlLink, rawSignalData}) {

    // const [isFiltered, setIsFiltered] = React.useState(false);
    // const [showFilterControls, setShowFilterControls] = React.useState(false);
    const [isRawDataVisible, setIsRawDataVisible] = React.useState(true);
    const [isMetaVisible, setIsMetaVisible] = React.useState(false);
    const [isListsVisible, setIsListsVisible] = React.useState(false);
    const [isRatingsVisible, setIsRatingsVisible] = React.useState(false);

    const onSignalClick = (e) => {
        iareAlert("Signal Clicked: " + e.target.dataset.signalKey)
    }

    const getDomain = () => {
        if (isEmpty(rawSignalData?.signals)) {
            // cannot get domain from signal data, so interpret it here.
            return extractRootDomain(urlLink)
        } else
            return rawSignalData?.signals?.domain
    }

    const getScore = (rawScore) => {
        if (rawScore === undefined) return "undefined"
        if (rawScore === "") return <span className={"lolite"}>Not Supplied</span>

        return Number(rawScore).toFixed(2)
    }

    const getRawSignalDataDisplay = () => {
        if (isEmpty(rawSignalData))
            return <div>No Signal Data exists for this domain</div>

        if (rawSignalData?.error)
            return <div>{rawSignalData.error}</div>

        if (isEmpty(rawSignalData?.signals))
            return <div className={"missing-value"}>No Signal Content Available</div>

        const signalMetaRows = Object.entries(rawSignalData.signals?.meta).map(([key, value]) => ({
            field_name: key,
            value: value
        }));

        const signalMetaDisplay = <div className={"grid-level-1"}>
            <div onClick={() => setIsMetaVisible(!isMetaVisible)} className="section-expander">
                Meta Signal Data&nbsp;{isMetaVisible ? "▼" : "▶"}
            </div>
            {isMetaVisible
                ? <JsonTable data={signalMetaRows}/>
                : null }
        </div>


        const filtered = Object.fromEntries(
            Object.entries(rawSignalData.signals?.lists).filter(([_, value]) => Array.isArray(value) && value.length > 0)
        );
        const signalListsDisplay = <div className={"grid-level-1"}>
            <div onClick={() => setIsListsVisible(!isListsVisible)} className="section-expander">
                Lists Signal Data&nbsp;{isListsVisible ? "▼" : "▶"}
            </div>
            {isListsVisible

                // filter lists so that only entries with non-zero arrays are shown
                ?  <PureJson data={Object.fromEntries(
                    Object.entries(rawSignalData.signals?.lists)
                        .filter(([_, value]) => Array.isArray(value) && value.length > 0)
                        )}
                        caption={null} />

                // ? <div>Lists data goes here</div>
                : null }
        </div>

        const signalRatingsDisplay = <div className={"grid-level-1"}>
            <div onClick={() => setIsRatingsVisible(!isRatingsVisible)} className="section-expander">
                Ratings Signal Data&nbsp;{isRatingsVisible ? "▼" : "▶"}
            </div>
            {isRatingsVisible
                ? <PureJson data={rawSignalData.signals?.ratings} caption={null} />
                : null }
        </div>


                    // const customControls = showFilterControls && false  // force false for now...debugging
                    //     ? <label>
                    //         <input
                    //             type="checkbox"
                    //             checked={isFiltered}
                    //             onChange={e => setIsFiltered(e.target.checked)}
                    //         />{isFiltered
                    //         ? <span>&nbsp;Remove Filter (Show all Signals)</span>
                    //         : <span>&nbsp;Apply Filter (Hide all null and false Signals)</span>}
                    //     </label>
                    //     : null

        const toggleTableVisibility = () => {
            setIsRawDataVisible(!isRawDataVisible);
        };


        return <div className={"signal-details-raw-data"}>
            <div onClick={toggleTableVisibility} className="section-expander">
                Raw Signal Data&nbsp;{isRawDataVisible ? "▼" : "▶"}
            </div>
            {isRawDataVisible
                ? <>
                    {signalMetaDisplay}
                    {signalListsDisplay}
                    {signalRatingsDisplay}
                </>
                :  null}
        </div>
    }



    const rawDataDisplay = getRawSignalDataDisplay();
    const urlDomain = getDomain(urlLink, rawSignalData)
    // const score = getScore(rawSignalData?.signals?.meta?.ws_score)
    const score = getNormalizedScore(rawSignalData?.signals?.meta?.ws_score);


    const signalHeader = <div className={"signal-details-header"}
    //     style={{
    //         display: "grid",
    //         gridTemplateColumns: "minmax(6.5rem, auto) minmax(auto, 1fr)",
    //         gap: "10px",
    //         marginBottom: "10px"
    //     }}
    >
        <div className={"grid-caption"}>Domain:</div>
        <div>{urlDomain}</div>

        <div className={"grid-caption"}>URL:</div>
        <div>{urlLink}</div>

        {/*<div className={"grid-caption"}>Score:</div>*/}
        {/*{ score < 0  // -1 means not provided*/}
        {/*    ? <div className={"missing-value"}>Not provided.</div>*/}
        {/*    : <div>WikiSignals Overall Score: {score}</div>*/}
        {/*}*/}

        <hr style={{gridColumn: "1 / -1"}}/>
    </div>

    return <div className={"signal-data-details"}>
        {signalHeader}
        <SignalBadges signals={rawSignalData?.signals}
                      onSignalClick={onSignalClick}
                      badgeContext={badgeContext.DETAIL}
                      fromCache={rawSignalData?.retrieved_from_cache}
        />
        <hr/>
        {rawDataDisplay}
    </div>
}
