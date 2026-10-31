# FSE Theme — WordPress block theme

A custom **Full Site Editing** block theme built with `theme.json`, HTML templates, block patterns and custom Gutenberg blocks — no page builder. Every layout is editable in the Site Editor. The custom blocks are covered by **Playwright** end-to-end tests.

![FSE Theme — front page](docs/screenshot.png)

<!-- TODO: dodaj zrzut ekranu (np. docs/screenshot.png) oraz screenshot.png w katalogu głównym, żeby motyw miał miniaturę w panelu WordPressa -->

<!-- TODO (opcjonalnie): **Live demo:** https://... -->

## Highlights

- **Pure block theme** — global styles, typography, colours and spacing defined in `theme.json`
- **4 custom blocks** built with `@wordpress/scripts`, including a dynamic, server-rendered Latest Posts block with AJAX loading
- **Block Bindings** — dynamic copyright text and page meta bound to core blocks without custom blocks
- **Dark style variation** and custom block styles / variations for core blocks
- **Tested** — 13 Playwright specs covering loading states, errors, request cancelling, debounce, security, performance and more

## Features

### Templates & parts

- Templates: front page, home (blog), single, page, archive, search, 404, landing page
- Template parts: header, footer
- Block patterns: **Hero (home)**, **Project CTA**, **Theme features**
- Style variation: **Dark**
- Self-hosted **Poppins** font

### Custom blocks

| Block              | Description                                                                                                                                                                                        |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Latest Posts**   | Dynamic block (`render.php`) with **Load more** and infinite scroll via the REST API, category filtering, skeleton loading, error handling, responsive images (`srcset`) and accessibility support |
| **Before / After** | Image comparison slider                                                                                                                                                                            |
| **Tabs**           | Tabbed content with frontend interactions                                                                                                                                                          |
| **API Greeting**   | Fetches data from the REST API — tested for validation, debounce, request abort and security                                                                                                       |

### Editor extensions

- Custom block styles: **Card** (`core/group`) and **Arrow** (`core/button`)
- Custom block variations
- **Block Bindings** sources:
  - `fse-theme/copyright` — "© {current year} {site name}" generated automatically
  - `fse_theme_hero_eyebrow` — editable page meta for the hero eyebrow text (registered with `show_in_rest` and sanitisation)
- Editor styles matching the frontend

### REST API

- Custom `fse-theme/v1` namespace <!-- TODO: dopisz listę endpointów -->

## Tech stack

WordPress 6.6+ (tested up to 6.9) · PHP 8.0+ · `theme.json` · `@wordpress/scripts` (React, `@wordpress/core-data`) · vanilla JS · Playwright · BrowserSync

## Project structure

```
templates/      # Page templates (HTML)
parts/          # Header & footer
patterns/       # Block patterns
styles/         # Style variations (dark.json)
src/blocks/     # Custom block sources
build/blocks/   # Compiled blocks (registered automatically from block.json)
assets/         # Fonts, editor scripts (block variations)
tests/e2e/      # Playwright tests
theme.json      # Global settings & styles
functions.php   # Block styles, bindings, meta, block registration
```

## Getting started

### Requirements

- WordPress 6.6+, PHP 8.0+
- Node.js <!-- TODO: wersja, np. 20+ -->

### Installation

```bash
cd wp-content/themes
git clone https://github.com/natalkakielbicka-coder/fse-theme.git
cd fse-theme
npm install
npm run build
```

Activate **FSE Theme** in _Appearance → Themes_ and customise it in _Appearance → Editor_.

### Development

```bash
npm run start   # watch & rebuild blocks
npm run dev     # watch + BrowserSync live reload (requires WP_ENVIRONMENT_TYPE=local)
npm run build   # production build
```

### Tests

```bash
npx playwright install   # first run only
npx playwright test
```

<!-- TODO: dopisz adres lokalnej strony (baseURL), na której działają testy, i potrzebne dane testowe -->

## License

GPL-2.0-or-later
