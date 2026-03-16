import React from "react";
import './css/signals.css';

export default function SignalsSort({
        onSort = () => {},
}) {
    return <>
        <div>Sort the URL links by their WikiSignal scores.</div>
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            // gap: '10px',
            alignItems: 'left',
            marginTop: '10px'
        }}>
            <button className={"utility-button no-margin"}
                    style={{width: '200px'}}
                    onClick={() => {
                        onSort("signal_wayback")
                    }}>Sort By Wayback snapshots
            </button>
            <button className={"utility-button no-margin"}
                    style={{width: '200px'}}
                    onClick={() => {
                        onSort("signal_wiki")
                    }}>Sort By Wikipedia uses
            </button>
            <button className={"utility-button no-margin"}
                    style={{width: '200px'}}
                    onClick={() => {
                        onSort("none")
                    }}>Remove Sort
            </button>
        </div>
    </>
}


