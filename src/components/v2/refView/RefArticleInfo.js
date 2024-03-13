import React from "react";
import {ArticleVersions} from "../../../constants/articleVersions";
import {ConfigContext} from "../../../contexts/ConfigContext";

/*
shows citation links for this reference
 */
export default function RefArticleInfo({ _ref, pageData={}, onAction }) {


    let myConfig = React.useContext(ConfigContext);
    myConfig = myConfig ? myConfig : {} // prevents "undefined.<param>" errors


    if (!_ref) {
        return <div className="ref-view-article-info">
            <div className={"article-info"}>
                Reference is undefined - no article info to display.
            </div>
        </div>
    }


    const handleCiteLink = (e) => {
        // requires/expects e.target.dataset.cite_link
        const citeRefLink = e.target.dataset["cite_link"]
        if (citeRefLink) {  // prepend wikibase to link which has article name and #citeref link
            window.open(citeRefLink.replace( /^\.\//, myConfig.wikiBaseUrl),"_blank")
        }
    }
    const handleCiteHomeLink = (e) => {
        // requires/expects e.target.dataset.cite_def_link
        const citeDefLink = e.target.dataset["cite_def_link"]
        if (citeDefLink) {  // prepend pathName to link which has #citedef link
            window.open(pageData.pathName + citeDefLink,"_blank")
        }
    }

    let articleInfo = null

    if (pageData.iariArticleVersion === ArticleVersions.ARTICLE_V1.key) {
        articleInfo = <div>Section of Origin: {_ref.section}&nbsp;&nbsp;</div>

    } else if (pageData.iariArticleVersion === ArticleVersions.ARTICLE_V2.key) {
        const anchorLinkDisplay = <div className={'citation-links'}>
            <button className={`utility-button small-button`}
                    data-cite_def_link={_ref.cite_def_link}
                    onClick={handleCiteHomeLink}
            >Go to Citation Definition in Article</button>
        </div>

        const citeRefLinks = _ref.cite_ref_links
            ? _ref.cite_ref_links.map( (cr, i) => {
                return <button className={`utility-button small-button`}
                    data-cite_link={cr.href}
                    key={i}
                    onClick={handleCiteLink}>^{String.fromCharCode(i + 97)}</button>
            })
            : null // <div>No Citation Refs!</div>


        articleInfo = <>
            <div className={'header-left-part'}>{anchorLinkDisplay}
            </div>
            <div className={'header-right-part'}>
                <div>&nbsp;&nbsp;Footnote Occurrences:&nbsp;</div>
                {citeRefLinks}
            </div>
            </>


    } else {
        articleInfo = <div> Unknown reference parsing version "{pageData.iariArticleVersion}"</div>
    }

    return <div className="ref-view-article-info">
        <div className={"article-info"}>
            {articleInfo}
        </div>
    </div>
}

