# Design: HC Interior

World: a Material Atlas. A canvas scroll film (src/film.js) walks through full-bleed photographic plates (opening slats, flooring, wall panelling, kitchen, sound proofing, ACP cladding, operation theatre). The next plate arrives through a wall of slats that rise column by column; the held plate drifts slowly. Captions sit bottom-left on a warm scrim; a vertical swatch rail on the right tracks position. The page closes on a charcoal slat wall.

## Color
- Wall `#efeae1` / Paper `#f7f4ee` (grounds), Charcoal `#2b2927` / Ink `#1f1d1b` (fabric, text), Bronze `#8c6d46` (thread, accents; text use `#6b5030`), Bronze light `#b8976a`.
- Collection accents: Home `#8c6d46`, Offices `#56656f`, Walls `#a5624a`, Blinds `#76845f`, Exterior `#b04a3a`, Theatre `#2f7f9a`, Wards `#3f8f86`.

## Type
- Display: Big Shoulders Display 300/500 uppercase, max 6rem, echoing the condensed "INTERIOR" wordmark. Body: Hanken Grotesk 400/600. Labels: 12px tracked caps. Product codes (HC-XX-000) are catalogue marks.

## Components
- Buttons: square, 1px charcoal, tracked caps; solid charcoal or outlined.
- Collection rails: scroll-snap tracks, 4:5 cards, quick-view dialog, enquiry list drawer (WhatsApp message builder).
- Cards carry the client's own photos where they exist, Unsplash reference photos (labelled "Reference photo") for materials, and geometry-only renders (src/paint.js, labelled "Illustrative"). All stand in until photography of the exact product is added.

## Motion
- Landing hero (src/hero.js) has three variants. Default `still`: three sector slats (Homes, Offices, Hospitals), one open at a time, auto-rotating, no scroll hijack. `?hero=reel`: full-bleed autoplay loop with a slat wipe and a Pause button. `?hero=film`: the original scroll-scrubbed canvas film (src/film.js), kept intact.
- Landing collections show a heading and three products each, linking to products.html (all products, search, collection anchors).
- GSAP for reveals and the closing slat wall. Reduced motion stops the hero rotation and reel.
- Copy rule: no "established" / year claims. Lines come from the reference PDFs.
