// Catalogue data. Descriptions are plain product descriptors, no claims about
// certifications, clients or numbers. Healthcare blurbs follow the supplied
// Build Vantage reference PDF.

// PLACEHOLDER: replace with the real WhatsApp number (international format, digits only).
export const WHATSAPP = '920000000000'
// Taken from the Build Vantage / Home Care reference PDFs (Murree Road Showroom). Confirm before launch.
export const CONTACT = {
  phone: '051-6128303',
  email: 'homecareisb@gmail.com',
  address: 'Showroom No. 2, Ground Floor, D-Block, Main Service Road, E-11/4, Islamabad',
}

export const ACCENT = {
  home: '#8c6d46',
  sound: '#6b5b7b',
  office: '#56656f',
  walls: '#a5624a',
  windows: '#76845f',
  outdoor: '#b04a3a',
  theatre: '#2f7f9a',
  wards: '#3f8f86',
}

const P = (code, name, pattern, blurb, img) => ({ code, name, pattern, blurb, img })

// Which products each collection shows on the landing page; the full list lives on products.html.
export const SHOWN = {
  home: ['HC-KT-001', 'HC-FL-003', 'HC-WL-008'],
  sound: ['HC-SP-011', 'HC-PT-015', 'HC-PT-016'],
  office: ['HC-FL-012', 'HC-FL-013', 'HC-FL-014'],
  walls: ['HC-PN-021', 'HC-SH-023', 'HC-CL-025'],
  windows: ['HC-BL-031', 'HC-BL-033', 'HC-BL-034'],
  outdoor: ['HC-AC-041', 'HC-AC-042', 'HC-DK-043'],
  theatre: ['HC-OT-051', 'HC-DR-055', 'HC-EP-057'],
  wards: ['HC-FL-061', 'HC-HR-063', 'HC-BG-064'],
}

// Which products the Home scroll shows per collection (four each); SHOWN above stays the three-up rows look.
export const SCROLL = {
  home: ['HC-KT-001', 'HC-FL-003', 'HC-WL-008', 'HC-WP-007'],
  sound: ['HC-SP-011', 'HC-PT-015', 'HC-PT-016'],
  office: ['HC-FL-012', 'HC-FL-014', 'HC-FL-013', 'HC-MW-017'],
  walls: ['HC-PN-021', 'HC-SH-023', 'HC-CL-025', 'HC-PN-022'],
  windows: ['HC-BL-031', 'HC-BL-033', 'HC-BL-034', 'HC-BL-032'],
  outdoor: ['HC-AC-041', 'HC-AC-042', 'HC-DK-043', 'HC-GR-045'],
  theatre: ['HC-OT-051', 'HC-DR-055', 'HC-EP-057', 'HC-OT-054'],
  wards: ['HC-FL-061', 'HC-HR-063', 'HC-BG-064', 'HC-TF-065'],
}

