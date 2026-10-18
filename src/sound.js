import { reduced } from './shared.js'

// Sound Proofing film: a scroll-scrubbed canvas. A source sends sound toward a wall; on bare plaster it
// bounces back as an echo (violet), then acoustic slats rise column by column across the wall and take the
// sound in (bronze glow), so the echo and the room level fall away. Scroll sets the state; a slow clock keeps
// the waves alive. Purely illustrative, no measured values.
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x))
const smooth = (x) => x * x * (3 - 2 * x)
const frac = (x) => x - Math.floor(x)
const COLS = 12
const SOUND = '184, 151, 106', ECHO = '168, 150, 196'

export function mountSound(root) {
  const track = root.querySelector('.snd-track'), cv = root.querySelector('canvas'), ctx = cv.getContext('2d')
  const lines = [...root.querySelectorAll('.snd-lines p')], ticks = [...root.querySelectorAll('.snd-prog i')]
  let W = 0, H = 0, dpr = 1, target = 0, cur = 0, raf = 0, visible = false, chapter = -1

  const size = () => {
    dpr = Math.min(window.devicePixelRatio || 1, matchMedia('(max-width: 900px)').matches ? 1.25 : 1.6)
    W = cv.clientWidth; H = cv.clientHeight
    cv.width = Math.max(2, Math.round(W * dpr)); cv.height = Math.max(2, Math.round(H * dpr))
  }
  const read = () => {
    const r = track.getBoundingClientRect(), span = r.height - window.innerHeight
    target = span > 0 ? clamp(-r.top / span) : 0.9
  }

  function draw(p, t) {
    const cov = smooth(clamp((p - 0.3) / 0.42))              // how far the slats have risen
    const refl = (1 - cov) * 0.85                             // echo strength
    const unit = Math.min(W, H * 1.35)
    const sx = W * 0.14, sy = H * 0.5, wallX = W * 0.7, slatW = Math.min(W - wallX, Math.max(W * 0.14, Math.min(W * 0.3, 110)))
    const lam = unit * 0.085, d = wallX - sx
    const ph = p * 4.5 + t * 0.32
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)

    // outside the wall: a quieter, darker side
    ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.fillRect(wallX, 0, W - wallX, H)
    // floor line
    ctx.strokeStyle = 'rgba(245,240,232,0.14)'; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(0, H * 0.92 + 0.5); ctx.lineTo(W, H * 0.92 + 0.5); ctx.stroke()

    // waves: direct from the source, echo from its mirror image across the wall
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, wallX, H); ctx.clip()
    const rmax = d * 1.9
    for (let k = -1; k < rmax / lam + 1; k++) {
      const r = (k + frac(ph)) * lam; if (r <= 0) continue
      const fade = Math.pow(clamp(1 - r / rmax), 1.3)
      ctx.lineWidth = 1.5
      ctx.strokeStyle = `rgba(${SOUND},${(0.7 * fade).toFixed(3)})`
      ctx.beginPath(); ctx.arc(sx, sy, r, 0, 7); ctx.stroke()
      if (refl > 0.01) {
        ctx.strokeStyle = `rgba(${ECHO},${(refl * 0.75 * fade).toFixed(3)})`
        ctx.beginPath(); ctx.arc(2 * wallX - sx, sy, r, 0, 7); ctx.stroke()
      }
    }
    ctx.restore()

    // the wall: bare plaster, then slats rising in front of it
    ctx.fillStyle = '#34312d'; ctx.fillRect(wallX, 0, slatW, H)
    ctx.fillStyle = 'rgba(245,240,232,0.55)'; ctx.fillRect(wallX - 2, 0, 2, H)
    const hit = Math.pow(0.5 + 0.5 * Math.cos(6.2832 * (d / lam - ph)), 3)   // a crest is arriving
    const colW = slatW / COLS, top = H * 0.1, full = H * 0.82
    for (let i = 0; i < COLS; i++) {
      const c = clamp(cov * 1.7 - (i / COLS) * 0.7); if (c <= 0) continue
      const h = full * (1 - Math.pow(1 - c, 3)), x = wallX + i * colW
      const g = 0.5 + 0.5 * hit
      ctx.fillStyle = `rgb(${Math.round(120 + 64 * g)},${Math.round(96 + 55 * g)},${Math.round(60 + 46 * g)})`
      ctx.fillRect(x + 1, top + full - h, colW - 2, h)
      ctx.fillStyle = 'rgba(245,240,232,0.18)'; ctx.fillRect(x + 1, top + full - h, 1, h)
    }

    // source
    const pulse = 0.5 + 0.5 * Math.sin(ph * 6.2832)
    ctx.fillStyle = `rgba(${SOUND},0.18)`; ctx.beginPath(); ctx.arc(sx, sy, 10 + 8 * pulse, 0, 7); ctx.fill()
    ctx.fillStyle = `rgb(${SOUND})`; ctx.beginPath(); ctx.arc(sx, sy, 4.5, 0, 7); ctx.fill()

    // room level meter
    const mw = Math.min(W * 0.34, 220), mx = W * 0.06, my = H * 0.92 + 22 > H ? H - 18 : H * 0.92 + 22
    ctx.fillStyle = 'rgba(245,240,232,0.14)'; ctx.fillRect(mx, my, mw, 3)
    ctx.fillStyle = `rgb(${ECHO})`; ctx.fillRect(mx, my, mw * (0.12 + 0.88 * refl / 0.85), 3)
    ctx.font = '500 12px "Hanken Grotesk", system-ui, sans-serif'; ctx.textBaseline = 'bottom'
    ctx.fillStyle = 'rgba(245,240,232,0.75)'; ctx.fillText('Echo in the room', mx, my - 8)
    ctx.textAlign = 'right'; ctx.fillStyle = `rgba(${SOUND},${(0.35 + 0.65 * cov).toFixed(2)})`
    ctx.fillText(cov > 0.5 ? 'Sound absorbed' : 'Bare wall', wallX + slatW, H * 0.02 + 14); ctx.textAlign = 'left'
  }

  function paintCopy(p) {
    const i = p < 0.28 ? 0 : p < 0.74 ? 1 : 2
    if (i === chapter) return; chapter = i
    lines.forEach((l, j) => l.classList.toggle('on', j === i))
    ticks.forEach((tk, j) => tk.classList.toggle('on', j === i))
  }

  const tick = (now) => {
    cur += (target - cur) * 0.14
    if (Math.abs(target - cur) < 0.0004) cur = target
    draw(cur, now / 1000); paintCopy(cur)
    raf = requestAnimationFrame(tick)
  }
  const run = () => { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(tick) }
  const stop = () => { cancelAnimationFrame(raf); raf = 0 }

  new ResizeObserver(() => { size(); read(); if (reduced) draw(0.9, 0) }).observe(cv)
  size(); read()
  if (reduced) { draw(0.9, 0); lines.forEach((l) => l.classList.add('on')); return }
  cur = target
  addEventListener('scroll', read, { passive: true })
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? run() : stop() }, { rootMargin: '10% 0px' }).observe(root)
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : run()))
}
