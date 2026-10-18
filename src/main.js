import { COLLECTIONS, HOME_COLLECTIONS } from './data.js'
import { $, $$, watchCanvases, initShared, enquireFromFilm } from './shared.js'
import { mountHero } from './hero.js'
import { mountCollectionScroll } from './cscroll.js'
import { renderRows } from './rows.js'
import { initMotion } from './motion.js'
import { mountGallery } from './gallery.js'
import { mountSound } from './sound.js'

mountHero({ onEnquire: enquireFromFilm })
// Home shows the priority collection (Sound Proofing) and the main audiences; the Collections page shows all eight
const PJ = [
  ['home', 'Home Care', 'Homes', 'stock/kitchen-light', 'Fitted kitchens, wardrobes, wood and vinyl floors, curtains and wall finishes for the rooms you live in.'],
  ['sound', 'Sound Proofing', 'Homes & offices', 'stock/room-teal-acoustic', 'Acoustic treatment and partitions for rooms that need to stay quiet.'],
  ['office', 'Offices', 'Commercial', 'stock/office-wood-floor', 'SPC and carpet-tile floors, raised floors and feature walls for working spaces.'],
  ['theatre', 'Healthcare: Theatre & Critical Care', 'Hospitals', 'stock/ot-wide', 'Modular operating theatres, hermetic doors, ceilings and medical panels built for clean air.'],
]
const pj = $('#pjList')
pj.innerHTML = PJ.map(([id, name, tag, img, line]) => `<a class="pj" href="/collections.html#rail-${id}"><img src="/img/${img}.webp" alt="" loading="lazy" decoding="async" width="483" height="322"><div><span class="chip">${tag}</span><h3>${name}</h3><p>${line}</p></div></a>`).join('')
// accordion: one service open at a time, its photo crossfades in
const acc = $('#bestAcc'), accImgs = $$('#bestImg img'), tag = $('#bestTag')
acc.addEventListener('click', (e) => {
  const btn = e.target.closest('button'); if (!btn) return
  const lis = $$('li', acc), k = lis.indexOf(btn.closest('li'))
  lis.forEach((x, j) => { x.classList.toggle('on', j === k); $('button', x).setAttribute('aria-expanded', String(j === k)) })
  accImgs.forEach((im, j) => im.classList.toggle('on', j === k))
  tag.innerHTML = `<b>0${k + 1}</b> ${$('button span', lis[k]).textContent}`
})
mountGallery($('#gallery'))
mountSound($('#sound'))
const host = $('#homeColl')
if (new URLSearchParams(location.search).get('collections') === 'scroll') {
  // the earlier pinned-title scroll, kept reachable at /?collections=scroll
  const shown = ['home', 'sound', 'office', 'walls', 'theatre'].map((id) => COLLECTIONS.find((c) => c.id === id))
  host.hidden = false; host.className = 'cscroll'; host.id = 'collectionsScroll'
  mountCollectionScroll(host, shown)
}
watchCanvases()
initShared()
initMotion()
