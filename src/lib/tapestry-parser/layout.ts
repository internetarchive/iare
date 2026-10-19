// GENERATED FILE — do not edit.
// Copied from tapestry-parser/src/layout.ts by `npm run sync:iare`.
// Change it there and re-run the sync; edits here will be overwritten.

/**
 * Layout primitives shared by parseTapestry and parseRefTapestry.
 *
 * docs/parseTapestry.md is the canonical description of these rules; this module
 * is the single implementation so the two parsers cannot drift apart.
 */

export interface LayoutConfig {
    xMediaSize: number
    yMediaSize: number
    xMediaGap: number
    yMediaGap: number
    xSectionGap: number
    ySectionGap: number
    /** Sections wrap to a new row once a row would grow past this width. */
    maxRowWidth: number
}

export const DEFAULT_LAYOUT: LayoutConfig = {
    xMediaSize: 600,
    yMediaSize: 450,
    xMediaGap: 20,
    yMediaGap: 20,
    xSectionGap: 50,
    ySectionGap: 50,
    maxRowWidth: 5000,
}

export const TAPESTRY_VERSION = 7

export const TEXT_STYLE = 'color: rgb(205, 205, 205); font-size: 16px;'

// Item and group ids share the 8-4-4-4-12 shape but differ in the fourth field,
// so an item id can never collide with a group id. Both indexes are 1-based.
export const itemId = (n: number): string => `00000000-0000-0000-0000-${String(n).padStart(12, '0')}`
export const groupId = (n: number): string => `00000000-0000-0000-0001-${String(n).padStart(12, '0')}`

export const escapeHtml = (s: string): string => s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

/**
 * Fit `count` items as close to a 4:3 grid as possible. Trailing empty cells in
 * the last row are allowed, and are preferred over a wider, emptier grid — so 9
 * items give 3x3, not the exactly-4:3 4x3.
 */
export function gridFor(count: number): { xGrid: number; yGrid: number } {
    const xGrid = Math.max(1, Math.round(Math.sqrt(count * 4 / 3)))
    return { xGrid, yGrid: Math.max(1, Math.ceil(count / xGrid)) }
}

export interface Placeable {
    xSize: number
    ySize: number
    xOrg: number
    yOrg: number
}

/**
 * Flow sections left to right, wrapping to a new row once one would cross
 * maxRowWidth. Each row advances by its tallest section. Mutates xOrg/yOrg.
 */
export function placeSections<T extends Placeable>(sections: T[], config: LayoutConfig): T[] {
    let nextOrigX = 0
    let nextOrigY = 0
    let rowMaxHeight = 0

    for (const section of sections) {
        // The nextOrigX > 0 guard lets a section wider than maxRowWidth overhang
        // its own row rather than wrapping forever.
        if (nextOrigX > 0 && nextOrigX + section.xSize > config.maxRowWidth) {
            nextOrigX = 0
            nextOrigY += rowMaxHeight + config.ySectionGap
            rowMaxHeight = 0
        }

        section.xOrg = nextOrigX
        section.yOrg = nextOrigY

        nextOrigX += section.xSize + config.xSectionGap
        rowMaxHeight = Math.max(rowMaxHeight, section.ySize)
    }

    return sections
}
