// scripts/smoke.mjs — 本地冒烟测试
// 模拟 Host 端 apply：验证模块导出、webServer 路由注册、敲击计数、防抖落盘、dispose 清理。
// 运行：node scripts/smoke.mjs   （用临时 DSH_HOME，不碰真实数据）
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const tmp = mkdtempSync(join(tmpdir(), 'muyu-smoke-'))
process.env.DSH_HOME = tmp // 必须在 import 模块之前设置

const { apply, name, inject } = await import('../lib/index.js')

let failures = 0
function check(label, cond) {
  if (cond) {
    console.log('  ✓', label)
  } else {
    console.error('  ✗', label)
    failures += 1
  }
}

console.log('[1] 模块导出')
check(`name === 'wooden-fish-dsh'`, name === 'wooden-fish-dsh')
check('inject 声明了 webServer', Array.isArray(inject) && inject.includes('webServer'))

console.log('[2] apply + 路由注册')
const registered = {}
const ctx = {
  get: (k) => k === 'webServer' ? {
    register: (route) => {
      registered[route.path] = route.handler
      return () => { delete registered[route.path] }
    },
  } : undefined,
  effect: (fn) => fn(),
}
const dispose = apply(ctx)
check('注册了 /muyu/knock', typeof registered['/muyu/knock'] === 'function')
check('注册了 /muyu/summary', typeof registered['/muyu/summary'] === 'function')
check('注册了 /muyu/client-hello', typeof registered['/muyu/client-hello'] === 'function')

console.log('[3] 敲击计数')
function mockRes() {
  const res = { status: 0, body: '' }
  res.writeHead = (status) => { res.status = status }
  res.end = (body) => { res.body = body }
  return res
}
const r1 = mockRes()
await registered['/muyu/knock'](null, r1)
const j1 = JSON.parse(r1.body)
check('knock 返回 today=1', j1.today === 1)
check('knock 返回 total=1', j1.total === 1)
check('knock 返回 series(30)', Array.isArray(j1.series) && j1.series.length === 30)
check('knock 返回全量 days（热力图数据源）', !!j1.days && typeof j1.days === 'object')

console.log('[4] summary 读取')
const r2 = mockRes()
await registered['/muyu/summary'](null, r2)
const j2 = JSON.parse(r2.body)
check('summary today=1', j2.today === 1)

console.log('[5] 防抖落盘（600ms）')
await new Promise((resolve) => setTimeout(resolve, 750))
const now = new Date()
const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
const saved = JSON.parse(readFileSync(join(tmp, 'wooden-fish-data.json'), 'utf8'))
check(`数据文件已写入且含今天(${key})=1`, saved.days[key] === 1)

console.log('[6] dispose 清理')
dispose()
check('dispose 后路由已移除', registered['/muyu/knock'] === undefined && registered['/muyu/summary'] === undefined)

rmSync(tmp, { recursive: true, force: true })
console.log(failures === 0 ? '\n✅ smoke 全部通过' : `\n❌ ${failures} 项失败`)
process.exit(failures === 0 ? 0 : 1)
