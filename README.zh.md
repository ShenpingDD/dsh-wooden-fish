# 🪵 电子木鱼桌宠 · Wooden Fish Pet（DeepSeek Harness 插件）

> 为 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) Web 界面打造的一只可点击的「电子木鱼」。
> 它不是卡通人物，而是一件案头小木器——随时点一下，系统自动按天记录敲击次数，设置页里可以看到每日趋势。

[English](README.md)

---

## ✨ 功能

- **悬浮木鱼**：页面右下角常驻，可自由拖动，点击敲击
- 敲击反馈：木鱼晃动 + 木槌朝左敲落 + 声波环 + 「+1」飘字
- 悬停木鱼显示「今天已敲 N 次」
- **按天计数**（`YYYY-MM-DD` 分桶），持久化到 `$DSH_HOME/wooden-fish-data.json`，重启不丢
- **设置 → 电子木鱼**：今日 / 累计 / 连续天数卡片 + 7/14/30 天柱状趋势图（0 次灰柱、悬停看数值、今日高亮）
- 可随时隐藏/恢复悬浮木鱼（隐藏后出现「点击恢复」药丸）
- 禅意木质风，适配深浅主题，纯本地零网络

> ⚠️ v1 无敲击音效（安装版插件运行在浏览器端，音频不在本版范围），反馈以视觉为主。

## 📦 安装

本插件是可直接安装的 **web profile bundle 包**。在 DeepSeek Harness 检出目录执行：

```bash
dsh plugin --profile web add --config.minimumReleaseAge=0 -w <本仓库路径>
# 然后重启 dsh
```

或直接从 GitHub 安装：

```bash
dsh plugin --profile web add --config.minimumReleaseAge=0 -w github:<owner>/wooden-fish-dsh
# 然后重启 dsh
```

重启后木鱼自动出现在右下角，**之后每次启动自动加载，无需重新激活。**

## 🎮 使用

| 操作 | 效果 |
|---|---|
| 点击木鱼 | 敲击一次：今日 +1，播放敲击动画 |
| 拖动木鱼 | 移动到任意位置（刷新后回默认右下角） |
| 悬停木鱼 | 显示「今天已敲 N 次」气泡 |
| 设置 → 电子木鱼 | 统计卡片 + 每日趋势图（7/14/30 天切换） |
| 设置页开关 | 隐藏/显示悬浮木鱼（隐藏后出现恢复药丸） |

## 💾 数据

存放于 `$DSH_HOME/wooden-fish-data.json`：

```json
{ "version": 1, "days": { "2026-08-18": 10, "2026-08-19": 3 } }
```

- `$DSH_HOME` 为 Harness 数据主目录（默认 `~/.dsh`）
- 纯本地、纯 JSON，方便备份或重置

## 🧱 工作原理

| 半端 | 机制 |
|---|---|
| **Host**（`lib/index.js`） | 在 harness 的 `webServer` 上注册两个 JSON 路由：`POST /muyu/knock`（今日 +1）与 `GET /muyu/summary`（统计）；用 `node:fs` 直接持久化。**必须声明 `inject: ['webServer']`**——空 `inject` 会在服务就绪前 apply，届时 `ctx.get()` 全部返回 undefined。 |
| **Client**（`lib/client.js`） | web `ModuleLoader` bundle（`window.__ModuleLoader__.load(...)`）：在 `shell.overlay` 渲染悬浮木鱼、在 `settings.section` 渲染统计页，通过同源 `fetch` 与 Host 通信。 |

详见 [ARCHITECTURE.md](ARCHITECTURE.md)。

## 📚 文档

- [docs/PRD.md](docs/PRD.md) — 产品需求文档
- [docs/UI-DESIGN.md](docs/UI-DESIGN.md) — 设计规格：令牌、状态、动效参数
- [docs/wooden-fish-preview.html](docs/wooden-fish-preview.html) — 交互预览页（浏览器打开）
- [docs/fish.svg](docs/fish.svg) — 木鱼美术稿
- [CHANGELOG.md](CHANGELOG.md) · [DEVELOPMENT.md](DEVELOPMENT.md) · [SECURITY.md](SECURITY.md) · [CONTRIBUTING.md](CONTRIBUTING.md)

## ⚖️ License

[MIT](LICENSE)
