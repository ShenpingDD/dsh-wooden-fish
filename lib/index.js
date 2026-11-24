/**
 * 电子木鱼（正式安装版）— Host 半端 v0.3
 *
 * 关键修复：install 插件的 entry 必须声明非空 `inject` 才会等到服务就绪；
 * `inject: []` 会立即 apply（此时 ctx.get 全部 undefined）。
 * 因此：
 *   - inject: ['webServer']  → 等 webserver 行就绪后注册路由；
 *   - 持久化改用 node:fs 直写（不依赖 ctx 的 fs 服务）；
 *   - 防抖用 Node 全局 setTimeout（不依赖 timer 服务）。
 *
 * 路由：POST /muyu/knock（今日+1）、GET /muyu/summary（统计）。
 * 数据：$DSH_HOME/wooden-fish-data.json（{version, days: {"YYYY-MM-DD": n}}）。
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { homedir } from 'node:os'

export const name = 'dsh-wooden-fish'
export const inject = ['webServer']

const HOME = process.env.DSH_HOME || join(homedir(), '.dsh')
const DATA_FILE = join(HOME, 'wooden-fish-data.json')
const DIAG_FILE = join(HOME, 'muyu-host-diag.json')

function dateKey(d = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function apply(ctx) {
  const webServer = ctx.get('webServer')

  const diag = {
    at: new Date().toISOString(),
    dshHome: HOME,
    webServer: !!webServer,
    routes: [],
  }
  try {
    mkdirSync(HOME, { recursive: true })
    writeFileSync(DIAG_FILE, JSON.stringify(diag, null, 2))
  } catch (err) { /* diagnostics best-effort */ }

  function writeDiag() {
    try {
      writeFileSync(DIAG_FILE, JSON.stringify(diag, null, 2))
    } catch (err) { /* ignore */ }
  }
  try {
    console.log('[dsh-wooden-fish] apply v0.3', JSON.stringify({ webServer: !!webServer, home: HOME }))
  } catch (err) { /* ignore */ }

  let cache = null
  let dirty = false
  let writeTimer = null

  function ensureLoaded() {
    if (cache) return
    try {
      if (existsSync(DATA_FILE)) {
        const parsed = JSON.parse(readFileSync(DATA_FILE, 'utf8'))
        if (parsed && typeof parsed === 'object' && parsed.days && typeof parsed.days === 'object') {
          cache = { days: parsed.days }
          return
        }
      }
    } catch (err) { /* fall through to create */ }
    try {
      mkdirSync(dirname(DATA_FILE), { recursive: true })
      writeFileSync(DATA_FILE, JSON.stringify({ version: 1, days: {} }))
      cache = { days: {} }
    } catch (err) {
      cache = { days: {} } // memory-only last resort
    }
  }

  function persistNow() {
    if (!cache) return
    dirty = false
    try {
      writeFileSync(DATA_FILE, JSON.stringify({ version: 1, days: cache.days, updatedAt: new Date().toISOString() }))
    } catch (err) { /* next write retries */ }
  }

  function schedulePersist() {
    dirty = true
    if (writeTimer) clearTimeout(writeTimer)
    writeTimer = setTimeout(() => {
      writeTimer = null
      if (dirty) persistNow()
    }, 600)
  }

  function computeStats(days) {
    const today = dateKey()
    const todayCount = days[today] || 0
    let total = 0
    for (const k in days) {
      if (Object.prototype.hasOwnProperty.call(days, k)) total += days[k]
    }
    let streak = 0
    const cursor = new Date()
    if (!(days[dateKey(cursor)] > 0)) cursor.setDate(cursor.getDate() - 1)
    while (days[dateKey(cursor)] > 0) {
      streak += 1
      cursor.setDate(cursor.getDate() - 1)
    }
    const series = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const k = dateKey(d)
      series.push({ date: k, count: days[k] || 0 })
    }
    // v1.1：日历热力图需要完整历史，直接返回全量 days（体量极小：一天一条）
    return { today: todayCount, total, streak, series, days }
  }

  function handleKnock() {
    ensureLoaded()
    const k = dateKey()
    cache.days[k] = (cache.days[k] || 0) + 1
    schedulePersist()
    return computeStats(cache.days)
  }

  function handleSummary() {
    ensureLoaded()
    return computeStats(cache.days)
  }

  function writeJson(res, value) {
    res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' })
    res.end(JSON.stringify(value))
  }

  function fail(res, message) {
    res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' })
    res.end(message)
  }

  const disposers = []
  if (webServer) {
    const routes = [
      {
        kind: 'exact',
        path: '/muyu/knock',
        handler: (_req, res) => {
          try { writeJson(res, handleKnock()) } catch (err) { fail(res, String(err)) }
        },
      },
      {
        kind: 'exact',
        path: '/muyu/summary',
        handler: (_req, res) => {
          try { writeJson(res, handleSummary()) } catch (err) { fail(res, String(err)) }
        },
      },
      {
        // 客户端挂载自证：UI 半端 apply 成功后会 POST 这里，Host 落盘留证。
        kind: 'exact',
        path: '/muyu/client-hello',
        handler: (req, res) => {
          try {
            diag.clientHello = {
              at: new Date().toISOString(),
              ua: String(req?.headers?.['user-agent'] ?? '').slice(0, 140),
            }
            writeDiag()
            console.log('[dsh-wooden-fish] client half mounted (client-hello received)')
          } catch (err) { /* ignore */ }
          writeJson(res, { ok: true })
        },
      },
    ]
    for (const route of routes) {
      try {
        const d = ctx.effect(() => webServer.register(route))
        disposers.push(d)
        diag.routes.push('registered:' + route.path)
        try { console.log('[dsh-wooden-fish] route registered:', route.path) } catch (err) { /* ignore */ }
      } catch (err) {
        diag.routes.push('failed:' + route.path + ':' + String(err))
        try { console.error('[dsh-wooden-fish] register failed for ' + route.path, err) } catch (e) { /* ignore */ }
      }
    }
  } else {
    diag.routes.push('NO-webServer')
    try { console.error('[dsh-wooden-fish] webServer not available at apply time') } catch (err) { /* ignore */ }
  }

  writeDiag()

  return () => {
    if (writeTimer) { clearTimeout(writeTimer); writeTimer = null }
    if (dirty) persistNow()
    for (const d of disposers) {
      try { d() } catch (err) { /* ignore */ }
    }
  }
}
