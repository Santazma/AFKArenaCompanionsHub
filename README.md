# AFK Arena Companions Hub

A fan-made companion site for **AFK Arena: Companions** players — one place
for hero tier lists, strategy guides, and an interactive team builder for
Arena, Dream Realm, and Guild Hunt.

> Not affiliated with or endorsed by Lilith Games. AFK Arena: Companions is a
> separate game from AFK Arena Classic, with its own (smaller) hero roster —
> the hero dataset in this repo reflects that.

## Status

- **Tier List** and **Guide** are external links — both the nav bar and the
  home page cards open them in a new tab:
  - Tier List → the community [tier list spreadsheet](https://docs.google.com/spreadsheets/d/1F8GWQiHuQV3ubYKLXVMpnHwwgtXAfdZOtCaMZ8usCWI/edit?pli=1&gid=1697331140#gid=1697331140)
  - Guide → [afk-web.onrender.com/guides](https://afk-web.onrender.com/guides)
- **Team Builder** is the only in-app route, and is functional — see
  [Team Builder](#team-builder) below.

## Tech stack

| Layer       | Choice                                                        |
| ----------- | -------------------------------------------------------------- |
| Framework   | [React 19](https://react.dev) + [Vite](https://vite.dev)      |
| Language    | TypeScript                                                     |
| Styling     | [Tailwind CSS v4](https://tailwindcss.com)                    |
| Routing     | [React Router v7](https://reactrouter.com) (client-side SPA)  |
| Animation   | [Motion](https://motion.dev) (`motion/react`), WebGL via [ogl](https://github.com/oframe/ogl) |
| UI effects  | Hand-picked components from [React Bits](https://reactbits.dev) |
| Linting     | [oxlint](https://oxc.rs)                                       |

Vite + React Router was chosen over Next.js since the whole app is a
client-rendered SPA for now — no server rendering or backend is needed yet.
If SEO for guide/tier-list content becomes a priority later, migrating to
Next.js (or adding a prerendering step) is a reasonable next step.

## Project structure

```
src/
├── App.tsx                     # Route definitions
├── main.tsx                     # App entry point, router provider
├── index.css                     # Tailwind import + theme tokens + fonts
├── components/
│   ├── Layout.tsx                 # Page shell: Aurora background, nav, footer
│   ├── NavBar.tsx                  # Top navigation (incl. mobile menu)
│   └── teambuilder/                 # Team Builder UI pieces (see below)
├── pages/
│   ├── Home.tsx                     # Landing page with the 3 entry points
│   └── TeamBuilder.tsx               # /team-builder — the real feature
├── hooks/
│   └── useTeamBuilderState.ts         # Team Builder state: load/save/share
├── lib/
│   ├── externalLinks.ts                # Tier List / Guide URLs (single source of truth)
│   └── teamBuilder.ts                   # Team Builder types, tiers, URL encode/decode
├── data/
│   ├── heroes.json                       # 109-hero dataset (see below)
│   └── heroes.ts                          # Typed wrapper + faction colors
└── reactbits/                               # Vendored React Bits components (see below)
    ├── Aurora/                               # Animated WebGL background
    ├── GradientText/                          # Animated gradient text
    └── SpotlightCard/                          # Cursor-tracking spotlight card
```

## React Bits components

Per the request to use [reactbits.dev](https://reactbits.dev) components,
three were pulled in (source vendored directly into `src/reactbits/`, then
manually converted to TypeScript, since ReactBits ships JS+CSS source and
there's no install CLI for arbitrary registries):

- **Aurora** (`Backgrounds`) — the animated purple/gold WebGL background
  behind every page, rendered once in `Layout.tsx`. Depends on `ogl`.
- **GradientText** (`Text Animations`) — the animated gold → lilac gradient
  used for the site title in the nav bar and on the home page. Depends on
  `motion`.
- **SpotlightCard** (`Components`) — the cursor-tracking glow cards used for
  the three home page entry points and the placeholder pages.

These live under `src/reactbits/<Component>/` with their original
`.css` files untouched, so updating them later is a matter of dropping in a
newer version from the site.

## Team Builder

`/team-builder` lets you build hero comps for **Arena** (two boards — your
team vs. an opponent's), **Dream Realm**, and **Guild Hunt** (one board vs. a
boss placeholder).

- **Mode switch** — pill buttons at the top swap between Arena / Dream Realm
  / Guild Hunt instantly; each mode keeps its own teams independently.
- **Investment toggle** — Minimum / Optimal / Competitive buttons control
  which investment text is shown under each hero in the browser grid below,
  pulled straight from the tier list's per-hero investment columns.
- **Team count** — 1 to 5, controlled by the stepper below the boards; resizing
  keeps whatever teams already had heroes in them.
- **Picking heroes** — click an empty slot to select it (or just click a hero
  card — it fills the first empty slot automatically), then click a hero in
  the search/scroll grid below to place them. Click a filled slot to clear it.
  The grid is sorted by that mode's tier (best first) and filterable by name.
- **Share** — copies a URL with the current mode's teams encoded into a
  `?team=` query param (base64url JSON of hero IDs). Opening that link loads
  the shared comp with no account or backend needed.
- **Persistence** — all modes' teams are auto-saved to `localStorage`
  (`afk-team-builder-state-v1`), so a refresh doesn't lose your work.

### Hero data

`src/data/heroes.json` (109 heroes) was generated from the
[tier list spreadsheet](https://docs.google.com/spreadsheets/d/1F8GWQiHuQV3ubYKLXVMpnHwwgtXAfdZOtCaMZ8usCWI)
via its `gviz/tq?tqx=out:csv` export endpoint — name, faction, overall rank,
per-mode tier (Arena/Dream Realm/Guild Hunt), and minimum/optimal/competitive
investment text are all real. **Hero portraits are not available** — the
sheet has no exposed image URLs for its embedded art (nothing a CSV/gviz
export can carry), so every hero renders as a faction-colored initial avatar
(`HeroAvatar.tsx`) instead of real artwork. Swapping in real portraits later
just means adding an `image` field per hero and rendering it in
`HeroAvatar.tsx` — no other change needed. Re-running the export command
against the same spreadsheet will pick up any tier list updates.

## Getting started

```bash
npm install
npm run dev       # start the dev server (http://localhost:5173)
npm run build      # type-check + production build
npm run preview     # preview the production build locally
npm run lint          # run oxlint
```

Requires Node.js 20+.

## Deployment

Every push to `main` builds and deploys automatically to **GitHub Pages**
via `.github/workflows/deploy.yml` — live at
`https://santazma.github.io/AFKArenaCompanionsHub/`. One-time setup on
GitHub: **Settings → Pages → Build and deployment → Source → "GitHub
Actions"**. After that, no manual deploy step is needed.

Two things make client-side routing work on GitHub Pages' static hosting
(no server-side rewrites):

- `vite.config.ts` sets `base: '/AFKArenaCompanionsHub/'`, and
  `main.tsx` passes that same value as the router's `basename`.
- `public/404.html` + a small decode script in `index.html` implement the
  [spa-github-pages](https://github.com/rafgraph/spa-github-pages) redirect
  trick, so a deep link like `/team-builder` (or a refresh on it) doesn't
  404 — GitHub Pages serves `404.html`, which redirects back to `index.html`
  with the real path encoded in a query param that gets decoded before
  React Router boots.

## Roadmap

- [ ] **Tier List** — currently an external spreadsheet link; revisit
      whether to bring it in-app (data file + filterable UI) later.
- [ ] **Guide** — currently an external site link; revisit whether to bring
      it in-app later.
- [ ] **Team Builder** — real hero portraits (currently initial avatars — see
      [Hero data](#hero-data)); team notes/labels; per-team "recommended
      comp" hints using the tier list's mode-specific rankings.

## License

No license chosen yet — all rights reserved by default until one is added.
