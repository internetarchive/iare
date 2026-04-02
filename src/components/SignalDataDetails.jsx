import React from "react";
import JsonTable from "./JsonTable.jsx";
import {iareAlert, isEmpty} from "../utils/generalUtils.js";
import './css/signals.css';
import {extractRootDomain} from "../utils/urlUtils.jsx";
import SignalBadges from "./SignalBadges.jsx";
import {BadgeContextEnum as badgeContext} from "../constants/badgeDisplayTypes.jsx";

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
    const [isTableVisible, setIsTableVisible] = React.useState(false);

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
        return Number(rawScore).toFixed(2)
    }

    const getRawSignalDataDisplay = () => {
        if (isEmpty(rawSignalData))
            return <div>No Signal Data exists for this domain</div>

        if (rawSignalData?.error)
            return <div>{rawSignalData.error}</div>

        if (isEmpty(rawSignalData?.signals))
            return <div>No Signal Content Available</div>

        const signalDataRows = Object.entries(rawSignalData.signals?.meta).map(([key, value]) => ({
            signal_name: key,
            value: value
        }));

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
            setIsTableVisible(!isTableVisible);
        };


        return <div className={"signal-details-raw-data"}>
            <div
                onClick={toggleTableVisibility}
                style={{marginBottom: "10px", cursor: "pointer", display: "inline-block"}}
            >Raw Signal Data&nbsp;
                {isTableVisible ? "▼" : "▶"}
            </div>
            {isTableVisible ? <JsonTable data={signalDataRows}/> : null}
        </div>
    }



    const rawDataDisplay = getRawSignalDataDisplay();
    const urlDomain = getDomain(urlLink, rawSignalData)
    const score = getScore(rawSignalData?.signals?.meta?.ws_score)

    const signalHeader = <div className={"signal-details-header"}
    //     style={{
    //         display: "grid",
    //         gridTemplateColumns: "minmax(6.5rem, auto) minmax(auto, 1fr)",
    //         gap: "10px",
    //         marginBottom: "10px"
    //     }}
    >
        <div className={"grid-caption"}>URL:</div>
        <div>{urlLink}</div>

        <div className={"grid-caption"}>Domain:</div>
        <div>{urlDomain}</div>

        <div className={"grid-caption"}>Score:</div>
        <div>{score}</div>

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
