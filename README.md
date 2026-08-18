# 🪵 电子木鱼桌宠 · Wooden Fish Pet (for DeepSeek Harness)

> A clickable **wooden-fish desktop pet** for the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) web GUI.
> Not a cartoon mascot — a zen digital 木鱼 you can knock anytime. Every knock is counted per day, and the settings page shows your daily trend.

[中文说明](#中文说明)

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

## 🧱 How it works

| Half | Mechanism |
|---|---|
| **Host** (`lib/index.js`) | Registers two JSON routes on the harness `webServer`: `POST /muyu/knock` (today +1) and `GET /muyu/summary` (stats). Persists via `node:fs` directly. Must declare `inject: ['webServer']` — an empty `inject` would apply before services are ready and `ctx.get()` returns `undefined` for everything. |
| **Client** (`lib/client.js`) | A web `ModuleLoader` bundle (`window.__ModuleLoader__.load(...)`) that renders the fish in the `shell.overlay` slot and the stats page in `settings.section`, talking to the host over same-origin `fetch`. |

## 📚 Docs

- [docs/PRD.md](docs/PRD.md) — product requirements (zh)
- [docs/UI-DESIGN.md](docs/UI-DESIGN.md) — design spec: tokens, states, animations (zh)
- [docs/wooden-fish-preview.html](docs/wooden-fish-preview.html) — interactive UI preview (open in a browser)
- [docs/fish.svg](docs/fish.svg) — the fish artwork

## 🛠 Development

The package is plain JavaScript — no build step:

```bash
git clone <repo-url>
cd wooden-fish-dsh
node --check lib/index.js && node --check lib/client.js   # syntax check
```

Edit `lib/index.js` (host) / `lib/client.js` (client), then reinstall or rely on the profile link + restart to see changes.

## ⚖️ License

[MIT](LICENSE)

---

## 中文说明

**电子木鱼桌宠**：为 DeepSeek Harness Web 界面打造的一只可点击的「电子木鱼」。它不是卡通人物，而是一件案头小木器——随时点一下，系统自动按天记录敲击次数，设置页里可以看到每日趋势。

- 悬浮木鱼可自由拖动，点击敲击（晃动 + 木槌敲落 + 声波环 + 「+1」飘字）
- 悬停显示「今天已敲 N 次」
- 数据按天分桶，持久化到 `$DSH_HOME/wooden-fish-data.json`，重启不丢
- 设置 → 电子木鱼：今日 / 累计 / 连续天数卡片 + 7/14/30 天柱状趋势图
- 可随时隐藏/恢复悬浮木鱼
- 禅意木质风，适配深浅主题，纯本地零网络

安装：在 DSH 检出目录执行 `dsh plugin --profile web add --config.minimumReleaseAge=0 -w <本仓库路径>`，重启 dsh 生效，之后每次启动自动加载。
