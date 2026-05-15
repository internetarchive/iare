// signalBadgeRegistry.jsx

// import DeadLinkBadge from "./badges/DeadLinkBadge";
// import ArchiveBadge from "./badges/ArchiveBadge";
// import PaywallBadge from "./badges/PaywallBadge";

import ScoreBadge from "./ScoreBadge.jsx";
import WaybackBadge from "./WaybackBadge.jsx";
import EnwikiBadge from "./EnwikiBadge.jsx";
import TrancoBadge from "./TrancoBadge";
import MbfcBadge from "./MbfcBadge";

import imgScoreLogo from "./images/wikisignals.logo.v1r4.png"
import imgWaybackLogo from "./images/badge.logo.wayback.small.png"
import imgTrancoLogo from './images/badge.logo.tranco.png'
import imgMbfcLogo from "./images/badge.logo.mbfc.png";
import imgEnwikiLogo from "./images/badge.logo.wiki.png";


export function extractInfoFromPath(data, path) {
    // returns data value from structure via path specified by pipe delim string
    //
    // ex: score|info_spec|source_fields|name

    return path
        .split("|")
        .reduce((acc, key) => acc?.[key], data)
}

export const signalBadgePrefix = "signal_"

const signalBadgeRegistry = {

    score: {
        key: "score",
        label: "Score",
        caption: "SCORE",
        class_name: "score-badge",

        description: "Overall WikiSignals Score",
        component: ScoreBadge,
        priority: 1000,
        logo: imgScoreLogo,

        group: "",

        info_spec: {
            description: "Provides overall score determined by WikiSignals",
            source_fields: [
                {
                    name: "Wikisignals score",
                    label: "meta|ws_score|label",
                    desc: "meta|ws_score|description"
                },
            ],
        },

        sort: (a, b, columnSort) => {
            const signalA = a?.signal_data?.signals?.meta
                ? a?.signal_data?.signals?.meta?.ws_score ?? 0
                : -1
            const signalB = b?.signal_data?.signals?.meta
                ? b?.signal_data?.signals?.meta?.ws_score ?? 0
                : -1

            if (signalA > signalB) return columnSort.sorts['signal_score']?.dir * -1;
            if (signalA < signalB) return columnSort.sorts['signal_score']?.dir;
            return 0;
        }

    },

    tranco: {
        key: "tranco",
        label: "Tranco",
        caption: "TRANCO",
        class_name: "tranco-badge",
        description: "Tranco rating (website)",
        component: TrancoBadge,
        priority: 100,
        logo: imgTrancoLogo,

        group: "",

        info_spec: {
            description: "Tranco rating",
            source_fields: [
                {
                    name: "ranking",
                    label: "meta|ws_web_rank|label",
                    desc: "meta|ws_web_rank|description"
                },
            ],
        },

        sort: (a, b, columnSort) => {
            const signalA = a?.signal_data?.signals?.meta
                ? a?.signal_data?.signals?.meta?.ws_web_rank ?? 0
                : -1
            const signalB = b?.signal_data?.signals?.meta
                ? b?.signal_data?.signals?.meta?.ws_web_rank ?? 0
                : -1

            if (signalA > signalB) return columnSort.sorts['signal_tranco']?.dir * -1;
            if (signalA < signalB) return columnSort.sorts['signal_tranco']?.dir;
            return 0;
        }
    },

    mbfc: {
        component: MbfcBadge,

        key: "mbfc",
        label: "MBFC",
        caption: "Media Bias Fact Check",
        class_name: "mbfc-badge",
        description: "Media Bias Fact Check (website)",

        priority: 200,
        group: "",
        logo: imgMbfcLogo,
        info_spec: {
            description: "Media Bias Fact Check",
            source_fields: [

            ],
        }
    },

    enwiki: {
        component: EnwikiBadge,

        key: "enwiki",
        label: "Enwiki",
        caption: "English Wiki Link Count",
        class_name: "enwiki-badge",
        description: "English Wikipedia Link Count",

        priority: 300,
        group: "",
        logo: imgEnwikiLogo,
        info_spec: {
            description: "How many external links with this domain in English Wikipedia.",
            source_fields: [
                {
                    name: "Wikipedia links",
                    label: "meta|ws_wiki_cite_en|label",
                    desc: "meta|ws_wiki_cite_en|description"
                },
            ],
        },

        sort: (a, b, columnSort) => {
            const signalA = a?.signal_data?.signals?.meta
                ? a?.signal_data?.signals?.meta?.ws_wiki_cite_en ?? 0
                : -1
            const signalB = b?.signal_data?.signals?.meta
                ? b?.signal_data?.signals?.meta?.ws_wiki_cite_en ?? 0
                : -1

            if (signalA > signalB) return columnSort.sorts['signal_enwiki']?.dir * -1;
            if (signalA < signalB) return columnSort.sorts['signal_enwiki']?.dir;
            return 0;
        }

    },

    wayback: {
        component: WaybackBadge,

        key: "wayback",
        label: "Wayback",
        caption: "Wayback Machine Statistics (Longevity)",
        description: "Wayback Machine History",
        class_name: "wayback-badge",

        priority: 400,
        group: "",
        logo: imgWaybackLogo,
        info_spec: {
            description: "Total snapshots in Wayback Machine, and first/last capture dates.",
            source_fields: [
                {
                    name: "Total Captures",
                    label: "meta|ws_wbm_total|label",
                    desc: "meta|ws_wbm_total|description"
                },
                {
                    name: "First capture",
                    label: "meta|ws_wbm_first|label",
                    desc: "meta|ws_wbm_first|description"
                },
                {
                    name: "Latest capture",
                    label: "meta|ws_wbm_last|label",
                    desc: "meta|ws_wbm_last|description"
                },
            ],
        },

        sort: (a, b, columnSort) => {

            const aMeta = a?.signal_data?.signals?.meta
            const bMeta = b?.signal_data?.signals?.meta

            const aFirst = aMeta ? aMeta["ws_wbm_first"] : 0
            const aLast = aMeta ? aMeta["ws_wbm_last"] : 0

            const bFirst = bMeta ? bMeta["ws_wbm_first"] : 0
            const bLast = bMeta ? bMeta["ws_wbm_last"] : 0

            // const aLength = new Date(aLast) - new Date(aFirst)
            // const bLength = new Date(bLast) - new Date(bFirst)

                    // const wayback_length = ((new Date(wayback_last) - new Date(wayback_first)) /
                    //     (1000 * 60 * 60 * 24 * 365))

                    //
                    //
                    // const signalA = a?.signal_data?.signals?.meta
                    //     ? a?.signal_data?.signals?.meta?.ws_wiki_cite_en ?? 0
                    //     : -1
                    // const signalB = b?.signal_data?.signals?.meta
                    //     ? b?.signal_data?.signals?.meta?.ws_wiki_cite_en ?? 0
                    //     : -1

            // signalA and signalB is length of time
            const signalA = new Date(aLast) - new Date(aFirst)
            const signalB = new Date(bLast) - new Date(bFirst)

            if (signalA > signalB) return columnSort.sorts['signal_wayback']?.dir * -1;
            if (signalA < signalB) return columnSort.sorts['signal_wayback']?.dir;

            return 0;
        }
    }

}

export default signalBadgeRegistry
