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
- **设置 → 电子木鱼**：今日 / 累计 / 连续天数卡片 + **日历热力图**（近 3 / **6（默认）** / 12 个月，5 档木色、月份 + 星期标签、悬停看数值、今日描边、范围摘要行）
- **记住你的设置**：木鱼位置与显隐状态刷新后保持
- **跟随主题**：外壳使用 harness 主题 token（`--dsw-alias-*`），自动匹配浅/深色与自定义主题（如 sakura）；木鱼与热力色阶保持木质本色
- **无横向滚动条**：热力图等分占满容器宽度（短范围格子更大，一年视图自动压缩）
- 禅意木质风，纯本地零网络

> ⚠️ 暂无敲击音效，反馈以视觉为主。

## 📸 界面预览

![UI 设计预览](docs/screenshots/ui-design-preview.png)

交互演示：[docs/preview-heatmap.html](docs/preview-heatmap.html)（浏览器打开——可拖动、敲击木鱼、切换热力图范围）

## 📦 安装

本插件是可直接安装的 **web profile bundle 包**。

推荐装预构建 tarball（无需构建授权、无构建步骤）：

```bash
dsh plugin --profile web add https://github.com/ShenpingDD/dsh-wooden-fish/releases/latest/download/dsh-wooden-fish.tgz
# 然后重启 dsh
```

或从源码安装（GitHub 源码安装需要一次 allowBuilds 授权）：

```bash
dsh plugin --profile web add --config.minimumReleaseAge=0 -w github:ShenpingDD/dsh-wooden-fish
# 然后重启 dsh
```

也可以从本地检出目录安装：

```bash
dsh plugin --profile web add --config.minimumReleaseAge=0 -w <本仓库路径>
# 然后重启 dsh
```

重启后木鱼自动出现在右下角，**之后每次启动自动加载，无需重新激活。**

## 🎮 使用

| 操作 | 效果 |
|---|---|
| 点击木鱼 | 敲击一次：今日 +1，播放敲击动画 |
| 拖动木鱼 | 移动到任意位置（位置会被记住） |
| 悬停木鱼 | 显示「今天已敲 N 次」气泡 |
| 设置 → 电子木鱼 | 统计卡片 + 日历热力图（近 3 / 6 / 12 个月） |
| 设置页开关 | 隐藏/显示悬浮木鱼（隐藏后出现恢复药丸，选择会被记住） |

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
| **Host**（`lib/index.js`） | 在 harness 的 `webServer` 上注册 JSON 路由（`POST /muyu/knock`、`GET /muyu/summary`、`POST /muyu/client-hello`），用 `node:fs` 直接持久化。**必须声明非空 `inject`**（`['webServer']`）——空 `inject` 会在服务就绪前 apply，届时 `ctx.get()` 全部返回 undefined。 |
| **Client**（`lib/client.js`） | web `ModuleLoader` bundle：在 `shell.overlay` 渲染悬浮木鱼、在 `settings.section` 渲染热力图页，通过同源 `fetch` 与 Host 通信。**0.1.5 上 `dsh.client.inject` 必须写真实存在的 id**（`@deepseek-ai/dsh-client-ui-renderer` 提供 `slots` 服务）；写了无法满足的 id，entry 会永远等待 → UI 静默不挂载。 |

详见 [ARCHITECTURE.md](ARCHITECTURE.md)。

## 📚 文档

- [docs/PRD.md](docs/PRD.md) — 产品需求文档
- [docs/UI-DESIGN.md](docs/UI-DESIGN.md) — 设计规格：令牌、状态、动效参数
- [docs/wooden-fish-preview.html](docs/wooden-fish-preview.html) — 交互预览页（浏览器打开）
- [docs/fish.svg](docs/fish.svg) — 木鱼美术稿
- [CHANGELOG.md](CHANGELOG.md) · [DEVELOPMENT.md](DEVELOPMENT.md) · [SECURITY.md](SECURITY.md) · [CONTRIBUTING.md](CONTRIBUTING.md)

## ⚖️ License

[MIT](LICENSE)
