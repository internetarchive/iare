// ---------------------------------------------------------------------------
// Input types — the IARI pageData shape, narrowed to the fields we read.
// ---------------------------------------------------------------------------

export interface ArchiveStatus {
    hasArchive?: boolean
}

export interface ReferenceSummary {
    sections?: string[]
}

/** One entry of pageData.urlArray. IARI sends many more fields than we read. */
export interface UrlItem {
    url?: string
    archive_status?: ArchiveStatus
    reference_summary?: ReferenceSummary
    [key: string]: unknown
}

export interface PageData {
    section_names?: string[]
    urlArray?: UrlItem[]
    /** "wiki_article" selects the page-titled tapestry title. */
    media_type?: string
    page_title?: string
    [key: string]: unknown
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

export interface TapestryConfig {
    xMediaSize: number
    yMediaSize: number
    xMediaGap: number
    yMediaGap: number
    xSectionGap: number
    ySectionGap: number
    /** Sections wrap to a new row once a row would grow past this width. */
    maxRowWidth: number
}

export type TapestryOptions = Partial<TapestryConfig>

// ---------------------------------------------------------------------------
// Working types — produced by gather, refined by process.
// ---------------------------------------------------------------------------

export interface Link {
    url: string
    hasArchive: boolean
    sections: string[]
    /** Pointer to the untouched entry in pageData.urlArray. */
    urlObj: UrlItem
}

/** A section as gathered: named, with its links, but not yet sized or placed. */
export interface Section {
    name: string
    items: Link[]
    count: number
}

/** A section that survived the empty filter and has been sized and placed. */
export interface PlacedSection extends Section {
    groupId: string
    xGrid: number
    yGrid: number
    xOrg: number
    yOrg: number
    xSize: number
    ySize: number
}

export interface GatherResult {
    sections: Section[]
    links: Link[]
}

// ---------------------------------------------------------------------------
// Output types — the tapestry document.
// ---------------------------------------------------------------------------

export interface Position {
    x: number
    y: number
}

export interface Size {
    width: number
    height: number
}

interface BaseItem {
    id: string
    position: Position
    size: Size
    title: string
    groupId: string
    notes: null
    layer: number
}

/** An archived link, embedded live. The `never` fields keep the two variants
 *  mutually exclusive, so a text-only field on a webpage item fails to compile. */
export interface WebpageItem extends BaseItem {
    dropShadow: true
    source: string
    type: 'webpage'
    webpageType: null
    text?: never
    backgroundColor?: never
}

/** An unarchived link, rendered as a text card. */
export interface TextItem extends BaseItem {
    dropShadow: false
    type: 'text'
    text: string
    backgroundColor: string
    source?: never
    webpageType?: never
}

export type TapestryItem = WebpageItem | TextItem

export interface TapestryGroup {
    id: string
    color: null
    hasBorder: boolean
    hasBackground: boolean
}

export interface Tapestry {
    version: number
    title: string
    description: string
    presentation: unknown[]
    items: TapestryItem[]
    groups: TapestryGroup[]
}

// ---------------------------------------------------------------------------

const DEFAULT_CONFIG: TapestryConfig = {
    xMediaSize: 400,
    yMediaSize: 300,
    xMediaGap: 10,
    yMediaGap: 10,
    xSectionGap: 50,
    ySectionGap: 50,
    maxRowWidth: 4000,
}

const TAPESTRY_VERSION = 7

const TEXT_STYLE = 'color: rgb(205, 205, 205); font-size: 16px;'

// Item and group ids share the 8-4-4-4-12 shape but differ in the fourth field,
// so an item id can never collide with a group id. Both indexes are 1-based.
const itemId = (n: number): string => `00000000-0000-0000-0000-${String(n).padStart(12, '0')}`
const groupId = (n: number): string => `00000000-0000-0000-0001-${String(n).padStart(12, '0')}`

const escapeHtml = (s: string): string => s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

/**
 * The tapestry title, which doubles as its description. A wiki article names
 * itself; anything else falls back to a generic title.
 */
export function tapestryTitle(pageData: PageData | null | undefined): string {
    if (pageData?.media_type !== 'wiki_article') return 'Citations for Wiki article'

    // Trimmed so a missing page_title degrades to the bare phrase rather than
    // leaving a trailing space or interpolating "undefined".
    return `Citations for wiki article ${pageData.page_title ?? ''}`.trim()
}

/**
 * 1. Gather data — build the sections and links collections from pageData.
 */
export function gatherData(pageData: PageData | null | undefined): GatherResult {
    const sectionNames = pageData?.section_names ?? []
    const urlArray = pageData?.urlArray ?? []

    const sections: Section[] = sectionNames.map((name) => ({
        name,
        items: [],
        count: 0,
    }))

    const byName = new Map(sections.map((section) => [section.name, section]))

    const links: Link[] = urlArray.map((urlObj) => ({
        url: urlObj?.url ?? '',
        hasArchive: urlObj?.archive_status?.hasArchive === true,
        sections: urlObj?.reference_summary?.sections ?? [],
        urlObj,
    }))

    // A link may belong to more than one section, so it lands in more than one list.
    for (const link of links) {
        for (const name of link.sections) {
            const section = byName.get(name)
            if (!section) continue // names absent from section_names are ignored
            section.items.push(link)
            section.count += 1
        }
    }

    return { sections, links }
}

/**
 * 2. Process data — drop empty sections, then size and place the survivors.
 * Returns the surviving sections in layout order.
 */
export function processData(
    sections: Section[],
    config: TapestryConfig = DEFAULT_CONFIG,
): PlacedSection[] {
    const active: PlacedSection[] = sections
        .filter((section) => section.count > 0)
        .map((section, i) => {
            // Fit count items as close to a 4:3 grid as possible. Trailing empty cells
            // in the last row are allowed, and are preferred over a wider, emptier grid.
            const xGrid = Math.max(1, Math.round(Math.sqrt(section.count * 4 / 3)))
            const yGrid = Math.max(1, Math.ceil(section.count / xGrid))

            return {
                ...section,
                groupId: groupId(i + 1),
                xGrid,
                yGrid,
                xOrg: 0,
                yOrg: 0,
                xSize: xGrid * (config.xMediaSize + config.xMediaGap) - config.xMediaGap,
                ySize: yGrid * (config.yMediaSize + config.yMediaGap) - config.yMediaGap,
            }
        })

    let nextOrigX = 0
    let nextOrigY = 0
    let rowMaxHeight = 0

    for (const section of active) {
        // The nextOrigX > 0 guard lets a section wider than maxRowWidth overhang its
        // own row rather than wrapping forever.
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

    return active
}

/**
 * 3. Render data — emit the tapestry object.
 */
export function renderData(
    sections: PlacedSection[],
    title: string,
    config: TapestryConfig = DEFAULT_CONFIG,
): Tapestry {
    const items: TapestryItem[] = []

    for (const section of sections) {
        section.items.forEach((link, i) => {
            const col = i % section.xGrid
            const row = Math.floor(i / section.xGrid)

            // Key order matches samples/output/tapestry.example.json so emitted
            // documents diff cleanly against the reference fixture.
            const common = {
                id: itemId(items.length + 1),
                position: {
                    x: section.xOrg + col * (config.xMediaSize + config.xMediaGap),
                    y: section.yOrg + row * (config.yMediaSize + config.yMediaGap),
                },
                size: { width: config.xMediaSize, height: config.yMediaSize },
                title: '',
            } as const

            // An unarchived link has nothing embeddable, so it renders as a text card.
            items.push(link.hasArchive
                ? {
                    ...common,
                    dropShadow: true,
                    source: link.url,
                    type: 'webpage',
                    groupId: section.groupId,
                    notes: null,
                    webpageType: null,
                    layer: 0,
                }
                : {
                    ...common,
                    dropShadow: false,
                    type: 'text',
                    text: `<p><span style="${TEXT_STYLE}">${escapeHtml(link.url)}</span></p>`,
                    backgroundColor: '#ffffff00',
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

    // presentation is built fresh per call so two tapestries never share an array.
    return {
        version: TAPESTRY_VERSION,
        title,
        description: title,
        presentation: [],
        items,
        groups,
    }
}

/**
 * Parse an IARI pageData object into a tapestry object.
 *
 * @param pageData IARI page data; only urlArray and section_names are read.
 * @param options  Overrides merged over the default layout config.
 * @returns A tapestry object, ready for JSON.stringify.
 */
export default function parseTapestry(
    pageData: PageData | null | undefined,
    options: TapestryOptions = {},
): Tapestry {
    const config: TapestryConfig = { ...DEFAULT_CONFIG, ...options }

    const { sections } = gatherData(pageData)
    const active = processData(sections, config)

    return renderData(active, tapestryTitle(pageData), config)
}
