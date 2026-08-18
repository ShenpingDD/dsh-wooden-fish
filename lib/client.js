/**
 * 电子木鱼（正式安装版）— Client 半端 v0.2
 *
 * web ModuleLoader bundle 格式：window.__ModuleLoader__.load({ id, factory })。
 * 与动态版不同，安装版是普通浏览器模块，可直接使用 document / fetch / setTimeout。
 * Host 通信走同源 JSON 路由：POST /muyu/knock、GET /muyu/summary。
 *
 * v0.2 修复：
 *  1. 悬停提示常驻渲染（数据未加载时显示 ·），悬停时自动刷新今日次数；
 *  2. 显示/隐藏开关直接读写 store（不依赖组件状态闭包）；
 *  3. 隐藏后悬浮层改为「已隐藏 · 点击恢复」药丸，任何时候都能找回木鱼。
 */
window.__ModuleLoader__.load({
  id: 'wooden-fish-dsh',
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
.dsh-muyu-mini{cursor:pointer;display:inline-block;position:relative;filter:drop-shadow(0 3px 8px rgba(80,50,20,.25))}
.dsh-muyu-mini svg{display:block;width:72px;height:auto;transition:transform .15s ease}
.dsh-muyu-mini:hover svg{transform:translateY(-1px)}
.dsh-muyu-page{display:flex;flex-direction:column;gap:16px;padding:4px 2px;font-family:system-ui,-apple-system,'PingFang SC','Microsoft YaHei',sans-serif}
.dsh-muyu-head{display:flex;align-items:center;gap:14px}
.dsh-muyu-title{font-size:15px;font-weight:600}
.dsh-muyu-sub{font-size:12px;opacity:.62;margin-top:2px}
.dsh-muyu-cards{display:flex;gap:10px;flex-wrap:wrap}
.dsh-muyu-card{flex:1;min-width:110px;background:rgba(139,100,60,.10);border:1px solid rgba(120,90,60,.22);border-radius:12px;padding:12px 14px}
.dsh-muyu-val{font-size:24px;font-weight:700;color:#C98A3B;line-height:1.2}
.dsh-muyu-key{font-size:12px;opacity:.62;margin-top:3px}
.dsh-muyu-range{display:flex;gap:6px}
.dsh-muyu-range button{cursor:pointer;background:rgba(139,100,60,.10);border:1px solid rgba(120,90,60,.25);color:inherit;border-radius:8px;padding:4px 12px;font-size:12px}
.dsh-muyu-range button.dsh-muyu-on{background:#C98A3B;border-color:#C98A3B;color:#fff}
.dsh-muyu-chartbox{display:flex;flex-direction:column}
.dsh-muyu-chart{display:flex;align-items:flex-end;gap:3px;height:130px;padding:8px 2px 0;border-bottom:1px solid rgba(120,90,60,.25)}
.dsh-muyu-bar{flex:1;min-width:4px;border-radius:3px 3px 0 0;background:#C98A3B;position:relative;transition:background .15s}
.dsh-muyu-bar:hover{background:#E8A75A}
.dsh-muyu-zero{background:rgba(120,90,60,.22)}
.dsh-muyu-today{outline:2px solid #E8A75A;outline-offset:1px}
.dsh-muyu-bar::after{content:attr(data-tip);position:absolute;left:50%;bottom:calc(100% + 4px);transform:translateX(-50%);background:rgba(30,20,8,.85);color:#FFE7C2;font-size:11px;padding:3px 7px;border-radius:5px;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .12s;z-index:3}
.dsh-muyu-bar:hover::after{opacity:1}
.dsh-muyu-xlabels{display:flex;gap:3px;margin-top:5px}
.dsh-muyu-xlabels span{flex:1;font-size:10px;opacity:.62;text-align:center;overflow:hidden;white-space:nowrap}
.dsh-muyu-empty{font-size:13px;opacity:.62;padding:40px 0;text-align:center}
.dsh-muyu-toggle{display:flex;align-items:center;gap:10px;margin-top:2px;padding-top:16px;border-top:1px dashed rgba(120,90,60,.25);font-size:13px;cursor:pointer}
.dsh-muyu-bell{font-size:16px}
.dsh-muyu-switch{width:38px;height:21px;border-radius:999px;background:rgba(120,90,60,.22);position:relative;transition:background .2s;flex-shrink:0}
.dsh-muyu-switch::after{content:"";position:absolute;top:2px;left:2px;width:17px;height:17px;border-radius:50%;background:#fff;transition:left .2s;box-shadow:0 1px 3px rgba(0,0,0,.3)}
.dsh-muyu-switch.dsh-muyu-on{background:#C98A3B}
.dsh-muyu-switch.dsh-muyu-on::after{left:19px}
@keyframes dshMuyuShake{0%{transform:rotate(0)}30%{transform:rotate(-6deg) translateY(2px)}60%{transform:rotate(5deg)}100%{transform:rotate(0)}}
@keyframes dshMuyuPop{0%{opacity:0;transform:translateY(4px) scale(.6)}20%{opacity:1;transform:translateY(0) scale(1.15)}100%{opacity:0;transform:translateY(-26px) scale(1)}}
@keyframes dshMuyuRipple{0%{opacity:.9;transform:scale(.5)}100%{opacity:0;transform:scale(2.6)}}
@keyframes dshMuyuBounce{0%{transform:scale(1)}40%{transform:scale(1.35)}100%{transform:scale(1)}}
@media (prefers-color-scheme:dark){.dsh-muyu-card{background:rgba(200,160,110,.08)}.dsh-muyu-val{color:#E8A75A}.dsh-muyu-range button.dsh-muyu-on{background:#E8A75A;border-color:#E8A75A}.dsh-muyu-bar{background:#E8A75A}.dsh-muyu-zero{background:rgba(200,160,110,.16)}.dsh-muyu-today{outline-color:#F2BC7A}}
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

    return {
      name: 'wooden-fish-dsh',
      inject: [],
      apply(ctx) {
        const slots = ctx.get('slots')
        if (slots === undefined) return

        const disposeStyles = insertCSS(CSS)

        const store = {
          visible: true,
          listeners: new Set(),
          setVisible(v) {
            store.visible = v
            store.listeners.forEach((fn) => fn())
          },
          subscribe(fn) {
            store.listeners.add(fn)
            return () => store.listeners.delete(fn)
          },
        }

        function WoodenFishOverlay() {
          const [pos, setPos] = React.useState(null)
          const [hitting, setHitting] = React.useState(false)
          const [popId, setPopId] = React.useState(0)
          const [rippleId, setRippleId] = React.useState(0)
          const [today, setToday] = React.useState(null)
          const [visible, setVisible] = React.useState(store.visible)
          const dragRef = React.useRef(null)
          const hitTimer = React.useRef(null)

          React.useEffect(() => {
            summaryReq().then((r) => setToday(r.today)).catch(() => {})
            return store.subscribe(setVisible)
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
              setPos({ left: Math.max(0, Math.round(d.sl + dx)), top: Math.max(0, Math.round(d.st + dy)) })
            }
          }
          const onPointerUp = (e) => {
            const d = dragRef.current
            if (d && !d.moved) knock()
            dragRef.current = null
            e.currentTarget.classList.remove('dsh-muyu-dragging')
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
            title: '电子木鱼：点我敲一下',
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
          const [range, setRange] = React.useState(14)
          const [hitting, setHitting] = React.useState(false)
          const [visible, setVisible] = React.useState(store.visible)
          const hitTimer = React.useRef(null)

          React.useEffect(() => {
            summaryReq().then(setStats).catch(() => {})
            return store.subscribe(setVisible)
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

          const series = stats ? stats.series.slice(-range) : []
          const hasData = series.some((s) => s.count > 0)
          const max = Math.max(1, ...series.map((s) => s.count))
          const bars = series.map((s, i) =>
            React.createElement('div', {
              key: s.date,
              className: 'dsh-muyu-bar' + (s.count ? '' : ' dsh-muyu-zero') + (i === series.length - 1 ? ' dsh-muyu-today' : ''),
              style: { height: Math.max(2, Math.round((s.count / max) * 108)) + 'px' },
              'data-tip': s.date + ' · ' + s.count + ' 次',
              title: s.date + '：' + s.count + ' 次',
            }),
          )
          const xlabels = series.map((s, i) =>
            React.createElement('span', {
              key: s.date,
              style: i === series.length - 1 ? { color: '#E8A75A' } : undefined,
            }, i % 5 === 0 || i === series.length - 1 ? s.date.slice(5) : '·'),
          )

          return React.createElement('div', { className: 'dsh-muyu-page' },
            React.createElement('div', { className: 'dsh-muyu-head' },
              React.createElement('div', { className: 'dsh-muyu-mini', onClick: knock, title: '点我敲一下' }, fishSvg(hitting, 72)),
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
              [7, 14, 30].map((n) =>
                React.createElement('button', {
                  key: n,
                  className: range === n ? 'dsh-muyu-on' : undefined,
                  onClick: () => setRange(n),
                }, '近 ' + n + ' 天'),
              ),
            ),
            hasData
              ? React.createElement('div', { className: 'dsh-muyu-chartbox' },
                  React.createElement('div', { className: 'dsh-muyu-chart' }, bars),
                  React.createElement('div', { className: 'dsh-muyu-xlabels' }, xlabels),
                )
              : React.createElement('div', { className: 'dsh-muyu-empty' }, '今天还没敲，去点一下木鱼吧'),
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

        return () => {
          for (const d of disposers) {
            try { d() } catch (err) { /* ignore */ }
          }
        }
      },
    }
  },
})
