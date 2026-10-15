// Tri-vision slat wall. A fluted wall of triangular timber-style slats; each slat
// is a prism with one photo per face (Homes / Offices / Hospitals). Turning the
// slats 120 degrees, in a left-to-right wave, swaps the picture, the way a blind
// or a fluted wall panel catches the light.
//
// Motion language (calm / soft, "premium"): one ease-in-out (cubic), 2s per slat,
// 25ms stagger, no overshoot, a new turn every 4.5s. Slat seams only show while turning. Ambient: a +/-1.2 degree breath and a
// warm light that follows the pointer. Hero tier = the turn; texture = the breath.

import {
  WebGLRenderer, Scene, PerspectiveCamera, BufferGeometry, BufferAttribute, Mesh,
  ShaderMaterial, TextureLoader, SRGBColorSpace, Vector2, Vector3, LinearFilter,
} from 'three'

const FACES = 3
const STEP = (Math.PI * 2) / FACES
const CYCLE = 4.5, DUR = 2.0, STAGGER = 0.025     // a turn starts every 4.5s: ~2.7s turning, ~1.8s at rest
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x))
const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)

const VERT = /* glsl */ `
  uniform float uAng[48];
  uniform vec2 uView;       // visible world width, height
  uniform float uSpacing;
  attribute float aIdx;
  attribute float aCx;
  attribute float aFace;
  attribute float aU;
  varying vec2 vUv;
  varying float vFace;
  varying float vU;
  varying vec3 vN;
  varying vec3 vP;
  varying float vM;
  void main() {
    float a = uAng[int(aIdx)];
    float d = mod(a, 6.28318530718 / 3.0);
    vM = smoothstep(0.08, 0.45, min(d, 6.28318530718 / 3.0 - d));   // 0 at rest, 1 while turning
    float c = cos(a), s = sin(a);
    vec3 p = position;
    vec3 n = normal;
    p = vec3(p.x * c + p.z * s, p.y, -p.x * s + p.z * c);
    n = vec3(n.x * c + n.z * s, n.y, -n.x * s + n.z * c);
    // image coordinate comes from the slat's resting position, so each strip stays continuous
    float x = aCx + (aU - 0.5) * uSpacing;
    vUv = vec2(x / uView.x + 0.5, position.y / uView.y + 0.5);
    vFace = aFace; vU = aU; vN = n;
    p.x += aCx;
    vP = p;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }`

const FRAG = /* glsl */ `
  precision highp float;
  uniform sampler2D uTex0, uTex1, uTex2;
  uniform vec2 uScale0, uScale1, uScale2;
  uniform vec3 uLight;
  varying vec2 vUv; varying float vFace; varying float vU; varying vec3 vN; varying vec3 vP; varying float vM;
  vec3 pick(vec2 uv) {
    if (vFace < 0.5) return texture2D(uTex0, (uv - 0.5) * uScale0 + 0.5).rgb;
    if (vFace < 1.5) return texture2D(uTex1, (uv - 0.5) * uScale1 + 0.5).rgb;
    return texture2D(uTex2, (uv - 0.5) * uScale2 + 0.5).rgb;
  }
  void main() {
    vec3 col = pick(vUv);
    vec3 n = normalize(vN);
    vec3 L = normalize(uLight - vP);
    float diff = max(dot(n, L), 0.0);
    float lit = 0.46 + 0.62 * diff;                       // faces turned from the light fall away
    float edge = mix(1.0, 0.8 + 0.2 * smoothstep(0.0, 0.07, min(vU, 1.0 - vU)), vM);   // seams only while a slat turns
    float spec = pow(max(dot(reflect(-L, n), vec3(0.0, 0.0, 1.0)), 0.0), 18.0) * 0.12;
    col = col * lit * edge + vec3(1.0, 0.86, 0.66) * spec;
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }`

function buildGeometry(n, spacing, H) {
  const side = spacing, r = side / Math.sqrt(3)
  const pos = [], nor = [], idx = [], cx = [], face = [], u = [], ind = []
  let v = 0
  for (let i = 0; i < n; i++) {
    const x0 = (i - (n - 1) / 2) * spacing
    for (let k = 0; k < FACES; k++) {
      const a = k * STEP, a0 = a - STEP / 2, a1 = a + STEP / 2
      const p0 = [r * Math.sin(a0), r * Math.cos(a0)], p1 = [r * Math.sin(a1), r * Math.cos(a1)]
      const nx = Math.sin(a), nz = Math.cos(a)
      ;[[p0, 0, -H / 2], [p1, 1, -H / 2], [p1, 1, H / 2], [p0, 0, H / 2]].forEach(([p, uu, y]) => {
        pos.push(p[0], y, p[1]); nor.push(nx, 0, nz); idx.push(i); cx.push(x0); face.push(k); u.push(uu)
      })
      ind.push(v, v + 1, v + 2, v, v + 2, v + 3); v += 4
    }
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new BufferAttribute(new Float32Array(pos), 3))
  g.setAttribute('normal', new BufferAttribute(new Float32Array(nor), 3))
  g.setAttribute('aIdx', new BufferAttribute(new Float32Array(idx), 1))
  g.setAttribute('aCx', new BufferAttribute(new Float32Array(cx), 1))
  g.setAttribute('aFace', new BufferAttribute(new Float32Array(face), 1))
  g.setAttribute('aU', new BufferAttribute(new Float32Array(u), 1))
  g.setIndex(ind)
  return g
}

