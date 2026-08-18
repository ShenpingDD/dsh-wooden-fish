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
node --check lib/index.js        # host syntax
node --check lib/client.js       # client syntax
node scripts/smoke.mjs           # host smoke test (mock ctx, temp DSH_HOME)
```

CI runs all three on every push (see `.github/workflows/ci.yml`).

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
  apply: which services were found and which routes registered.
- Probe the routes directly:
  ```bash
  curl http://127.0.0.1:3080/muyu/summary          # stats JSON
  curl -X POST http://127.0.0.1:3080/muyu/knock    # knock once
  ```
  If `/muyu/summary` returns the SPA index HTML instead of JSON, the host
  routes are not registered — check the diag file and the inject declaration.

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

## Structure

```
lib/index.js          Host half: webServer routes + persistence (ESM)
lib/client.js         Client half: ModuleLoader bundle (UI)
cordis.patch.yml      Composition patch inserting the plugin row
scripts/smoke.mjs     Host smoke test
docs/                 PRD, UI design spec, preview, artwork
```
