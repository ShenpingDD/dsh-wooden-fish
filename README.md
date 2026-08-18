# 🪵 Wooden Fish Pet · 电子木鱼桌宠 (for DeepSeek Harness)

> A clickable **wooden-fish desktop pet** for the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) web GUI.
> Not a cartoon mascot — a zen digital 木鱼 you can knock anytime. Every knock is counted per day, and the settings page shows your daily trend.

[中文说明](README.zh.md)

---

## ✨ Features

- **Floating wooden fish** on the page — drag it anywhere, click to knock
- Knock feedback: fish shake + mallet swing + ripple ring + floating "+1"
- Hover the fish to see **今天已敲 N 次** (today's count)
- **Per-day counting** (`YYYY-MM-DD` buckets), persisted to `$DSH_HOME/wooden-fish-data.json` — survives restarts
- **Settings page** (`设置 → 电子木鱼`): today / total / streak cards + 7/14/30-day bar chart (zero days in gray, hover for details)
- Show/hide the floating fish anytime (a small "restore" pill appears while hidden)
- Zen wood style, light/dark theme aware, zero network calls, data stays local

> ⚠️ v1 has no knock **sound** (the installed-plugin client runs in the browser; audio was out of scope). Feedback is visual only.

## 📸 Preview

![UI design preview](docs/screenshots/ui-design-preview.png)

Interactive demo: [docs/wooden-fish-preview.html](docs/wooden-fish-preview.html) (open in a browser — drag and knock the fish, switch the chart range)

## 📦 Install

The plugin is an installable **web-profile bundle** package. From the DeepSeek Harness checkout:

```bash
dsh plugin --profile web add --config.minimumReleaseAge=0 -w <this-repo-path>
# then restart dsh
```

Or install directly from GitHub:

```bash
dsh plugin --profile web add --config.minimumReleaseAge=0 -w github:<owner>/wooden-fish-dsh
# then restart dsh
```

After restart the fish appears at the bottom-right automatically. **No re-activation needed on later restarts.**

## 🎮 Usage

| Action | Effect |
|---|---|
| Click the fish | Knock: +1 to today's count, animation feedback |
| Drag the fish | Move it anywhere (position resets to default on reload) |
| Hover the fish | Show today's count bubble |
| 设置 → 电子木鱼 | Stats cards + daily trend chart (7/14/30 days) |
| Toggle in settings | Show/hide the floating fish (a "restore" pill appears while hidden) |

## 💾 Data

Stored at `$DSH_HOME/wooden-fish-data.json`:

```json
{ "version": 1, "days": { "2026-08-18": 10, "2026-08-19": 3 } }
```

- `$DSH_HOME` is the harness data home (default `~/.dsh`)
- Local-only, plain JSON, easy to back up or reset
- See [docs/sample-data.json](docs/sample-data.json) for a fuller example

## 🧱 How it works

| Half | Mechanism |
|---|---|
| **Host** (`lib/index.js`) | Registers two JSON routes on the harness `webServer`: `POST /muyu/knock` (today +1) and `GET /muyu/summary` (stats). Persists via `node:fs` directly. Must declare `inject: ['webServer']` — an empty `inject` would apply before services are ready and `ctx.get()` returns `undefined` for everything. |
| **Client** (`lib/client.js`) | A web `ModuleLoader` bundle (`window.__ModuleLoader__.load(...)`) that renders the fish in the `shell.overlay` slot and the stats page in `settings.section`, talking to the host over same-origin `fetch`. |

More: [ARCHITECTURE.md](ARCHITECTURE.md)

## 📚 Docs

- [docs/PRD.md](docs/PRD.md) — product requirements (zh)
- [docs/UI-DESIGN.md](docs/UI-DESIGN.md) — design spec: tokens, states, animations (zh)
- [docs/wooden-fish-preview.html](docs/wooden-fish-preview.html) — interactive UI preview (open in a browser)
- [docs/fish.svg](docs/fish.svg) — the fish artwork
- [CHANGELOG.md](CHANGELOG.md) · [DEVELOPMENT.md](DEVELOPMENT.md) · [SECURITY.md](SECURITY.md) · [CONTRIBUTING.md](CONTRIBUTING.md)

## ⚖️ License

[MIT](LICENSE)
