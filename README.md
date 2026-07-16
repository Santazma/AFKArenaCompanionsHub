# AFK Arena Companions Hub

A fan-made companion site for **AFK Arena: Companions** players — one place
for hero tier lists, strategy guides, and an interactive team builder for
Arena, Dream Realm, and Guild Hunt.

> Not affiliated with or endorsed by Lilith Games. AFK Arena: Companions is a
> separate game from AFK Arena Classic, with its own (smaller) hero roster —
> the hero dataset in this repo reflects that.

## Credits & attribution

The **Tier List** and the **Guide** are **not** this project's content — they
are created and hosted by **SaiLus**. This hub does **not** copy or reproduce
them; it only links out to the originals, with visible credit:

- Tier List → SaiLus's [tier list spreadsheet](https://docs.google.com/spreadsheets/d/1F8GWQiHuQV3ubYKLXVMpnHwwgtXAfdZOtCaMZ8usCWI/edit?pli=1&gid=1697331140#gid=1697331140)
- Guide → SaiLus's [afk-web.onrender.com/guides](https://afk-web.onrender.com/guides)

The **Team Builder** is the only original tool in this repo. Credit and the
full disclaimer live on the in-app `/legal` page (`src/pages/Legal.tsx`), and
attribution is surfaced on the home cards and footer. If SaiLus asks for the
links to be removed, take them down — they're centralized in
`src/lib/externalLinks.ts`.

## Status

