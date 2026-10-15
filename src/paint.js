// Procedural material renders: geometry only (planks, slats, grids, bands).
// These stand in for photography on products we hold no photo of, and are
// labelled synthetic in the page. k = 0..1 build-in progress, T = seconds.

export const C = {
  ink: '#1f1d1b', charcoal: '#2b2927', bronze: '#8c6d46', bronzeLt: '#b8976a',
  wall: '#efeae1', paper: '#f7f4ee', sand: '#d9cfbf',
}

export function rng(seed) {
  let s = seed >>> 0 || 1
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)
}
const ease = (x) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 3)
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x))
function mix(a, b, t) { return a + (b - a) * t }
function hsl(h, s, l) { return `hsl(${h} ${s}% ${l}%)` }
function ground(ctx, w, h, col) { ctx.fillStyle = col; ctx.fillRect(0, 0, w, h) }

function planks(ctx, w, h, { hue, sat, vertical = true, n = 7, seed = 3, k = 1, grain = true }) {
  const r = rng(seed)
  const size = (vertical ? w : h) / n
  for (let i = 0; i < n; i++) {
    const len = (vertical ? h : w)
    let pos = -r() * len * 0.5
    while (pos < len) {
      const seg = len * (0.45 + r() * 0.5)
      const l = 40 + r() * 16
      ctx.fillStyle = hsl(hue + r() * 6, sat, l)
      const prog = ease(k * 1.4 - i * 0.05)
      if (vertical) ctx.fillRect(i * size, pos, size - 1.5, seg * prog)
      else ctx.fillRect(pos, i * size, seg * prog, size - 1.5)
      if (grain) {
        ctx.strokeStyle = hsl(hue, sat, l - 9); ctx.lineWidth = 1; ctx.globalAlpha = 0.35
        for (let g = 0; g < 4; g++) {
          const o = (g + 1) * size / 5 + (r() - 0.5) * 4
          ctx.beginPath()
          if (vertical) { ctx.moveTo(i * size + o, pos); ctx.lineTo(i * size + o + (r() - 0.5) * 6, pos + seg * prog) }
          else { ctx.moveTo(pos, i * size + o); ctx.lineTo(pos + seg * prog, i * size + o + (r() - 0.5) * 6) }
          ctx.stroke()
        }
        ctx.globalAlpha = 1
      }
      pos += seg
    }
  }
}

function slatsV(ctx, w, h, { n = 22, col = C.bronze, gap = '#171615', k = 1, seed = 5 }) {
  const r = rng(seed); const s = w / n
  ground(ctx, w, h, gap)
  for (let i = 0; i < n; i++) {
    const a = ease(k * 1.6 - i / n * 0.6)
    ctx.fillStyle = col
    const l = 0.88 + r() * 0.12
    ctx.globalAlpha = 0.85 + r() * 0.15
    ctx.fillRect(i * s + s * 0.12, h * (1 - a), s * 0.76, h * a * l + h * (1 - l) * 0)
    ctx.globalAlpha = 1
  }
}

function grid(ctx, w, h, cols, rows, fn) {
  const cw = w / cols, ch = h / rows
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) fn(x * cw, y * ch, cw, ch, x, y)
}

function circle(ctx, x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2) }

function blindBands(ctx, w, h, n, a, b) {
  const bh = h / n
  for (let i = 0; i < n; i++) { ctx.fillStyle = i % 2 ? a : b; ctx.fillRect(0, i * bh, w, bh + 0.5) }
}

