# IARE Architecture

This document explains how the IARE front end is put together: how a request flows from the
address bar to the screen, where the data is processed, and how the views, "flocks" and
filters fit together. For setup and scripts, see the [README](../README.md).

## Tech stack

| Concern             | Library                                                                            |
|---------------------|------------------------------------------------------------------------------------|
| UI                  | React 19 (function components and hooks)                                           |
| Build / dev server  | Vite 6 (`@vitejs/plugin-react`, `vite-plugin-svgr`)                                |
| Styling             | Bootstrap 5 via SCSS (`src/custom.scss`) plus per-component CSS                    |
| Charts              | Chart.js 4 + `react-chartjs-2` + `chartjs-plugin-datalabels`; D3 for bubble charts |
| Tooltips            | `react-tooltip`                                                                    |
| Popups / dragging   | `react-modal`, `react-rnd`, `react-draggable`                                      |
| Markdown            | `react-markdown`, `marked`, `dompurify`, `rehype-raw`                              |
| JSON viewer         | `json-edit-react`                                                                  |
| i18n                | `i18next` / `react-i18next` (`src/locales/*.json`, barely used so far)             |
| Domain parsing      | `tldts`                                                                            |

Vite needs JSX files to use the `.jsx` extension (it is not configured to read JSX inside
`.js` files). Newer code is written in TypeScript (`.ts`/`.tsx`).


## Directory layout

```
src/
  index.jsx            Entry point: reads query params, works out environment, renders <App>
  App.jsx              Shell: header, debug panel, URL input, fetches article data from IARI
  components/
    PageDisplay.jsx    Routes pageData to a display by media type (WIKI / PDF / GROK)
    pages/v2/          Main Wikipedia display (PageData, flocks, views, RefView popup)
    pages/v2pdf/       PDF display (less developed)
    pages/vGrok/       Grokipedia display and "Grok vs. Wiki" view
    charts/            Chart.js filter charts (link status, books, TLDs, perennial, ...)
    d3/                D3 visualizations (bubble charts, citation display)
    flock/             Typed cell/header components for the URL flock table
    *.jsx              Shared widgets (FilterBox, FlockBox, Loader, Popup, Dropdown, ...)
  constants/           Configuration maps: IARI sources, parse/check methods, filter maps,
                       column registry, shortcut articles, colors, signal definitions
  contexts/            ConfigContext, TooltipContext, ColumnSortContext
  utils/               IARI fetch helpers, Tapestry builders, general helpers
  errors/              IariError, CaseNotHandledError
  locales/             i18n strings (en, es, fr)
  images/              Icons and status images
```

## Request lifecycle

```
address bar ?url=...&iari-source=...
        │
        ▼
index.jsx ── getEnvironment(), getIariSource(), getCheckMethod(), getParseMethod()
        │
        ▼
App.jsx ── getMediaType(url) ─► getPagePathEndpoint() ─► fetch(IARI article endpoint)
        │                                                    │
        │            decorate data: pathName, endpoint,  ◄───┘
        │            iariSource, mediaType, displayVersion...
        ▼
PageDisplay ── WIKI ─► PageDisplayV2 ─► PageInfo + PageData
             ├ PDF  ─► PageDisplayV2PDF
             └ GROK ─► PageDisplayGrok
        ▼
PageData ── fetches URL status + signals, processes refs ─► selected view
        ▼
UrlDisplay (default) │ RefDisplay │ DomainDisplay │ StatsDisplay │ ArchiveDisplay │ GrokDisplay
```

### 1. Bootstrapping (`src/index.jsx`)

`index.jsx` reads the query string once at load time and works out:

- **Environment.** `env-production` for any `*.archive.org` host, `env-staging` for
  `internetarchive.github.io`, `env-local` for `localhost:3000`, otherwise `env-other`. The
  value is added as a class on `<body>` so CSS can style each environment differently.
- **IARI source.** A key from `constants/iariSources.jsx`. Production always uses `iari_prod`.
- **Check method.** A key from `constants/checkMethods.jsx`, used for URL live-status checks.
- **Parse method.** A key from `constants/parseMethods.jsx`. Each parse method uses a
  different IARI endpoint, and `alternate_keys` (such as `XREF`) are accepted.

Invalid values are logged to the console and replaced with the default.

### 2. Fetching the article (`src/App.jsx`)

`App` keeps the top-level state: the target path, the loaded `pageData`, loading and error
state, and the debug toggles. It also provides `ConfigContext`, which holds the environment,
IARI base URL, check method, parse method and the debug/UI flags.

