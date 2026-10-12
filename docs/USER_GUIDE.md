# IARE User Guide

The Internet Archive Reference Explorer (IARE) shows you every citation in an online
article: which references it contains, which URLs they link to, whether those links still
work, whether the Wayback Machine has archived them, and how reliable the sources are.

> IARE works best on a desktop or laptop screen. It is not mobile-friendly yet.

## Analyzing an article

1. Paste an article URL into the input box at the top, for example
   `https://en.wikipedia.org/wiki/Easter_Island`.
2. Click **Load References**.
3. Wait while IARE shows "Analyzing Page References..." and then "Retrieving URL info".
   Large articles with hundreds of links can take a minute or more.

IARE accepts these kinds of URL:

| Source | Example | Support |
|---|---|---|
| Wikipedia article | `https://en.wikipedia.org/wiki/...` | Full |
| PDF | any URL ending in `.pdf` | Basic |
| Grokipedia page | `https://grokipedia.com/page/...` | Experimental |

**Force Refresh.** IARE's back end (IARI) caches results. Tick **Force Refresh** before
loading if the article has changed recently and you want fresh data.

**Sharing.** The address bar always contains the article you're viewing (`?url=...`), so you
can bookmark the page or send the link to someone else.

## The screen layout

After loading, the default **URLs** view has three areas:

```
┌───────────────┬─────────────────────────────┬──────────────────────┐
│   Filters     │   Results  (active filter)  │                      │
│   (charts)    ├─────────────────────────────┤   References List    │
│               │   URL list                  │                      │
└───────────────┴─────────────────────────────┴──────────────────────┘
```

Use **Hide Filters** / **Show Filters** and **Hide Refs** / **Show Refs** above the URL list
to make more room.

### Filters (left)

Each box is a chart that summarizes the article's links. **Click any bar or slice to filter
the URL list and the references list together.** Boxes can be collapsed and expanded
individually or all at once.

| Filter | What it shows |
|---|---|
| Actionable | Links that need attention, such as a broken live link with no archive, or a good archive that isn't the cited version |
| Link Status Codes | HTTP status of each live link (200 OK, 404 Not Found, ...) |
| Links to Books | Links to book sources, grouped by domain (Google Books, Internet Archive, ...) |
| Links to Papers and DOIs | Academic papers and DOI links |
| Pay Level Domains | The registrable domain of each link (for example `nytimes.com`) |
| Reliability Statistics | Ratings from Wikipedia's Perennial Sources list |
| Top Level Domains | `.com`, `.org`, `.gov`, `.edu`, ... |
| Template Occurrences | Citation templates used (`{{cite web}}`, `{{cite book}}`, ...) |
| Reference Stats | Reference counts, such as references with or without templates |

The **Results** box above the URL list shows the active filter. Click **Remove Filters** to
show everything again.

### URL list (center)

Each row is one unique URL from the article. Columns include:

| Column | Meaning |
|---|---|
| URL Link | The link itself |
| Live Status | HTTP status code from checking the live URL |
| Archive Status | Whether the Wayback Machine has a working archived copy |
| WikiSignals Score | Credibility signals from WikiSignals. Click the column header for a short explanation, or a cell for details |
| Wayback Machine | Archive history for the URL |
| Wikipedia Usage | How widely the URL is cited across Wikipedia |
| Domain | The link's domain |
| Tranco Rating | The domain's Tranco popularity rank |
| SimPPL Rating | The domain's SimPPL rating |

- **Sort:** click a column header to cycle through ascending, descending and unsorted.
- **Filter references by URL:** click a URL row to show only the references that cite it.
- **Tooltips:** hover over a cell or header for more detail.

### References list (right)

This lists the article's references, filtered by whatever filter is active. Named references
that are reused in the article appear once. **Click a reference to open the Reference View.**

### Reference View popup

This is a draggable window with full details for one reference:

- **Citation:** the rendered citation and the claim it supports in the article
- **Actionables:** suggested fixes, such as adding an archive link
- **URLs:** every link in the reference, with live and archive status
- **Wikitext:** the reference's raw wiki markup
- **Templates:** each citation template and its parameters

The list on the left of the popup lets you move between references without closing it.

## Other views

Use **View Options** above the results to switch views:

| View | Description |
|---|---|
| URLs | The default view described above |
| Reference Stats | Reference-level statistics and template breakdown |
| Domains | A bubble chart of the domains the article links to |
| Raw page data | The full analyzed data as browsable JSON (for advanced users) |

## Copying and exporting

| Action | Where | What you get |
|---|---|---|
| Copy icon | Next to the URL list caption | Plain list of the URLs currently shown, one per line |
| **Copy URL Details** | URL list toolbar | CSV of the URL rows currently shown, ready to paste into a spreadsheet |
| Copy icon | Next to the References List caption | CSV of the references currently shown |
| **Tapestry** | URL list toolbar | Tapestry JSON of the article's links, grouped by section |
| **Tapestry** | References List toolbar | Tapestry JSON of the article's references |

All exports respect the active filter and go to your clipboard. A short confirmation message
appears when the copy succeeds.

## Menu

The **Menu** button at the top right shows the IARE version, the IARI server and version,
and these options:

- **Show/Hide PageInfo:** details about the analyzed page and the request
- **Scroll Fix:** experimental. If parts of the screen won't scroll on a small display,
  click the lock icon to unlock page-wide scrolling.

## Troubleshooting

| Message | What to do |
|---|---|
| *Failed to fetch - IARI service failure* | The IARI service is down or unreachable. Try again later. |
| *404 Error finding target page* | Check that the article URL is spelled correctly and exists. |
| *IARI failure: ...* | IARI couldn't parse the article. The message has details. Try **Force Refresh**. |
| Analysis seems stuck | Very large articles take a while. Reload the page to start again. |

To report a bug or request a feature, open an issue at
https://github.com/internetarchive/iare/issues.
