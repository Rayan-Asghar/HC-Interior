import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import { COLLECTIONS } from './data.js'
import { $, $$, cardHTML, watchCanvases, initShared, reduced } from './shared.js'
import { initMotion } from './motion.js'

gsap.registerPlugin(Flip)

// One <li> per product, created once and moved between layouts, so Flip can glide
// every card from its old place to its new one (grid <-> list, collection <-> A-Z).
const total = COLLECTIONS.reduce((n, c) => n + c.items.length, 0)
const cards = new Map()
const tpl = document.createElement('ul')
COLLECTIONS.forEach((c) => c.items.forEach((p) => {
  tpl.innerHTML = cardHTML(p, c.name.replace('Healthcare: ', 'Healthcare · '))
  const li = tpl.firstElementChild; li.dataset.coll = c.id; li.dataset.name = p.name
  cards.set(p.code, { li, coll: c })
}))

const host = $('#list'), chips = $('#chips')
const qs = new URLSearchParams(location.search)
let view = qs.get('view') === 'list' ? 'list' : 'grid', sort = qs.get('sort') === 'name' ? 'name' : 'coll'

function section(id, name, line, accent, items) {
  const sec = document.createElement('section')
  sec.className = 'coll coll-full'; sec.id = id; sec.style.setProperty('--accent', accent); sec.setAttribute('aria-labelledby', `h-${id}`)
  sec.innerHTML = `<header><h3 id="h-${id}">${name}</h3><p>${line}</p><span class="cnt">${items.length} products</span></header><ul class="grid"></ul>`
  const ul = $('.grid', sec); items.forEach((li) => ul.append(li))
  return sec
}
function layout() {
  host.classList.toggle('is-list', view === 'list'); chips.hidden = sort === 'name'
  host.replaceChildren(...(sort === 'coll'
    ? COLLECTIONS.map((c) => section(c.id, c.name, c.line, c.accent, c.items.map((p) => cards.get(p.code).li)))
    : [section('az', 'A to Z', 'Every product, alphabetically.', '#8c6d46', [...cards.values()].map((x) => x.li).sort((a, b) => a.dataset.name.localeCompare(b.dataset.name)))]))
  filter()
}
// run a layout change inside a Flip so the cards travel instead of jumping
function change(fn) {
  if (reduced) return fn()
  const state = Flip.getState($$('.card', host))
  fn()
  Flip.from(state, { duration: 0.95, ease: 'power3.inOut', stagger: { each: 0.012, from: 'start' }, absolute: false, nested: true,
    onEnter: (els) => gsap.fromTo(els, { opacity: 0 }, { opacity: 1, duration: 0.6 }) })
}

chips.innerHTML = COLLECTIONS.map((c) => `<a href="#${c.id}" style="--accent:${c.accent}">${c.name.replace('Healthcare: ', '')}${c.name.startsWith('Healthcare') ? '<small>Healthcare</small>' : ''}</a>`).join('')

// search: hide cards that do not match, and any section left empty
const q = $('#q'), empty = $('#pEmpty')
function filter() {
  const t = q.value.trim().toLowerCase(); let any = 0
  $$('.coll-full', host).forEach((sec) => {
    let n = 0
    $$('.card', sec).forEach((card) => {
      const hit = !t || card.textContent.toLowerCase().includes(t)
      card.hidden = !hit; if (hit) n++
    })
    sec.hidden = n === 0; any += n
  })
  empty.hidden = any > 0
  $('#pCount').textContent = t ? `${any} of ${total} products` : `${total} products`
}
q.addEventListener('input', () => change(filter))
$('#pClear').onclick = () => { q.value = ''; change(filter); q.focus() }

// view + sort controls
$$('[data-view]').forEach((b) => (b.onclick = () => {
  if (view === b.dataset.view) return; view = b.dataset.view
  $$('[data-view]').forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', String(x === b)) })
  change(() => host.classList.toggle('is-list', view === 'list'))
}))
$$('[data-sort]').forEach((b) => (b.onclick = () => {
  if (sort === b.dataset.sort) return; sort = b.dataset.sort
  $$('[data-sort]').forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', String(x === b)) })
  change(layout)
}))

layout()
$$('[data-view]').forEach((x) => { x.classList.toggle('on', x.dataset.view === view); x.setAttribute('aria-pressed', String(x.dataset.view === view)) })
$$('[data-sort]').forEach((x) => { x.classList.toggle('on', x.dataset.sort === sort); x.setAttribute('aria-pressed', String(x.dataset.sort === sort)) })
watchCanvases()
initShared()
if (location.hash) document.querySelector(location.hash)?.scrollIntoView()
initMotion()
