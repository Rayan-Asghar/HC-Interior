import { reduced } from './shared.js'

// Sliding gallery (after the Interiia reference): bottom-aligned cards drift to the right and grow as they
// travel, so the row always reads as a staircase that rises toward the right. Time-driven, not scroll-driven.
// Card scale is a function of its screen x, so a card swells smoothly as it moves.
const ASPECT = 0.61      // card width / height
const SPEED = 0.4        // cards per second
const GAP = 2            // px between cards
const MIN = 0.735        // scale at the left edge
const RAMP = 0.62        // fraction of the width over which cards reach full size

export function mountGallery(root) {
  const els = [...root.querySelectorAll('img')], n = els.length
  let W = 0, H = 0, off = 0, last = 0, raf = 0, visible = false
  const size = () => { W = root.clientWidth; H = root.clientHeight; els.forEach((el) => { el.style.width = H * ASPECT + 'px'; el.style.height = H + 'px' }) }
  const scale = (x) => MIN + (1 - MIN) * Math.min(1, Math.max(0, x) / (RAMP * W))
  const draw = () => {
    const shown = new Set()
    let i = Math.floor(off), x = -(off - i) * H * MIN * ASPECT
    while (x < W && shown.size < n) {
      const s = scale(x), w = H * ASPECT * s, el = els[((i % n) + n) % n]
      el.style.transform = `translate3d(${x.toFixed(1)}px,0,0) scale(${s.toFixed(4)})`
      el.style.visibility = 'visible'; shown.add(el)
      x += w + GAP; i++
    }
    els.forEach((el) => { if (!shown.has(el)) el.style.visibility = 'hidden' })
  }
  const tick = (t) => {
    const dt = last ? Math.min((t - last) / 1000, 0.1) : 0; last = t
    off -= dt * SPEED; draw()
    raf = requestAnimationFrame(tick)
  }
  const run = () => { if (!raf && visible && !reduced && !document.hidden) { last = 0; raf = requestAnimationFrame(tick) } }
  const stop = () => { cancelAnimationFrame(raf); raf = 0 }
  new ResizeObserver(() => { size(); draw() }).observe(root)
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? run() : stop() }).observe(root)
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : run()))
  size(); draw()
}
