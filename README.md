# Internet Archive Reference Explorer (IARE)

A visual interface that gives a comprehensive view of the citations in one or more online articles.

IARE takes the URL of a Wikipedia article, sends it to the
**IARI** (Internet Archive Reference Inventory) api for parsing, and then presents every
reference and every linked URL in an interactive, filterable column display.
Display columns currently include live link status, Wayback Machine archive status, source reliability, WikiSignals scores, source type (article, book, papers/DOIs, etc.), citation templates and more.

**Current Staging version:** https://internetarchive.github.io/iare/

**Issues:** https://github.com/internetarchive/iare/issues

## Documentation

| Document | Audience |
|---|---|
| [User Guide](docs/USER_GUIDE.md) | People using IARE to explore an article's references |
| [Architecture](docs/ARCHITECTURE.md) | Developers working on the IARE codebase |
| [Development notes](_notes/_archive/README.development_notes.md) | Filter/flock implementation details |
| [Release notes](docs/release_notes/) | Per-version release notes |

## Limitations

* There is support in the app for analyzing PDFs and Grokipedia pages, but it is experimental and incomplete.
* Direct in-place modification of references in a Wikipedia article is an tended use of this tool, 
but is not yet implemented.

## Quick start

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

The dev server runs at http://localhost:3000/iare/ (the app is built with `base: '/iare/'`).

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Starts the Vite dev server on port 3000 with hot reload |
| `npm run build` | Builds a production bundle into `dist/` (with source maps) |
| `npm run preview` | Serves the built `dist/` folder locally to check a production build |

## URL parameters

IARE is driven by query parameters, so any analysis can be bookmarked or shared:

```
https://internetarchive.github.io/iare/?url=https://en.wikipedia.org/wiki/Easter_Island
```

| Parameter | Description | Default |
|---|---|---|
| `url` | Article to analyze (Wikipedia article, PDF URL, or Grokipedia page) | _(none)_ |
| `refresh` | `true` forces IARI to re-fetch instead of using its cache | `false` |
| `iari-source` | IARI backend: `iari_prod`, `iari_stage`, `iari_test`, `iari_local`, `iari` | `iari_stage` (`iari_local` on localhost) |
| `method` | URL live-status check method: `LIVEWEBCHECK`, `IABOT`, `CORENTIN` | `LIVEWEBCHECK` |
| `parse_method` | Article parser: `WIKIPARSE_XREF` (alias `XREF`), `WIKIPARSE_V1`, `WIKIPARSE_V2` | `WIKIPARSE_XREF` |
| `use_local_cache` | Ask IARI to use its local parse cache (debug aid) | `false` |
| `show_shortcuts` | Show the shortcut buttons for sample articles | `false` |
| `debug` | Open the debug panel | `false` |

In **production** (any `*.archive.org` host), `iari-source` is fixed to `iari_prod`, and
`method` and `parse_method` are fixed to their defaults; the matching query parameters are ignored.

## Deployment


### Local (Local Docker)

In the local directory where iare is cloned, running `npm run dev` will start a local
Vite dev server on port 3000. 

Running `http://localhost:3000/iare/` in the browser will bring up iare.


### Staging (GitHub Pages)

In the github repo `github.com/internetarchive/iare`, every push to `main` in 
will trigger [`.github/workflows/stage.yml`](.github/workflows/stage.yml),
which runs `npm install && npm run build` on Node 20 and publishes `dist/` to GitHub Pages at
https://internetarchive.github.io/iare/. You can also start it manually (`workflow_dispatch`), by 
clicking `Run Workflow', and choosing another branch to deploy if desired.

<div style="background-color: #145261; padding: 15px; border-radius: 5px; margin-left:85px">
#### Docker

```bash
docker image build -t iare .
```

```bash
docker container run --rm -it -p 3000:3000 iare
```

> The `Dockerfile` and `builder.sh` were written for the older Create React App build and
> still serve or copy a `build/` folder. Vite now outputs to `dist/`, so update both to
> `dist` before relying on them.

</div>

### Production

There is currently no production deployment.

## Maintenance

Keep the browser-compatibility data current:

```bash
npx update-browserslist-db@latest
```

## License

See [LICENSE](LICENSE).
