import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { $, $$, reduced } from './shared.js'

// Site-wide motion language: calm / soft ("premium"). One ease-out (expo), 0.4s base unit,
// 60ms stagger, travel <= 32px, no overshoot. Everything arrives the way the hero does:
// rising from a baseline or unveiled by a slat-style wipe. Textures stay ambient.
gsap.registerPlugin(ScrollTrigger)
const OUT = 'expo.out'

function splitWords(el) {
  el.innerHTML = el.innerHTML.split(/(<br\s*\/?>)/i).map((part) => /^<br/i.test(part) ? part
    : part.split(' ').filter(Boolean).map((w) => `<span class="w"><span>${w}</span></span>`).join(' ')).join('')
}

export function initMotion() {
  if (reduced) return
  gsap.registerPlugin(ScrollTrigger)

  // scroll hairline in the header
  const bar = document.createElement('i'); bar.className = 'scrollbar'; $('.top').append(bar)
  gsap.to(bar, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } })

  // headings: words rise out of a mask
  $$('.about h2, .close-copy h2, .p-head h1').forEach((h) => {
    splitWords(h)
    gsap.from($$('.w > span', h), { yPercent: 110, duration: 1.1, stagger: 0.07, ease: OUT, scrollTrigger: { trigger: h, start: 'top 85%' } })
  })

  // collection rows: rule draws, title block settles, photos are unveiled bottom-up
  // (the products page lays its cards out with Flip instead, so its rows are left alone)
  $$('.coll:not(.coll-full)').forEach((sec) => {
    const tl = gsap.timeline({ defaults: { ease: OUT }, scrollTrigger: { trigger: sec, start: 'top 78%' } })
    tl.fromTo(sec, { '--draw': 0 }, { '--draw': 1, duration: 1.4 })
      .from($$('header > *', sec), { y: 24, opacity: 0, duration: 0.9, stagger: 0.06 }, 0.1)
      .from($$('.card .media', sec), { clipPath: 'inset(100% 0 0 0)', duration: 1.2, stagger: 0.09 }, 0.15)
      .from($$('.card .media img, .card .media canvas', sec), { scale: 1.18, duration: 1.8, stagger: 0.09 }, 0.15)
      .from($$('.card .meta', sec), { y: 16, opacity: 0, duration: 0.8, stagger: 0.09 }, 0.5)
  })

  // about: columns rise, divider lines draw
  if ($('.about .cols')) gsap.from('.about .cols > div, .about-note', { y: 28, opacity: 0, duration: 1, stagger: 0.12, ease: OUT, scrollTrigger: { trigger: '.about .cols', start: 'top 85%' } })

  // close: the blind comes down as you arrive (kept from the original)
  if ($('#closeBands')) {
    gsap.set('#closeBands', { scaleY: 0 })
    gsap.to('#closeBands', { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '#contact', start: 'top 85%', end: 'top 15%', scrub: 0.6 } })
    gsap.from('.close-copy > *:not(h2)', { y: 30, opacity: 0, stagger: 0.08, duration: 1, ease: OUT, scrollTrigger: { trigger: '.close-copy', start: 'top 70%' } })
  }

  if ($('.facts')) gsap.from('.facts > div', { y: 28, opacity: 0, duration: 1, stagger: 0.12, ease: OUT, scrollTrigger: { trigger: '.facts', start: 'top 85%' } })

  // page heads settle
  if ($('.p-head')) gsap.from('.eyebrow, .p-sub, .p-tools, .page .chips a', { y: 18, opacity: 0, duration: 0.9, stagger: 0.04, ease: OUT, delay: 0.1 })
}
