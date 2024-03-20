// src/components/pages/Grid.js
import React from 'react';
import ScoreBoard from "../../components/main/ScoreBoard";

const Grid = () => {
    console.log("Page: Grid.js")
    return (
        <div>
            <h2>Data Grid</h2>
            <p>Compare results of different methods of operations on a set of data</p>
            <ScoreBoard options={{}} />
        </div>
    );
};

export default Grid;