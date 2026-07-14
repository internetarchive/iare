import React, { createContext, useContext, useState } from "react"
import {Tooltip as MyTooltip} from "react-tooltip";  // using "MyTooltip" helps in Chrome devTools
import TooltipTemplate from "../components/TooltipTemplate.jsx"

const TooltipContext = createContext(null)

export function TooltipProvider({ children }) {

    const [tooltip, setTooltip] = useState(null)
    // {
    //     content,
    //     canPin,
    //     pinned
    // })

    const showTooltip = ({ content, canPin = false }) => {
        if (tooltip?.pinned) return;

        setTooltip({
            content,
            canPin,
            pinned: false
        });
    }

    const pinTooltip = () => {
        setTooltip(prev => ({
            ...prev,
            pinned: true
        }));
    }

    const closeTooltip = () => {
        setTooltip(null)
    }

    return (
        <TooltipContext.Provider
            value={{
                // content,
                // pinned,
                showTooltip,
                pinTooltip,
                closeTooltip
            }}
        >
            {children}

            <MyTooltip
                id="master-tooltip"
                className={"tooltip-iare-display"}
                // float={false}
                float={true}
                closeOnEsc={true}
                delayShow={420}
                variant={"info"}
                noArrow={true}
                // offset={5}
                offset={30}
                style={{zIndex: 9999}}

                place="top"
                positionStrategy="fixed"

                clickable
            >
                <TooltipTemplate
                    content={tooltip?.content}
                    canPin={tooltip?.canPin}
                    pinned={tooltip?.pinned}
                    onClose={closeTooltip}
                />
            </MyTooltip>

        </TooltipContext.Provider>
    )

}

export function useTooltip() {
    return useContext(TooltipContext)
}
