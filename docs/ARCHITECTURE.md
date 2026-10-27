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
    pages/v2pdf/       PDF display (development on hold)
    pages/vGrok/       Grokipedia display and "Grok vs. Wiki" view (development on hold)
    charts/            Various Chart.js charts to filter links
    d3/                D3 visualizations (bubble charts, citation display)
    flock/             Typed cell/header components for the flock tables
    *.jsx              Shared widgets (FilterBox, FlockBox, Loader, Popup, Dropdown, ...)
  constants/           Configuration and definitions. Of particular interest are:
    iariSources        Available IARI sources (production, staging, local)
    actionableMap      definitions for actionable flags - what to look for when looking for anomalies 
    urlColumnRegistry  Defines display and behavior for columns in URL flock
  contexts/            React contexts for component property progagation
  utils/               helper utilities for various tasks
  errors/              Customixed Exception definitions: IariError, CaseNotHandledError
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

- **Environment.** Calculates environment based on host value: `env-production` for any `*.archive.org` host, `env-staging` for
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
4. Appends client-side fields to the response (`pathName`, `endpoint`, `iariSource`,
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
| Book statistics   | `processBookStats()`                            | Counts used by the Book-link filter                        |
| WikiSignals       | `fetchSignalInfoForUrls()` → `processSignals()` | `signals` property on each URL                             |
| References        | `processReferences()`                           | Named references merged, templates collected               |
| Actionables       | `processActionables()`                          | Flags such as "broken, no archive" on URLs and refs        |

Errors collected in `pageData.process_errors` are shown above the view. Once processing is
done, the **View Options** radio buttons pick which view to render: URLs (default),
Reference Stats, Domains, or Raw page data. The URL Archives and Grok views exist but are
switched off in `viewOptionsList`.

**NB**: Several of these steps are marked TODO to move into the IARI backend, as they are related to the information about the link that is available in the backend.

**NB**: `fetchUrls` makes a live status call for each URL, but can be improved to fetch only the status of URLs that are
missing a cached status.

**NB**: `fetchUrls` can also be enhanced to show the fetch status of each URL asynchronously as it becomes available.

## Views

Each view is a different way of filtering one shared reference list. That's why most views
include a `RefFlock`.

### UrlDisplay (`.../pages/v2/views/Url/UrlDisplay.jsx`)

This is the main view, displaying the Filters column on the left, and a right column containing
both the URL table and the References list:

```
<UrlDisplay>

    // Filters Column
    <UrlFilterPanel>
 
    // Contents Column
    <ConditionsBox>      displays the current results stats - spans UrlFlock and RefFlock columns
      <UrlFlock>
      <RefFlock>
      
    // Popup component showing Refrence details
    <RefView>            reference detail popup
```

`UrlFilterPanel` contains collapsible `FilterBox`es, each with a chart from
`components/charts/`. The filters are specified in the component UrlFilterPanel.jsx.

**NB**: The display of the various filters could be improved with a mechanism using a 
collection of filter definitions with an automatic rendering of each filter.

Clicking a filter chart segment sends an action to `UrlDisplay.handleAction()`. That sets **both**
a URL filter (for `UrlFlock`) and a reference filter (for `RefFlock`), and records the active
condition shown in `ConditionsBox`. Clicking a URL in `UrlFlock` filters the references to
those that cite it. Clicking a reference opens the `RefView` popup to show the reference details.

### RefDisplay, DomainDisplay, StatsDisplay 

**NB**: these views are not quite ready for prime time.
- **RefDisplay** shows `RefOverview` (reference statistics and template breakdown).
- **DomainDisplay** shows a D3 `BubbleChart` of domains.
- **StatsDisplay (Raw Page Data)** shows the raw, decorated `pageData` in a JSON editor. It's useful for
  debugging.

### RefView popup (`.../pages/v2/refView/`)

`RefView` is a modal with a reference list on one side and `RefDetails` on the
other. `RefDetails` is made up of section components, currently: `RefCitationClaim`,
`RefCitationDisplayHtml`, `RefActionables`, `RefUrls`, `RefWikitext` and `RefTemplates`.

**NB**: This component is where the bulk of improvements to the reference view could be made.

## Flocks and filters

A **flock** is a list component that takes a filter "from the outside":

- `UrlFlock.tsx` is a sortable table of URLs. Its columns are defined in
  `constants/urlColumnRegistry.tsx` and rendered
  with `components/flock/FlockHeaderCell` and `FlockDataCell`. Clicking a header cycles
  through ascending, descending and no sort. Only one sort column is active at a time.
- `RefFlock.jsx` is the references list.

### Filter function convention

For URL and Reference filters, we have a convention for defining filter functions, which are passed 
into a Flock component to filter the items displayed in that flock. 

A filter is an object with a caption, desc, and a **function-returning function**
`filterFunction` property.

UrlFlock filters are defined directly in UrlDisplay.jsx or from LINK_STATUS_MAP or
ACTIONABLE_FILTER_MAP. Their function-returning function takes a URL object and returns a boolean:

```js
    getUrlDomainFilter = (targetDomain) => {
        ... 
        return {
          ...              
          filterFunction: () => (url) => {
                return url?.pay_level_domain === targetDomain
          }
        }
    }
```

The `filterFunction` property for a Reference filter is also a **function-returning function** that receives a
`ref` object and a `urlDict` parameter. The `urlDict` parameter enables lookup of URL objects that a reference points
to. Using these parameters, the `filterFunction` determines whether the reference is included in the filter. 
Example:

```js

    const getRefDomainFilter = (targetDomain) => {
        ...
        return {
            ...
            filterFunction: () => (urlDict, ref) => {
                return ref.urls.some( url => {
                    return urlDict[url]?.pay_level_domain === targetDomain
                })

```

In UrlFlock, the filter is applied to the urls list with the self-calling function method:
```js
filteredUrls = filteredUrls.filter((f.filterFunction)())
```
In RefFlock, the filter is also applied with a self-calling function, with an additional bind() to
include the urlDict parameter in the `filterFunction` call:

```js
const filteredRefs = refFilter
  ? refArray.filter((refFilter.filterFunction)().bind(null, pageData.urlDict), ) // NB Note self-calling function
  : refArray;

```

## Copy and export

| Button          | Location   | Output                                                                         |
|-----------------|------------|--------------------------------------------------------------------------------|
| Copy URLs       | `UrlFlock` | Newline-separated list of the filtered URLs                                    |
| Copy details    | `UrlFlock` | CSV of the filtered URL rows (`convertToCSV`)                                  |
| Copy references | `RefFlock` | CSV of the filtered references, in source order                                |
| Tapestry Refs   | `RefFlock` | Tapestry .zip file download built by `parseRefTapestry`  |

For Copy, everything is copied to the clipboard with `copyToClipboard()` (`utils/generalUtils.js`),
and `iareAlert()` shows a short, fading confirmation message.

For Tapestry exports, a JSON object is created with `parseRefTapestry()`, where reference items are
placed on a grid and grouped by article section. A tapestry .zip file is created and a file download 
is initiated.


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
| `/check-url`                      | URL live status and archive status                    |
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

Testing for IARE is incomplete.

`src/__tests__/` contains a `FilterButton` spec and a jsdom setup file, and the
Testing Library packages are installed. However, `package.json` has no `test` script and no
test runner (for example Vitest) is configured, so the tests don't currently run.
`tests/tests.suggestions.txt` lists manual test cases.

## Known issues

- `Dockerfile` and `builder.sh` still use the CRA `build/` folder. Vite outputs to `dist/`.
- The app is not yet mobile-friendly.