export const PAINT = {
  wood(ctx, w, h, c) { ground(ctx, w, h, '#b18a5a'); planks(ctx, w, h, { hue: 30, sat: 42, k: c.k, seed: 7 }) },
  spc(ctx, w, h, c) { ground(ctx, w, h, '#8f8b84'); planks(ctx, w, h, { hue: 28, sat: 8, n: 6, seed: 11, k: c.k, vertical: false }) },
  deck(ctx, w, h, c) { ground(ctx, w, h, '#2b2927'); planks(ctx, w, h, { hue: 22, sat: 24, n: 9, seed: 5, k: c.k, grain: false }) },
  decktile(ctx, w, h, c) {
    ground(ctx, w, h, '#2b2927')
    grid(ctx, w, h, 2, 3, (x, y, cw, ch, i, j) => {
      ctx.save(); ctx.beginPath(); ctx.rect(x + 3, y + 3, cw - 6, ch - 6); ctx.clip()
      ctx.translate(x, y); planks(ctx, cw, ch, { hue: 24, sat: 30, n: 6, seed: i * 3 + j, k: c.k, vertical: (i + j) % 2 === 0, grain: false }); ctx.restore()
    })
  },
  vinyl(ctx, w, h, c) {
    ground(ctx, w, h, '#9db4b8'); const r = rng(9); const n = 520 * c.k
    for (let i = 0; i < n; i++) { ctx.fillStyle = ['#e9efef', '#6f8e97', '#cfdcdd', '#5b7780'][i % 4]; ctx.fillRect(r() * w, r() * h, 2 + r() * 4, 1.5 + r() * 3) }
  },
  carpet(ctx, w, h, c) {
    grid(ctx, w, h, 4, 5, (x, y, cw, ch, i, j) => {
      ctx.fillStyle = (i + j) % 2 ? '#4b5057' : '#5d646b'; ctx.fillRect(x + 1, y + 1, cw - 2, ch - 2)
      ctx.strokeStyle = 'rgba(255,255,255,.08)'
      for (let l = 0; l < ch; l += 5) { ctx.beginPath(); ctx.moveTo(x + 2, y + l); ctx.lineTo(x + cw - 2, y + l); ctx.stroke() }
    })
  },
  raised(ctx, w, h, c) {
    ground(ctx, w, h, '#c9c6c0')
    grid(ctx, w, h, 4, 5, (x, y, cw, ch) => { ctx.strokeStyle = '#8f8b84'; ctx.strokeRect(x + 1, y + 1, cw - 2, ch - 2); ctx.fillStyle = '#6a6862'; circle(ctx, x, y, 4); ctx.fill() })
  },
  gym(ctx, w, h, c) {
    grid(ctx, w, h, 3, 4, (x, y, cw, ch, i, j) => { ctx.fillStyle = (i + j) % 2 ? '#2b2927' : '#b04a3a'; ctx.fillRect(x + 1, y + 1, cw - 2, ch - 2); ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.strokeRect(x + 6, y + 6, cw - 12, ch - 12) })
  },
  grass(ctx, w, h, c) {
    ground(ctx, w, h, '#3d5a2c'); const r = rng(2)
    for (let i = 0; i < 1300 * c.k; i++) {
      const x = r() * w, y = r() * h, l = 10 + r() * 18
      ctx.strokeStyle = hsl(95 + r() * 20, 45, 30 + r() * 22); ctx.lineWidth = 1.2
      ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + (r() - 0.5) * 8, y - l / 2, x + (r() - 0.5) * 12, y - l); ctx.stroke()
    }
  },
  fluted(ctx, w, h, c) {
    const n = 14; const s = w / n; ground(ctx, w, h, '#6f5a43')
    for (let i = 0; i < n; i++) {
      const g = ctx.createLinearGradient(i * s, 0, (i + 1) * s, 0)
      g.addColorStop(0, '#3a2f24'); g.addColorStop(0.35, '#a88a64'); g.addColorStop(0.7, '#8c6d46'); g.addColorStop(1, '#3a2f24')
      ctx.fillStyle = g; const o = (1 - ease(c.k * 1.5 - i * 0.04)) * h * 0.4
      ctx.fillRect(i * s, o, s - 0.5, h)
    }
  },
  pvcpanel(ctx, w, h) {
    ground(ctx, w, h, '#e7e3dc'); const n = 6
    for (let i = 0; i < n; i++) { ctx.fillStyle = i % 2 ? '#dcd7ce' : '#e9e5de'; ctx.fillRect(i * w / n + 2, 0, w / n - 4, h); ctx.fillStyle = '#b5ad9f'; ctx.fillRect(i * w / n - 1, 0, 3, h) }
  },
  spcsheet(ctx, w, h) {
    ground(ctx, w, h, '#a39e96'); const r = rng(14)
    for (let i = 0; i < 26; i++) { ctx.strokeStyle = `rgba(40,38,34,${0.08 + r() * 0.12})`; ctx.lineWidth = 1 + r() * 2; ctx.beginPath(); ctx.moveTo(r() * w, 0); ctx.bezierCurveTo(r() * w, h * 0.3, r() * w, h * 0.6, r() * w, h); ctx.stroke() }
    ctx.strokeStyle = 'rgba(0,0,0,.2)'; ctx.strokeRect(w / 2, 0, 0, h)
  },
  uv(ctx, w, h, c) {
    const g = ctx.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#2b2927'); g.addColorStop(0.5, '#4a443d'); g.addColorStop(1, '#1f1d1b')
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
    const s = ctx.createLinearGradient(0, 0, w, h); const p = (c.k * 1.2) % 1.2 - 0.1
    s.addColorStop(clamp(p - 0.12), 'rgba(255,255,255,0)'); s.addColorStop(clamp(p), 'rgba(255,255,255,.35)'); s.addColorStop(clamp(p + 0.12), 'rgba(255,255,255,0)')
    ctx.fillStyle = s; ctx.fillRect(0, 0, w, h)
  },
  gypsum(ctx, w, h, c) {
    ground(ctx, w, h, '#ece8e1'); ctx.fillStyle = '#d6d0c4'; ctx.fillRect(w * 0.12, h * 0.12, w * 0.76, h * 0.76)
    ctx.fillStyle = '#ece8e1'; ctx.fillRect(w * 0.18, h * 0.18, w * 0.64, h * 0.64)
    const g = ctx.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w * 0.4); g.addColorStop(0, 'rgba(255,238,200,.9)'); g.addColorStop(1, 'rgba(255,238,200,0)')
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h); ctx.fillStyle = '#fff'; circle(ctx, w / 2, h / 2, 7); ctx.fill()
  },
  dampa(ctx, w, h) {
    ground(ctx, w, h, '#f1efea'); ctx.strokeStyle = '#c7c2b8'; const n = 4
    grid(ctx, w, h, n, n + 1, (x, y, cw, ch) => { ctx.strokeRect(x, y, cw, ch); ctx.fillStyle = '#d4cfc4'; for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) { circle(ctx, x + (i + 0.7) * cw / 6.4, y + (j + 0.7) * ch / 6.4, 1.2); ctx.fill() } })
  },
  moulding(ctx, w, h) {
    ground(ctx, w, h, '#efeae1')
    const g = ctx.createLinearGradient(0, 0, 0, h * 0.4); g.addColorStop(0, '#fff'); g.addColorStop(1, '#cfc7b8')
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(w, 0); ctx.lineTo(w, h * 0.18); ctx.quadraticCurveTo(w * 0.5, h * 0.5, 0, h * 0.18); ctx.fill()
    ctx.fillStyle = '#d6cdbd'; ctx.fillRect(0, h * 0.82, w, h * 0.18); ctx.fillStyle = '#cfc7b8'; ctx.fillRect(0, h * 0.8, w, 4)
  },
  wallpaper(ctx, w, h) {
    ground(ctx, w, h, '#d8c8b0'); ctx.strokeStyle = '#8c6d46'; ctx.lineWidth = 1.5
    grid(ctx, w, h, 4, 5, (x, y, cw, ch, i, j) => { const cx = x + cw / 2, cy = y + ch / 2 + (i % 2) * ch / 2 - ch / 4; for (let r = 4; r <= 20; r += 8) { ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI, 0); ctx.stroke() } })
  },
  picture(ctx, w, h) {
    ground(ctx, w, h, '#e8e2d6'); ctx.fillStyle = '#d6cdbd'; ctx.fillRect(w * 0.14, h * 0.12, w * 0.72, h * 0.76)
    ctx.fillStyle = '#e6c9a0'; ctx.fillRect(w * 0.18, h * 0.16, w * 0.64, h * 0.68)
    ctx.fillStyle = '#8c6d46'; ctx.beginPath(); ctx.moveTo(w * 0.18, h * 0.84); ctx.lineTo(w * 0.42, h * 0.45); ctx.lineTo(w * 0.62, h * 0.7); ctx.lineTo(w * 0.72, h * 0.55); ctx.lineTo(w * 0.82, h * 0.84); ctx.fill()
    ctx.fillStyle = '#2b2927'; ctx.beginPath(); ctx.moveTo(w * 0.18, h * 0.84); ctx.lineTo(w * 0.34, h * 0.62); ctx.lineTo(w * 0.52, h * 0.84); ctx.fill()
    ctx.fillStyle = '#fff4dc'; circle(ctx, w * 0.68, h * 0.3, w * 0.06); ctx.fill()
  },
  media(ctx, w, h) {
    ground(ctx, w, h, '#2b2927'); ctx.fillStyle = '#111'; ctx.fillRect(w * 0.2, h * 0.2, w * 0.6, h * 0.34)
    ctx.fillStyle = '#3a3733'; ctx.fillRect(w * 0.2, h * 0.64, w * 0.28, h * 0.22); ctx.fillRect(w * 0.52, h * 0.64, w * 0.28, h * 0.22)
    ctx.fillStyle = '#b8976a'; ctx.fillRect(w * 0.1, h * 0.58, w * 0.8, 3)
  },
  partition(ctx, w, h) {
    ground(ctx, w, h, '#e4e0d8'); ctx.fillStyle = '#c4beb2'; for (let i = 0; i <= 4; i++) ctx.fillRect(i * (w - 6) / 4, 0, 6, h)
    ctx.fillStyle = '#aaa396'; ctx.fillRect(0, h * 0.35, w, 3); ctx.fillRect(0, h * 0.7, w, 3)
  },
  door(ctx, w, h) {
    ground(ctx, w, h, '#dcd7ce'); ctx.fillStyle = '#8c6d46'; ctx.fillRect(w * 0.18, h * 0.08, w * 0.64, h * 0.9)
    ctx.fillStyle = '#a58259'; for (let i = 0; i < 4; i++) ctx.fillRect(w * 0.18 + i * w * 0.16, h * 0.08, w * 0.15, h * 0.9)
    ctx.fillStyle = '#2b2927'; ctx.fillRect(w * 0.7, h * 0.5, 4, 22)
  },
  curtain(ctx, w, h, c) {
    ground(ctx, w, h, '#e9e4da'); const n = 9
    for (let i = 0; i < n; i++) {
      const x0 = i * w / n; const g = ctx.createLinearGradient(x0, 0, x0 + w / n, 0)
      g.addColorStop(0, '#6b7f8a'); g.addColorStop(0.5, '#a9bcc4'); g.addColorStop(1, '#6b7f8a')
      ctx.fillStyle = g; ctx.fillRect(x0, h * 0.06, w / n, h * 0.94 * ease(c.k * 1.4 - i * 0.04))
    }
    ctx.fillStyle = '#2b2927'; ctx.fillRect(0, h * 0.04, w, 4)
  },
  zebra(ctx, w, h, c) {
    ground(ctx, w, h, '#f1ede5'); const n = 12; const bh = h / n
    for (let i = 0; i < n; i++) { ctx.fillStyle = '#2b2927'; ctx.fillRect(0, i * bh + bh * 0.5 * (1 - c.k), w, bh * 0.5 * (0.45 + 0.55 * (1 - c.k))) }
  },
  roller(ctx, w, h, c) {
    ground(ctx, w, h, '#ece8e0'); ctx.fillStyle = '#c9c3b7'; ctx.fillRect(0, 0, w, h * 0.78 * ease(c.k * 1.3 + 0.2))
    ctx.fillStyle = '#2b2927'; ctx.fillRect(0, 0, w, 10); ctx.fillStyle = '#8c6d46'; ctx.fillRect(0, h * 0.78 * ease(c.k * 1.3 + 0.2), w, 5)
  },
  woodblind(ctx, w, h) {
    ground(ctx, w, h, '#e9e4da'); const n = 16; const bh = h / n
    for (let i = 0; i < n; i++) { const g = ctx.createLinearGradient(0, i * bh, 0, (i + 1) * bh); g.addColorStop(0, '#c8a374'); g.addColorStop(1, '#8c6d46'); ctx.fillStyle = g; ctx.fillRect(0, i * bh + 1, w, bh - 3) }
  },
  horizontal(ctx, w, h) {
    ground(ctx, w, h, '#e9e4da'); const n = 22; const bh = h / n
    for (let i = 0; i < n; i++) { ctx.fillStyle = '#d4d0c8'; ctx.fillRect(0, i * bh + 1, w, bh * 0.6); ctx.fillStyle = '#a9a398'; ctx.fillRect(0, i * bh + bh * 0.6 + 1, w, 2) }
  },
  chick(ctx, w, h) {
    ground(ctx, w, h, '#c9a56f'); const r = rng(12)
    for (let i = 0; i < 60; i++) { ctx.strokeStyle = r() > 0.5 ? '#a98550' : '#dcbd8a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(i * w / 60, 0); ctx.lineTo(i * w / 60, h); ctx.stroke() }
    ctx.strokeStyle = '#6b5236'; for (let y = 0.2; y < 1; y += 0.3) { ctx.beginPath(); ctx.moveTo(0, h * y); ctx.lineTo(w, h * y); ctx.stroke() }
  },
  acp(ctx, w, h, c) {
    const cols = ['#b82f2a', '#2b2927', '#efeae1', '#d9a53a', '#3d7f86', '#6a6f78', '#7d2f2c', '#c9c3b7']; const r = rng(4)
    grid(ctx, w, h, 4, 5, (x, y, cw, ch, i, j) => { const f = ease(c.k * 1.6 - (i + j) * 0.09); ctx.fillStyle = cols[Math.floor(r() * cols.length)]; ctx.fillRect(x + 1.5 + cw * (1 - f) / 2, y + 1.5, (cw - 3) * f, ch - 3) })
  },
  kitchen(ctx, w, h, c) {
    ground(ctx, w, h, '#e9e4da'); const o = ease(c.k * 1.3)
    ctx.fillStyle = '#2b2927'; ctx.fillRect(w * 0.06, h * 0.12, w * 0.88, h * 0.26)
    for (let i = 0; i < 4; i++) { ctx.fillStyle = i % 2 ? '#3a3733' : '#4a443d'; ctx.fillRect(w * 0.07 + i * w * 0.218, h * 0.13, w * 0.21, h * 0.24 * (0.6 + 0.4 * o)) }
    ctx.fillStyle = '#b8976a'; ctx.fillRect(w * 0.06, h * 0.56, w * 0.88, 6)
    for (let i = 0; i < 4; i++) { ctx.fillStyle = i % 2 ? '#8c6d46' : '#a58259'; ctx.fillRect(w * 0.07 + i * w * 0.218, h * 0.58, w * 0.21, h * 0.36); ctx.fillStyle = '#efeae1'; ctx.fillRect(w * 0.07 + i * w * 0.218 + w * 0.08, h * 0.6, w * 0.05, 3) }
  },
  wardrobe(ctx, w, h) {
    ground(ctx, w, h, '#e4dfd5'); for (let i = 0; i < 3; i++) { ctx.fillStyle = i === 1 ? '#8c6d46' : '#3a3733'; ctx.fillRect(w * 0.08 + i * w * 0.28, h * 0.06, w * 0.27, h * 0.9); ctx.fillStyle = '#efeae1'; ctx.fillRect(w * 0.08 + i * w * 0.28 + w * 0.2, h * 0.45, 3, h * 0.12) }
  },
  sound(ctx, w, h, c) {
    slatsV(ctx, w, h, { n: 14, col: '#a07c52', gap: '#262321', k: c.k })
    ctx.strokeStyle = 'rgba(239,234,225,.55)'; ctx.lineWidth = 1.5
    for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.arc(0, h / 2, i * w * 0.14 * c.k, -0.9, 0.9); ctx.stroke() }
  },
  ot(ctx, w, h) {
    ground(ctx, w, h, '#e8f0f2'); ctx.fillStyle = '#2f7f9a'; ctx.fillRect(0, h * 0.72, w, h * 0.28)
    ctx.fillStyle = '#fff'; circle(ctx, w * 0.5, h * 0.22, w * 0.15); ctx.fill(); ctx.strokeStyle = '#b4c6cc'; ctx.stroke()
    ctx.fillStyle = '#cfe0e5'; for (let i = 0; i < 7; i++) { circle(ctx, w * 0.5 + Math.cos(i) * w * 0.08, h * 0.22 + Math.sin(i) * w * 0.08, w * 0.025); ctx.fill() }
    ctx.fillStyle = '#c4d3d8'; ctx.fillRect(w * 0.25, h * 0.58, w * 0.5, h * 0.06)
  },
  epoxy(ctx, w, h) {
    const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#6fb0d0'); g.addColorStop(1, '#2f7f9a'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
    const s = ctx.createRadialGradient(w * 0.35, h * 0.35, 4, w * 0.35, h * 0.35, w * 0.4); s.addColorStop(0, 'rgba(255,255,255,.7)'); s.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = s; ctx.fillRect(0, 0, w, h)
  },
  panel(ctx, w, h) {
    ground(ctx, w, h, '#e9eef0'); for (let i = 0; i < 3; i++) { ctx.fillStyle = '#fff'; ctx.fillRect(w * 0.08, h * (0.14 + i * 0.28), w * 0.84, h * 0.2); ctx.fillStyle = '#2f7f9a'; ctx.fillRect(w * 0.3, h * (0.2 + i * 0.28), w * 0.4, h * 0.05); ctx.fillStyle = '#c9a23a'; circle(ctx, w * 0.16, h * (0.24 + i * 0.28), 6); ctx.fill() }
  },
  handrail(ctx, w, h) {
    ground(ctx, w, h, '#efeae1'); ctx.fillStyle = '#b8976a'; ctx.fillRect(0, h * 0.4, w, h * 0.1); ctx.fillStyle = '#8c6d46'; ctx.fillRect(0, h * 0.5, w, 5); ctx.fillStyle = '#cdd5d8'; ctx.fillRect(0, h * 0.8, w, h * 0.2)
  },
  guard(ctx, w, h) {
    ground(ctx, w, h, '#efeae1'); ctx.fillStyle = '#4a4540'; ctx.fillRect(w * 0.44, 0, w * 0.12, h); ctx.fillStyle = '#6a645c'; ctx.fillRect(w * 0.4, h * 0.4, w * 0.2, h * 0.08)
  },
  tactile(ctx, w, h) {
    ground(ctx, w, h, '#d8c34a'); ctx.fillStyle = '#a28f1a'; grid(ctx, w, h, 7, 9, (x, y, cw, ch) => { circle(ctx, x + cw / 2, y + ch / 2, Math.min(cw, ch) * 0.28); ctx.fill() })
  },
}

