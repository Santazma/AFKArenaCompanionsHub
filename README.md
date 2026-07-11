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
boss placeholder). Each board renders as a 2-front / 3-back formation (like
the in-game team layout) turned on its side: **back column on the left,
front column on the right**. In Arena, the opponent board is mirrored (front
on the left, back on the right) so the two front lines face each other in
the middle, like an actual matchup.

- **Mode switch** — pill buttons at the top swap between Arena / Dream Realm
  / Guild Hunt instantly; each mode keeps its own teams independently.
- **Investment toggle** — Minimum / Optimal / Competitive buttons control
  which investment text is shown under each hero in the browser grid below,
  pulled straight from the tier list's per-hero investment columns.
- **Team count** — 1 to 5, controlled by the stepper below the boards; resizing
  keeps whatever teams already had heroes in them.
- **Picking heroes** — desktop: drag a hero card from the grid onto a slot.
  Mobile/touch (or just clicking): tap a hero to select it, then tap a slot
  to place it there — the same "select, then place" model works in either
  order (tap a slot first, then a hero, also works). The grid is sorted by
  that mode's tier (best first) and filterable by name.
- **Moving/swapping placed heroes** — an already-placed hero can be dragged
  (or tapped, then tap the destination) onto any other slot, including a
  slot in a different team or side. Dropping onto an empty slot moves the
  hero there; dropping onto an occupied slot swaps the two heroes. A small
  `×` button on each filled slot removes that hero outright.
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
investment text are all real. Re-running the export command against the same
spreadsheet will pick up any tier list updates.

**Avatars** (`image` field, 108/109 heroes) are hotlinked from the
[AFK Arena Fandom wiki](https://afk-arena.fandom.com/), specifically each
hero's small square **game UI icon** (`{Name}_Icon.jpg`) rather than the
large splash portrait (`{Name}.png`) — the icon is what actually looks right
in a square avatar slot. Almost all of them (103/109) came from a single
page fetch: every hero page embeds a shared navigation widget listing
`_Icon.jpg` files for ~237 heroes, so one HTML page yields the whole map
(name → icon URL) without hitting the API per hero. The remaining few used
the MediaWiki `pageimages` API (`action=query&prop=pageimages`, which
resolves redirects and title mismatches, e.g. `Wukong` → actual page title
`Wu Kong`) and fall back to the full portrait when a hero genuinely has no
separate icon file (`Zaphrael`, `Leonardo`, `Cha Hae-in`) — the Companions
roster's naming doesn't always match the (Classic AFK Arena) wiki 1:1, since
Companions has a smaller, partly-overlapping roster with some exclusive
crossover heroes (Sung Jinwoo, Saitama, etc.) that the Classic wiki happens
to also document. Only `Judy & Punch` has no matching page at all and falls
back to a placeholder.

Two things matter if you regenerate this data:

- Fandom's static image host (`static.wikia.nocookie.net`) has open CORS
  (`Access-Control-Allow-Origin: *`), but its dynamic thumbnailer **rejects
  requests that carry a cross-origin `Referer` header** (curl without one
  gets `200`; a real `<img>` load from another site normally gets `404`).
  `HeroAvatar.tsx` works around this with `referrerPolicy="no-referrer"` on
  the `<img>` tag — don't remove it.
- `HeroAvatar.tsx` falls back to a faction-colored initial avatar whenever
  `hero.image` is `null` or the `<img>` fails to load (`onError`), so a
  missing/renamed wiki image degrades gracefully instead of breaking.

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
- [ ] **Team Builder** — a real portrait for `Judy & Punch` (currently the
      only placeholder avatar — see [Hero data](#hero-data)); team
      notes/labels; per-team "recommended comp" hints using the tier list's
      mode-specific rankings.

## License

No license chosen yet — all rights reserved by default until one is added.
