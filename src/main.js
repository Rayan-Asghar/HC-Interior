import { COLLECTIONS, HOME_COLLECTIONS } from './data.js'
import { $, watchCanvases, initShared, enquireFromFilm } from './shared.js'
import { mountHero } from './hero.js'
import { mountCollectionScroll } from './cscroll.js'
import { renderRows } from './rows.js'
import { initMotion } from './motion.js'

mountHero({ onEnquire: enquireFromFilm })
// Home shows the priority collection (Sound Proofing) and the main audiences; the Collections page shows all eight
const shown = ['home', 'sound', 'office', 'walls', 'theatre'].map((id) => COLLECTIONS.find((c) => c.id === id))
const host = $('#collections')
if ((new URLSearchParams(location.search).get('collections') || HOME_COLLECTIONS) === 'rows') {
  // the earlier look, kept switchable: HOME_COLLECTIONS in data.js, or /?collections=rows
  host.className = 'collections'
  host.innerHTML = '<div class="col-head"><h2 id="colH">Eight collections, one supplier.</h2><p>A first look at each collection. Open the full range on the products page.</p></div><div id="collRows"></div>'
  renderRows($('#collRows'), COLLECTIONS)
} else mountCollectionScroll(host, shown)
watchCanvases()
initShared()
initMotion()
