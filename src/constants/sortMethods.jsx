/** sort methods that can bne used for sorting routines */

/**
 * Sorts an array of objects by URL, asc or desc, depending on parameter,
 */
export function compareByUrl(direction = 'asc') {
    const multiplier = direction === 'desc' ? 1 : -1;
    return (a, b) => {
        if (a.url < b.url) return 1 * multiplier;
        if (a.url > b.url) return -1 * multiplier;
        return 0;
    };
}