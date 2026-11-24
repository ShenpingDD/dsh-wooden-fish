/**
 * 电子木鱼（正式安装版）— Client 半端 v1.1.0
 *
 * web ModuleLoader bundle 格式：window.__ModuleLoader__.load({ id, factory })。
 * 安装版是普通浏览器模块，可直接用 document / fetch / setTimeout / localStorage。
 * Host 通信走同源 JSON 路由：POST /muyu/knock、GET /muyu/summary。
 *
 * v1.1.0 变更：
 *  1. 趋势图：柱状图 → 日历热力图（GitHub 贡献图风格），默认近 6 个月，可切 3 月/6 月/一年；
 *  2. 位置与显隐状态持久化（localStorage），刷新/重启后木鱼回到原位；
 *  3. 主题适配：外壳使用 0.1.5 官方 CSS 变量 --dsw-alias-*（跟随 sakura 等主题），木鱼与热力色阶保持木质本色。
 */
window.__ModuleLoader__.load({
  id: 'dsh-wooden-fish',
  factory: (require) => {
    const React = require('react')

    const CSS = `
.dsh-muyu-overlay{position:fixed;z-index:9999;pointer-events:auto;user-select:none;touch-action:none;cursor:pointer;font-family:system-ui,-apple-system,'PingFang SC','Microsoft YaHei',sans-serif;filter:drop-shadow(0 6px 14px rgba(80,50,20,.30))}
.dsh-muyu-overlay svg{display:block;width:96px;height:auto;transition:transform .15s ease}
.dsh-muyu-overlay:hover svg{transform:translateY(-2px)}
.dsh-muyu-hit{animation:dshMuyuShake .18s ease}
.dsh-muyu-mallet{transform-box:fill-box;transform-origin:50% 90%;transition:transform .12s ease}
.dsh-muyu-hit .dsh-muyu-mallet{transform:rotate(-38deg)}
.dsh-muyu-pop{position:absolute;left:78%;top:2%;font-size:17px;font-weight:700;color:#E8A75A;text-shadow:0 1px 2px rgba(0,0,0,.35);pointer-events:none;animation:dshMuyuPop .9s ease-out forwards}
.dsh-muyu-ripple{position:absolute;left:50%;top:6px;width:14px;height:14px;margin-left:-7px;border:2px solid rgba(217,154,61,.75);border-radius:50%;pointer-events:none;animation:dshMuyuRipple .6s ease-out forwards}
.dsh-muyu-tip{position:absolute;left:50%;bottom:calc(100% + 10px);transform:translateX(-50%) translateY(4px);background:rgba(40,25,10,.55);color:#FFD58A;font-size:12px;line-height:1;padding:6px 11px;border-radius:999px;white-space:nowrap;letter-spacing:.5px;opacity:0;pointer-events:none;transition:opacity .15s ease,transform .15s ease;box-shadow:0 4px 12px rgba(0,0,0,.25);z-index:2}
.dsh-muyu-tip::after{content:"";position:absolute;left:50%;top:100%;transform:translateX(-50%);border:5px solid transparent;border-top-color:rgba(40,25,10,.55)}
.dsh-muyu-overlay:hover .dsh-muyu-tip{opacity:1;transform:translateX(-50%) translateY(0)}
.dsh-muyu-dragging .dsh-muyu-tip{opacity:0 !important;transform:translateX(-50%) translateY(4px) !important}
.dsh-muyu-tip b{display:inline-block;animation:dshMuyuBounce .2s cubic-bezier(.34,1.56,.64,1)}
.dsh-muyu-restore{background:rgba(40,25,10,.45);color:#FFD58A;font-size:12px;line-height:1;padding:8px 12px;border-radius:999px;white-space:nowrap;letter-spacing:.5px;border:1px solid rgba(232,167,90,.55);transition:background .15s,transform .15s;display:inline-block}
.dsh-muyu-overlay:hover .dsh-muyu-restore{background:rgba(40,25,10,.7);transform:translateY(-1px)}

/* ── 木质本色变量（热力色阶，深浅主题各一套；按设计稿锁定不改） ── */
.dsh-muyu-page,.dsh-muyu-overlay{--dsh-muyu-h0:rgba(120,90,60,.10);--dsh-muyu-h1:#F0DFC4;--dsh-muyu-h2:#E3C293;--dsh-muyu-h3:#D09A54;--dsh-muyu-h4:#B2702F}

.dsh-muyu-mini{cursor:pointer;display:inline-block;position:relative;filter:drop-shadow(0 3px 8px rgba(80,50,20,.25))}
.dsh-muyu-mini svg{display:block;width:64px;height:auto;transition:transform .15s ease}
.dsh-muyu-mini:hover svg{transform:translateY(-1px)}
.dsh-muyu-page{display:flex;flex-direction:column;gap:16px;padding:4px 2px;font-family:system-ui,-apple-system,'PingFang SC','Microsoft YaHei',sans-serif}
.dsh-muyu-head{display:flex;align-items:center;gap:14px}
.dsh-muyu-title{font-size:15px;font-weight:600;color:var(--dsw-alias-label-primary,#4A3520)}
.dsh-muyu-sub{font-size:12px;color:var(--dsw-alias-label-secondary,rgba(74,53,32,.62));margin-top:2px}
.dsh-muyu-cards{display:flex;gap:10px;flex-wrap:wrap}
.dsh-muyu-card{flex:1;min-width:110px;background:var(--dsw-alias-bg-layer-1,rgba(139,100,60,.10));border:1px solid var(--dsw-alias-border-l1,rgba(120,90,60,.22));border-radius:12px;padding:12px 14px}
.dsh-muyu-val{font-size:24px;font-weight:700;color:var(--dsw-alias-brand-primary,#C98A3B);line-height:1.2}
.dsh-muyu-key{font-size:12px;color:var(--dsw-alias-label-secondary,rgba(74,53,32,.62));margin-top:3px}
.dsh-muyu-range{display:flex;gap:6px}
.dsh-muyu-range button{cursor:pointer;background:var(--dsw-alias-bg-layer-1,rgba(139,100,60,.10));border:1px solid var(--dsw-alias-border-l1,rgba(120,90,60,.25));color:var(--dsw-alias-label-primary,inherit);border-radius:8px;padding:4px 12px;font-size:12px}
.dsh-muyu-range button.dsh-muyu-on{background:var(--dsw-alias-brand-primary,#C98A3B);border-color:var(--dsw-alias-brand-primary,#C98A3B);color:#fff}

/* ── 日历热力图（等分填充：格子随容器宽度自适应，横向 clip 防滚动条） ── */
.dsh-muyu-heatwrap{display:flex;gap:6px;align-items:flex-start;overflow-x:clip;overflow-y:visible}
.dsh-muyu-lhs{display:grid;grid-template-rows:repeat(7,1fr);gap:3px;font-size:9px;line-height:1;color:var(--dsw-alias-label-secondary,rgba(120,90,60,.65));margin-top:18px;align-self:stretch;text-align:right;flex-shrink:0}
.dsh-muyu-heatmain{flex:1;min-width:0}
.dsh-muyu-months{display:grid;gap:3px;height:14px;margin-bottom:4px}
.dsh-muyu-months span{font-size:10px;color:var(--dsw-alias-label-secondary,rgba(120,90,60,.65));white-space:nowrap;overflow:visible}
.dsh-muyu-heat{display:grid;grid-auto-flow:column;grid-template-rows:repeat(7,1fr);gap:3px}
.dsh-muyu-cell{width:100%;min-width:0;aspect-ratio:1/1;border-radius:2.5px;background:var(--dsh-muyu-h0)}
.dsh-muyu-swatch{display:inline-block;width:12px;height:12px;border-radius:2.5px;background:var(--dsh-muyu-h0)}
.dsh-muyu-l1{background:var(--dsh-muyu-h1)}
.dsh-muyu-l2{background:var(--dsh-muyu-h2)}
.dsh-muyu-l3{background:var(--dsh-muyu-h3)}
.dsh-muyu-l4{background:var(--dsh-muyu-h4)}
.dsh-muyu-cell{position:relative}
.dsh-muyu-future{background:transparent}
.dsh-muyu-future::after{display:none}
.dsh-muyu-today{outline:1.5px solid var(--dsw-alias-brand-primary,#E8A75A);outline-offset:1px}
.dsh-muyu-cell::after{content:attr(data-tip);position:absolute;left:50%;bottom:calc(100% + 5px);transform:translateX(-50%);background:var(--dsw-alias-bg-overlay,rgba(30,20,8,.88));color:var(--dsw-alias-label-primary,#FFE7C2);font-size:11px;padding:3px 7px;border-radius:5px;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .12s;z-index:5}
.dsh-muyu-cell:hover::after{opacity:1}
/* 最后 8 列 tooltip 右对齐锚定：既避免外溢撑出滚动，也保证最近数据的气泡完整可读 */
.dsh-muyu-cell:nth-last-child(-n+56)::after{left:auto;right:0;transform:none}
.dsh-muyu-heatfoot{display:flex;justify-content:space-between;align-items:center;margin-top:10px;gap:12px;flex-wrap:wrap}
.dsh-muyu-summary{font-size:12px;color:var(--dsw-alias-label-secondary,rgba(74,53,32,.62))}
.dsh-muyu-legend{display:flex;align-items:center;gap:4px;font-size:11px;color:var(--dsw-alias-label-secondary,rgba(74,53,32,.62))}

.dsh-muyu-toggle{display:flex;align-items:center;gap:10px;margin-top:2px;padding-top:16px;border-top:1px dashed var(--dsw-alias-border-l1,rgba(120,90,60,.25));font-size:13px;color:var(--dsw-alias-label-primary,inherit);cursor:pointer}
.dsh-muyu-bell{font-size:16px}
.dsh-muyu-switch{width:38px;height:21px;border-radius:999px;background:var(--dsh-muyu-h0);position:relative;transition:background .2s;flex-shrink:0}
.dsh-muyu-switch::after{content:"";position:absolute;top:2px;left:2px;width:17px;height:17px;border-radius:50%;background:#fff;transition:left .2s;box-shadow:0 1px 3px rgba(0,0,0,.3)}
.dsh-muyu-switch.dsh-muyu-on{background:var(--dsw-alias-brand-primary,#C98A3B)}
.dsh-muyu-switch.dsh-muyu-on::after{left:19px}
@keyframes dshMuyuShake{0%{transform:rotate(0)}30%{transform:rotate(-6deg) translateY(2px)}60%{transform:rotate(5deg)}100%{transform:rotate(0)}}
@keyframes dshMuyuPop{0%{opacity:0;transform:translateY(4px) scale(.6)}20%{opacity:1;transform:translateY(0) scale(1.15)}100%{opacity:0;transform:translateY(-26px) scale(1)}}
@keyframes dshMuyuRipple{0%{opacity:.9;transform:scale(.5)}100%{opacity:0;transform:scale(2.6)}}
@keyframes dshMuyuBounce{0%{transform:scale(1)}40%{transform:scale(1.35)}100%{transform:scale(1)}}
@media (prefers-color-scheme:dark){
  .dsh-muyu-page,.dsh-muyu-overlay{--dsh-muyu-h0:rgba(200,160,110,.10);--dsh-muyu-h1:#4A3A26;--dsh-muyu-h2:#7A5A32;--dsh-muyu-h3:#B07C3C;--dsh-muyu-h4:#E0A055}
}
`

    function insertCSS(css) {
      const style = document.createElement('style')
      style.textContent = css
      document.head.appendChild(style)
      return () => {
        try { document.head.removeChild(style) } catch (err) { /* already gone */ }
      }
    }

    async function knockReq() {
      const res = await fetch('/muyu/knock', { method: 'POST' })
      if (!res.ok) throw new Error('muyu knock http ' + res.status)
      return res.json()
    }

    async function summaryReq() {
      const res = await fetch('/muyu/summary')
      if (!res.ok) throw new Error('muyu summary http ' + res.status)
      return res.json()
    }

    function fishSvg(hitting, size) {
      return React.createElement('svg', {
        viewBox: '0 0 140 104',
        width: size,
        style: { display: 'block' },
        className: hitting ? 'dsh-muyu-hit' : undefined,
      },
        React.createElement('defs', null,
          React.createElement('linearGradient', { id: 'dshMuyuG1', x1: 0, y1: 0, x2: 0, y2: 1 },
            React.createElement('stop', { offset: '0', stopColor: '#D8A062' }),
            React.createElement('stop', { offset: '1', stopColor: '#A8622A' })),
          React.createElement('linearGradient', { id: 'dshMuyuG2', x1: 0, y1: 0, x2: 0, y2: 1 },
            React.createElement('stop', { offset: '0', stopColor: '#EABD85' }),
            React.createElement('stop', { offset: '1', stopColor: '#C9884A' })),
        ),
        React.createElement('rect', { x: 24, y: 78, width: 92, height: 13, rx: 6.5, fill: '#8A5A2B', stroke: '#6B421A', strokeWidth: 2 }),
        React.createElement('rect', { x: 26, y: 80, width: 88, height: 3, rx: 1.5, fill: '#A07038', opacity: 0.7 }),
        React.createElement('path', { d: 'M32 52 C30 32 48 22 70 22 C92 22 112 32 110 52 C108 70 88 76 70 76 C50 76 34 68 32 52 Z', fill: 'url(#dshMuyuG1)', stroke: '#7C4A1E', strokeWidth: 2.5 }),
        React.createElement('ellipse', { cx: 46, cy: 38, rx: 19, ry: 12, fill: 'url(#dshMuyuG2)' }),
        React.createElement('ellipse', { cx: 42, cy: 35, rx: 9, ry: 5, fill: '#F0CE9D', opacity: 0.85 }),
        React.createElement('path', { d: 'M30 52 C46 44 64 44 80 52', fill: 'none', stroke: '#5D3412', strokeWidth: 4, strokeLinecap: 'round' }),
        React.createElement('path', { d: 'M32 56 C48 49 66 49 80 55', fill: 'none', stroke: '#8A5426', strokeWidth: 1.6, strokeLinecap: 'round', opacity: 0.55 }),
        React.createElement('path', { d: 'M40 37 Q44 33 48 37', fill: 'none', stroke: '#3A2410', strokeWidth: 2.8, strokeLinecap: 'round' }),
        React.createElement('path', { d: 'M108 50 L122 38 L126 46 L122 50 L126 54 L122 62 Z', fill: '#9A5C24', stroke: '#6B421A', strokeWidth: 2, strokeLinejoin: 'round' }),
        React.createElement('g', { className: 'dsh-muyu-mallet', style: { transformBox: 'fill-box', transformOrigin: '50% 90%', transition: 'transform .12s ease' } },
          React.createElement('rect', { x: 113, y: 16, width: 6, height: 28, rx: 3, fill: '#8A5A2B', stroke: '#6B421A', strokeWidth: 1.5 }),
          React.createElement('ellipse', { cx: 116, cy: 13, rx: 9, ry: 7, fill: '#B87A35', stroke: '#6B421A', strokeWidth: 1.5 }),
        ),
      )
    }

    // ── 本地持久化（位置 + 显隐）──────────────────────────────
    const STATE_KEY = 'dsh-wooden-fish:v1'

    function loadState() {
      try {
        const raw = window.localStorage.getItem(STATE_KEY)
        if (!raw) return { visible: true, pos: null }
        const parsed = JSON.parse(raw)
        const pos = (typeof parsed.left === 'number' && typeof parsed.top === 'number')
          ? { left: parsed.left, top: parsed.top }
          : null
        return { visible: parsed.visible !== false, pos }
      } catch (err) {
        return { visible: true, pos: null }
      }
    }

    function saveState(state) {
      try {
        window.localStorage.setItem(STATE_KEY, JSON.stringify({
          visible: state.visible,
          left: state.pos ? state.pos.left : undefined,
          top: state.pos ? state.pos.top : undefined,
        }))
      } catch (err) { /* ignore (private mode / quota) */ }
    }

    function clampPos(pos) {
      try {
        const w = window.innerWidth || 1280
        const h = window.innerHeight || 800
        return {
          left: Math.max(0, Math.min(Math.round(pos.left), w - 110)),
          top: Math.max(0, Math.min(Math.round(pos.top), h - 110)),
        }
      } catch (err) {
        return pos
      }
    }

    // ── 热力图数据 ────────────────────────────────────────────
    const RANGES = [[13, '近 3 个月'], [26, '近 6 个月'], [53, '近一年']]

    function dateKey(d) {
      return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
    }

    function heatLevel(count) {
      return count <= 0 ? 0 : count <= 3 ? 1 : count <= 8 ? 2 : count <= 15 ? 3 : 4
    }

    function buildHeat(days, weeks) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayKey = dateKey(today)
      const dow = (today.getDay() + 6) % 7 // 0 = 周一
      const start = new Date(today)
      start.setDate(start.getDate() - dow - (weeks - 1) * 7)

      const cells = []
      const labels = []
      let sum = 0
      let active = 0
      let longest = 0
      let run = 0
      let lastMonth = -1

      for (let i = 0; i < weeks * 7; i++) {
        const d = new Date(start)
        d.setDate(d.getDate() + i)
        const key = dateKey(d)
        const future = d > today
        const count = future ? 0 : (days[key] || 0)
        if (!future) {
          sum += count
          if (count > 0) { active += 1; run += 1; if (run > longest) longest = run } else { run = 0 }
        }
        cells.push({ key, count, future, today: key === todayKey })
        if (i % 7 === 0) {
          const mid = new Date(d)
          mid.setDate(mid.getDate() + 3)
          if (mid.getMonth() !== lastMonth) {
            labels.push({ w: i / 7, text: (mid.getMonth() + 1) + '月' })
            lastMonth = mid.getMonth()
          }
        }
      }
      return { cells, labels, sum, active, longest, todayKey }
    }

    return {
      name: 'dsh-wooden-fish',
      inject: [],
      apply(ctx) {
        const slots = ctx.get('slots')
        if (slots === undefined) return

        const disposeStyles = insertCSS(CSS)

        const initial = loadState()
        const store = {
          visible: initial.visible,
          pos: initial.pos ? clampPos(initial.pos) : null,
          listeners: new Set(),
          notify() {
            store.listeners.forEach((fn) => { try { fn() } catch (err) { /* ignore */ } })
          },
          setVisible(v) {
            store.visible = v
            saveState(store)
            store.notify()
          },
          setPos(p) {
            store.pos = p ? clampPos(p) : null
            saveState(store)
            store.notify()
          },
          subscribe(fn) {
            store.listeners.add(fn)
            return () => store.listeners.delete(fn)
          },
        }

        function WoodenFishOverlay() {
          const [pos, setPos] = React.useState(store.pos)
          const [hitting, setHitting] = React.useState(false)
          const [popId, setPopId] = React.useState(0)
          const [rippleId, setRippleId] = React.useState(0)
          const [today, setToday] = React.useState(null)
          const [visible, setVisible] = React.useState(store.visible)
          const dragRef = React.useRef(null)
          const lastPosRef = React.useRef(store.pos)
          const hitTimer = React.useRef(null)

          React.useEffect(() => {
            const sync = () => { setVisible(store.visible); setPos(store.pos) }
            summaryReq().then((r) => setToday(r.today)).catch(() => {})
            return store.subscribe(sync)
          }, [])

          React.useEffect(() => () => {
            if (hitTimer.current) clearTimeout(hitTimer.current)
          }, [])

          const refresh = () => {
            summaryReq().then((r) => setToday(r.today)).catch(() => {})
          }

          const knock = () => {
            setHitting(true)
            setPopId((p) => p + 1)
            setRippleId((r) => r + 1)
            if (hitTimer.current) clearTimeout(hitTimer.current)
            hitTimer.current = setTimeout(() => setHitting(false), 220)
            knockReq().then((r) => setToday(r.today)).catch(() => {})
          }

          const onPointerEnter = () => {
            if (today === null) refresh()
          }

          const onPointerDown = (e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            dragRef.current = { sx: e.clientX, sy: e.clientY, sl: rect.left, st: rect.top, moved: false }
            try { e.currentTarget.setPointerCapture(e.pointerId) } catch (err) {}
          }
          const onPointerMove = (e) => {
            const d = dragRef.current
            if (!d) return
            const dx = e.clientX - d.sx
            const dy = e.clientY - d.sy
            if (Math.abs(dx) + Math.abs(dy) > 5) d.moved = true
            if (d.moved) {
              e.currentTarget.classList.add('dsh-muyu-dragging')
              const next = clampPos({ left: d.sl + dx, top: d.st + dy })
              lastPosRef.current = next
              setPos(next)
            }
          }
          const onPointerUp = (e) => {
            const d = dragRef.current
            if (d && !d.moved) knock()
            dragRef.current = null
            e.currentTarget.classList.remove('dsh-muyu-dragging')
            if (d && d.moved && lastPosRef.current) store.setPos(lastPosRef.current)
          }

          const style = pos ? { left: pos.left, top: pos.top } : { right: 26, bottom: 150 }

          if (!visible) {
            return React.createElement('div', {
              className: 'dsh-muyu-overlay',
              style,
              title: '电子木鱼已隐藏，点这里恢复',
              onClick: () => store.setVisible(true),
            },
              React.createElement('span', { className: 'dsh-muyu-restore' }, '🪵 已隐藏 · 点击恢复'),
            )
          }

          return React.createElement('div', {
            className: 'dsh-muyu-overlay',
            style,
            title: '电子木鱼：点我敲一下，可拖动',
            onPointerEnter,
            onPointerDown,
            onPointerMove,
            onPointerUp,
          },
            React.createElement('div', { className: 'dsh-muyu-tip' }, '今天已敲 ', React.createElement('b', null, today === null ? '·' : today), ' 次'),
            rippleId > 0 && React.createElement('span', { key: rippleId, className: 'dsh-muyu-ripple' }),
            popId > 0 && React.createElement('span', { key: popId, className: 'dsh-muyu-pop' }, '+1'),
            fishSvg(hitting, 96),
          )
        }

        function MuyuSettingsPage() {
          const [stats, setStats] = React.useState(null)
          const [weeks, setWeeks] = React.useState(26) // 默认近 6 个月
          const [hitting, setHitting] = React.useState(false)
          const [visible, setVisible] = React.useState(store.visible)
          const hitTimer = React.useRef(null)

          React.useEffect(() => {
            const sync = () => setVisible(store.visible)
            summaryReq().then(setStats).catch(() => {})
            return store.subscribe(sync)
          }, [])

          React.useEffect(() => () => {
            if (hitTimer.current) clearTimeout(hitTimer.current)
          }, [])

          const knock = () => {
            setHitting(true)
            if (hitTimer.current) clearTimeout(hitTimer.current)
            hitTimer.current = setTimeout(() => setHitting(false), 220)
            knockReq().then(setStats).catch(() => {})
          }

          const days = (stats && stats.days) || {}
          const heat = buildHeat(days, weeks)
          const cols = 'repeat(' + weeks + ', minmax(0, 1fr))'
          const rangeLabel = (RANGES.find((r) => r[0] === weeks) || RANGES[1])[1]

          const monthCells = []
          for (let w = 0; w < weeks; w++) {
            const hit = heat.labels.find((l) => l.w === w)
            monthCells.push(React.createElement('span', { key: w }, hit ? hit.text : ''))
          }
          const cellEls = heat.cells.map((c, i) =>
            React.createElement('div', {
              key: i,
              className: 'dsh-muyu-cell'
                + (c.future ? ' dsh-muyu-future' : (c.count ? ' dsh-muyu-l' + heatLevel(c.count) : ''))
                + (c.today ? ' dsh-muyu-today' : ''),
              'data-tip': c.future ? undefined : (c.key + ' · ' + c.count + ' 次'),
              title: c.future ? undefined : (c.key + '：' + c.count + ' 次'),
            }),
          )
          const weekdayLabels = ['一', '', '三', '', '五', '', ''].map((t, i) =>
            React.createElement('span', { key: i }, t),
          )

          return React.createElement('div', { className: 'dsh-muyu-page' },
            React.createElement('div', { className: 'dsh-muyu-head' },
              React.createElement('div', { className: 'dsh-muyu-mini', onClick: knock, title: '点我敲一下' }, fishSvg(hitting, 64)),
              React.createElement('div', null,
                React.createElement('div', { className: 'dsh-muyu-title' }, '电子木鱼'),
                React.createElement('div', { className: 'dsh-muyu-sub' }, '点一下小木鱼，积攒今日份安心'),
              ),
            ),
            React.createElement('div', { className: 'dsh-muyu-cards' },
              React.createElement('div', { className: 'dsh-muyu-card' },
                React.createElement('div', { className: 'dsh-muyu-val' }, stats ? stats.today : '—'),
                React.createElement('div', { className: 'dsh-muyu-key' }, '今日敲击')),
              React.createElement('div', { className: 'dsh-muyu-card' },
                React.createElement('div', { className: 'dsh-muyu-val' }, stats ? stats.total.toLocaleString() : '—'),
                React.createElement('div', { className: 'dsh-muyu-key' }, '累计敲击')),
              React.createElement('div', { className: 'dsh-muyu-card' },
                React.createElement('div', { className: 'dsh-muyu-val' }, stats ? stats.streak : '—'),
                React.createElement('div', { className: 'dsh-muyu-key' }, '连续天数')),
            ),
            React.createElement('div', { className: 'dsh-muyu-range' },
              RANGES.map(([w, label]) =>
                React.createElement('button', {
                  key: w,
                  className: weeks === w ? 'dsh-muyu-on' : undefined,
                  onClick: () => setWeeks(w),
                }, label),
              ),
            ),
            React.createElement('div', { className: 'dsh-muyu-heatwrap' },
              React.createElement('div', { className: 'dsh-muyu-lhs' }, weekdayLabels),
              React.createElement('div', { className: 'dsh-muyu-heatmain' },
                React.createElement('div', { className: 'dsh-muyu-months', style: { gridTemplateColumns: cols } }, monthCells),
                React.createElement('div', { className: 'dsh-muyu-heat', style: { gridTemplateColumns: cols } }, cellEls),
              ),
            ),
            React.createElement('div', { className: 'dsh-muyu-heatfoot' },
              React.createElement('div', { className: 'dsh-muyu-summary' },
                rangeLabel + '　共 ' + heat.sum + ' 次 · 有敲击 ' + heat.active + ' 天 · 最长连续 ' + heat.longest + ' 天'),
              React.createElement('div', { className: 'dsh-muyu-legend' },
                '少',
                [0, 1, 2, 3, 4].map((l) => React.createElement('i', { key: l, className: 'dsh-muyu-swatch' + (l ? ' dsh-muyu-l' + l : '') })),
                '多',
              ),
            ),
            React.createElement('div', {
              className: 'dsh-muyu-toggle',
              onClick: () => store.setVisible(!store.visible),
            },
              React.createElement('span', { className: 'dsh-muyu-switch' + (store.visible ? ' dsh-muyu-on' : '') }),
              React.createElement('span', { className: 'dsh-muyu-bell' }, store.visible ? '🔔' : '🔕'),
              React.createElement('span', null, store.visible ? '悬浮木鱼：显示中（点这里隐藏）' : '悬浮木鱼：已隐藏（点这里重新显示）'),
            ),
          )
        }

        const disposers = [disposeStyles]
        const inj1 = slots.inject('shell.overlay', () => slots.register(
          { name: 'shell.overlay', id: 'wooden-fish-overlay', order: 10 },
          () => React.createElement(WoodenFishOverlay),
        ))
        if (inj1) disposers.push(inj1)
        const inj2 = slots.inject('settings.section', () => slots.register(
          { name: 'settings.section', id: 'wooden-fish', order: 50, label: '电子木鱼' },
          () => React.createElement(MuyuSettingsPage),
        ))
        if (inj2) disposers.push(inj2)

        // 客户端挂载自证：Host 收到后落盘 $DSH_HOME/muyu-host-diag.json 的 clientHello，
        // 从此「UI 是否真的挂上」有服务端铁证，不靠肉眼判断。
        try {
          fetch('/muyu/client-hello', { method: 'POST' }).catch(() => {})
        } catch (err) { /* ignore */ }

        return () => {
          for (const d of disposers) {
            try { d() } catch (err) { /* ignore */ }
          }
        }
      },
    }
  },
})
