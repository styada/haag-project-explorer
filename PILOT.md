# HAAG Website — Next.js Pilot

Pilot conversion of the HAAG site to **Next.js (App Router) with static export**
(`output: 'export'`), approved by Riyam on 2026-10-24. The design is a faithful
port: each page's CSS was extracted verbatim from the original HTML into a
per-route stylesheet, the shared header/nav/footer markup became React
components, and all content still comes from the same data files in this repo.

Branch: `Sai/nextjs-pilot` (from `main`). The old site remains fully available
in git history on `main` — the `.html` files and obsolete scripts were removed
only on this branch.

## Routes ported

| Route | Source on `main` | Data source |
|---|---|---|
| `/` | `index.html` | project count from `projects/manifest.json` |
| `/project-explorer` | `project-explorer.html` | `projects/manifest.json` + `projects/*.yml` |
| `/data-science-research` | `data-science-research.html` | `content/data-science-research.json` (blocks) |
| `/faculty-affiliates` | `faculty-affiliates.html` | `content/faculty-affiliates.json` (blocks) |
| `/people` | `people.html` | `people.yml` |
| `/phd-postdoc` | `phd-postdoc.html` | `content/phd-postdoc.json` (blocks) |
| `/project-management` | `project-management.html` | static page (no data file) |
| `/recruitment` | `recruitment.html` | `recruitment.yml` + `recruitment-status/faqs.yml` |
| `/team-matching` | `team-matching.html` | redirect stub → `/recruitment` (unchanged behavior) |
| `/recruitment-status` | `recruitment-status/index.html` | `recruitment-status/recruitment.yml` |
| `/recruitment-status/team-matching` | `recruitment-status/team-matching.html` | redirect stub → `/recruitment-status` (unchanged behavior) |

## How to run

```bash
npm install     # once
npm run dev     # dev server at http://localhost:3000
npm run build   # static export written to out/
```

Serve `out/` with any static host (it is plain HTML/CSS/JS, like the old site).

## Layout

- `app/` — one folder per route; `app/layout.jsx` holds the shared
  `<html>` shell and the Google Fonts links every original page carried.
  Each route imports its own `page.css`, extracted unchanged from the
  original page's `<style>` block (`app/home.css` for the home page).
- `components/Chrome.jsx` — UtilityBar, Nav, Masthead, Breadcrumb, Footer.
  The site has two chrome families and both are preserved: variant A
  (standard nav order, 4-column footer) and variant B (recruitment family:
  People second in the nav, 3-column footer; `recruitment.html`'s utility bar
  has only 2 links). `recruitment-status/` keeps its completely separate
  topbar design.
- `components/Blocks.jsx` — React port of `content-render-blocks.js`
  (all main + sidebar block types, same classes/templates). The `*_html`
  fields pass through `lib/sanitize.js`, a line-for-line port of the old
  allow-list sanitizer (tags `A P STRONG EM B I BR UL OL LI`, script/style/etc.
  dropped with content, `href` validation, `link-strong` class rule).
- `components/ArticlePage.jsx` — shared shell for the three blocks pages.
- `lib/data.js` — build-time loaders (see below). `lib/projects.js` — the
  explorer's project normalization (buildProject, link validation, accent
  hash) ported from its inline script. `lib/links.js` — internal-link
  rewriting.
- Client components (`app/people/PeopleClient.jsx`,
  `app/project-explorer/ExplorerClient.jsx`) implement the same
  search/filter/modal behavior as the old inline scripts, with data passed
  in as props from the server components.

Navigation uses plain `<a>` tags (full page loads), like the original
multi-page site. This is deliberate for the pilot: each page ships a full
stylesheet with page-specific class definitions, and full-page navigation
keeps those perfectly isolated, exactly as before.

## How content data is wired

Nothing was copied or hard-coded: at build time the app reads the repo's
existing data files **from their current locations** —

- `projects/manifest.json` + `projects/*.yml` → explorer cards/filters and
  the home page's two project counters (parsed with the `yaml` package
  instead of the explorer's hand-rolled parser; field handling mirrors the
  original `buildProject`).
- `people.yml` → the directory (28 researchers + the `features:` list).
  `role_label`/`byline` values contain HTML entities (`&middot;`) that the
  old page injected via `innerHTML`; the loader decodes them so React text
  renders the same glyphs.
- `recruitment.yml` → `/recruitment`; `recruitment-status/recruitment.yml`
  → `/recruitment-status`. **These are two different files with different
  values** (dates, notes) and each page reads its own, as before.
  `recruitment-status/faqs.yml` → the FAQ sections on `/recruitment`.
- `content/*.json` → the three article pages, rendered at build time
  (the old pages shipped the same content as static fallback and re-rendered
  it client-side; the export now ships the rendered result directly).

YAML dates normalize to `YYYY-MM-DD`, matching the old pages' js-yaml
`Date` → ISO rendering.

Internal links are rewritten from the old `*.html` scheme to routes
(`index.html` → `/`, `people.html` → `/people`,
`recruitment-status/index.html` → `/recruitment-status`, …), including
links inside the content JSON and sanitized HTML fields.

## Intentionally not ported

- **`embed-resize.js`** — existed only to resize the site inside the old
  WordPress iframe. WordPress is gone; not ported.
- **`feature-flags.js` / `feature-toggle.js` (PREVIEW machinery)** — the
  registry + sessionStorage opt-in is dropped. Default-visitor (CURRENT
  mode) behavior is preserved exactly:
  - the explorer's `#project-result-count` line keeps its
    `data-feature="projectResultCount"` attribute and stays hidden via the
    same `[data-feature] { display: none !important; }` rule (now at the end
    of the explorer's `page.css`); its text is populated as before.
  - on `/people`, profile buttons render `hidden` and the "Recently
    Featured" section stays hidden, as the page's own
    `PEOPLE_FEATURE_FLAGS` defaults (all false) dictate. The
    `window.HAAG_PEOPLE_FEATURE_FLAGS` override hook no longer exists.
  - The one behavioral consequence of the migration: the three article
    pages now always show their `content/*.json` content (previously
    PREVIEW-gated behind the toggle, with static fallback shown by
    default). The JSON mirrors the old fallback text, so the visible result
    is the same content — this is the migration working as intended.
- **Runtime fetching / loading states** — pages previously fetched their
  YAML at runtime and showed "Loading…" plus an error box on failure. Data
  is now read at build time, so the exported HTML is fully rendered (no
  loading flash, no fetch errors). A malformed data file fails the build
  instead of breaking the page for visitors.
- **`fix_modal.py`** — one-off helper for the old hand-written HTML;
  obsolete.
- **`scripts/` and the `Makefile`** — left untouched. Note the Makefile's
  `make serve` still describes the old python-http-server workflow and the
  old `.html` URLs; use `npm run dev` / serve `out/` instead.

## Known differences / imperfections

- Export shape: routes are written as `out/<route>.html` files (Next's
  default). Hosts that need folder-style URLs can set
  `trailingSlash: true` in `next.config.mjs`.
- The explorer modal is mounted only while open (the original kept a hidden
  modal element in the DOM); its scroll-anchored positioning math is ported
  unchanged.
- Project/People card text is rendered as escaped React text instead of the
  original's unescaped `innerHTML` string building. Visible output is
  identical for the current plain-text data, and safer if a YAML field ever
  contains markup.
- Page `<title>`s and headings were spot-checked against the originals for
  all routes and match; per-page CSS is byte-identical to the original
  `<style>` blocks (only addition: the explorer's feature-gate rule, noted
  above).
