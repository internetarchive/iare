export default function TooltipTemplate({
    content,
    canPin = false,
    pinned = false,
    onClose
}) {
    let header = null
    if (pinned) {
        header = <div className="tooltip-header"><button onClick={onClose}>✕</button></div>
    } else if (canPin) {
        header = <div className="tooltip-header">Click to Pin</div>
    }

    return (
        <div className="tooltip-template">
            {header}
            <div className="tooltip-content">
                {content}
            </div>

        </div>
    );
}
