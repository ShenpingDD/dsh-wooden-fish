# Changelog

All notable changes to this project are documented here.

## [1.1.0] — 2026-09-19

DeepSeek Harness **0.1.5** compatibility + trend-chart redesign.

### Fixed
- **The client half stopped mounting on DSH 0.1.5.** `dsh.client.inject` declared `@deepseek-ai/dsh-client-runtime` (removed in 0.1.5) and `@deepseek-ai/dsh-client-ui-slots`; an unsatisfiable inject left the client entry waiting forever, so `apply()` never ran and the fish silently disappeared (the host half kept working, so nothing was logged). The package now injects `@deepseek-ai/dsh-client-ui-renderer`, which provides the `slots` service in 0.1.5.

### Added
- **Calendar heatmap** (GitHub-contribution style) replaces the bar chart: 3 / **6 (default)** / 12-month ranges, 5-level wood ramp, month + weekday labels, hover tooltip, today outline, and a per-range summary line
- **Scrollbar-free responsive heatmap**: cells share the panel width equally (larger for short ranges, compact for the 1-year view) and the wrapper clips horizontally, so no horizontal scrollbar appears at any width; the last 8 columns right-anchor their tooltips
- **Position + visibility persistence** (localStorage): the fish returns to where you left it and stays hidden across reloads
- **Theme adaptation**: chrome (cards, borders, text, buttons, tooltip) follows the active DSH theme through the official `--dsw-alias-*` CSS variables — including the sakura theme
- `POST /muyu/client-hello` self-proof route: the client half reports on mount, recorded in `$DSH_HOME/muyu-host-diag.json` (a server-side answer to "is the UI actually mounted?")
- `knock` / `summary` responses now carry the full `days` map (the heatmap's data source)

### Changed
- Settings-header fish 72 px → 64 px

## [1.0.0] — 2026-08-19

Initial open-source release.

### Added
- Floating draggable wooden fish in the `shell.overlay` slot
- Knock feedback: fish shake + mallet swing + ripple ring + floating "+1"
- Hover bubble showing today's count ("今天已敲 N 次"), refreshed on hover
- Per-day counting persisted to `$DSH_HOME/wooden-fish-data.json` (plain JSON, `node:fs` writes with 600 ms debounce)
- Host JSON routes on the harness `webServer`: `POST /muyu/knock`, `GET /muyu/summary`
- Settings section 「电子木鱼」: today / total / streak cards + 7/14/30-day bar chart
- Show/hide toggle with a "restore" pill while hidden
- Zen wood style, light/dark theme aware, zero network calls

### Engineering notes
- Host must declare `inject: ['webServer']` — an empty `inject` applies before services are ready and `ctx.get()` returns `undefined` for every service
- Client is a web `ModuleLoader` bundle; persistence intentionally does not depend on the `fs` ctx service
- Smoke test: `node scripts/smoke.mjs` (mock host apply + route registration + counting + debounced persistence + dispose)
