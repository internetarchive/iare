import React, { useState } from 'react';

/*
assume choices is an array of { caption: <caption>, value: <value> } objects
 */
const DropdownChoiceChooser = ({ label='Select an option', choices, onSelect, defaultChoice='' }) => {
    const [selectedChoice, setSelectedChoice] = useState(defaultChoice);

    const handleChange = (event) => {
        const selectedValue = event.target.value;
        setSelectedChoice(selectedValue);
        onSelect(selectedValue);
    };

    return (
        <label>{label}
        <select value={selectedChoice} onChange={handleChange}>
            {choices.map((choice) => (
                <option key={choice.value} value={choice.value}>
                    {choice.caption}
                </option>
            ))}
        </select>
        </label>
    );
};

export default DropdownChoiceChooser;