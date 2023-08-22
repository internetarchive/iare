

export const convertUrlArray = (urlArray=[]) => {

    if (!urlArray || !urlArray.length) return [];

    // transform urlArray, which is an array of objects wrapping a url object in a "data" property,
    // into an array of bare url objects
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