// ---------- film scenes (animated, drawn into the blind window) ----------
// Each draws a full-window scene. k: 0..1 chapter-local, T: seconds.
export const SCENES = {
  intro(ctx, w, h, k, T) {
    ground(ctx, w, h, C.wall)
    const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#f6f2ea'); g.addColorStop(1, '#ddd3c1'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
    // skyline from the logo's rhythm: solid blocks with slim fins
    const base = h * 0.78; const u = w / 22; const r = rng(21)
    const towers = [[3, 7, 0.34], [6, 3, 0.2], [9, 5, 0.5], [13, 3, 0.26], [16, 4, 0.38]]
    towers.forEach(([x, wd, th], i) => {
      const a = ease(k * 2 + 0.7 - i * 0.12)
      const th2 = h * th * a * 1.5
      ctx.fillStyle = C.charcoal; ctx.fillRect(x * u, base - th2, wd * u * 0.34, th2)
      for (let f = 1; f < 5; f++) { ctx.fillRect(x * u + wd * u * 0.34 + f * wd * u * 0.13, base - th2 * (1 - f * 0.05), wd * u * 0.045, th2 * (1 - f * 0.05)) }
    })
    ctx.strokeStyle = C.charcoal; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(w * 0.05, base + 18); ctx.quadraticCurveTo(w * 0.5, base - 30, w * 0.95, base + 18); ctx.stroke()
    ctx.fillStyle = C.charcoal; ctx.beginPath(); ctx.moveTo(w * 0.34, base + 60); ctx.lineTo(w * 0.48, base - 12); ctx.lineTo(w * 0.62, base + 60); ctx.closePath(); ctx.fill()
    ctx.fillStyle = C.wall; ctx.fillRect(w * 0.455, base + 18, 20, 20); ctx.fillStyle = C.charcoal; ctx.fillRect(w * 0.455 + 9, base + 18, 2, 20); ctx.fillRect(w * 0.455, base + 27, 20, 2)
    ctx.fillStyle = C.bronze; ctx.fillRect(0, base + 62, w, h - base - 62)
  },
  sound(ctx, w, h, k, T) {
    ground(ctx, w, h, '#ebe5d9')
    const wallX = w * 0.55; const n = 18; const s = (w - wallX) / n; const r = rng(31)
    for (let i = 0; i < n; i++) {
      const a = ease(k * 2 - i * 0.03); const hh = h * (0.7 + r() * 0.25)
      ctx.fillStyle = i % 3 === 0 ? '#7a5c38' : '#a07c52'; ctx.fillRect(wallX + i * s + 2, h * 0.5 - hh / 2, (s - 4) * a, hh)
    }
    ctx.fillStyle = '#262321'; ctx.fillRect(wallX - 8, 0, 6, h)
    // source and waves, strong before the wall, nearly gone after it
    const sx = w * 0.14, sy = h * 0.5
    ctx.fillStyle = C.charcoal; circle(ctx, sx, sy, 10 + Math.sin(T * 8) * 2); ctx.fill()
    for (let i = 0; i < 9; i++) {
      const rad = (i * 62 + T * 90) % (wallX - sx + 40)
      const al = Math.max(0, 0.7 - rad / (wallX - sx + 40) * 0.5)
      ctx.strokeStyle = `rgba(43,41,39,${al})`; ctx.lineWidth = 2
      ctx.beginPath(); ctx.arc(sx, sy, rad, -1.1, 1.1); ctx.stroke()
    }
    ctx.strokeStyle = 'rgba(140,109,70,.55)'; ctx.lineWidth = 1.5
    for (let i = 0; i < 3; i++) { const rad = (i * 40 + T * 40) % 120; ctx.beginPath(); ctx.arc(wallX + 8, sy, rad * 0.5, -0.5, 0.5); ctx.globalAlpha = 0.5 - rad / 300; ctx.stroke(); ctx.globalAlpha = 1 }
  },
  floor(ctx, w, h, k, T) {
    ground(ctx, w, h, '#e9e3d6'); const hz = h * 0.34; const vx = w * 0.5
    ctx.fillStyle = '#ddd5c4'; ctx.fillRect(0, 0, w, hz)
    ctx.save(); ctx.beginPath(); ctx.rect(0, hz, w, h - hz); ctx.clip()
    const r = rng(8); const rows = 16
    for (let i = 0; i < rows; i++) {
      const t0 = Math.pow(i / rows, 1.7), t1 = Math.pow((i + 1) / rows, 1.7)
      const y0 = hz + (h - hz) * t0, y1 = hz + (h - hz) * t1
      const plank = 8
      for (let j = -plank; j < plank * 2; j++) {
        const xa = (j / plank) * w
        const run = Math.floor((i + (((j % 5) + 5) % 5) * 3) / 7)
        const q = rng(j * 131 + run * 17 + 5)
        const shade = 40 + q() * 13
        const x0 = vx + (xa - vx) * (0.15 + t0 * 0.85), x1 = vx + (xa + w / plank - vx) * (0.15 + t0 * 0.85)
        const x2 = vx + (xa + w / plank - vx) * (0.15 + t1 * 0.85), x3 = vx + (xa - vx) * (0.15 + t1 * 0.85)
        ctx.fillStyle = hsl(30 + q() * 5, 44, shade)
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y0); ctx.lineTo(x2, y1); ctx.lineTo(x3, y1); ctx.fill()
        ctx.strokeStyle = 'rgba(0,0,0,.22)'; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x3, y1); ctx.stroke()
      }
          }
    const sweep = clamp(k * 1.2 - 0.1); const sx = -w * 0.3 + sweep * w * 1.6
    const g = ctx.createLinearGradient(sx - 160, 0, sx + 160, 0); g.addColorStop(0, 'rgba(255,240,205,0)'); g.addColorStop(0.5, 'rgba(255,240,205,.5)'); g.addColorStop(1, 'rgba(255,240,205,0)')
    ctx.fillStyle = g; ctx.fillRect(0, hz, w, h)
    ctx.restore()
    ctx.fillStyle = '#f3efe8'; ctx.fillRect(0, hz - 14, w, 14)
  },
  wall(ctx, w, h, k, T) {
    ground(ctx, w, h, '#4a3d2f'); const n = 26; const s = w / n
    for (let i = 0; i < n; i++) {
      const g = ctx.createLinearGradient(i * s, 0, (i + 1) * s, 0)
      const l = clamp(0.5 + Math.sin(T * 0.6 + i * 0.12) * 0.1)
      g.addColorStop(0, '#2d241b'); g.addColorStop(0.3 + l * 0.2, '#b79566'); g.addColorStop(0.7, '#8c6d46'); g.addColorStop(1, '#2d241b')
      ctx.fillStyle = g; const o = (1 - ease(k * 2.2 - i * 0.035)) * h * 0.6
      ctx.fillRect(i * s, o, s - 0.6, h)
    }
    ctx.fillStyle = C.bronzeLt; ctx.fillRect(0, h * 0.7, w, 6); ctx.fillStyle = '#1f1d1b'; ctx.fillRect(0, h * 0.7 + 6, w, h)
  },
  kitchen(ctx, w, h, k, T) {
    ground(ctx, w, h, '#ece6da'); ctx.fillStyle = '#d9d0bf'; ctx.fillRect(0, h * 0.9, w, h)
    const o = ease(k * 2)
    // wall units
    const nU = 5, uw = w * 0.84 / nU, x0 = w * 0.08
    for (let i = 0; i < nU; i++) {
      ctx.fillStyle = '#2b2927'; ctx.fillRect(x0 + i * uw, h * 0.1, uw - 4, h * 0.28)
      ctx.fillStyle = i % 2 ? '#4a443d' : '#3a3733'
      const open = i === 2 ? Math.sin(T * 1.4) * 0.5 + 0.5 : 0
      ctx.fillRect(x0 + i * uw + 4, h * 0.11, (uw - 12) * (1 - open * 0.55), h * 0.26 * o)
      ctx.fillStyle = C.bronzeLt; ctx.fillRect(x0 + i * uw + uw * 0.72, h * 0.34 * o, 3, h * 0.025)
    }
    ctx.fillStyle = '#9a9488'; ctx.fillRect(w * 0.4, h * 0.38, w * 0.2, h * 0.09 * o) // hood stub
    ctx.fillStyle = C.charcoal; ctx.fillRect(x0 - 8, h * 0.58, w * 0.84 + 16, 14)
    for (let i = 0; i < nU; i++) {
      ctx.fillStyle = i % 2 ? '#a58259' : '#8c6d46'; ctx.fillRect(x0 + i * uw, h * 0.58 + 14, uw - 4, h * 0.32 * o)
      ctx.fillStyle = '#efeae1'; ctx.fillRect(x0 + i * uw + uw * 0.3, h * 0.58 + 26, uw * 0.3, 3)
    }
    ctx.strokeStyle = '#7f786c'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(w * 0.7, h * 0.58); ctx.quadraticCurveTo(w * 0.7, h * 0.5, w * 0.74, h * 0.5); ctx.stroke()
  },
  acp(ctx, w, h, k, T) {
    ground(ctx, w, h, '#dcd7ce'); const cols = ['#b82f2a', '#2b2927', '#efeae1', '#d9a53a', '#3d7f86', '#6a6f78', '#7d2f2c', '#c9c3b7']
    const r = rng(41); const cw = w / 7, ch = h / 8
    for (let y = 0; y < 8; y++) for (let x = 0; x < 7; x++) {
      const f = ease(k * 2.4 - (x + y) * 0.09)
      ctx.fillStyle = cols[Math.floor(r() * cols.length)]
      ctx.fillRect(x * cw + 2 + cw * (1 - f) / 2, y * ch + 2, (cw - 4) * f, ch - 4)
    }
    const sh = ctx.createLinearGradient(0, 0, w, h); const p = (T * 0.12) % 1.4 - 0.2
    sh.addColorStop(clamp(p - 0.1), 'rgba(255,255,255,0)'); sh.addColorStop(clamp(p), 'rgba(255,255,255,.22)'); sh.addColorStop(clamp(p + 0.1), 'rgba(255,255,255,0)')
    ctx.fillStyle = sh; ctx.fillRect(0, 0, w, h)
  },
  ot(ctx, w, h, k, T, img) {
    ground(ctx, w, h, '#e8f0f2')
    if (img && img.complete && img.naturalWidth) {
      const s = Math.max(w / img.naturalWidth, h / img.naturalHeight) * (1.04 + k * 0.08)
      const dw = img.naturalWidth * s, dh = img.naturalHeight * s
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh)
    }
  },
}