// opts: { canvas, images:[url,url,url], reduced, onStep(faceIndex) }
export function mountSlats({ canvas, images, reduced, onStep }) {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false })
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75))
  renderer.setClearColor(0x1f1d1b)
  const scene = new Scene()
  const FOV = 28, VIEW_H = 10
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 100)
  camera.position.z = VIEW_H / 2 / Math.tan((FOV * Math.PI) / 360)

  const loader = new TextureLoader()
  const texs = images.map((src) => loader.load(src, (t) => { t.colorSpace = SRGBColorSpace; t.minFilter = LinearFilter; t.needsUpdate = true; ready() }))
  texs.forEach((t) => { t.colorSpace = SRGBColorSpace })
  const scales = texs.map(() => new Vector2(1, 1))
  const fitScales = () => {
    const wa = (canvas.clientWidth || 1) / (canvas.clientHeight || 1)
    texs.forEach((t, i) => {
      const im = t.image; if (!im) return
      const ia = im.width / im.height
      scales[i].set(wa > ia ? 1 : wa / ia, wa > ia ? ia / wa : 1)
    })
  }

  const uniforms = {
    uAng: { value: new Float32Array(48) },
    uView: { value: new Vector2(1, VIEW_H) },
    uSpacing: { value: 1 },
    uTex0: { value: texs[0] }, uTex1: { value: texs[1] }, uTex2: { value: texs[2] },
    uScale0: { value: scales[0] }, uScale1: { value: scales[1] }, uScale2: { value: scales[2] },
    uLight: { value: new Vector3(-4, 3, 9) },
  }
  const mat = new ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG })
  let mesh = null, N = 0
  let step = 0, from = 0, start = -1e9, lastChange = 0
  let paused = reduced, visible = true, raf = 0, disposed = false
  const mouse = { x: 0, y: 0 }, mSmooth = { x: 0, y: 0 }
  let loaded = 0
  function ready() { loaded++; fitScales(); if (loaded === 1) canvas.dataset.ready = '1' }

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight
    if (!w || !h) return
    renderer.setSize(w, h, false)
    camera.aspect = w / h; camera.updateProjectionMatrix()
    const viewW = VIEW_H * (w / h)
    N = Math.min(46, Math.max(12, Math.round(viewW / 0.62)))      // ~0.62 world units per slat; fewer on phones
    const spacing = viewW / N
    uniforms.uView.value.set(viewW, VIEW_H); uniforms.uSpacing.value = spacing
    if (mesh) { mesh.geometry.dispose(); scene.remove(mesh) }
    mesh = new Mesh(buildGeometry(N, spacing, VIEW_H * 1.04), mat); mesh.frustumCulled = false
    scene.add(mesh); fitScales()
  }

  function angles(now) {
    const a = uniforms.uAng.value
    for (let i = 0; i < N; i++) {
      const t = clamp((now - start - i * STAGGER) / DUR)
      const e = easeInOut(t)
      const rest = -STEP * (from + (step - from) * e)
      const breath = reduced ? 0 : Math.sin(now * 0.5 + i * 0.35) * 0 * (t >= 1 ? 1 : 0.4)
      a[i] = rest + breath + mSmooth.x * 0.05
    }
  }

  function goTo(s, now) {
    // note: a tab click during a turn restarts the wave from the old resting angle
    from = step; step = s; start = now; lastChange = now
    onStep?.(((s % FACES) + FACES) % FACES)
  }

  // ?freeze=0..1 holds the wall at that point of the first turn (for screenshots)
  const fz = new URLSearchParams(location.search).get('freeze'); const FREEZE = fz === null ? -1 : clamp(parseFloat(fz) || 0)
  if (FREEZE >= 0) paused = true
  const t0 = performance.now()
  function frame(ms) {
    raf = 0
    if (disposed || !visible || document.hidden) return
    const now = FREEZE >= 0 ? 100 : (ms - t0) / 1000
    if (FREEZE >= 0 && start < 0) { from = 0; step = 1; start = 100 - FREEZE * (DUR + N * STAGGER) }
    if (start < -1e8) { start = now - 100; lastChange = now }
    if (!paused && now - lastChange > CYCLE) goTo(step + 1, now)
    mSmooth.x += (mouse.x - mSmooth.x) * 0.06; mSmooth.y += (mouse.y - mSmooth.y) * 0.06
    uniforms.uLight.value.set(-4 + mSmooth.x * 9, 3 - mSmooth.y * 4, 9)
    camera.position.x = mSmooth.x * 0.35; camera.position.y = -mSmooth.y * 0.2; camera.lookAt(0, 0, 0)
    angles(now)
    renderer.render(scene, camera)
    raf = requestAnimationFrame(frame)
  }
  const kick = () => { if (!raf && !disposed) raf = requestAnimationFrame(frame) }

  addEventListener('pointermove', (e) => { mouse.x = (e.clientX / innerWidth - 0.5) * 2; mouse.y = (e.clientY / innerHeight - 0.5) * 2 }, { passive: true })
  new ResizeObserver(resize).observe(canvas)
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; kick() }).observe(canvas)
  document.addEventListener('visibilitychange', kick)
  resize(); kick()

  return {
    // pick a face directly (tabs): take the shortest forward route so slats always turn the same way
    show(face) { const cur = ((step % FACES) + FACES) % FACES; const d = (face - cur + FACES) % FACES; if (d) goTo(step + d, (performance.now() - t0) / 1000) },
    setPaused(p) { paused = p; if (!p) lastChange = (performance.now() - t0) / 1000 },
    get paused() { return paused },
    dispose() { disposed = true; cancelAnimationFrame(raf); mesh?.geometry.dispose(); mat.dispose(); texs.forEach((t) => t.dispose()); renderer.dispose() },
  }
}
