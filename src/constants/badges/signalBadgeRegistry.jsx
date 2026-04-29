// signalBadgeRegistry.jsx

// import DeadLinkBadge from "./badges/DeadLinkBadge";
// import ArchiveBadge from "./badges/ArchiveBadge";
// import PaywallBadge from "./badges/PaywallBadge";

import ScoreBadge from "./ScoreBadge.jsx";
import WaybackBadge from "./WaybackBadge.jsx";
import EnwikiBadge from "./EnwikiBadge.jsx";
import TrancoBadge from "./TrancoBadge";
import MbfcBadge from "./MbfcBadge";

// import logoImage from "./images/wikisignals.logo.v1r1.png";
import imgScoreLogo from "./images/wikisignals.logo.v1r4.png"
import imgWaybackLogo from "./images/badge.logo.wayback.small.png"
import imgTrancoLogo from './images/badge.logo.tranco.png'
import imgMbfcLogo from "./images/badge.logo.mbfc.png";
import imgEnwikiLogo from "./images/badge.logo.wiki.png";


export function extractInfoFromPath(data, path) {
    return path
        .split("|")
        .reduce((acc, key) => acc?.[key], data)
}


export const signalBadgeRegistry = {

    score: {
        key: "score",
        label: "Score",
        caption: "SCORE",
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
        }

    },

    tranco: {
        key: "tranco",
        label: "Tranco",
        caption: "TRANCO",
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
        }

    },

    mbfc: {
        key: "mbfc",
        label: "MBFC",
        caption: "Media Bias Fact Check",
        description: "Media Bias Fact Check (website)",
        component: MbfcBadge,
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
        key: "enwiki",
        label: "Enwiki",
        caption: "English Wiki Link Count",
        component: EnwikiBadge,
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
        }
    },

    wayback: {
        key: "wayback",
        label: "Wayback",
        caption: "Wayback Machine Statistics (Longevity)",
        component: WaybackBadge,
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
        }
    }

}
