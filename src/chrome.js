// Header, footer, quick-view dialog and enquiry drawer, injected on every page so the
// five pages share one definition. <body data-page="home|collections|products|about|contact">
const page = document.body.dataset.page || ''
const NAV = [['/collections.html', 'Collections', 'collections'], ['/products.html', 'Products', 'products'], ['/about.html', 'Company', 'about'], ['/contact.html', 'Contact', 'contact']]

const skip = `<a class="skip" href="#main">Skip to content</a>`
const header = `<header class="top" id="top">
  <a class="brand" href="/" aria-label="HC Interior, home"><img src="/img/logo.webp" alt="HC Interior, Design Beyond Ordinary" width="56" height="65"></a>
  <nav class="menu" id="menu" aria-label="Primary">${NAV.map(([h, l, k]) => `<a href="${h}"${page === k ? ' aria-current="page"' : ''}>${l}</a>`).join('')}</nav>
  <button class="menu-btn" id="menuBtn" type="button" aria-controls="menu" aria-expanded="false"><span class="sr">Menu</span><i></i><i></i></button>
  <button class="enq-btn" id="enqOpen" type="button" aria-controls="enq" aria-expanded="false">Enquiry list <b id="enqCount">0</b></button>
</header>`
const footer = `<footer class="foot">
  <p><b>HC Interior</b> · Design Beyond Ordinary</p>
  <nav aria-label="Footer"><a href="/">Home</a>${NAV.map(([h, l]) => `<a href="${h}">${l}</a>`).join('')}</nav>
</footer>`
const overlays = `<dialog id="qv" aria-labelledby="qvName">
  <button class="qv-x" id="qvClose" type="button" aria-label="Close">×</button>
  <div class="qv-media" id="qvMedia"></div>
  <div class="qv-body">
    <p class="qv-code" id="qvCode"></p><h3 id="qvName"></h3><p id="qvBlurb"></p><p class="qv-coll" id="qvColl"></p>
    <button class="btn btn-solid" id="qvAdd" type="button">Add to enquiry list</button>
  </div>
</dialog>
<aside class="enq" id="enq" aria-label="Enquiry list" aria-hidden="true">
  <div class="enq-head"><h2>Your enquiry list</h2><button id="enqClose" type="button" aria-label="Close enquiry list">×</button></div>
  <ul id="enqList"></ul>
  <p class="enq-empty" id="enqEmpty">Nothing here yet. Use “Add to list” on any product.</p>
  <div class="enq-foot"><a class="btn btn-solid" id="enqSend" href="#" target="_blank" rel="noopener">Send on WhatsApp</a><button class="btn btn-line" id="enqCopy" type="button">Copy list</button></div>
</aside>`

document.body.insertAdjacentHTML('afterbegin', skip + header)
const main = document.querySelector('main'); if (main) main.id = 'main'
if (page !== 'contact') main?.insertAdjacentHTML('afterend', footer)
document.body.insertAdjacentHTML('beforeend', overlays)
