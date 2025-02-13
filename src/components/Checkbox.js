import React from "react";

export default function Checkbox({
  label,
  value,
  onChange,
  className = "",
  tooltipId = null,
  tooltipContent = null,
}) {
  // Determine the status message based on the checkbox value
  const statusMessage = value ? "Permalive" : "Permadead";

  return (
    <label
      className={`${className} ${tooltipContent ? "tooltip-active" : ""}`}
      data-tooltip-id={tooltipId}
      data-tooltip-html={tooltipContent}
    >
      <input type="checkbox" checked={value} onChange={onChange} />
      {label}
      {/* Display the status message */}
      <span className="status-message"> ({statusMessage})</span>
    </label>
  );
}