- **Tier List** and **Guide** are external links (see
  [Credits & attribution](#credits--attribution)) — both the nav bar and the
  home page cards open them in a new tab.
- **Team Builder** (`/team-builder`) is the only in-app feature route — see
  [Team Builder](#team-builder) below.
- **Legal** (`/legal`) hosts the credits + disclaimers.

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
├── App.tsx                     # Route definitions (home, team-builder, legal)
├── main.tsx                     # App entry point, router provider
├── index.css                     # Tailwind import + theme tokens + fonts
├── components/
│   ├── Layout.tsx                 # Page shell: Aurora background, nav, footer + credit
│   ├── NavBar.tsx                  # Top navigation (incl. mobile menu)
│   └── teambuilder/                 # Team Builder UI pieces (see below)
├── pages/
│   ├── Home.tsx                     # Landing page with the 3 entry points + attribution
│   ├── TeamBuilder.tsx               # /team-builder — the real feature
│   └── Legal.tsx                      # /legal — credits + disclaimers
├── hooks/
│   └── useTeamBuilderState.ts         # Team Builder state: load/save/share
├── lib/
│   ├── externalLinks.ts                # Tier List / Guide URLs + SaiLus attribution (single source of truth)
│   └── teamBuilder.ts                   # Team Builder types, tiers, URL encode/decode
├── data/
│   ├── heroes.json                       # 109-hero dataset (see below)
│   └── heroes.ts                          # Typed wrapper + faction colors
└── reactbits/                               # Vendored React Bits components (see below)
    ├── Aurora/                               # Animated WebGL background
    ├── GradientText/                          # Animated gradient text
    └── SpotlightCard/                          # Cursor-tracking spotlight card
```

`public/spa-restore.js` holds the SPA deep-link restore shim (see
[Deployment](#deployment)); it's an external file so the production
Content-Security-Policy can keep a strict `script-src 'self'` (see
[Security](#security)).

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
selectable boss). Each hero board renders as a 2-front / 3-back formation
(like the in-game team layout) turned on its side: **back column on the
left, front column on the right**. In Arena, the opponent board is mirrored
(front on the left, back on the right) so the two front lines face each
other in the middle, like an actual matchup.

- **Mode switch** — pill buttons at the top swap between Arena / Dream Realm
  / Guild Hunt instantly; each mode keeps its own teams independently.
- **Investment toggle** — Minimum / Optimal / Competitive buttons control
  which investment text is shown under each hero, both in the browser grid
  and under any hero already placed in a slot, pulled straight from the
  tier list's per-hero investment columns.
- **Team count** — 1 to 5, controlled by the stepper below the boards; resizing
  keeps whatever teams already had heroes in them.
- **Faction filter** — seven faction icons above the hero grid (Lightbearer,
  Mauler, Wilder, Graveborn, Celestial, Hypogean, Dimensional); click any
  number of them to narrow the grid to just those factions, click again to
  deactivate.
- **Picking heroes** — desktop: drag a hero card from the grid onto a slot.
  Mobile/touch (or just clicking): tap a hero to select it, then tap a slot
  to place it there — the same "select, then place" model works in either
  order (tap a slot first, then a hero, also works). The grid is sorted by
  that mode's tier (best first), filterable by name, and filterable by
  faction.
- **Moving/swapping placed heroes** — an already-placed hero can be dragged
  (or tapped, then tap the destination) onto any other slot, including a
  slot in a different team or side. Dropping onto an empty slot moves the
  hero there; dropping onto an occupied slot swaps the two heroes. A small
  `×` button on each filled slot removes that hero outright.
- **Boss picker** (Dream Realm / Guild Hunt) — the boss slot next to each
  team starts as a "Select a boss" placeholder at a fixed height
  (`BossSlot.tsx`, `h-[22.5rem]` — matches the hero board's own natural
  height) so it never grows the row just because a boss's splash art is
  tall. (A flex row with `items-stretch` and no explicit height will size
  itself to a tall image's *intrinsic* size even with `min-height: 0` on
  the item — `min-height: 0` only lifts the floor, it doesn't stop content
  from being the ceiling. An explicit height sidesteps that instead of
  fighting it.) The art itself uses `object-contain`, not `object-cover` —
  it's letterboxed to fit the fixed box with its full aspect ratio intact,
  never cropped top/bottom or left/right (the small picker-grid thumbnails
  are the one place that still uses `object-cover`, since a uniform square
  crop reads better at icon size than letterboxing would). Clicking the
  slot opens a picker of that mode's bosses; picking one shows that boss
  full-size (uncropped) with its name below, and clicking a picked boss
  again reopens the picker to swap it. The boss is **one shared pick per
  mode** — every team is built against the same boss, so selecting one
  updates all of them at once
  (you're comparing team comps against a single fight, not fighting
  different bosses per team).
- **Share** — copies a URL with the current mode's teams (and any picked
  bosses) encoded into a `?team=` query param (base64url JSON). Opening that
  link loads the shared comp with no account or backend needed.
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
in a square avatar slot. Almost all of them came from a single page fetch:
every hero page embeds a shared navigation widget listing `_Icon.jpg` files
for ~237 heroes, so one HTML page yields the whole map (name → icon URL)
without hitting the API per hero. Note that four `Awakened X` heroes
(`Awakened Brutus/Baden/Solise/Talene`) have their **own** distinct
`X_Awakened_Icon.jpg` in that same list — don't fall back to the base
hero's plain icon for these, it's visibly wrong (a different portrait).
The rest used the MediaWiki `pageimages` API
(`action=query&prop=pageimages`, which resolves redirects and title
mismatches, e.g. `Wukong` → actual page title `Wu Kong`).

`Judy & Punch`, `Zaphrael`, `Leonardo`, and `Cha Hae-in` have no icon (or,
for Judy & Punch, no page at all) on the Classic AFK Arena wiki — the
Companions roster's naming doesn't always match the Classic wiki 1:1, since
Companions has a smaller, partly-overlapping roster with some exclusive
crossover heroes (Sung Jinwoo, Saitama, etc.) that the Classic wiki happens
to also document. For these four, [afk-web.onrender.com](https://afk-web.onrender.com)
(the site linked from the Guide card, Companions-specific) has a proper
128px icon per hero at `/images/generated/tier-list/heroes/{Name}-128.webp`.
Those four images are downloaded into `src/assets/heroes/` and wired in via
`IMAGE_OVERRIDES` in `heroes.ts`, rather than hotlinked, because that host
sends `Cross-Origin-Resource-Policy: same-origin`, which browsers enforce
regardless of `referrerPolicy` (unlike Fandom's Referer check below, this
one has no client-side workaround). They end up inlined as base64 in the
JS bundle since they're each under Vite's 4kB asset-inlining threshold —
that's expected, not a bug.

**Faction icons** (`FACTION_ICONS` in `heroes.ts`) are each faction's small
circular emblem, pulled from the wiki's [Factions](https://afk-arena.fandom.com/wiki/Factions)
page the same way — hotlinked from `static.wikia.nocookie.net`.

**Bosses** (`src/data/bosses.ts`) use each boss's own splash art (not an
icon) since the boss slot displays it at full board height. The 6 Dream
Realm bosses (Kane, Ice Shemira, Demonic Entity, Grotesque Mage, The
Unhinged, Burning Brute) are all documented on the wiki's
[The Twisted Realm](https://afk-arena.fandom.com/wiki/The_Twisted_Realm)
page, with each boss's own portrait fetched via `pageimages`. Guild Hunt
only has one confirmed image: **Wrizz**. `Dune Destroyer` is a real,
named boss on the wiki's
[Nightmare Corridor](https://afk-arena.fandom.com/wiki/Nightmare_Corridor)
page (a large rotating boss-name list) but has no artwork uploaded there
yet; `Raven Whisperer` and `Fortune Firecrackers` don't appear anywhere on
the Classic wiki at all (likely Companions-exclusive, undocumented
content) despite a thorough search (direct titles, MediaWiki search API,
wikitext dives). All three still work in the picker — `BossSlot.tsx` shows
a `?` placeholder in place of the `<img>` when `boss.image` is `null` —
swap in real art later by just filling in the `image` field.

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
- `public/404.html` + `public/spa-restore.js` (loaded from `index.html`)
  implement the [spa-github-pages](https://github.com/rafgraph/spa-github-pages)
  redirect trick, so a deep link like `/team-builder` (or a refresh on it)
  doesn't 404 — GitHub Pages serves `404.html`, which redirects back to
  `index.html` with the real path encoded in a query param that
  `spa-restore.js` decodes before React Router boots. The restore logic is an
  external script (not inline) so the CSP can stay strict — see below.

## Security

The app is fully static and client-side (no backend, no accounts, no
secrets), so the hardening is defense-in-depth:

- **Content-Security-Policy** — injected as a `<meta>` tag at build time only
  (via a small plugin in `vite.config.ts`, so it never breaks the dev
  server's inline HMR scripts). `script-src 'self'` with no inline/eval;
  `img-src`/`connect-src` limited to self + the floofpire icon CDN. This is
  why the SPA restore shim lives in an external file.
- **Input sanitization** — every share/roster/profile code and every
  `localStorage` payload is run through validators (`shareCodes.ts`,
  `teamBuilder.ts`, `useProfiles.ts`) that drop unknown hero/boss ids and
  out-of-range values, so a tampered code can't inject arbitrary data.
- **Pinned CI actions** — `.github/workflows/deploy.yml` pins each GitHub
  Action to a full commit SHA (with a `# v4`-style comment) to guard against
  a moved tag serving malicious workflow code.

## Roadmap

- [ ] **Tier List / Guide** — these stay as external links to SaiLus's
      originals. Do **not** copy or embed that content in-app without SaiLus's
      explicit permission (see [Credits & attribution](#credits--attribution)).
- [ ] **Team Builder** — art for `Dune Destroyer`, `Raven Whisperer`, and
      `Fortune Firecrackers` (see [Boss data](#hero-data)) once it exists
      somewhere; team notes/labels; per-team "recommended comp" hints using
      the tier list's mode-specific rankings.

## License

No license chosen yet — the original code here is all rights reserved by
default until a license is added. Note this covers only this project's own
code and the Team Builder: the linked Tier List and Guides belong to SaiLus,
and game assets belong to Lilith Games / their respective owners (see
[`/legal`](src/pages/Legal.tsx)).
