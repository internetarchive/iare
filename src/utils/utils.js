

export const normalizeUrlArray = (urlArray=[]) => {
    // transform urlArray, which is an array of url objects wrapped in a "data" property,
    // returns array of bare url objects extracted from "data" wrapper
    if (!urlArray || !urlArray.length) return [];
    return urlArray.map( uData => uData.data )
}


export const copyToClipboard = (copyText, label="Data") => {

    navigator.clipboard.writeText(copyText)
        .then(() => {
            console.log(`${label} copied to clipboard.`);
            alert(`${label} copied to clipboard.`);
        })
        .catch((error) => {
            console.error(`Failed to copy ${label} to clipboard.`, error);
            alert(`Failed to copy ${label} to clipboard: ${error}`);
        });
}

// returns hexadecimal color for interpolated gradient between start and end colors
//
// startColor and endColor are rgb triplet integer arrays: [ <r>, <g>, <b> ]
// steps is how many steps in between first and last color
// index is which of those step colors to return, 0 based
export const getColorFromIndex = (index, startColor, endColor, steps) => {
    function rgbToHex(r, g, b) {
        const hexR = r.toString(16).padStart(2, "0"); // Convert to hex and pad with 0 if needed
        const hexG = g.toString(16).padStart(2, "0");
        const hexB = b.toString(16).padStart(2, "0");
        return `#${hexR}${hexG}${hexB}`; // Return the hexadecimal color string
    }
    if (steps <= 1) {
        return rgbToHex(endColor[0],endColor[1],endColor[2]);
    }
    const r = Math.floor(startColor[0] + (index / (steps -1) * (endColor[0] - startColor[0]) ));
    const g = Math.floor(startColor[1] + (index / (steps -1) * (endColor[1] - startColor[1]) ));
    const b = Math.floor(startColor[2] + (index / (steps -1) * (endColor[2] - startColor[2]) ));
    return rgbToHex(r,g,b);
}

// startColor and endColor are #AABBCC hex format
// returns array of colors that are a fade from start color to end color
// Example usage:
//   const startColor = '#ff0000'; // Red
//   const endColor = '#00ff00'; // Green
//   const steps = 10; // Number of steps
//
//   const colorArray = generateColorFade(startColor, endColor, steps);
//   console.log(colorArray);
export const generateColorFade = (startColor, endColor, steps) => {
    if (steps < 2) return [ startColor ]

    // Convert start and end colors to RGB format
    const startRGB = hexToRgb(startColor);
    const endRGB = hexToRgb(endColor);

    // Calculate the step increments for each color channel
    const stepIncrement = {
        r: (endRGB.r - startRGB.r) / (steps - 1),
        g: (endRGB.g - startRGB.g) / (steps - 1),
        b: (endRGB.b - startRGB.b) / (steps - 1),
    };

    // Generate the array of color specifications
    const colorArray = Array.from({ length: steps }, (_, index) => {
        const currentColor = {
            r: Math.round(startRGB.r + stepIncrement.r * index),
            g: Math.round(startRGB.g + stepIncrement.g * index),
            b: Math.round(startRGB.b + stepIncrement.b * index),
        };
        return rgbToHex(currentColor);
    });

    return colorArray;
}

// Helper function to convert hex color to RGB
function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r: r, g: g, b: b };
}

// Helper function to convert RGB color to hex
function rgbToHex(rgb) {
    return (
        '#' +
        ((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b)
            .toString(16)
            .slice(1)
    );
}

export const convertToCSV = (json) => {
    const rows = json.map((row) => {

        const myRowItems = row.map( (item) => {
            // from: https://stackoverflow.com/questions/46637955/write-a-string-containing-commas-and-double-quotes-to-csv
            // We remove blanks and check if the item contains other whitespace,`,` or `"`.
            // In that case, we need to quote the item.

            if (typeof item === 'string') {
                if (item.replace(/ /g, '').match(/[\s,"]/)) {
                    return '"' + item.replace(/"/g, '""') + '"';
                }
                return item
            } else {
                return item
            }
        })
        return myRowItems.join(',');
    });
    return rows.join('\n');
}


export const areObjectsEqual = (objA, objB) => {
    // Get the keys of the objects
    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);

    // Check if the number of keys is the same
    if (keysA.length !== keysB.length) {
        return false;
    }

    // Iterate through keys and compare values
    for (let key of keysA) {
        // If the values of the current key are not the same, objects are not equal
        if (objA[key] !== objB[key]) {
            return false;
        }
    }

    // If all values are equal, objects are equal
    return true;
}

export const getLinkStatus = (statusCode) => {
    return (statusCode === undefined)
        ? 'none'
        : (statusCode >= 200 && statusCode < 400)
            ? 'good'
            : 'bad'
}

