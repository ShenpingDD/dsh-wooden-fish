# Contributing

Thanks for helping improve the wooden fish! 🪵

## Ways to contribute

- **Report a bug / suggest a feature** — open an issue with a short
  description; for bugs include what you did, what you expected, and what
  happened (screenshots help).
- **Send a PR** — keep changes focused; run the checks below before pushing.

## Checks

```bash
node --check lib/index.js
node --check lib/client.js
node scripts/smoke.mjs
```

The smoke test uses a temporary `DSH_HOME` and never touches real data.

## Style

- Plain JavaScript, ESM on the host (`lib/index.js`), no build step.
- The client half must stay inside the `window.__ModuleLoader__.load({...})`
  wrapper format (no JSX, no TS, no imports at bundle top level — use the
  `factory(require)`).
- CSS for the client lives in the big template string inside `lib/client.js`
  (all class names are prefixed `dsh-muyu-`).
- Keep the README bilingual (EN + zh) when touching user-facing docs.
- Update `CHANGELOG.md` for user-visible changes.
