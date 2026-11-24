# Architecture

```
┌────────────────────────── Browser (Client) ──────────────────────────┐
│  lib/client.js  (web ModuleLoader bundle)                            │
│                                                                      │
│  shell.overlay ──→ 悬浮木鱼（可拖动 / 点击敲击 / 悬停气泡）           │
│  settings.section ──→ 「电子木鱼」设置页（卡片 + 日历热力图 + 开关）   │
│  localStorage ──→ 位置 / 显隐状态持久化                               │
│  CSS ──→ 主题 token var(--dsw-alias-*)（跟随 harness 主题）           │
└──────────────────────────────┬───────────────────────────────────────┘
                      same-origin fetch
     POST /muyu/knock · GET /muyu/summary · POST /muyu/client-hello
┌──────────────────────────────┴───────────────────────────────────────┐
│  Harness host process (Node)                                          │
│                                                                       │
│  lib/index.js  (ESM entry, injected into the web composition)         │
│    ├─ webServer.register({ kind: 'exact', path: '/muyu/…' })         │
│    ├─ node:fs  → $DSH_HOME/wooden-fish-data.json (600ms debounce)     │
│    └─ $DSH_HOME/muyu-host-diag.json (routes + clientHello 自证)       │
└───────────────────────────────────────────────────────────────────────┘
```

## Composition

The package is a **bundle** in the web profile: `dsh.bundle.patch` points at
`cordis.patch.yml`, which inserts the plugin row

```yaml
- insert:
    - id: dsh-wooden-fish
      name: dsh-wooden-fish
```

into the loader entry tree. The loader resolves the **host** face through the
package `exports["."]` (`lib/index.js`) and the **client** face through
`exports["./client"]` (`lib/client.js`) plus the `dsh.client` declaration.

> **0.1.5 note:** `dsh.client.inject` must name ids that the shell actually
> provides. The plugin injects `@deepseek-ai/dsh-client-ui-renderer` — the
> package that owns the `slots` service in 0.1.5. (`@deepseek-ai/dsh-client-runtime`
> and the standalone `dsh-client-ui-slots` package were removed in 0.1.5; naming
> one leaves the client entry waiting forever with **no error anywhere**.)

## Host half

- `inject: ['webServer']` — **required**. Installed-host entries apply
  immediately when `inject` is empty, at which point `ctx.get()` returns
  `undefined` for every service. Injecting `webServer` makes the entry wait
  until the webserver row is up, and the service becomes visible.
- Three routes, registered inside `ctx.effect(...)`:
  - `POST /muyu/knock` — today +1, returns stats
  - `GET /muyu/summary` — stats (see payload below)
  - `POST /muyu/client-hello` — the client half's mount self-proof; recorded in
    the diagnostic file so "is the UI actually mounted?" has a server-side answer
- Persistence uses `node:fs` (`existsSync` / `readFileSync` / `writeFileSync`)
  straight to `$DSH_HOME/wooden-fish-data.json` — deliberately independent of
  the `fs` ctx service. Writes are debounced 600 ms via `setTimeout`.
- Data model: `{ version: 1, days: { "YYYY-MM-DD": n } }`.
- Response payload: `{ today, total, streak, series: [{date,count} × 30], days }`
  — `days` is the full map (the heatmap's data source; one entry per active day).
- Self-diagnostics: `$DSH_HOME/muyu-host-diag.json` records the services found,
  the routes registered, and the last `clientHello`.

## Client half

- Standard `window.__ModuleLoader__.load({ id, factory })` bundle format.
  `factory(require)` may `require('react')` and use browser globals
  (`document`, `fetch`, `setTimeout`, `localStorage`) — installed client bundles
  are ordinary browser modules, unlike the restricted dynamic-plugin sandbox.
- `ctx.get('slots')` → registers two entries:
  - `shell.overlay` (id `wooden-fish-overlay`): the floating fish
  - `settings.section` (id `wooden-fish`, label 电子木鱼): cards + heatmap
- **Persistence**: a module-scoped `store` mirrors `{ visible, pos }` into
  `localStorage` (`dsh-wooden-fish:v1`); position is clamped to the viewport and
  written on drag end.
- **Theme adaptation**: the chrome (cards, borders, labels, buttons, tooltip)
  uses the harness theme CSS variables `--dsw-alias-*` with hard-coded
  fallbacks, so it follows light/dark and custom themes (e.g. sakura). The fish
  artwork and the heat ramp keep the fixed wood palette by design.
- **Heatmap**: a CSS grid, columns = weeks, rows = Mon–Sun.
  - Track sizing `repeat(N, minmax(0, 1fr))` + `aspect-ratio: 1/1` cells →
    share the panel width equally (bigger for short ranges, compact for the
    one-year view) and never overflow.
  - The wrapper is `overflow-x: clip; overflow-y: visible` so no horizontal
    scrollbar appears while tooltips can still escape vertically.
  - The last 8 columns right-anchor their tooltips (`nth-last-child(-n+56)`),
    because at 8-20 px column widths a centered tooltip would widen the grid.
- A module-scoped `store` keeps the show/hide state shared between the two
  components; while hidden, the overlay renders a "restore" pill so the fish
  is always recoverable.
- The fish artwork is an inline React SVG (see `docs/fish.svg`); all
  animations are CSS-only (styles injected via `document.head`).

## Failure modes

| Symptom | Likely cause |
|---|---|
| Fish renders but hover bubble / settings data empty | Host routes not registered → `curl /muyu/summary` returns SPA HTML. Check `$DSH_HOME/muyu-host-diag.json` |
| `fs:false webServer:false timer:false` in diag | `inject` list is empty — declare the services |
| No diag file at all | Host entry did not apply (composition / import problem) |
| UI entirely missing, **but the bundle is served** (present in `__DSH_BOOT__` / `/plugins/<id>/client.js`) and no error is logged | `dsh.client.inject` names an id that does not exist → the client entry waits forever. Check the shell's static module map and use the id that owns the service (0.1.5: `@deepseek-ai/dsh-client-ui-renderer` for `slots`) |
| Heatmap shows a horizontal scrollbar | A tooltip overhang is widening the grid — right-anchor the trailing columns and keep the wrapper `overflow-x: clip` |
