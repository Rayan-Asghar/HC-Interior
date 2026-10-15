import { HEROES, OPENING } from './data.js'

// Material Atlas: a full-bleed photographic film. Each scroll chapter is one
// material plate; the next plate arrives through a wall of slats that rise
// column by column. Ken Burns drift keeps the held plate alive.

const CHAPTERS = [{ intro: true, ...OPENING }, ...HEROES]
const N = CHAPTERS.length
const COLS = 14
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x))
const smooth = (x) => x * x * (3 - 2 * x)
const easeOut = (x) => 1 - Math.pow(1 - clamp(x), 3)
const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)

export function mountFilm({ onEnquire }) {
  const film = document.getElementById('film')
  const canvas = document.getElementById('blind')
  const win = document.getElementById('window')
  const copy = document.getElementById('copy')
  const rail = document.getElementById('rail')
  const ctx = canvas.getContext('2d')

  const imgs = CHAPTERS.map((c) => { const im = new Image(); im.src = `/img/${c.plate}.webp`; return im })

  copy.innerHTML = CHAPTERS.map((c, i) => c.intro ? `
    <article class="chap chap-intro" data-i="0">
      <h1>Design Beyond Ordinary</h1>
      <p>HC Interior supplies the floors, walls, ceilings, kitchens, blinds, facades and hospital interiors that make a building work.</p>
      <div class="acts"><a class="btn btn-solid" data-wa href="#" target="_blank" rel="noopener">Request a quote</a><a class="btn btn-line" href="#collections">Browse collections</a></div>
      <span class="hint">Scroll through the materials</span>
    </article>` : `
    <article class="chap" data-i="${i}" aria-hidden="true">
      <h2>${c.name}</h2>
      <p>${c.line}</p>
      <div class="acts"><button class="btn btn-solid" type="button" data-enq="${c.code}">Enquire</button><a class="btn btn-line" href="#rail-${c.collection}">See the collection</a></div>
      <span class="code">${c.code}</span>
    </article>`).join('')
  rail.innerHTML = CHAPTERS.map((c, i) => `<button type="button" data-go="${i}" aria-label="${c.intro ? 'Opening' : c.name}" style="background-image:url(/img/${c.plate}.webp)"></button>`).join('')

  const chaps = [...copy.querySelectorAll('.chap')]
  const ticks = [...rail.querySelectorAll('button')]
  copy.addEventListener('click', (e) => { const b = e.target.closest('[data-enq]'); if (b) onEnquire(b.dataset.enq) })
  rail.addEventListener('click', (e) => { const b = e.target.closest('[data-go]'); if (b) scrollToChapter(+b.dataset.go) })

  const trackMetrics = () => ({ top: film.getBoundingClientRect().top + window.scrollY, span: film.offsetHeight - window.innerHeight })
  function scrollToChapter(i) { const { top, span } = trackMetrics(); window.scrollTo({ top: top + span * (i / (N - 0.0001)) + 2, behavior: 'smooth' }) }

  let vw = 0, vh = 0, dpr = 1
  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.75)
    const r = win.getBoundingClientRect(); vw = r.width; vh = r.height
    canvas.width = Math.max(2, Math.round(vw * dpr)); canvas.height = Math.max(2, Math.round(vh * dpr))
    film.style.height = `${N * 130 + 100}svh`
  }
  size(); new ResizeObserver(size).observe(win)

  let target = 0, cur = 0
  const readScroll = () => { const { top, span } = trackMetrics(); target = clamp((window.scrollY - top) / span) * (N - 0.0001) }
  window.addEventListener('scroll', readScroll, { passive: true }); readScroll(); cur = target

  // cover-fit with focal point, zoom and drift
  function plate(im, c, zoom, drift, x0, y0, w, h) {
    if (!im.complete || !im.naturalWidth) return
    const s = Math.max(w / im.naturalWidth, h / im.naturalHeight) * zoom
    const dw = im.naturalWidth * s, dh = im.naturalHeight * s
    const fx = c.focus ? c.focus[0] : 0.5, fy = c.focus ? c.focus[1] : 0.5
    const ox = clamp(x0 + (w - dw) * fx + drift[0], x0 + w - dw, x0), oy = clamp(y0 + (h - dh) * fy + drift[1], y0 + h - dh, y0)
    ctx.drawImage(im, ox, oy, dw, dh)
  }

  let visible = true, raf = 0
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) raf = requestAnimationFrame(tick) }).observe(film)
  const t0 = performance.now()

  function tick(now) {
    raf = 0
    if (!visible || document.hidden) return
    cur += (target - cur) * 0.12
    if (Math.abs(target - cur) < 0.0004) cur = target
    const c = clamp(cur, 0, N - 0.0001), i = Math.floor(c), k = c - i
    const T = (now - t0) / 1000
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.fillStyle = '#1f1d1b'; ctx.fillRect(0, 0, vw, vh)

    const cutIn = i < N - 1 ? clamp((k - 0.62) / 0.38) : 0   // transition progress to the next plate
    // current plate: slow push-in
    plate(imgs[i], CHAPTERS[i], 1.04 + k * 0.1, [Math.sin(T * 0.2) * 8, -k * 26], 0, 0, vw, vh)
    if (cutIn > 0) {
      const next = i + 1, cw = vw / COLS
      for (let col = 0; col < COLS; col++) {
        const p = easeInOut(clamp(cutIn * 1.6 - (col / COLS) * 0.6))
        if (p <= 0) continue
        const up = true, h = vh * p
        const y = vh - h
        ctx.save(); ctx.beginPath(); ctx.rect(col * cw, y, cw + 0.5, h); ctx.clip()
        plate(imgs[next], CHAPTERS[next], 1.04, [0, 0], 0, 0, vw, vh)
        ctx.restore()
        ctx.fillStyle = 'rgba(184,151,106,.9)'; ctx.fillRect(col * cw, up ? y : y + h - 1, cw, 1)
      }
    }
    // grade: warm shadow, bottom scrim for the caption, soft vignette
    ctx.fillStyle = 'rgba(31,29,27,.22)'; ctx.fillRect(0, 0, vw, vh)
    const g = ctx.createLinearGradient(0, vh * 0.35, 0, vh); g.addColorStop(0, 'rgba(31,29,27,0)'); g.addColorStop(1, 'rgba(31,29,27,.82)')
    ctx.fillStyle = g; ctx.fillRect(0, 0, vw, vh)
    const gl = ctx.createLinearGradient(0, 0, vw * 0.7, 0); gl.addColorStop(0, 'rgba(31,29,27,.55)'); gl.addColorStop(1, 'rgba(31,29,27,0)')
    ctx.fillStyle = gl; ctx.fillRect(0, 0, vw, vh)

    // caption follows the dwell: in during the first 12%, out before the cut
    const vis = smooth(clamp(k / 0.12)) * (i === N - 1 ? 1 : 1 - smooth(clamp((k - 0.5) / 0.12)))
    const visFirst = i === 0 ? 1 - smooth(clamp((k - 0.5) / 0.12)) : vis
    chaps.forEach((el, j) => {
      const on = j === i, o = on ? visFirst : 0
      el.style.opacity = String(o); el.style.transform = `translate3d(0,${(1 - o) * 24}px,0)`
      el.style.pointerEvents = on && o > 0.5 ? 'auto' : 'none'
      if (j) el.setAttribute('aria-hidden', on ? 'false' : 'true')
      el.inert = !on
    })
    const act = cutIn > 0.5 ? i + 1 : i
    ticks.forEach((t, j) => t.classList.toggle('on', j === act))
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
  document.addEventListener('visibilitychange', () => { if (!document.hidden && visible && !raf) raf = requestAnimationFrame(tick) })
}

// Reduced motion: every plate laid out as a static, readable section.
export function mountStatic({ onEnquire }) {
  const host = document.getElementById('staticFilm')
  host.innerHTML = HEROES.map((c) => `
    <article class="s-chap"><img src="/img/${c.plate}.webp" alt="${c.name}" loading="lazy">
      <div><h2>${c.name}</h2><p>${c.line}</p><div class="acts"><button class="btn btn-solid" type="button" data-enq="${c.code}">Enquire</button><a class="btn btn-line" href="#rail-${c.collection}">See the collection</a></div></div></article>`).join('')
  host.addEventListener('click', (e) => { const b = e.target.closest('[data-enq]'); if (b) onEnquire(b.dataset.enq) })
}