export const COLLECTIONS = [
  {
    id: 'home', name: 'Home Care', accent: ACCENT.home,
    line: 'Kitchens, wardrobes and floors for the rooms you live in.',
    items: [
      P('HC-KT-001', 'Kitchen', 'kitchen', 'Fitted kitchens, planned around how the room is used.', 'stock/kitchen-dark'),
      P('HC-WD-002', 'Wardrobe', 'wardrobe', 'Built-in wardrobes with fitted interiors.', 'stock/wardrobe-walk-in'),
      P('HC-FL-003', 'Wooden Floor', 'wood', 'Timber flooring in warm, natural tones.', 'stock/floor-boards'),
      P('HC-FL-004', 'Vinyl Floor', 'vinyl', 'Resilient vinyl flooring, easy to keep clean.', 'stock/vinyl-floor'),
      P('HC-DR-005', 'PVC Folding Door', 'door', 'Space-saving folding doors for baths and partitions.'),
      P('HC-CT-006', 'Curtains', 'curtain', 'Made-to-measure curtains for homes.', 'stock/curtains-sheer'),
      P('HC-WP-007', 'Wallpaper', 'wallpaper', 'Printed wall coverings in a wide range of patterns.', 'stock/wallpaper-feature'),
      P('HC-WL-008', 'Wall Picture', 'picture', 'Large-format wall pictures for feature walls.', 'stock/room-warm-lights'),
    ],
  },
  {
    id: 'sound', name: 'Sound Proofing', accent: ACCENT.sound, priority: true,
    line: 'Acoustic treatment and partitions for rooms that need to stay quiet.',
    items: [
      P('HC-SP-011', 'Sound Proofing', 'sound', 'Acoustic treatment for rooms that need to stay quiet.', 'stock/acoustic-felt'),
      P('HC-PT-015', 'Gypsum Partition', 'partition', 'Light board partitions for dividing floor plates.', 'stock/gypsum-partition'),
      P('HC-PT-016', 'Cement Board Partition', 'partition', 'Cement board partitions where moisture resistance matters.', 'stock/cement-board'),
    ],
  },
  {
    id: 'office', name: 'Offices', accent: ACCENT.office,
    line: 'Floors and feature walls for working spaces.',
    items: [
      P('HC-FL-012', 'SPC Floor', 'spc', 'Rigid-core stone plastic composite planks.', 'stock/spc-office-floor'),
      P('HC-FL-013', 'Carpet Tile', 'carpet', 'Modular carpet squares, replaceable one at a time.', 'stock/carpet-tile-office'),
      P('HC-FL-014', 'Raised Floor', 'raised', 'Access floor panels on pedestals for cabling underneath.'),
      P('HC-MW-017', 'Media Wall', 'media', 'Feature walls built around the screen.', 'stock/media-wall'),
    ],
  },
  {
    id: 'walls', name: 'Walls & Ceilings', accent: ACCENT.walls,
    line: 'Panels, sheets, ceilings and mouldings that finish a room.',
    items: [
      P('HC-PN-021', 'WPC Panel', 'fluted', 'Wood plastic composite wall panels.', 'stock/wpc-slat-panel'),
      P('HC-PN-022', 'PVC Panel', 'pvcpanel', 'Lightweight, moisture-resistant PVC wall and ceiling panels.'),
      P('HC-SH-023', 'SPC Sheet', 'spcsheet', 'Rigid wall sheets in stone and wood finishes.', 'stock/marble-grey'),
      P('HC-SH-024', 'UV Sheet', 'uv', 'High-gloss UV-coated sheets for cabinetry and walls.'),
      P('HC-CL-025', 'Gypsum Ceiling', 'gypsum', 'Gypsum board ceilings with lighting coves.', 'stock/gypsum-ceiling'),
      P('HC-CL-026', 'Dampa Ceiling', 'dampa', 'Dampa suspended ceiling systems.'),
      P('HC-MD-027', 'Moulding', 'moulding', 'Cornice and skirting mouldings.', 'stock/wall-moulding'),
    ],
  },
  {
    id: 'windows', name: 'Blinds', accent: ACCENT.windows,
    line: 'Five ways to let the light in, or keep it out.',
    items: [
      P('HC-BL-031', 'Zebra Blind', 'zebra', 'Alternating sheer and opaque bands, aligned for light control.', 'stock/blinds-window'),
      P('HC-BL-032', 'Roller Blind', 'roller', 'Clean, flat roller blinds in plain and sunscreen fabrics.', 'stock/roller-blind'),
      P('HC-BL-033', 'Wooden Blind', 'woodblind', 'Real-timber slat blinds.', 'stock/blinds-shadow'),
      P('HC-BL-034', 'Horizontal Blind', 'horizontal', 'Tilting horizontal slat blinds.', 'stock/blinds-light'),
      P('HC-BL-035', 'Chick Blind', 'chick', 'Woven bamboo-style blinds for patios and verandas.', 'stock/bamboo-blind'),
    ],
  },
  {
    id: 'outdoor', name: 'Exterior & Outdoor', accent: ACCENT.outdoor,
    line: 'Facades, decks, turf and gym surfaces that face the weather.',
    items: [
      P('HC-AC-041', 'ACP Alucobond', 'acp', 'Aluminium composite panels for facade elevation.', 'acp-colour'),
      P('HC-AC-042', 'ACP Cladding', 'acp', 'Cladding systems with ACP for new and existing buildings.', 'acp-facade'),
      P('HC-DK-043', 'WPC Deck Floor', 'deck', 'Wood plastic composite decking for outdoor floors.', 'stock/wood-deck'),
      P('HC-DK-044', 'Deck Tile', 'decktile', 'Click-together deck tiles for terraces and balconies.', 'stock/deck-terrace'),
      P('HC-GR-045', 'Artificial Grass', 'grass', 'Synthetic turf for lawns, roofs and play areas.', 'stock/artificial-grass'),
      P('HC-GY-046', 'Gym Tile', 'gym', 'Interlocking impact-absorbing gym floor tiles.', 'stock/gym-tile'),
    ],
  },
  {
    id: 'theatre', name: 'Healthcare: Theatre & Critical Care', accent: ACCENT.theatre,
    line: 'Operating theatres, hermetic doors and medical panels.',
    items: [
      P('HC-OT-051', 'Modular Operation Theatre', 'ot', 'Modular OT with integrated wall, ceiling and floor for controlled, hygienic surgery.', 'ot-white'),
      P('HC-OT-052', 'Hospital OT Cladding Sheet', 'ot', 'Seamless cladding sheets for theatre walls.', 'ot-cladding'),
      P('HC-OT-053', 'Surgical Control Panel (Eyecare)', 'panel', 'Control panels for surgical and eye-care suites.', 'surgical-panel'),
      P('HC-OT-054', 'Bed Head Medical Panel', 'panel', 'Bed-head panels carrying gases, power and nurse call.', 'bedhead-panel'),
      P('HC-DR-055', 'Hermetic Doors', 'door', 'Airtight sliding or swing doors for operating theatres and critical areas.', 'hermetic-door'),
      P('HC-CL-056', 'Hospital Ceiling', 'dampa', 'Hygienic, moisture-resistant ceiling systems with integrated lighting.', 'hospital-ceiling'),
      P('HC-EP-057', 'Epoxy Flooring', 'epoxy', 'Seamless epoxy floors for hygienic, high-traffic areas.', 'epoxy-blue'),
    ],
  },
  {
    id: 'wards', name: 'Healthcare: Wards & Corridors', accent: ACCENT.wards,
    line: 'Floors, rails and protection for the places patients walk.',
    items: [
      P('HC-FL-061', 'Homogeneous Vinyl Flooring', 'vinyl', 'Durable, hygienic, easy-to-clean flooring for hospitals.', 'vinyl-corridor'),
      P('HC-DR-062', 'Non-Hermetic Doors', 'door', 'Hospital doors for general areas, durable and easy to maintain.', 'door-wood'),
      P('HC-HR-063', 'Hospital Handrails', 'handrail', 'Ergonomic wall-mounted handrails that support patients and visitors.', 'handrail'),
      P('HC-BG-064', 'Bumper & Corner Guards', 'guard', 'Wall and corner protection against trolley and bed impact.', 'corner-guard'),
      P('HC-TF-065', 'Tactile Flooring', 'tactile', 'Tactile indicators for wayfinding and accessibility.', 'tactile-yellow'),
      P('HC-BC-066', 'Hospital Bed Curtains', 'curtain', 'Antimicrobial, easy-to-maintain privacy curtains for wards.', 'bed-curtain-blue'),
    ],
  },
]

