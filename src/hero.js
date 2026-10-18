import { SECTORS } from './data.js'
import gsap from 'gsap'
import { mountFilm, mountStatic } from './film.js'

// Three ways to open the landing page. `still` is the default; `reel` and
// `film` are reachable with ?hero=reel and ?hero=film so they can be compared.
//   still : three sector slats, one open at a time. Nothing hijacks the scroll.
//   reel  : full-bleed autoplay loop of the room photos with a slat wipe. Has a pause button.
//   film  : the original scroll-scrubbed canvas film (src/film.js), unchanged except for copy.

const LEAD = 'Stunning places to live, work and heal. Floors, walls, ceilings, kitchens, blinds, facades and healthcare interiors, supplied and fitted.'

const STRIP = [['Showroom', 'Islamabad'], ['We supply', 'Floors, walls & ceilings'], ['Speciality', 'Homes, offices & hospitals'], ['Collections', 'Eight, and 40+ products']]
const intro = (cls = '') => `
  <div class="hero-copy ${cls}">
    <h1>Design Beyond Ordinary</h1>
    <div class="hero-side">
      <p>${LEAD}</p>
      <div class="acts"><a class="slat-go" href="#collections">View collections</a></div>
    </div>
    <dl class="strip">${STRIP.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
  </div>`

function mountStill(host, fx = '') {
  host.innerHTML = `<section class="hero hero-still" aria-label="Who we supply">
    ${intro()}
    <ul class="sectors" id="sectors">
      ${SECTORS.map((s, i) => `<li class="sector${i === 0 ? ' on' : ''}" style="--focus:${s.focus}">
        <a href="${s.href}"><img src="/img/${s.img}.webp" alt="" ${i ? 'loading="lazy"' : 'fetchpriority="high"'}>
          <span class="sector-label"><small>0${i + 1}</small><b>${s.name}</b><span>${s.line}</span><em>See the collection</em></span></a>
      </li>`).join('')}
    </ul>
  </section>`
  const items = [...host.querySelectorAll('.sector')]
  let cur = 0, hold = false, timer = 0
  const set = (i) => { cur = i; items.forEach((el, j) => el.classList.toggle('on', j === i)) }
  const start = () => { clearInterval(timer); if (!matchMedia('(prefers-reduced-motion: reduce)').matches) timer = setInterval(() => { if (!hold && !document.hidden) set((cur + 1) % items.length) }, 5000) }
  items.forEach((el, i) => {
    el.addEventListener('pointerenter', () => { hold = true; set(i) })
    el.addEventListener('pointerleave', () => { hold = false })
    el.addEventListener('focusin', () => { hold = true; set(i) })
    el.addEventListener('focusout', () => { hold = false })
  })
  start()
  if (fx && !matchMedia('(prefers-reduced-motion: reduce)').matches) FX[fx]?.(host)
}

// ---- motion prototypes for the first section (?hero=rise | drift | light) ----
const FX = {
  // A. page-load choreography: headline words rise out of a mask, a bronze rule draws, slats unfold
  rise(host) {
    const h1 = host.querySelector('h1')
    h1.innerHTML = h1.textContent.split(' ').map((w) => `<span class="w"><span>${w}</span></span>`).join(' ')
    const rule = document.createElement('i'); rule.className = 'rule'; host.querySelector('.hero-copy').append(rule)
    const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
    tl.from('.w > span', { yPercent: 110, duration: 1.2, stagger: 0.09 })
      .from(rule, { scaleX: 0, transformOrigin: 'left', duration: 1.4 }, 0.2)
      .from('.hero-side > *', { y: 20, opacity: 0, duration: 1, stagger: 0.1 }, 0.5)
      .from('.sector', { clipPath: 'inset(100% 0 0 0)', duration: 1.4, stagger: 0.16 }, 0.3)
      .from('.sector img', { scale: 1.3, duration: 2.2 }, 0.3)
  },
  // B. cursor parallax: photos and headline drift a few pixels against the pointer
  drift(host) {
    const imgs = [...host.querySelectorAll('.sector img')], h1 = host.querySelector('h1')
    const qx = imgs.map((el) => gsap.quickTo(el, 'x', { duration: 1.2, ease: 'power3.out' }))
    const qy = imgs.map((el) => gsap.quickTo(el, 'y', { duration: 1.2, ease: 'power3.out' }))
    const hx = gsap.quickTo(h1, 'x', { duration: 1.4, ease: 'power3.out' })
    host.addEventListener('pointermove', (e) => {
      const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5
      qx.forEach((f) => f(nx * -22)); qy.forEach((f) => f(ny * -14)); hx(nx * 14)
    })
    imgs.forEach((el) => gsap.set(el, { scale: 1.1 }))
  },
  // C. light through slats: faint vertical blind lines with a slow band of light crossing the headline area
  light(host) { host.querySelector('.hero-copy').classList.add('light') },
}

