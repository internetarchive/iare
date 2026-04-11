// signalBadgeRegistry.jsx

// import DeadLinkBadge from "./badges/DeadLinkBadge";
// import ArchiveBadge from "./badges/ArchiveBadge";
// import PaywallBadge from "./badges/PaywallBadge";

import WaybackBadge from "./WaybackBadge.jsx";
import EnwikiBadge from "./EnwikiBadge.jsx";
import TrancoBadge from "./TrancoBadge";
import MbfcBadge from "./MbfcBadge";
import ScoreBadge from "./ScoreBadge.jsx";

// import logoImage from "./images/wikisignals.logo.v1r1.png";
import imgScoreLogo from "./images/wikisignals.logo.v1r4.png"
import imgWaybackLogo from "./images/badge.logo.wayback.small.png"
import imgTrancoLogo from './images/badge.logo.tranco.png'
import imgMbfcLogo from "./images/badge.logo.mbfc.small.png";
import imgEnwikiLogo from "./images/badge.logo.wiki.png";


export function extractInfoFromPath(data, path) {
    return path
        .split("|")
        .reduce((acc, key) => acc?.[key], data)
}


export const signalBadgeRegistry = {

    score: {
        key: "score",
        caption: "SCORE",
        description: "Overall WikiSignals Score",
        component: ScoreBadge,
        priority: 1000,
        group: "",

        // logo_source: "./images/wikisignals.logo.v1r1.png",
        image: imgScoreLogo,


    },

    tranco: {
        key: "tranco",
        label: "Tranco",
        caption: "TRANCO",
        description: "Tranco rating (website)",
        component: TrancoBadge,
        priority: 100,
        group: "",
        logo: imgTrancoLogo,
        info_spec: {
            description: "",
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
    },

    enwiki: {
        key: "enwiki",
        label: "Enwiki",
        caption: "English Wiki Link Count",
        component: EnwikiBadge,
        priority: 300,
        group: "",
        logo: imgEnwikiLogo,
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
            description: "",
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
