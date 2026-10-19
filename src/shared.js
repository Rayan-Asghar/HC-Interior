import './chrome.js'
import '@fontsource/hanken-grotesk/latin-300'
import '@fontsource/hanken-grotesk/latin-500'
import '@fontsource/hanken-grotesk/latin-400'
import '@fontsource/hanken-grotesk/latin-600'
import '@fontsource/big-shoulders-display/latin-300'
import '@fontsource/big-shoulders-display/latin-400'
import '@fontsource/big-shoulders-display/latin-500'
import './style.css'
import gsap from 'gsap'
import { COLLECTIONS, WHATSAPP } from './data.js'
import { PAINT } from './paint.js'

// Behaviour shared by the landing page and the products page: product cards,
// quick view, and the enquiry list that builds a WhatsApp message.

export const $ = (s, r = document) => r.querySelector(s)
export const $$ = (s, r = document) => [...r.querySelectorAll(s)]
export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
document.documentElement.dataset.motion = reduced ? 'reduced' : 'full'

const ALL = COLLECTIONS.flatMap((c) => c.items.map((p) => ({ ...p, coll: c })))
export const byCode = (code) => ALL.find((p) => p.code === code)

export function mediaHTML(p) {
  return p.img
    ? `<img src="/img/${p.img}.webp" alt="${p.name}" loading="lazy" decoding="async">`
    : `<canvas width="480" height="600" data-pat="${p.pattern}" role="img" aria-label="${p.name}"></canvas>`
}

export function cardHTML(p, collName = '') {
  return `<li class="card" data-code="${p.code}">
    <button type="button" class="media" data-qv="${p.code}" aria-label="Quick view: ${p.name}">${mediaHTML(p)}</button>
    <div class="meta"><span class="pc">${p.code}</span><h4>${p.name}</h4><span class="pcoll">${collName}</span>
    <button type="button" class="add" data-add="${p.code}">Add to list</button></div>
  </li>`
}

// paint the illustrative canvases as they approach the viewport
const io = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting) return; io.unobserve(e.target)
  const cv = e.target; PAINT[cv.dataset.pat]?.(cv.getContext('2d'), cv.width, cv.height, { k: 1, T: 0 })
}), { rootMargin: '300px' })
export const watchCanvases = (root = document) => $$('canvas[data-pat]', root).forEach((c) => io.observe(c))

// ---------- enquiry list ----------
let list = []
try { list = JSON.parse(localStorage.getItem('hc-enq') || '[]').filter(byCode) } catch { list = [] }
const enq = $('#enq')

const waLink = (text) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`
function enquiryText() {
  if (!list.length) return 'Hello HC Interior, I would like a quote.'
  return `Hello HC Interior, I would like a quote for:\n${list.map((c) => `- ${byCode(c).name} (${c})`).join('\n')}`
}
export function renderEnq() {
  $('#enqCount').textContent = list.length
  $('#enqList').innerHTML = list.map((c) => `<li><span>${byCode(c).name}<small>${c}</small></span><button type="button" data-rm="${c}" aria-label="Remove ${byCode(c).name}">Remove</button></li>`).join('')
  $('#enqEmpty').hidden = list.length > 0
  $('#enqSend').href = waLink(enquiryText())
  $$('[data-wa]').forEach((a) => (a.href = waLink(enquiryText())))
  $$('[data-add]').forEach((b) => { const on = list.includes(b.dataset.add); b.classList.toggle('on', on); b.textContent = on ? 'On your list' : 'Add to list' })
  try { localStorage.setItem('hc-enq', JSON.stringify(list)) } catch {}
}
function toggleEnq(code, force) {
  const has = list.includes(code)
  if (force === true && has) return
  list = has && force !== true ? list.filter((c) => c !== code) : [...list, code]
  renderEnq(); gsap.fromTo('#enqCount', { scale: 1.5 }, { scale: 1, duration: 0.5, ease: 'expo.out' })
}
function openEnq(open) {
  enq.classList.toggle('open', open); enq.setAttribute('aria-hidden', String(!open)); enq.inert = !open
  $('#enqOpen').setAttribute('aria-expanded', String(open))
  if (open) $('#enqClose').focus(); else $('#enqOpen').focus({ preventScroll: true })
}
export function enquireFromFilm(code) { toggleEnq(code, true); openEnq(true) }

// ---------- quick view ----------
const qv = $('#qv'); let qvCode = null
const syncQV = () => { $('#qvAdd').textContent = list.includes(qvCode) ? 'Remove from list' : 'Add to enquiry list' }
function openQV(code) {
  const p = byCode(code); qvCode = code
  $('#qvCode').textContent = p.code; $('#qvName').textContent = p.name; $('#qvBlurb').textContent = p.blurb
  $('#qvColl').textContent = p.coll.name
  const m = $('#qvMedia')
  if (p.img) m.innerHTML = `<img src="/img/${p.img}.webp" alt="${p.name}">`
  else { m.innerHTML = `<canvas width="720" height="720" role="img" aria-label="${p.name}"></canvas>`; PAINT[p.pattern]?.($('canvas', m).getContext('2d'), 720, 720, { k: 1, T: 0 }) }
  qv.showModal(); syncQV()
}

export function initShared() {
  enq.inert = true
  $('#enqOpen').onclick = () => openEnq(!enq.classList.contains('open'))
  $('#enqClose').onclick = () => openEnq(false)
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && enq.classList.contains('open')) openEnq(false) })
  $('#enqList').addEventListener('click', (e) => { const b = e.target.closest('[data-rm]'); if (b) toggleEnq(b.dataset.rm) })
  $('#enqCopy').onclick = async (e) => { try { await navigator.clipboard.writeText(enquiryText()); e.target.textContent = 'Copied' } catch { e.target.textContent = 'Copy failed' } setTimeout(() => (e.target.textContent = 'Copy list'), 1800) }
  $('#qvClose').onclick = () => qv.close()
  qv.addEventListener('click', (e) => { if (e.target === qv) qv.close() })
  $('#qvAdd').onclick = () => { toggleEnq(qvCode); syncQV() }
  document.addEventListener('click', (e) => {
    const q = e.target.closest('[data-qv]'); if (q) openQV(q.dataset.qv)
    const a = e.target.closest('[data-add]'); if (a) toggleEnq(a.dataset.add)
  })
  renderEnq(); initNav()
}

// ---------- header: clear over the hero, solid once scrolled, tucks away on the way down ----------
export function initNav() {
  const top = $('#top'), btn = $('#menuBtn'), menu = $('#menu')
  let last = scrollY, open = false
  const setOpen = (o) => { open = o; top.classList.toggle('menu-open', o); btn.setAttribute('aria-expanded', String(o)) }
  btn.onclick = () => setOpen(!open)
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false) })
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) { setOpen(false); btn.focus() } })
  const onScroll = () => {
    const y = scrollY
    top.classList.toggle('solid', y > 40 || !$('#heroHost'))   // pages without a hero keep the solid bar
    if (!open) top.classList.toggle('tucked', y > last && y > 240)
    last = y
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll()
  top.addEventListener('focusin', () => top.classList.remove('tucked'))
}
