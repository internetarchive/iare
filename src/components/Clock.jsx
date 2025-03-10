import React, {useState} from "react";

function Clock(props) {
    const [time, setTime] = useState(new Date().toLocaleTimeString());

    setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);

    return <div className="display-clock">Current time: {time}</div>
}