// The six products the legacy scroll film reveals (?hero=film). `scene` names the film painter.
export const HEROES = [
  { scene: 'floor', plate: 'stock/floor-boards', focus: [0.5, 0.5], name: 'Flooring', code: 'HC-FL-003', collection: 'home',
    line: 'Wood, SPC, vinyl, carpet and raised floors, from living rooms to server rooms.' },
  { scene: 'wall', plate: 'stock/timber-cladding', focus: [0.5, 0.42], name: 'Wall Panelling', code: 'HC-PN-021', collection: 'walls',
    line: 'Fluted WPC, PVC and SPC panels that finish a wall in a day, not a season.' },
  { scene: 'kitchen', plate: 'stock/kitchen-dark', focus: [0.5, 0.5], name: 'Kitchen', code: 'HC-KT-001', collection: 'home',
    line: 'Cabinetry planned around the cook, the counter and the way the day moves.' },
  { scene: 'sound', plate: 'stock/slats-vertical', focus: [0.5, 0.5], name: 'Sound Proofing', code: 'HC-SP-011', collection: 'sound',
    line: 'Rooms that keep their noise to themselves: acoustic slats, boards and linings.' },
  { scene: 'acp', plate: 'stock/facade', focus: [0.5, 0.45], name: 'ACP Cladding', code: 'HC-AC-042', collection: 'outdoor',
    line: 'Aluminium composite facades in a full range of colour.' },
  { scene: 'ot', plate: 'stock/ot-wide', focus: [0.5, 0.5], name: 'Operation Theatre', code: 'HC-OT-051', collection: 'theatre',
    line: 'Modular theatres, hermetic doors, ceilings and floors built for clean air.' },
]

// First plate of the film (the opening, before any product).
export const OPENING = { plate: 'stock/slats-stack', focus: [0.5, 0.38] }

// Landing hero: the three audiences, each with the client's own reference image.
export const SECTORS = [
  { id: 'home', name: 'Homes', img: 'stock/hero-homes', focus: '50% 55%', line: 'Kitchens, floors, wardrobes, blinds and wall finishes.', href: '/collections.html#rail-home' },
  { id: 'office', name: 'Offices', img: 'stock/hero-offices', focus: '50% 55%', line: 'Acoustics, partitions, floors and ceilings for working floors.', href: '/collections.html#rail-office' },
  { id: 'health', name: 'Hospitals', img: 'stock/hero-hospitals', focus: '50% 55%', line: 'Operating theatres, hermetic doors, hygienic floors and medical panels.', href: '/collections.html#rail-theatre' },
]

// Home page collections look: 'scroll' (pinned title, floating photos) or 'rows' (the earlier look:
// a heading and three products per collection). Either can be previewed with /?collections=scroll or /?collections=rows.
export const HOME_COLLECTIONS = 'scroll'