// Default: the tri-vision slat wall (WebGL). Falls back to the still slats if WebGL is unavailable.
async function mountSlatWall(host) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const probe = document.createElement('canvas')
  if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) return mountStill(host)
  host.innerHTML = `<section class="hero hero-reel hero-slats" aria-label="Who we supply">
    <canvas class="slats-gl" id="slatsGL" aria-hidden="true"></canvas>
    <div class="reel-shade" aria-hidden="true"></div>
    ${intro('over')}
    <div class="reel-ui slats-ui">
      <div class="slat-tabs" role="group" aria-label="Choose a sector">${SECTORS.map((s, i) => `<button type="button" class="slat-tab${i === 0 ? ' on' : ''}" data-i="${i}" aria-pressed="${i === 0}"><small>0${i + 1}</small>${s.name}</button>`).join('')}</div>
      <a class="slat-go" id="slatGo" href="${SECTORS[0].href}">See the collection <span aria-hidden="true">→</span></a>
    </div>
  </section>`
  const { mountSlats } = await import('./slats.js')
  const tabs = [...host.querySelectorAll('.slat-tab')], go = host.querySelector('#slatGo')
  const wall = mountSlats({
    canvas: host.querySelector('#slatsGL'), reduced,
    images: SECTORS.map((s) => `/img/${s.img}.webp`),
    onStep: (i) => { tabs.forEach((t, j) => { t.classList.toggle('on', j === i); t.setAttribute('aria-pressed', String(j === i)) }); go.href = SECTORS[i].href },
  })
  tabs.forEach((t) => (t.onclick = () => wall.show(+t.dataset.i)))
}

function mountReel(host) {
  const slides = [
    { img: 'stock/room-warm-lights', tag: 'Homes' },
    { img: 'stock/room-wood-slats', tag: 'Floors & walls' },
    { img: 'stock/office-colour', tag: 'Offices' },
    { img: 'stock/room-teal-acoustic', tag: 'Acoustics' },
    { img: 'stock/clinic-waiting', tag: 'Hospitals' },
  ]
  host.innerHTML = `<section class="hero hero-reel" aria-label="HC Interior projects">
    <div class="reel" aria-hidden="true">${slides.map((s, i) => `<div class="slide${i === 0 ? ' on' : ''}"><img src="/img/${s.img}.webp" alt=""></div>`).join('')}</div>
    <div class="reel-shade" aria-hidden="true"></div>
    ${intro('over')}
    <div class="reel-ui">
      <span class="reel-tag" id="reelTag" aria-live="off">${slides[0].tag}</span>
      <div class="reel-dots" aria-hidden="true">${slides.map((_, i) => `<i${i === 0 ? ' class="on"' : ''}></i>`).join('')}</div>
      <button type="button" class="reel-pause" id="reelPause" aria-pressed="false">Pause</button>
    </div>
  </section>`
  const els = [...host.querySelectorAll('.slide')], dots = [...host.querySelectorAll('.reel-dots i')]
  const tag = host.querySelector('#reelTag'), btn = host.querySelector('#reelPause')
  let cur = 0, paused = matchMedia('(prefers-reduced-motion: reduce)').matches
  const sync = () => { btn.textContent = paused ? 'Play' : 'Pause'; btn.setAttribute('aria-pressed', String(paused)); host.querySelector('.hero').classList.toggle('paused', paused) }
  const go = (n) => {
    const prev = cur; cur = n
    els[prev].classList.remove('on'); els[prev].classList.add('out')
    els[cur].classList.remove('out'); els[cur].classList.add('on')
    setTimeout(() => els[prev].classList.remove('out'), 1800)
    dots.forEach((d, j) => d.classList.toggle('on', j === cur)); tag.textContent = slides[cur].tag
  }
  btn.onclick = () => { paused = !paused; sync() }
  setInterval(() => { if (!paused && !document.hidden) go((cur + 1) % els.length) }, 5200)
  sync()
}

function mountLegacyFilm(host, onEnquire) {
  host.innerHTML = `<section class="film" id="film" aria-label="Featured products">
      <div class="stage">
        <div class="copy" id="copy"></div>
        <div class="window" id="window"><canvas id="blind" role="img" aria-label="Featured products, one at a time"></canvas></div>
        <nav class="rail" id="rail" aria-label="Featured product progress"></nav>
      </div>
    </section>
    <div class="static-film" id="staticFilm" aria-label="Featured products"></div>`
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) mountStatic({ onEnquire }); else mountFilm({ onEnquire })
}

export function mountHero({ onEnquire }) {
  const host = document.getElementById('heroHost')
  const v = new URLSearchParams(location.search).get('hero')
  if (v === 'film') mountLegacyFilm(host, onEnquire)
  else if (v === 'reel') mountReel(host)
  else if (v === 'still' || ['rise', 'drift', 'light'].includes(v)) mountStill(host, v === 'still' ? '' : v)
  else mountSlatWall(host)
}
