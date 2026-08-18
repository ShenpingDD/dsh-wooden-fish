# Architecture

```
┌────────────────────────── Browser (Client) ──────────────────────────┐
│  lib/client.js  (web ModuleLoader bundle)                            │
│                                                                      │
│  shell.overlay ──→ 悬浮木鱼（可拖动 / 点击敲击 / 悬停气泡）           │
│  settings.section ──→ 「电子木鱼」设置页（卡片 + 趋势图 + 显隐开关）   │
└──────────────────────────────┬───────────────────────────────────────┘
                      same-origin fetch
               POST /muyu/knock · GET /muyu/summary
┌──────────────────────────────┴───────────────────────────────────────┐
│  Harness host process (Node)                                          │
│                                                                       │
│  lib/index.js  (ESM entry, injected into the web composition)         │
│    ├─ webServer.register({ kind: 'exact', path: '/muyu/…' })         │
│    ├─ node:fs  → $DSH_HOME/wooden-fish-data.json (600ms debounce)     │
│    └─ $DSH_HOME/muyu-host-diag.json (self-diagnostics)                │
└───────────────────────────────────────────────────────────────────────┘
```

## Composition

The package is a **bundle** in the web profile: `dsh.bundle.patch` points at
`cordis.patch.yml`, which inserts the plugin row

```yaml
- insert:
    - id: wooden-fish-dsh
      name: wooden-fish-dsh
```

into the loader entry tree. The loader resolves the **host** face through the
package `exports["."]` (`lib/index.js`) and the **client** face through
`exports["./client"]` (`lib/client.js`) plus the `dsh.client` declaration
(`platform: "web"`, `inject: [runtime, ui-slots]`).

## Host half

- `inject: ['webServer']` — **required**. Installed-host entries apply
  immediately when `inject` is empty, at which point `ctx.get()` returns
  `undefined` for every service. Injecting `webServer` makes the entry wait
  until the webserver row is up, and the service becomes visible.
- Route handlers are registered inside `ctx.effect(...)`, the same pattern
  used by `dsh-inline-images`.
- Persistence uses `node:fs` (`existsSync` / `readFileSync` / `writeFileSync`)
  straight to `$DSH_HOME/wooden-fish-data.json` — deliberately independent of
  the `fs` ctx service. Writes are debounced 600 ms via `setTimeout`.
- Data model: `{ version: 1, days: { "YYYY-MM-DD": n } }`.
- RPC responses: `{ today, total, streak, series: [{ date, count } × 30] }`.

## Client half

- Standard `window.__ModuleLoader__.load({ id, factory })` bundle format.
  `factory(require)` may `require('react')` and use browser globals
  (`document`, `fetch`, `setTimeout`) — installed client bundles are ordinary
  browser modules, unlike the restricted dynamic-plugin sandbox.
- `ctx.get('slots')` → registers two entries:
  - `shell.overlay` (id `wooden-fish-overlay`): the floating fish
  - `settings.section` (id `wooden-fish`, label 电子木鱼): the stats page
- A module-scoped `store` keeps the show/hide state shared between the two
  components; while hidden, the overlay renders a "restore" pill so the fish
  is always recoverable.
- The fish artwork is an inline React SVG (see `docs/fish.svg`); all
  animations are CSS-only (`styles` are injected via `document.head`).

## Failure modes

| Symptom | Likely cause |
|---|---|
| Fish renders but hover bubble / settings data empty | Host routes not registered → `curl /muyu/summary` returns SPA HTML. Check `$DSH_HOME/muyu-host-diag.json` |
| `fs:false webServer:false timer:false` in diag | `inject` list is empty — declare the services |
| No diag file at all | Host entry did not apply (composition / import problem) |
