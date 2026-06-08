# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`rg-nuxt` — a RoosterGrin Nuxt.js 2 template used to build statically-generated orthodontics/dental marketing sites (this instance: Valley Orthodontics). Content is authored in WordPress (headless, via the WP REST API) and mirrored into local JSON files under `data/` that are baked into the static build. Templates are Pug, styling is Sass (indented syntax), animation is GSAP.

## Commands

All Nuxt commands point at `config/nuxt.config.js` via `--config-file`, and all are prefixed by `node scripts/process-logo.js` (which regenerates `assets/icons/logo.svg` + `logo-white.svg` from `data/theme.json`). Always use the npm scripts — running `nuxt` directly will use the wrong config and skip logo generation.

- `npm run dev` — dev server on port 8081 (host 0.0.0.0)
- `npm run generate` — static site generation into `dist/` (this is the deploy artifact; `npm run deploy` aliases it)
- `npm run build` — Nuxt SSR build (rarely used; site ships as `target: 'static'`)
- `npm run lint` — ESLint over `.js`/`.vue`. Run after changes.
- `npm test` — Jest. Single test: `npx jest test/Logo.spec.js` or `npx jest -t '<name>'`. Tests live in `test/`; coverage is collected from `components/**/*.vue` and `pages/**/*.vue`.

Deploys: CodeBuild (`buildspec.yml`, Node 14, runs `npm run generate`, artifact = `dist/`) and Cloudflare (`wrangler.jsonc`, same generate → `dist/`).

Note: `.npmrc` configures the private GreenSock (`@gsap`) registry — `npm install` needs it.

## Architecture

### Data-driven pages (the core pattern)

There is essentially **one page template** that renders everything. `pages/_slug.vue` catches all routes and calls `setJSONData(slug)` (in `resources/utils.js`) to load that page's section array from `data/pages.json`, then hands it to the `PageSections` component.

- `data/pages.json` — keyed by page name/slug (e.g. `Home`, `About`, `iconix-champagne-gold-braces`). Each value is an array of **section objects**; one element carries an `seo` object, the rest are page sections.
- Each section object has an `acf_fc_layout` discriminator (e.g. `"hero"`, `"image_text"`, `"block_grid"`, `"form"`, `"map"`). `components/page-sections/index.pug` is a long `v-if`/`v-else-if` chain that maps each `acf_fc_layout` value to a `Block*` component, passing the whole section object as `:props`. Sections also honor `hide_component`, `component_padding`, and `background`.
- **To add a new section type:** create the `Block*` component, import + register it in `components/page-sections/index.vue`, and add a matching `v-else-if` branch keyed on its `acf_fc_layout` in `index.pug`.

Static page keys (`Home`, `About`, `Get Started`, `Treatments`, `Contact`, `FAQ`) are excluded from dynamic-route generation in `config/nuxt.config.js`; everything else in `pages.json` (lowercase, slug-shaped keys) becomes a generated route. Blog routes are generated at build time by fetching `/wp/v2/posts` live from the WP API.

### WordPress as content source

`resources/api.js` defines `api` (WP REST base, `…/wp-json`) and `url` (public site URL) — **update both when repurposing the template for a new site.** `resources/utils.js` holds the data layer:

- `setJSONData(slug, type)` — reads from local `data/${type}.json` via `require` (so content is bundled at build time). Used for pages/global.
- `getForms`, `getCustomPosts`, `getAllPages`, `setData` — live `axios` calls to the WP API (paginate via `x-wp-totalpages`). `getForms` falls back to `data/forms.json` if the API is down.
- `setMeta(page)` — builds the Nuxt `head()` (title, description, OG tags, canonical) from a section's `seo` object.

`data/` JSON files (`pages.json`, `globalData.json`, `forms.json`, `theme.json`) are the local mirror of WP content and are the source of truth for the static build. `scripts/sync-pages.js`, `generate-routes*.js` help reconcile `router/index.js` with these files.

### Global data & theming

- `layouts/default.vue` `fetch()`s forms, posts, global data, and theme, then dispatches them into the Vuex store (`store/`). `data/globalData.json` holds company name, phone, nav, footer, CTA, popup, and typography.
- **Theming is runtime CSS variables, not Sass vars.** `default.vue`'s `updateGlobalStyles()` reads `theme.json` colors and sets `--<label>` / `--<label>-rgb` custom properties on `:root`. Google Fonts are auto-extracted from `theme.json` typography in `nuxt.config.js`. Editing colors = edit `data/theme.json` (see `.cursor/rules/theme-json.mdc` for the palette-overhaul prompt: all colors unique, no pure white, WCAG AA contrast).
- Responsive breakpoints are tracked in the store via window-width dispatches in `default.vue` (`IS_PHONE_LG`, `IS_TABLET`, etc.) rather than purely in CSS.

### Dev mode

`globalData.json`'s `enable_development_mode` toggles an in-page overlay (`components/dev-mode/`) that only renders when running locally (`NODE_ENV === 'development'`). The store flags `devInspector`/`devTools` gate `DevModeOverlay`/`DevModeTools` in `page-sections`, which annotate each section with its `acf_fc_layout`.

## Component conventions

Three-file pattern, referenced via `src` attributes:

```vue
<template lang='pug' src='./index.pug'></template>
<script> /* logic */ </script>
<style lang="sass" src="./index.sass"></style>
```

- `components/base/` — primitives (button, icon, image, modal); several are globally registered in `resources/components.js`.
- `components/block/` — the `Block*` page-section components consumed by `page-sections`.
- `components/hero/`, `footer/`, `navigation/`, `popup/`, `form/` — layout/chrome.
- Styling uses stylelint (BEM selector pattern, `.stylelintrc`) and sass-lint; global Sass resources in `styles/base|utilities|grid` are auto-injected into every component via `styleResources`. GSAP is loaded through `nuxt-gsap-module` + `resources/vendors*.js`.

## When working here

- New components: create all three files (`.vue`/`.pug`/`.sass`), wire into `page-sections` if it's a section type, then `npm run lint`.
- Content/copy changes generally mean editing `data/*.json`, not Vue components.
- `AGENTS.md` is a legacy copy of older guidance; this file supersedes it.
