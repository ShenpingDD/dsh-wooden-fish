# Changelog

All notable changes to this project are documented here.

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
