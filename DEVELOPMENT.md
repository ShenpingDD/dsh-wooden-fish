# Development

## Requirements

- Node.js ≥ 22
- A DeepSeek Harness checkout with a `web` profile (to actually run the plugin)

## Quick start

```bash
git clone <repo-url>
cd wooden-fish-dsh
```

The package is plain JavaScript — **no build step**.

## Checks

```bash
npm run check                    # all three checks below in one command
node --check lib/index.js        # host syntax
node --check lib/client.js       # client syntax
node scripts/smoke.mjs           # host smoke test (mock ctx, temp DSH_HOME)
```

`npm run check` is the single entry point used for validation.

## Running against a live harness

The package is an installable web-profile bundle. From your DSH checkout:

```bash
dsh plugin --profile web add --config.minimumReleaseAge=0 -w <path-to-this-repo>
# restart dsh
```

The profile links to this directory, so after editing `lib/*` you only need to
restart DSH to pick up changes (client bundle rev changes; host code re-applies).

## Debugging

- Host logs go to the DSH web process stdout (a `dsh-market-restart-*.out.log`
  in the system temp dir on typical setups).
- The host writes a self-diagnostic file `$DSH_HOME/muyu-host-diag.json` on
  apply: which services were found, which routes registered, and the last
  `clientHello` (the client half reports on mount — **this is the objective
  answer to "did the UI actually mount?"**, no eyeballs required).
- Probe the routes directly:
  ```bash
  curl http://127.0.0.1:3080/muyu/summary          # stats JSON
  curl -X POST http://127.0.0.1:3080/muyu/knock    # knock once
  ```
  If `/muyu/summary` returns the SPA index HTML instead of JSON, the host
  routes are not registered — check the diag file and the inject declaration.
  (`/muyu/*` answers without the DSH web token; the shell's own `/` and
  `/plugins/*` routes need `?token=` → cookie on 0.1.5.)

## Gotchas (learned the hard way)

1. **`inject` is a service-visibility gate on installed host plugins.**
   `inject: []` makes the entry apply immediately, when `ctx.get()` returns
   `undefined` for every service. Declare the services you need, e.g.
   `export const inject = ['webServer']`.
2. **The host half is ordinary Node ESM.** You can use `node:fs`,
   `process.env` (`DSH_HOME`), and `setTimeout` directly — you do not need the
   `fs` / `timer` ctx services for persistence.
3. **`~` is not expanded by the host `fs` service** and `fs.resolve` fails for
   paths that do not exist. Prefer `process.env.DSH_HOME` for data locations.
4. **The client bundle is independent of the host entry.** A host failure
   (e.g. routes missing) shows up as "UI loads but data is empty", with no
   boot error. Always curl the routes to check the host half.
5. **`dsh.client.inject` must name ids the shell actually provides.** The
   client entry *waits* on every id in that list; an id that no longer exists
   (0.1.5 removed `@deepseek-ai/dsh-client-runtime`) makes the entry wait
   forever — the bundle is served, nothing renders, nothing is logged. In 0.1.5
   `slots` is provided by `@deepseek-ai/dsh-client-ui-renderer`. Verify a name
   against the shell's static module map instead of guessing.
6. **Heatmap layout: never let tooltips size the grid.** A centered tooltip on a
   8–14 px cell widens the track's scroll area and produces a horizontal
   scrollbar even at `opacity: 0`. Keep the wrapper `overflow-x: clip`, size
   tracks with `minmax(0, 14px)`, and right-anchor the trailing columns'
   tooltips.
7. **`days` is the heatmap's contract.** The host returns the full
   `{ "YYYY-MM-DD": n }` map; the client builds 3/6/12-month windows from it, so
   a new range needs no host change (and the smoke test asserts the field).

## Structure

```
lib/index.js          Host half: webServer routes + persistence (ESM)
lib/client.js         Client half: ModuleLoader bundle (fish + heatmap UI)
cordis.patch.yml      Composition patch inserting the plugin row
scripts/smoke.mjs     Host smoke test (mock ctx, temp DSH_HOME)
docs/                 PRD, UI design spec, heatmap preview, artwork, sample data
```