`fetchArticleData()`:

1. Works out the media type from the URL with the regexes in `constants/knownMediaTypes.jsx`.
2. Builds the endpoint with `getPagePathEndpoint()` in `utils/iariUtils.js`.
3. Fetches the endpoint. If the response is not OK, it reads `errors[0].details` and throws
   an `IariError`.
4. Adds client-side fields to the response (`pathName`, `endpoint`, `iariSource`,
   `iariVersion`, `mediaType`, `displayVersion`, ...) and stores it as `pageData`.

Submitting a new URL doesn't fetch in place. `refreshPageResults()` builds a new address-bar
URL and does a full page navigation, so every analysis is a bookmarkable URL.

### 3. Processing the data (`components/pages/v2/PageData.jsx`)

`PageData` does most of the client-side work. When it mounts, `fetchPageData()` runs these
steps in order:

| Step              | Function                                        | Result                                                     |
|-------------------|-------------------------------------------------|------------------------------------------------------------|
| Fetch URL status  | `fetchUrls()` (iariUtils)                       | Live status for every URL, using the selected check method |
| Build URL index   | `processUrls()`                                 | `pageData.urlDict` (keyed by URL) and `pageData.urlArray`  |
| Link refs to URLs | `associateUrlsWithRefs()`                       | Each URL knows which references cite it                    |
| URL statistics    | `processUrlStats()`                             | Counts used by the filter charts                           |
| Book statistics   | `processBookStats()`                            | Book-link counts by domain                                 |
| WikiSignals       | `fetchSignalInfoForUrls()` → `processSignals()` | `signals` property on each URL                             |
| References        | `processReferences()`                           | Named references merged, templates collected               |
| Actionables       | `processActionables()`                          | Flags such as "broken, no archive" on URLs and refs        |

Errors collected in `pageData.process_errors` are shown above the view. Once processing is
done, the **View Options** radio buttons pick which view to render: URLs (default),
Reference Stats, Domains, or Raw page data. The URL Archives and Grok views exist but are
switched off in `viewOptionsList`.

Several of these steps are marked TODO to move into the IARI backend.

## Views

Each view is a different way of filtering one shared reference list. That's why most views
include a `RefFlock`.

### UrlDisplay (`views/Url/UrlDisplay.jsx`)

This is the main view, with three columns:

```
<UrlDisplay>
  <UrlFilterPanel>     filter charts (left)
  <ConditionsBox>      the active filter ("Results")
  <UrlFlock>           URL table (center)
  <RefFlock>           references list (right)
  <RefView>            reference detail popup
```

`UrlFilterPanel` contains collapsible `FilterBox`es, each with a chart from
`components/charts/`: Actionable, Link Status Codes, Links to Books, Links to Papers and
DOIs, Pay Level Domains, Reliability Statistics (perennial sources), Top Level Domains,
Template Occurrences, and Reference Stats.

Clicking a chart segment sends an action to `UrlDisplay.handleAction()`. That sets **both**
a URL filter (for `UrlFlock`) and a reference filter (for `RefFlock`), and records the active
condition shown in `ConditionsBox`. Clicking a URL in `UrlFlock` filters the references to
those that cite it. Clicking a reference opens `RefView`.

### RefDisplay, DomainDisplay, StatsDisplay

- **RefDisplay** shows `RefOverview` (reference statistics and template breakdown) with a
  reference list.
- **DomainDisplay** shows a D3 `BubbleChart` of domains.
- **StatsDisplay** shows the raw, decorated `pageData` in a JSON editor. It's useful for
  debugging.

### RefView popup (`refView/`)

`RefView` is a draggable modal with a reference list on one side and `RefDetails` on the
other. `RefDetails` is made up of section components: `RefCitationClaim`,
`RefCitationDisplayHtml`, `RefActionables`, `RefUrls`, `RefWikitext` and `RefTemplates`.

## Flocks and filters

A **flock** is a list component that takes a filter "from the outside":

- `UrlFlock.tsx` is a sortable table of URLs. Its columns are defined in
  `constants/urlColumnRegistry.tsx` and rendered
  with `components/flock/FlockHeaderCell` and `FlockDataCell`. Clicking a header cycles
  through ascending, descending and no sort. Only one sort column is active at a time.
- `RefFlock.jsx` is the references list.

### Filter function convention

Reference filters receive `urlDict` as a parameter so they can look up the full URL objects a reference
points to. Filter definitions are **function-returning functions**:

```js
filterFunction: () => (urlDict, ref) => {
    if (!templateName?.length) return true
    if (!ref.template_names) return false
    return ref.template_names.includes(templateName)
}
```

`RefFlock` calls the outer function, then binds `urlDict`:

```js
const filteredRefs = refFilter
    ? refArray.filter((refFilter.filterFunction)().bind(null, pageData.urlDict))
    : refArray;
```

Predefined filters are in `constants/refFilterMaps.jsx`, `urlFilterMaps.jsx`,
`actionableMap.jsx` and `linkStatusMap.jsx`. Filters built at runtime (domain, TLD, book,
template, perennial) are built in `UrlDisplay.jsx` (`getUrlDomainFilter`,
`getRefDomainFilter`, and so on).

## Copy and export

| Button          | Location   | Output                                                           |
|-----------------|------------|------------------------------------------------------------------|
| Copy URLs       | `UrlFlock` | Newline-separated list of the filtered URLs                      |
| Copy details    | `UrlFlock` | CSV of the filtered URL rows (`convertToCSV`)                    |
| Copy references | `RefFlock` | CSV of the filtered references, in source order                  |
| Tapestry (URLs) | `UrlFlock` | Tapestry JSON built by `utils/parseTapestry.ts`                  |
| Tapestry (refs) | `RefFlock` | Tapestry JSON built by `parseRefTapestry` from `tapestry-parser` |

Everything is copied to the clipboard with `copyToClipboard()` (`utils/generalUtils.js`),
and `iareAlert()` shows a short message that fades out.

### Tapestry export

Tapestry is a canvas document format: items are placed on a grid and grouped by article
section. `utils/parseTapestry.ts` contains the URL-based version (gather → process → render).
The reference-based version comes from the separate `tapestry-parser` package from src/lib/tapestry-parser.

## IARI integration

IARI base URLs are listed in `constants/iariSources.jsx`:

| Key          | Base                                                           |
|--------------|----------------------------------------------------------------|
| `iari_prod`  | `https://iabot-api.archive.org/services/context/iari-prod/v2`  |
| `iari_stage` | `https://iabot-api.archive.org/services/context/iari-stage/v2` |
| `iari_test`  | `https://iabot-api.archive.org/services/context/iari-test/v2`  |
| `iari_local` | `http://localhost:5001/v2`                                     |
| `iari`       | `https://archive.org/services/context/iari/v2`                 |

Endpoints used (see `utils/iariUtils.js`):

| Endpoint                          | Purpose                                               |
|-----------------------------------|-------------------------------------------------------|
| `/extract_refs`                   | Parse an article (`WIKIPARSE_XREF`, the default)      |
| `/statistics/article`, `/article` | Older parsers (`WIKIPARSE_V1`, `WIKIPARSE_V2`)        |
| `/check-url`, `/check-urls`       | URL live status and archive status                    |
| `/signals`                        | WikiSignals data for a URL                            |
| `/probe`                          | Credibility probes (currently disabled in `PageData`) |

The `LIVEWEBCHECK` and `CORENTIN` check methods call `iabot-api.archive.org` services directly.

## Configuration and debugging

- **Debug panel.** Shown with `?debug=true` or the menu's "Show Debug" button (hidden in
  production). From it, you can switch the IARI source, check method and parser, and turn on
  test filters, shortcuts, view options, debug details and debug components.
- **Shortcuts.** Sample articles per environment are in `constants/shortcutDefs.jsx`
  (`envShortcutLists.prod / stage / other`).
- **Scroll Fix.** An experimental menu toggle that unlocks page-wide scrolling on small
  screens by setting the CSS variable `--iare-ux-body-overflow-y`.

## Coding conventions

- **"NB"** in a comment means *nota bene* ("note well"). It points out something
  important that isn't a TODO.
- **Don't name a prop `ref`.** React reserves it. Use `_ref` for a reference object.
- **Version.** The app version comes from `package.json` (`version` and `version_name`) and is
  shown in the header. Add release notes in `docs/release_notes/release.<version>.md`.

## Testing

`src/__tests__/` contains a `FilterButton` spec and a jsdom setup file, and the
Testing Library packages are installed. However, `package.json` has no `test` script and no
test runner (for example Vitest) is configured, so the tests don't currently run.
`tests/tests.suggestions.txt` lists manual test cases.

## Known issues

- `Dockerfile` and `builder.sh` still use the CRA `build/` folder. Vite outputs to `dist/`.
- The app is not mobile-friendly yet.
