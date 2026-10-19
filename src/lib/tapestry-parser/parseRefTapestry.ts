// GENERATED FILE — do not edit.
// Copied from tapestry-parser/src/parseRefTapestry.ts by `npm run sync:iare`.
// Change it there and re-run the sync; edits here will be overwritten.

import {
    DEFAULT_LAYOUT,
    TAPESTRY_VERSION,
    TEXT_STYLE,
    escapeHtml,
    gridFor,
    groupId,
    itemId,
    placeSections,
} from './layout'
import type { LayoutConfig } from './layout'
import { tapestryTitle } from './common'
import type { PageDataBase, Position, Size, TapestryGroup } from './common'

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

export interface ReferenceTemplate {
    name?: string
    parameters?: Record<string, string>
}

/** One entry of pageData.references. IARI sends more fields than we read. */
export interface Reference {
    ref_index?: number
    section?: string
    urls?: string[]
    templates?: ReferenceTemplate[]
    titles?: string[]
    name?: string | null
    wikitext?: string
    [key: string]: unknown
}

export interface UrlDictEntry {
    status_code?: number
    [key: string]: unknown
}

export interface RefPageData extends PageDataBase {
    references?: Reference[]
    urlDict?: Record<string, UrlDictEntry>
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export interface RefTapestryConfig extends LayoutConfig {
    /** Height of the caption item sitting below each cell's main item. */
    captionHeight: number
    /** Gap between a cell's main item and its caption. */
    captionGap: number
    /** Height of the name caption sitting above each section. */
    sectionCaptionHeight: number
    /** Gap between a section's name caption and its first row of cells. */
    sectionCaptionGap: number
    /** Height of the tapestry title above everything. */
    titleHeight: number
    /** Gap between the title and the first section. */
    titleGap: number
}

export type RefTapestryOptions = Partial<RefTapestryConfig> & {
    /**
     * Overrides both the document title (`tapestry.title` and `description`,
     * otherwise `tapestryTitle()`) and the on-canvas title item (otherwise
     * `pageData.page_title`). When given, it is simply *the* title.
     */
    title?: string
    /**
     * Background for the whole tapestry, emitted as the top-level `background`
     * field. Omitted from the output when unset, leaving the Tapestry app its
     * own default. This is the canvas background, not any item's background.
     */
    backgroundColor?: string
}

/** Presentational inputs to the render stage, as opposed to layout dimensions. */
export interface RefRenderOptions {
    /** Text of the on-canvas title item. */
    headingText?: string
    /** Background for the whole tapestry. */
    backgroundColor?: string
}

/**
 * Exported so callers — and tests — can derive geometry from the defaults
 * rather than restating them. Changing a value here should never require
 * recalculating an expected coordinate by hand.
 */
export const DEFAULT_REF_CONFIG: RefTapestryConfig = {
    ...DEFAULT_LAYOUT,
    captionHeight: 40,
    captionGap: 6,
    sectionCaptionHeight: 40,
    sectionCaptionGap: 10,
    titleHeight: 60,
    titleGap: 20,
}

/** A cell is the main item plus its caption, stacked. */
const cellHeightOf = (config: RefTapestryConfig): number =>
    config.yMediaSize + config.captionGap + config.captionHeight

/** Vertical space a section's name caption occupies above its grid. */
const sectionHeaderHeightOf = (config: RefTapestryConfig): number =>
    config.sectionCaptionHeight + config.sectionCaptionGap

/** Vertical space the tapestry title occupies above every section. */
const titleBlockHeightOf = (config: RefTapestryConfig): number =>
    config.titleHeight + config.titleGap

// ---------------------------------------------------------------------------
// Working types
// ---------------------------------------------------------------------------

/** A section as gathered: named, with its references, not yet sized or placed. */
export interface RefSection {
    name: string
    items: Reference[]
    count: number
}

/** A section that survived the empty filter and has been sized and placed. */
export interface PlacedRefSection extends RefSection {
    groupId: string
    xGrid: number
    yGrid: number
    xOrg: number
    yOrg: number
    xSize: number
    ySize: number
}

export interface RefGatherResult {
    sections: RefSection[]
    references: Reference[]
    /** Named references that can serve as a back-reference target. */
    definitions: Map<string, Reference>
}

// ---------------------------------------------------------------------------
// Output types
// ---------------------------------------------------------------------------

export type PrimeLink = 'archive' | 'live' | 'live-dead' | 'none'

export interface OriginalLink {
    url: string
    status: number | null
    hot: boolean
}

interface RefBaseItem {
    id: string
    position: Position
    size: Size
    title: string
    groupId: string
    notes: null
    layer: number
}

export interface RefWebpageItem extends RefBaseItem {
    dropShadow: boolean
    source: string
    type: 'webpage'
    webpageType: null
    primeLink: PrimeLink
    originalLink?: OriginalLink
    pointerRef?: string
    errors?: string[]
    text?: never
    backgroundColor?: never
}

export interface RefTextItem extends RefBaseItem {
    dropShadow: false
    type: 'text'
    text: string
    backgroundColor: string
    /** Present on a cell's main item, absent on its caption. */
    primeLink?: PrimeLink
    pointerRef?: string
    errors?: string[]
    source?: never
    webpageType?: never
}

export type RefTapestryItem = RefWebpageItem | RefTextItem

export interface RefTapestry {
    version: number
    title: string
    description: string
    presentation: unknown[]
    /** Canvas background. Absent unless the caller asked for one. */
    background?: string
    items: RefTapestryItem[]
    groups: TapestryGroup[]
}

// ---------------------------------------------------------------------------
// Reference helpers
// ---------------------------------------------------------------------------

const ARCHIVE_PATTERN = /web\.archive\.org/
const STUB_PATTERN = /^<ref[^>]*\/>$/

const WARNING_BACKGROUND = '#3a1f1f80'
const TRANSPARENT_BACKGROUND = '#ffffff00'
const WARNING_STYLE = 'color: rgb(255, 120, 120); font-size: 16px;'
/** Twice the normal 16px body size. */
const TITLE_STYLE = 'color: rgb(205, 205, 205); font-size: 32px;'

/** Merge every template's parameters into one object; later templates win. */
export function templateParams(ref: Reference): Record<string, string> {
    const merged: Record<string, string> = {}
    for (const template of ref.templates ?? []) Object.assign(merged, template.parameters ?? {})
    return merged
}

const isValidStatus = (status: number | null): boolean =>
    status !== null && status >= 200 && status <= 399

/** `<ref name="X" />` — a pointer to a reference defined elsewhere, with no content. */
export function isBackRefStub(ref: Reference): boolean {
    return !(ref.templates?.length)
        && !(ref.urls?.length)
        && Boolean(ref.name)
        && STUB_PATTERN.test((ref.wikitext ?? '').trim())
}

/** Heading cascade for a text cell: title, then ref name, then a placeholder. */
export function refHeading(ref: Reference): string {
    return ref.titles?.[0] ?? ref.name ?? '(untitled reference)'
}

/**
 * Strip wiki markup from a reference's raw wikitext. No length cap — a long
 * citation is shown in full and clipped by the UI rather than by the parser.
 */
export function cleanWikitext(wikitext: string): string {
    let out = wikitext
        .replace(/^<ref[^>]*>/i, '')
        .replace(/<\/ref>\s*$/i, '')

    // Templates nest, so collapse innermost-first until nothing changes.
    for (let pass = 0; pass < 10; pass++) {
        const next = out.replace(/\{\{[^{}]*\}\}/g, '')
        if (next === out) break
        out = next
    }

    return out
        .replace(/\[\[(?:[^\]|]*\|)?([^\]]*)\]\]/g, '$1')
        .replace(/'''/g, '')
        .replace(/''/g, '')
        .replace(/\s+/g, ' ')
        .trim()
}

/** Data-quality problems in the citation itself. Starter taxonomy; expect growth. */
export function detectErrors(ref: Reference, urlDict: Record<string, UrlDictEntry>): string[] {
    const params = templateParams(ref)
    const errors: string[] = []

    const original = params['url'] ?? params['chapter-url']
    const status = original ? urlDict[original]?.status_code ?? null : null

    if (params['isbn'] && params['archive-url']) {
        errors.push('Books should not have archives')
    }
    if (params['url-status'] === 'live' && status !== null && !isValidStatus(status)) {
        errors.push(`Template says url-status=live but URL returns ${status}`)
    }
    if ((ref.urls ?? []).some((u) => ARCHIVE_PATTERN.test(u)) && !params['archive-url']
        && (ref.templates?.length ?? 0) > 0) {
        errors.push('Archive URL in wikitext but no archive-url parameter')
    }
    if ((ref.templates?.length ?? 0) > 0 && !original
        && !params['doi'] && !params['bibcode'] && !params['isbn']) {
        errors.push('Template has no URL and no identifier')
    }

    return errors
}

// ---------------------------------------------------------------------------
// 1. Gather
// ---------------------------------------------------------------------------

export function gatherRefData(pageData: RefPageData | null | undefined): RefGatherResult {
    const sectionNames = pageData?.section_names ?? []
    const references = pageData?.references ?? []

    const sections: RefSection[] = sectionNames.map((name) => ({ name, items: [], count: 0 }))
    const byName = new Map(sections.map((section) => [section.name, section]))

    // reference.section is a single string, so each reference lands in exactly
    // one section — no duplication, unlike parseTapestry.
    for (const reference of references) {
        const section = reference.section ? byName.get(reference.section) : undefined
        if (!section) continue // sections absent from section_names are ignored
        section.items.push(reference)
        section.count += 1
    }

    const definitions = new Map<string, Reference>()
    for (const reference of references) {
        if (reference.name && !isBackRefStub(reference)) definitions.set(reference.name, reference)
    }

    return { sections, references, definitions }
}

// ---------------------------------------------------------------------------
// 2. Process
// ---------------------------------------------------------------------------

export function processRefData(
    sections: RefSection[],
    config: RefTapestryConfig = DEFAULT_REF_CONFIG,
): PlacedRefSection[] {
    const cellHeight = cellHeightOf(config)
    const header = sectionHeaderHeightOf(config)

    const active: PlacedRefSection[] = sections
        .filter((section) => section.count > 0)
        .map((section, i) => {
            const { xGrid, yGrid } = gridFor(section.count)

            return {
                ...section,
                groupId: groupId(i + 1),
                xGrid,
                yGrid,
                xOrg: 0,
                yOrg: 0,
                xSize: xGrid * (config.xMediaSize + config.xMediaGap) - config.xMediaGap,
                // A section spans its name caption plus its grid, and each grid row
                // must fit a cell's main item plus that cell's own caption.
                ySize: header + yGrid * (cellHeight + config.yMediaGap) - config.yMediaGap,
            }
        })

    placeSections(active, config)

    // Everything shifts down to leave room for the title above the first section.
    const titleBlock = titleBlockHeightOf(config)
    for (const section of active) section.yOrg += titleBlock

    return active
}

// ---------------------------------------------------------------------------
// 3. Render
// ---------------------------------------------------------------------------

const paragraph = (text: string, style: string = TEXT_STYLE): string =>
    `<p><span style="${style}">${text}</span></p>`

const link = (url: string, label: string): string =>
    `<a href="${escapeHtml(url)}">${escapeHtml(label)}</a>`

/** What a reference renders as, before it is turned into positioned items. */
interface CellPlan {
    primeLink: PrimeLink
    /** Set for a webpage cell. */
    source?: string
    dropShadow: boolean
    /** Set for a text cell: already-escaped HTML. */
    text?: string
    backgroundColor?: string
    caption: string
    originalLink?: OriginalLink
    pointerRef?: string
    errors: string[]
}

function textCell(lines: string[], primeLink: PrimeLink, background: string): CellPlan {
    return {
        primeLink,
        dropShadow: false,
        text: lines.join(''),
        backgroundColor: background,
        caption: '',
        errors: [],
    }
}

function planFor(
    reference: Reference,
    urlDict: Record<string, UrlDictEntry>,
    definitions: Map<string, Reference>,
): CellPlan {
    // Case A — back-reference stub.
    if (isBackRefStub(reference)) {
        const target = reference.name ? definitions.get(reference.name) : undefined
        if (target) {
            const plan = planFor(target, urlDict, definitions)
            return reference.name ? { ...plan, pointerRef: reference.name } : plan
        }
        return textCell([
            paragraph('Unresolved reference:', WARNING_STYLE),
            paragraph(escapeHtml(reference.name ?? '')),
        ], 'none', WARNING_BACKGROUND)
    }

    const params = templateParams(reference)
    const errors = detectErrors(reference, urlDict)
    const templated = (reference.templates?.length ?? 0) > 0

    // Cases B/C for a templated reference, or case E when only bare URLs exist.
    const archive = templated
        ? params['archive-url']
        : (reference.urls ?? []).find((u) => ARCHIVE_PATTERN.test(u))
    const original = templated
        ? params['url'] ?? params['chapter-url']
        : (reference.urls ?? []).find((u) => !ARCHIVE_PATTERN.test(u))

    // Case B — an archive exists; embed it and offer the original as a caption.
    if (archive) {
        const status = original ? urlDict[original]?.status_code ?? null : null
        const hot = isValidStatus(status)
        return {
            primeLink: 'archive',
            source: archive,
            dropShadow: true,
            caption: original
                ? paragraph(hot ? link(original, 'Original Link') : 'Original Link invalid')
                : '',
            ...(original ? { originalLink: { url: original, status, hot } } : {}),
            errors,
        }
    }

    // Case C — a URL but no archive. A dead one is called out in the caption.
    if (original) {
        const status = urlDict[original]?.status_code ?? null
        const hot = isValidStatus(status)
        return {
            primeLink: hot ? 'live' : 'live-dead',
            source: original,
            dropShadow: false,
            caption: hot ? '' : paragraph(`Link invalid (${status ?? 'unknown'})`),
            errors,
        }
    }

    // Case D — no URL, but a doi or bibcode identifies the work.
    if (params['doi'] ?? params['bibcode']) {
        const lines = [paragraph(escapeHtml(refHeading(reference))), paragraph('No URL')]
        // Plain text, not links: resolving to doi.org / ADS is deliberately deferred.
        if (params['doi']) lines.push(paragraph(`doi:${escapeHtml(params['doi'])}`))
        if (params['bibcode']) lines.push(paragraph(`bibcode:${escapeHtml(params['bibcode'])}`))
        return { ...textCell(lines, 'none', TRANSPARENT_BACKGROUND), errors }
    }

    // Case F — no template at all.
    return {
        ...textCell([
            paragraph(escapeHtml(refHeading(reference))),
            paragraph('No Citation Template'),
            paragraph(escapeHtml(cleanWikitext(reference.wikitext ?? ''))),
        ], 'none', TRANSPARENT_BACKGROUND),
        errors,
    }
}

export function renderRefData(
    sections: PlacedRefSection[],
    title: string,
    urlDict: Record<string, UrlDictEntry>,
    definitions: Map<string, Reference>,
    config: RefTapestryConfig = DEFAULT_REF_CONFIG,
    render: RefRenderOptions = {},
): RefTapestry {
    const headingText = render.headingText ?? ''
    const items: RefTapestryItem[] = []
    const titleGroupId = groupId(sections.length + 1)

    // The title sits above every section, left-aligned with the first one, and
    // spans the full laid-out width — its text is free to run long.
    const contentWidth = sections.reduce((w, s) => Math.max(w, s.xOrg + s.xSize), config.xMediaSize)
    const leftEdge = sections.length ? Math.min(...sections.map((s) => s.xOrg)) : 0

    if (sections.length) {
        items.push({
            id: itemId(items.length + 1),
            position: { x: leftEdge, y: 0 },
            size: { width: contentWidth, height: config.titleHeight },
            title: '',
            dropShadow: false,
            type: 'text',
            text: headingText ? paragraph(escapeHtml(headingText), TITLE_STYLE) : '',
            backgroundColor: TRANSPARENT_BACKGROUND,
            groupId: titleGroupId,
            notes: null,
            layer: 0,
        })
    }

    for (const section of sections) {
        // Every section is captioned with its name, flush with its left edge and
        // directly above its first row of cells.
        items.push({
            id: itemId(items.length + 1),
            position: { x: section.xOrg, y: section.yOrg },
            size: { width: section.xSize, height: config.sectionCaptionHeight },
            title: '',
            dropShadow: false,
            type: 'text',
            text: paragraph(escapeHtml(section.name)),
            backgroundColor: TRANSPARENT_BACKGROUND,
            groupId: section.groupId,
            notes: null,
            layer: 0,
        })

        const gridTop = section.yOrg + sectionHeaderHeightOf(config)

        section.items.forEach((reference, i) => {
            const col = i % section.xGrid
            const row = Math.floor(i / section.xGrid)
            const cellHeight = cellHeightOf(config)

            const x = section.xOrg + col * (config.xMediaSize + config.xMediaGap)
            const y = gridTop + row * (cellHeight + config.yMediaGap)

            const plan = planFor(reference, urlDict, definitions)

            // Key order matches samples/output/tapestry.example.json; the extra
            // fields follow so a document still diffs cleanly against the fixture.
            const common = {
                id: itemId(items.length + 1),
                position: { x, y },
                size: { width: config.xMediaSize, height: config.yMediaSize },
                title: '',
            } as const

            const extras = {
                groupId: section.groupId,
                notes: null,
                layer: 0,
                primeLink: plan.primeLink,
                ...(plan.originalLink ? { originalLink: plan.originalLink } : {}),
                ...(plan.pointerRef ? { pointerRef: plan.pointerRef } : {}),
                ...(plan.errors.length ? { errors: plan.errors } : {}),
            } as const

            items.push(plan.source !== undefined
                ? {
                    ...common,
                    dropShadow: plan.dropShadow,
                    source: plan.source,
                    type: 'webpage',
                    webpageType: null,
                    ...extras,
                }
                : {
                    ...common,
                    dropShadow: false,
                    type: 'text',
                    text: plan.text ?? '',
                    backgroundColor: plan.backgroundColor ?? TRANSPARENT_BACKGROUND,
                    ...extras,
                })

            // The caption is always emitted, even when empty, so every cell is
            // exactly two items and positions follow from the reference index.
            items.push({
                id: itemId(items.length + 1),
                position: { x, y: y + config.yMediaSize + config.captionGap },
                size: { width: config.xMediaSize, height: config.captionHeight },
                title: '',
                dropShadow: false,
                type: 'text',
                text: plan.caption,
                backgroundColor: TRANSPARENT_BACKGROUND,
                groupId: section.groupId,
                notes: null,
                layer: 0,
            })
        })
    }

    const groups: TapestryGroup[] = sections.map((section) => ({
        id: section.groupId,
        color: null,
        hasBorder: true,
        hasBackground: true,
    }))

    // The title belongs to no section, but every item needs a group. Give it one
    // that draws nothing, so no box appears around the heading.
    if (sections.length) {
        groups.push({ id: titleGroupId, color: null, hasBorder: false, hasBackground: false })
    }

    return {
        version: TAPESTRY_VERSION,
        title,
        description: title,
        presentation: [],
        // The caller's `backgroundColor` option lands here as `background`, the
        // name the Tapestry document uses. Omitted entirely when unset, so the
        // app keeps its own default.
        ...(render.backgroundColor !== undefined
            ? { background: render.backgroundColor }
            : {}),
        items,
        groups,
    }
}

/**
 * Parse an IARI pageData object into a reference tapestry — one cell per
 * reference, so citations with no URL are represented too.
 *
 * @param pageData IARI page data; reads references, section_names and urlDict.
 * @param options  Overrides merged over the default layout config.
 * @returns A tapestry object, ready for JSON.stringify.
 */
export default function parseRefTapestry(
    pageData: RefPageData | null | undefined,
    options: RefTapestryOptions = {},
): RefTapestry {
    // `title` and `backgroundColor` are presentational, not layout dimensions.
    const { title, backgroundColor, ...layoutOptions } = options
    const config: RefTapestryConfig = { ...DEFAULT_REF_CONFIG, ...layoutOptions }

    const { sections, definitions } = gatherRefData(pageData)
    const active = processRefData(sections, config)

    return renderRefData(
        active,
        // An explicit title wins over the calculated one.
        title ?? tapestryTitle(pageData, 'References'),
        pageData?.urlDict ?? {},
        definitions,
        config,
        {
            headingText: title ?? pageData?.page_title ?? '',
            ...(backgroundColor !== undefined ? { backgroundColor } : {}),
        },
    )
}
