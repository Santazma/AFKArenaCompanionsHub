# AFK Arena Companions Hub

A fan-made companion site for **AFK Arena** players — one place for hero tier
lists, strategy guides, and an interactive team builder for Arena, Dream
Realm, Guild Boss, and other game modes.

> Not affiliated with or endorsed by Lilith Games.

## Status

This is the initial scaffold: base routing, layout, and home page are in
place.

- **Tier List** and **Guide** are external links for now — both the nav bar
  and the home page cards open them in a new tab:
  - Tier List → the community [tier list spreadsheet](https://docs.google.com/spreadsheets/d/1F8GWQiHuQV3ubYKLXVMpnHwwgtXAfdZOtCaMZ8usCWI/edit?pli=1&gid=1697331140#gid=1697331140)
  - Guide → [afk-web.onrender.com/guides](https://afk-web.onrender.com/guides)
- **Team Builder** is the only in-app route so far, currently a "coming
  soon" placeholder — see [Roadmap](#roadmap).

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
├── App.tsx                 # Route definitions
├── main.tsx                 # App entry point, router provider
├── index.css                 # Tailwind import + theme tokens + fonts
├── components/
│   ├── Layout.tsx             # Page shell: Aurora background, nav, footer
│   ├── NavBar.tsx              # Top navigation (incl. mobile menu)
│   └── PlaceholderPage.tsx      # Shared "coming soon" page template
├── pages/
│   ├── Home.tsx                 # Landing page with the 3 entry points
│   └── TeamBuilder.tsx           # /team-builder (placeholder)
├── lib/
│   └── externalLinks.ts           # Tier List / Guide URLs (single source of truth)
└── reactbits/                       # Vendored React Bits components (see below)
    ├── Aurora/                       # Animated WebGL background
    ├── GradientText/                  # Animated gradient text
    └── SpotlightCard/                  # Cursor-tracking spotlight card
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

## Getting started

```bash
npm install
npm run dev       # start the dev server (http://localhost:5173)
npm run build      # type-check + production build
npm run preview     # preview the production build locally
npm run lint          # run oxlint
```

Requires Node.js 20+.

## Roadmap

- [ ] **Tier List** — currently an external spreadsheet link; revisit
      whether to bring it in-app (data file + filterable UI) later.
- [ ] **Guide** — currently an external site link; revisit whether to bring
      it in-app later.
- [ ] **Team Builder** — pick heroes into slots, save/share comps, likely
      needs local storage (or a backend) for persistence.
- [ ] Hero artwork/data source (manual dataset vs. an existing community
      API) — needed if Tier List / Team Builder move in-app.

## License

No license chosen yet — all rights reserved by default until one is added.
