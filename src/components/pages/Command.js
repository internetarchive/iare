// src/components/pages/Command.js
import React from 'react';
import CommandTest from "../main/CommandTest";

const Command = () => {

    const handleAction = (result) => {
        // error of not object like: {action: <action>, value: <value>}
        const {action, value} = result;
        console.log (`Command:handleAction: action=${action}, value=${value}`);

        if (0) {
            // placebo to make coding easier for adding "else if" conditions
        }


        else {
            console.log(`ScoreBoard Action "${action}" not supported.`)
            alert(`Scoreboard Action "${action}" not supported.`)
        }

    }

    return (<>
            <div>
                <h2>Command</h2>
                <p>Page to exercise commands over the wire</p>
            </div>

            <div className="row">
                <div className={"col"}>
                    <CommandTest commandData={{}} onAction={handleAction}/>
                </div>
            </div>
        </>
    );
};

export default Command;