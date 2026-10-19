// GENERATED FILE — do not edit.
// Copied from tapestry-parser/src/common.ts by `npm run sync:iare`.
// Change it there and re-run the sync; edits here will be overwritten.

/**
 * Types and helpers shared by every parser.
 *
 * Nothing here knows about `urlArray` or `references` — parser-specific input
 * shapes extend `PageDataBase` in their own module. Keeping this module free of
 * parser imports is what lets parseTapestry and parseRefTapestry stay
 * independent of each other.
 */

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------

/**
 * The fields of an IARI `pageData` that every parser reads. Parser-specific
 * inputs extend this — `PageData` adds `urlArray`, `RefPageData` adds
 * `references` and `urlDict`.
 */
export interface PageDataBase {
    section_names?: string[]
    /** "wiki_article" selects the page-titled document title. */
    media_type?: string
    page_title?: string
    [key: string]: unknown
}

// ---------------------------------------------------------------------------
// Output primitives
// ---------------------------------------------------------------------------

export interface Position {
    x: number
    y: number
}

export interface Size {
    width: number
    height: number
}

export interface TapestryGroup {
    id: string
    color: null
    hasBorder: boolean
    hasBackground: boolean
}

// ---------------------------------------------------------------------------
// Document title
// ---------------------------------------------------------------------------

/**
 * Which parser produced a tapestry, used as the leading noun of its title.
 * `parseTapestry` emits "Citations …"; `parseRefTapestry` emits "References …",
 * so the two documents are distinguishable at a glance.
 */
export type TapestryKind = 'Citations' | 'References'

/**
 * The document title, which doubles as its description. A wiki article names
 * itself; anything else falls back to a generic title.
 *
 * This is `tapestry.title` metadata. It is not the on-canvas heading that
 * parseRefTapestry draws — see docs/parseRefTapestry.md.
 */
export function tapestryTitle(
    pageData: PageDataBase | null | undefined,
    kind: TapestryKind = 'Citations',
): string {
    if (pageData?.media_type !== 'wiki_article') return `${kind} for Wiki article`

    // Trimmed so a missing page_title degrades to the bare phrase rather than
    // leaving a trailing space or interpolating "undefined".
    return `${kind} for wiki article ${pageData.page_title ?? ''}`.trim()
}
