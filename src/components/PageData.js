import React from "react";

function PageData(props) {
    const pd = props.pageData;

    return <div className="j-view-page-info">
        <h3>Page Data:</h3>
        <table className="page-data">
            <tbody>
            <tr>
                <td>site</td>
                <td>{pd.site}</td>
            </tr>
            <tr>
                <td>title</td>
                <td>{pd.title}</td>
            </tr>
            <tr>
                <td>page id</td>
                <td>{pd.page_id}</td>
            </tr>
            <tr>
                <td>timestamp</td>
                <td>{new Date(pd.timestamp * 1000).toString()}</td>
            </tr>
            <tr>
                <td>lang</td>
                <td>{pd.lang}</td>
            </tr>
            <tr>
                <td>has refs</td>
                <td>{pd.has_references ? "YES" : "NO"}</td>
            </tr>
            <tr>
                <td>timing</td>
                <td>{pd["timing"]}</td>
            </tr>

            </tbody>
        </table>

        {/*<pre>{JSON.stringify(pd, null, 2)}</pre>*/}

    </div>
}

export default PageData;
