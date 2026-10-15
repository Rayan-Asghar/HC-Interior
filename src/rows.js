import { SHOWN } from './data.js'
import { cardHTML } from './shared.js'

// The earlier collections look: one row per collection, heading on the left, three products on the right.
// Used by the Collections page, and on Home with ?collections=rows (kept in case the scroll look is rejected).
export function renderRows(host, collections) {
  host.innerHTML = collections.map((c, i) => {
    const shown = SHOWN[c.id].map((code) => c.items.find((p) => p.code === code))
    return `<section class="coll" id="rail-${c.id}" style="--accent:${c.accent}" aria-labelledby="h-${c.id}">
      <header>
        <p class="coll-no">0${i + 1}</p>
        <h3 id="h-${c.id}">${c.name}</h3>
        <p>${c.line}</p>
        <a class="more" href="/products.html#${c.id}">View all ${c.items.length} products <span aria-hidden="true">→</span></a>
      </header>
      <ul class="grid">${shown.map((p) => cardHTML(p)).join('')}</ul>
    </section>`
  }).join('')
}
