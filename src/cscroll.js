import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SCROLL } from './data.js'
import { $, $$, reduced, mediaHTML } from './shared.js'

gsap.registerPlugin(ScrollTrigger)

// Collection scroll: one big collection name stays pinned while that collection's
// photos float past in a loose staggered grid, each at its own speed. When the next
// collection arrives, the name swaps. (Inspired by the Giopato & Coombes collections page.)
//
// Motion language: calm / soft. One ease (expo out), photos unveil as they arrive, title swap 0.5s out / 0.9s in.

// Layout: the title owns the centre column; photos alternate left / right of it and every
// photo steps down by the same distance (collection boundaries included), so spacing is even.

export function mountCollectionScroll(root, collections) {
  let n = 0   // running photo count, so left/right alternation continues across collections
  const scenes = collections.map((c, ci) => {
    const items = SCROLL[c.id].map((code) => c.items.find((p) => p.code === code))
    return `<article class="cs-scene" data-i="${ci}" style="--accent:${c.accent}" aria-labelledby="cs-h-${c.id}">
      <h3 class="sr" id="cs-h-${c.id}">${c.name}</h3>
      ${items.map((p) => `<figure class="cs-img ${n++ % 2 ? 'r' : 'l'}">
          <button type="button" class="media" data-qv="${p.code}" aria-label="Quick view: ${p.name}">${mediaHTML(p)}</button>
          <figcaption><span>${p.code}</span><b>${p.name}</b></figcaption>
        </figure>`).join('')}
    </article>`
  }).join('')

  root.innerHTML = `
    <div class="cs-pin" aria-hidden="true"><div class="cs-stack"><p class="cs-title" id="csTitle"><span class="cs-name"></span><sup class="cs-n"></sup></p><p class="cs-line" id="csLine"></p></div></div>
    <div class="cs-ui">
      <nav class="cs-index" aria-label="Collections">${collections.map((c, i) => `<a href="#cs-h-${c.id}" data-go="${i}" aria-label="${c.name}" title="${c.name}">0${i + 1}</a>`).join('')}</nav>
      <a class="cs-cta" id="csCta" href="/products.html">View all products <span aria-hidden="true">→</span></a>
    </div>
    <div class="cs-scenes">${scenes}</div>`

  const line = $('#csLine'), title = $('#csTitle'), nameEl = $('.cs-name', title), nEl = $('.cs-n', title), cta = $('#csCta')
  const idx = $$('.cs-index a', root), sceneEls = $$('.cs-scene', root)
  let active = -1

  const words = (txt) => txt.split(' ').map((w) => `<span class="w"><span>${w}</span></span>`).join(' ')
  function setActive(i) {
    if (i === active) return
    const first = active < 0, dir = i > active ? 1 : -1; active = i
    const c = collections[i], name = c.name.replace('Healthcare: ', '')
    idx.forEach((a, j) => a.classList.toggle('on', j === i))
    cta.href = `/products.html#${c.id}`; cta.firstChild.textContent = `View all ${c.items.length} ${name} products `
    title.style.setProperty('--accent', c.accent)
    const cs = getComputedStyle(root), longest = Math.max(...name.split(' ').map((w) => w.length))
    const fit = Math.min(+cs.getPropertyValue('--cap') || 9, (+cs.getPropertyValue('--tw') || 34) / (longest * 0.46))
    title.style.setProperty('--fs', `${fit}vw`)
    const paint = () => { line.textContent = c.line; nameEl.innerHTML = reduced ? name : words(name); nEl.textContent = `(${c.items.length})` }
    if (reduced || first) { paint(); return }
    gsap.timeline()
      .to($$('.w > span', nameEl), { yPercent: -110 * dir, duration: 0.5, stagger: 0.03, ease: 'power2.in' })
      .add(paint)
      .fromTo($$('.w > span', nameEl), { yPercent: 110 * dir }, { yPercent: 0, duration: 0.9, stagger: 0.05, ease: 'expo.out' })
  }
  setActive(0)
  ScrollTrigger.create({ trigger: $('.cs-scenes', root), start: 'top 70%', end: 'bottom 30%', toggleClass: { targets: root, className: 'live' } })

  sceneEls.forEach((el, i) => {
    // the title changes when this collection's first photo arrives, so title and photos always agree
    ScrollTrigger.create({ trigger: $('.cs-img', el), start: 'top 62%', onEnter: () => setActive(i), onLeaveBack: () => setActive(Math.max(i - 1, 0)) })
    if (reduced) return
    $$('.cs-img', el).forEach((fig) => {
      gsap.from($('.media', fig), { clipPath: 'inset(100% 0 0 0)', duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: fig, start: 'top 88%' } })
      gsap.from($('.media img, .media canvas', fig), { scale: 1.2, duration: 1.8, ease: 'expo.out', scrollTrigger: { trigger: fig, start: 'top 88%' } })
    })
  })

  // aim the warm light at whichever photo is hovered
  root.addEventListener('pointerover', (e) => {
    const fig = e.target.closest('.cs-img'); if (!fig) return
    const r = $('.media', fig).getBoundingClientRect()
    fig.style.setProperty('--lx', `${r.left + r.width / 2}px`); fig.style.setProperty('--ly', `${r.top + r.height / 2}px`)
  })

  root.addEventListener('click', (e) => {
    const a = e.target.closest('[data-go]'); if (!a) return
    e.preventDefault(); sceneEls[+a.dataset.go].scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' })
  })
}
