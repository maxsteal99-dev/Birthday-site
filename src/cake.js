/* The birthday cake: a real-time 3D scene she has to blow out to open the site.
   Blow into the microphone, swipe across the flames, or tap a candle. Drag to spin the cake. */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import topperFont from './topper-font.json';

const CANDLES = 30;
const V2 = THREE.Vector2;

export function createCake(canvas, { onProgress, onTrick, onAllOut } = {}) {
  /* ---------- renderer, scene, camera ---------- */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.32;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
  const target = new THREE.Vector3(0, 1.55, 0);

  /* ---------- lights: warm key, cool rim, and the candles themselves ---------- */
  scene.add(new THREE.HemisphereLight(0xffe2c4, 0x1a0b10, 0.35));
  const key = new THREE.SpotLight(0xffd6a8, 55, 20, 0.5, 0.85, 1.6);
  key.position.set(3.2, 7, 4.2); key.target.position.set(0, 1.2, 0);
  key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.0004; key.shadow.radius = 6;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0xc9d6ff, 0.9); rim.position.set(-4, 3.5, -5); scene.add(rim);
  const glow = new THREE.PointLight(0xff9a4a, 6, 7, 1.6); glow.position.set(0, 2.9, 0.2); scene.add(glow);

  /* ---------- procedural textures ---------- */
  function noiseTexture(size, repeatX, repeatY) {
    const c = document.createElement('canvas'); c.width = c.height = size;
    const g = c.getContext('2d'), img = g.createImageData(size, size);
    for (let i = 0; i < img.data.length; i += 4) { const v = 118 + Math.random() * 30; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
    g.putImageData(img, 0, 0); g.filter = 'blur(1.2px)'; g.drawImage(c, 0, 0);
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeatX, repeatY); return t;
  }
  function stripeTexture() {
    const c = document.createElement('canvas'); c.width = 64; c.height = 256;
    const g = c.getContext('2d'); g.fillStyle = '#ffffff'; g.fillRect(0, 0, 64, 256);
    g.fillStyle = '#d9b06a'; for (let y = -64; y < 320; y += 40) { g.beginPath(); g.moveTo(0, y); g.lineTo(64, y + 26); g.lineTo(64, y + 36); g.lineTo(0, y + 10); g.fill(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  }
  function tableFade() {
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
    const gr = g.createRadialGradient(128, 128, 10, 128, 128, 128); gr.addColorStop(0, '#fff'); gr.addColorStop(.55, '#bbb'); gr.addColorStop(1, '#000');
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256); return new THREE.CanvasTexture(c);
  }
  const frostBump = noiseTexture(256, 6, 2);

  /* ---------- materials ---------- */
  const frosting = new THREE.MeshPhysicalMaterial({ color: 0xf5e7d6, roughness: 0.62, sheen: 0.8, sheenRoughness: 0.5, sheenColor: 0xfff1e2, bumpMap: frostBump, bumpScale: 1.6 });
  const glaze = new THREE.MeshPhysicalMaterial({ color: 0x5a1024, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.08, side: THREE.DoubleSide });
  const gold = new THREE.MeshPhysicalMaterial({ color: 0xd8b26e, metalness: 1, roughness: 0.24, clearcoat: 0.4 });
  const cream = new THREE.MeshPhysicalMaterial({ color: 0xfbefe2, roughness: 0.5, sheen: 0.6, sheenColor: 0xffffff });
  const berry = new THREE.MeshPhysicalMaterial({ color: 0xa3102c, roughness: 0.38, clearcoat: 0.6, clearcoatRoughness: 0.3, bumpMap: noiseTexture(64, 2, 2), bumpScale: 3 });

  const cake = new THREE.Group(); scene.add(cake);

  /* table that fades into the page */
  const table = new THREE.Mesh(new THREE.CircleGeometry(6, 64), new THREE.MeshStandardMaterial({ color: 0x241016, roughness: 0.55, metalness: 0.05, transparent: true, alphaMap: tableFade() }));
  table.rotation.x = -Math.PI / 2; table.receiveShadow = true; scene.add(table);

  /* gold cake stand */
  const standPts = [[0, 0], [0.92, 0], [0.97, 0.04], [0.62, 0.13], [0.3, 0.22], [0.2, 0.48], [0.25, 0.6], [1.6, 0.645], [1.67, 0.69], [1.64, 0.74], [0, 0.74]].map(p => new V2(p[0], p[1]));
  const stand = new THREE.Mesh(new THREE.LatheGeometry(standPts, 96), gold); stand.castShadow = stand.receiveShadow = true; cake.add(stand);

  /* tiers with softly rounded top edges */
  function tier(r, h, y) {
    const b = 0.035, pts = [new V2(0, 0), new V2(r, 0), new V2(r, h - b)];
    for (let i = 1; i <= 8; i++) { const a = i / 8 * Math.PI / 2; pts.push(new V2(r - b + Math.cos(a) * b, h - b + Math.sin(a) * b)); }
    pts.push(new V2(0, h));
    const m = new THREE.Mesh(new THREE.LatheGeometry(pts, 128), frosting); m.position.y = y; m.castShadow = m.receiveShadow = true; cake.add(m);
  }
  const T1 = 0.74, H1 = 0.86, R1 = 1.3, T2 = T1 + H1, H2 = 0.72, R2 = 0.94, TOP = T2 + H2;
  tier(R1, H1, T1); tier(R2, H2, T2);

  /* glossy burgundy glaze dripping down each tier */
  function drips(r, y, count) {
    const seg = 320, g = new THREE.CylinderGeometry(r + 0.012, r + 0.012, 1, seg, 1, true), pos = g.attributes.position;
    const d = [];
    for (let k = 0; k < count; k++) d.push({ a: (k + Math.random() * 0.7) / count * Math.PI * 2, l: 0.07 + Math.random() * Math.random() * 0.42, w: 0.06 + Math.random() * 0.07 });
    for (let i = 0; i < pos.count; i++) {
      if (pos.getY(i) > 0) { pos.setY(i, 0); continue; }
      const ang = Math.atan2(pos.getX(i), pos.getZ(i)); let len = 0.05;
      for (const q of d) { let da = Math.abs(ang - q.a) % (Math.PI * 2); da = Math.min(da, Math.PI * 2 - da); const t = da / q.w; if (t < 1) len = Math.max(len, 0.05 + q.l * Math.sqrt(1 - t * t)); }
      pos.setY(i, -len);
    }
    g.computeVertexNormals();
    const band = new THREE.Mesh(g, glaze); band.position.y = y; band.castShadow = true; cake.add(band);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(r + 0.012, r + 0.012, 0.022, 128), glaze); cap.position.y = y + 0.006; cap.receiveShadow = true; cake.add(cap);
    const bulbGeo = new THREE.SphereGeometry(1, 16, 12), bulbs = new THREE.InstancedMesh(bulbGeo, glaze, d.length), M = new THREE.Matrix4();
    d.forEach((q, i) => { const s = q.w * r * 0.32; M.compose(new THREE.Vector3(Math.sin(q.a) * (r + 0.012), y - 0.05 - q.l + s * 0.4, Math.cos(q.a) * (r + 0.012)), new THREE.Quaternion(), new THREE.Vector3(s, s * 1.25, s)); bulbs.setMatrixAt(i, M); });
    cake.add(bulbs);
  }
  drips(R1, T2, 22); drips(R2, TOP, 16);

  /* cream rosettes, raspberries and gold pearls */
  function ring(geo, mat, n, r, y, scale, jitter, tilt) {
    const m = new THREE.InstancedMesh(geo, mat, n), M = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    for (let i = 0; i < n; i++) {
      const a = i / n * Math.PI * 2 + (jitter ? (Math.random() - .5) * jitter : 0);
      e.set(tilt ? (Math.random() - .5) * .5 : 0, a, tilt ? (Math.random() - .5) * .5 : 0); q.setFromEuler(e);
      const s = scale * (jitter ? 0.85 + Math.random() * .3 : 1);
      M.compose(new THREE.Vector3(Math.sin(a) * r, y, Math.cos(a) * r), q, new THREE.Vector3(s, s, s)); m.setMatrixAt(i, M);
    }
    m.castShadow = true; cake.add(m); return m;
  }
  const kissPts = []; for (let i = 0; i <= 14; i++) { const t = i / 14; kissPts.push(new V2(Math.max(0.0001, Math.sin(Math.PI * (1 - t) * 0.5) * (1 - t * 0.85) * 1.0), t * 1.3)); }
  const kiss = new THREE.LatheGeometry(kissPts, 12); // ridged meringue kiss
  ring(kiss, cream, 22, 1.12, T2 + 0.012, 0.11, 0.05, false);
  ring(new THREE.IcosahedronGeometry(1, 2), berry, 11, 1.17, T2 + 0.07, 0.065, 0.3, true);
  const pearl = new THREE.SphereGeometry(1, 14, 10);
  ring(pearl, gold, 72, R1 + 0.018, T1 + 0.03, 0.03, 0, false);
  ring(pearl, gold, 54, R2 + 0.018, T2 + 0.03, 0.026, 0, false);

  /* gold "30" topper */
  try {
    const font = new FontLoader().parse(topperFont);
    const tg = new TextGeometry('30', { font, size: 0.5, depth: 0.07, curveSegments: 10, bevelEnabled: true, bevelThickness: 0.018, bevelSize: 0.012, bevelSegments: 4 });
    tg.computeBoundingBox(); const bb = tg.boundingBox; tg.translate(-(bb.max.x + bb.min.x) / 2, 0, -(bb.max.z + bb.min.z) / 2);
    const topper = new THREE.Mesh(tg, gold); topper.position.set(0, TOP + 0.36, -0.06); topper.castShadow = true; cake.add(topper);
    const stick = new THREE.CylinderGeometry(0.008, 0.008, 0.4, 8);
    [-0.15, 0.15].forEach(x => { const s = new THREE.Mesh(stick, gold); s.position.set(x, TOP + 0.2, -0.06); cake.add(s); });
  } catch (e) { /* topper is decoration only */ }

  /* ---------- candles ---------- */
  const CR = 0.7, CH = 0.42, CB = TOP + 0.012, candleGeo = new THREE.CylinderGeometry(0.028, 0.028, CH, 16);
  candleGeo.translate(0, CH / 2, 0);
  const candleMat = new THREE.MeshPhysicalMaterial({ map: stripeTexture(), roughness: 0.45, sheen: 0.3 });
  const candles = new THREE.InstancedMesh(candleGeo, candleMat, CANDLES);
  const wickGeo = new THREE.CylinderGeometry(0.0055, 0.0045, 0.055, 6); wickGeo.translate(0, CH + 0.027, 0);
  const wickMat = new THREE.MeshStandardMaterial({ color: 0x2a1a12, roughness: 0.9, emissive: 0xff5a1a, emissiveIntensity: 0 });
  const wicks = new THREE.InstancedMesh(wickGeo, wickMat, CANDLES);
  const tints = [0xfff8ee, 0xf3c9cf, 0xf1ddb6, 0xe8b2bd];
  const tips = [];
  const M = new THREE.Matrix4();
  for (let i = 0; i < CANDLES; i++) {
    const a = i / CANDLES * Math.PI * 2, x = Math.sin(a) * CR, z = Math.cos(a) * CR;
    M.makeRotationY(a); M.setPosition(x, CB, z);
    candles.setMatrixAt(i, M); wicks.setMatrixAt(i, M);
    candles.setColorAt(i, new THREE.Color(tints[i % tints.length]));
    tips.push(new THREE.Vector3(x, CB + CH + 0.05, z));
  }
  candles.castShadow = true; cake.add(candles, wicks);

  /* flames: camera-facing quads drawn by a shader so they flicker and lean */
  const flameGeo = new THREE.InstancedBufferGeometry();
  flameGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-0.5, 0, 0, 0.5, 0, 0, 0.5, 1, 0, -0.5, 1, 0]), 3));
  flameGeo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([0, 0, 1, 0, 1, 1, 0, 1]), 2));
  flameGeo.setIndex([0, 1, 2, 0, 2, 3]);
  const offs = new Float32Array(CANDLES * 3), seeds = new Float32Array(CANDLES), life = new Float32Array(CANDLES).fill(1);
  tips.forEach((p, i) => { offs.set([p.x, p.y, p.z], i * 3); seeds[i] = Math.random() * 100; });
  flameGeo.setAttribute('iOffset', new THREE.InstancedBufferAttribute(offs, 3));
  flameGeo.setAttribute('iSeed', new THREE.InstancedBufferAttribute(seeds, 1));
  const lifeAttr = new THREE.InstancedBufferAttribute(life, 1); lifeAttr.setUsage(THREE.DynamicDrawUsage);
  flameGeo.setAttribute('iLife', lifeAttr);
  flameGeo.instanceCount = CANDLES;
  const uniforms = { uTime: { value: 0 }, uWind: { value: new V2(0, 0) }, uGlow: { value: 0 } };
  const flameVert = `
    attribute vec3 iOffset; attribute float iSeed; attribute float iLife;
    uniform float uTime; uniform vec2 uWind; uniform float uGlow;
    varying vec2 vUv; varying float vLife;
    void main(){
      vUv = uv; vLife = iLife;
      float t = uTime;
      float flick = 1.0 + 0.09*sin(t*13.0+iSeed*7.0) + 0.05*sin(t*27.0+iSeed*3.1) + 0.04*sin(t*5.3+iSeed);
      vec2 size = uGlow > 0.5 ? vec2(0.5, 0.5) : vec2(0.095, 0.25*flick);
      size *= mix(0.15, 1.0, iLife);
      vec4 mv = modelViewMatrix * vec4(iOffset, 1.0);
      float h = position.y;
      vec2 lean = uWind * pow(h, 1.6) * 0.16 + vec2(sin(t*2.7+iSeed)*0.012, 0.0) * h;
      vec2 p = uGlow > 0.5 ? (position.xy - vec2(0.0, 0.5)) * size + vec2(0.0, 0.08) : position.xy * size + lean;
      mv.xy += p;
      gl_Position = projectionMatrix * mv;
    }`;
  const flameMat = new THREE.ShaderMaterial({
    uniforms: { ...uniforms, uGlow: { value: 0 } }, vertexShader: flameVert, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    fragmentShader: `
      varying vec2 vUv; varying float vLife;
      void main(){
        float y = vUv.y, x = (vUv.x - 0.5) * 2.0;
        float w = smoothstep(0.0, 0.22, y) * mix(0.95, 0.06, smoothstep(0.2, 1.0, y));
        float body = 1.0 - smoothstep(w * 0.45, w, abs(x));
        float core = (1.0 - smoothstep(0.0, w * 0.55, abs(x))) * smoothstep(0.85, 0.25, y);
        vec3 col = mix(vec3(1.0, 0.42, 0.08), vec3(1.0, 0.86, 0.55), core);
        col = mix(col, vec3(0.35, 0.45, 1.0), smoothstep(0.22, 0.0, y) * 0.7);
        float a = body * smoothstep(1.0, 0.72, y) * vLife;
        gl_FragColor = vec4(col * a * 1.6, a);
      }` });
  const haloMat = new THREE.ShaderMaterial({
    uniforms: { ...uniforms, uGlow: { value: 1 } }, vertexShader: flameVert, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    fragmentShader: `
      varying vec2 vUv; varying float vLife;
      void main(){ float d = length(vUv - 0.5) * 2.0; float a = pow(max(0.0, 1.0 - d), 2.2) * 0.32 * vLife; gl_FragColor = vec4(vec3(1.0, 0.62, 0.28) * a, a); }` });
  // the two materials share time and wind
  haloMat.uniforms.uTime = flameMat.uniforms.uTime = uniforms.uTime;
  haloMat.uniforms.uWind = flameMat.uniforms.uWind = uniforms.uWind;
  const flames = new THREE.Mesh(flameGeo, flameMat), halos = new THREE.Mesh(flameGeo, haloMat);
  flames.frustumCulled = halos.frustumCulled = false; flames.renderOrder = 3; halos.renderOrder = 2;
  cake.add(halos, flames);

  /* smoke: soft particles that curl up from each wick */
  const SMOKE = 700, sPos = new Float32Array(SMOKE * 3), sA = new Float32Array(SMOKE), sS = new Float32Array(SMOKE);
  const sVel = new Float32Array(SMOKE * 3), sAge = new Float32Array(SMOKE).fill(1e9), sLife = new Float32Array(SMOKE);
  const smokeGeo = new THREE.BufferGeometry();
  smokeGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3).setUsage(THREE.DynamicDrawUsage));
  smokeGeo.setAttribute('aAlpha', new THREE.BufferAttribute(sA, 1).setUsage(THREE.DynamicDrawUsage));
  smokeGeo.setAttribute('aSize', new THREE.BufferAttribute(sS, 1).setUsage(THREE.DynamicDrawUsage));
  const smoke = new THREE.Points(smokeGeo, new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, uniforms: { uScale: { value: 300 } },
    vertexShader: `attribute float aAlpha; attribute float aSize; uniform float uScale; varying float vA;
      void main(){ vA = aAlpha; vec4 mv = modelViewMatrix * vec4(position,1.0); gl_PointSize = aSize * uScale / -mv.z; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `varying float vA; void main(){ float d = length(gl_PointCoord - 0.5) * 2.0; float a = smoothstep(1.0, 0.0, d) * vA; gl_FragColor = vec4(vec3(0.82, 0.8, 0.78) * a, a); }`
  }));
  smoke.frustumCulled = false; smoke.renderOrder = 4; cake.add(smoke);
  let sNext = 0;
  function puffSmoke(i, n) {
    const p = tips[i];
    for (let k = 0; k < n; k++) {
      const j = sNext; sNext = (sNext + 1) % SMOKE;
      sPos.set([p.x, p.y + 0.02, p.z], j * 3);
      sVel.set([(Math.random() - .5) * 0.04, 0.22 + Math.random() * 0.2, (Math.random() - .5) * 0.04], j * 3);
      sAge[j] = -k * 0.045; sLife[j] = 1.6 + Math.random() * 1.2; sS[j] = 0.03;
    }
  }

  /* ---------- state + extinguishing ---------- */
  const lit = new Array(CANDLES).fill(true), target01 = new Float32Array(CANDLES).fill(1), ember = new Float32Array(CANDLES);
  let left = CANDLES, finished = false, trick = Math.floor(Math.random() * CANDLES), trickUsed = false;
  function out(i) {
    if (!lit[i] || finished) return false;
    lit[i] = false; target01[i] = 0; ember[i] = 1; left--; puffSmoke(i, 26);
    if (i === trick && !trickUsed && left > 3) {
      trickUsed = true;
      setTimeout(() => { if (finished) return; lit[i] = true; target01[i] = 1; left++; onTrick && onTrick(); onProgress && onProgress(left); }, 1400);
    }
    onProgress && onProgress(left);
    if (left === 0) { finished = true; setTimeout(() => onAllOut && onAllOut(), 900); }
    return true;
  }

  /* ---------- sizing ---------- */
  function resize() {
    const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    const vf = THREE.MathUtils.degToRad(camera.fov) / 2, hf = Math.atan(Math.tan(vf) * camera.aspect);
    const dist = Math.max((camera.aspect < 0.8 ? 2.0 : 2.75) / Math.tan(vf), 1.9 / Math.tan(hf));
    const dir = new THREE.Vector3(0, 0.42, 1).normalize();
    camera.position.copy(target).addScaledVector(dir, dist);
    camera.lookAt(target);
    // lift the cake a little lower on tall phones so the title fits above it
    const lift = camera.aspect < 0.8 ? 0.12 : 0.2; camera.position.y += lift; camera.lookAt(target.x, target.y + lift, target.z);
    camera.updateProjectionMatrix();
    smoke.material.uniforms.uScale.value = h * renderer.getPixelRatio() * 0.9;
  }
  resize(); addEventListener('resize', resize);

  /* ---------- screen positions of the flames, for swipes and taps ---------- */
  const tmp = new THREE.Vector3();
  function flameScreen(i) {
    tmp.copy(tips[i]); tmp.y += 0.08; cake.localToWorld(tmp); tmp.project(camera);
    const r = canvas.getBoundingClientRect();
    return { x: (tmp.x + 1) / 2 * r.width + r.left, y: (1 - tmp.y) / 2 * r.height + r.top, z: tmp.z };
  }
  function distToSeg(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy; let t = l ? ((px - ax) * dx + (py - ay) * dy) / l : 0; t = Math.max(0, Math.min(1, t));
    const cx = ax + t * dx - px, cy = ay + t * dy - py; return Math.sqrt(cx * cx + cy * cy);
  }

  /* ---------- pointer: drag spins the cake; passing over a flame blows it out ---------- */
  let spin = 0, spinV = 0.0015, drag = null, windTarget = new V2(0, 0);
  canvas.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, t: performance.now(), moved: false, id: e.pointerId }; try { canvas.setPointerCapture(e.pointerId); } catch (er) {} });
  canvas.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (Math.abs(e.clientX - drag.sx) + Math.abs(e.clientY - drag.sy) > 6) drag.moved = true;
    spinV = dx * 0.006; spin += spinV;
    windTarget.set(THREE.MathUtils.clamp(dx * 0.08, -1.2, 1.2), 0);
    const rad = Math.max(22, Math.min(40, canvas.clientWidth * 0.06));
    for (let i = 0; i < CANDLES; i++) if (lit[i]) { const s = flameScreen(i); if (distToSeg(s.x, s.y, drag.x, drag.y, e.clientX, e.clientY) < rad) out(i); }
    drag.x = e.clientX; drag.y = e.clientY;
  });
  const endDrag = e => {
    if (!drag) return;
    if (!drag.moved) { // a tap: blow out the closest flame near the finger
      let best = -1, bd = 46;
      for (let i = 0; i < CANDLES; i++) if (lit[i]) { const s = flameScreen(i), d = Math.hypot(s.x - e.clientX, s.y - e.clientY); if (d < bd) { bd = d; best = i; } }
      if (best >= 0) { out(best); windTarget.set((Math.random() - .5) * 1.5, 0); }
    }
    drag = null;
  };
  canvas.addEventListener('pointerup', endDrag); canvas.addEventListener('pointercancel', () => { drag = null; });

  /* a gentle puff for keyboards: blows out the candles nearest the viewer */
  function puff(strength) {
    const order = []; for (let i = 0; i < CANDLES; i++) if (lit[i]) order.push([flameScreen(i).z, i]);
    order.sort((a, b) => a[0] - b[0]);
    const n = Math.max(1, Math.round(order.length * strength * (0.4 + Math.random() * 0.3)));
    order.slice(0, n).forEach(([, i], k) => setTimeout(() => out(i), k * 40));
    windTarget.set((Math.random() - .5) * 2, 0);
  }

  /* ---------- microphone: blowing makes a loud low rush of air ---------- */
  let mic = null;
  async function listen() {
    if (mic) return true;
    try { if (navigator.audioSession) navigator.audioSession.type = 'auto'; } catch (e) {}
    const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: false, autoGainControl: false } });
    const ac = new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') await ac.resume();
    const src = ac.createMediaStreamSource(stream), an = ac.createAnalyser(); an.fftSize = 1024; an.smoothingTimeConstant = 0.3; src.connect(an);
    mic = { stream, ac, an, buf: new Uint8Array(an.frequencyBinCount), floor: 0, warm: 0, blowing: 0 };
    return true;
  }
  function micLevel(dt) {
    if (!mic) return 0;
    const { an, buf } = mic; an.getByteFrequencyData(buf);
    const hz = mic.ac.sampleRate / an.fftSize, lo = Math.max(1, Math.round(60 / hz)), hi = Math.round(900 / hz), hi2 = Math.round(4000 / hz);
    let low = 0, mid = 0; for (let i = lo; i < hi; i++) low += buf[i]; for (let i = hi; i < hi2; i++) mid += buf[i];
    low /= (hi - lo) * 255; mid /= (hi2 - hi) * 255;
    const e = low * 0.7 + mid * 0.3;
    if (mic.warm < 0.6) { mic.warm += dt; mic.floor = Math.max(mic.floor, e); return 0; }
    const thr = Math.max(0.28, mic.floor * 1.6 + 0.08), s = THREE.MathUtils.clamp((e - thr) / 0.25, 0, 1);
    if (s === 0) mic.floor = mic.floor * 0.995 + e * 0.005;
    return s;
  }
  function stopMic() { if (!mic) return; mic.stream.getTracks().forEach(t => t.stop()); mic.ac.close(); mic = null; try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {} }

  /* ---------- the loop ---------- */
  const clock = new THREE.Clock(); let raf = 0, running = false, intro = 0;
  const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* adaptive quality: if frames are slow, lower resolution, then drop shadows */
  let slow = 0, level = 0, lastWall = 0;
  function adapt(now) {
    const ms = lastWall ? now - lastWall : 16; lastWall = now;
    if (level >= 3) return;
    slow = ms > 45 ? slow + 1 : Math.max(0, slow - 1);
    if (slow < 6) return;
    slow = 0; level++;
    if (level === 1) renderer.setPixelRatio(Math.min(renderer.getPixelRatio(), 1.25));
    if (level === 2) { renderer.setPixelRatio(1); renderer.shadowMap.enabled = false; key.castShadow = false; scene.traverse(o => { if (o.material) o.material.needsUpdate = true; }); }
    if (level === 3) renderer.setPixelRatio(0.7);
    resize();
  }
  function frame(now) {
    raf = requestAnimationFrame(frame);
    adapt(now || performance.now());
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
    uniforms.uTime.value = t;
    intro = Math.min(1, intro + dt * 0.6);

    // blowing into the mic
    const s = micLevel(dt);
    if (s > 0) {
      windTarget.set((Math.sin(t * 9) * 0.4 + 0.6) * (0.6 + s), 0);
      for (let i = 0; i < CANDLES; i++) if (lit[i]) { const z = flameScreen(i).z; const front = 1.4 - (z - 0.97) * 30; if (Math.random() < s * dt * 4.5 * THREE.MathUtils.clamp(front, 0.35, 1.6)) out(i); }
    }
    uniforms.uWind.value.lerp(windTarget, 1 - Math.pow(0.002, dt));
    windTarget.multiplyScalar(Math.pow(0.04, dt));

    // flames shrink when blown, embers fade
    let any = false, glowSum = 0;
    for (let i = 0; i < CANDLES; i++) {
      const to = target01[i]; if (life[i] !== to) { life[i] += (to - life[i]) * Math.min(1, dt * (to ? 6 : 14)); if (Math.abs(life[i] - to) < 0.01) life[i] = to; any = true; }
      glowSum += life[i];
      if (ember[i] > 0) ember[i] = Math.max(0, ember[i] - dt * 0.6);
    }
    if (any) lifeAttr.needsUpdate = true;
    wickMat.emissiveIntensity = ember.reduce((a, b) => a + b, 0) > 0 ? 0.6 : 0;
    glow.intensity = (glowSum / CANDLES) * (5.5 + Math.sin(t * 11) * 0.5 + Math.sin(t * 17.3) * 0.35);

    // smoke drifts up, curls and fades
    let live = false;
    for (let j = 0; j < SMOKE; j++) {
      const a = sAge[j]; if (a > sLife[j]) { if (sA[j]) { sA[j] = 0; live = true; } continue; }
      sAge[j] = a + dt; live = true; if (a < 0) { sA[j] = 0; continue; }
      const k = j * 3, f = a / sLife[j];
      sVel[k] += Math.sin(t * 2 + j) * 0.02 * dt; sVel[k + 2] += Math.cos(t * 1.7 + j) * 0.02 * dt;
      sPos[k] += sVel[k] * dt + uniforms.uWind.value.x * 0.05 * dt; sPos[k + 1] += sVel[k + 1] * dt * (1 - f * 0.5); sPos[k + 2] += sVel[k + 2] * dt;
      sA[j] = (1 - f) * Math.min(1, a * 6) * 0.45; sS[j] = 0.04 + f * 0.35;
    }
    if (live) { smokeGeo.attributes.position.needsUpdate = smokeGeo.attributes.aAlpha.needsUpdate = smokeGeo.attributes.aSize.needsUpdate = true; }

    // spin with a little inertia, plus a slow showcase turn
    if (!drag) { spinV *= Math.pow(0.08, dt); spin += spinV + (rm ? 0 : dt * 0.09); }
    cake.rotation.y = spin;
    cake.position.y = (1 - easeOut(intro)) * -0.6;
    renderer.render(scene, camera);
  }
  function easeOut(x) { return 1 - Math.pow(1 - x, 3); }

  function start() { if (running) return; running = true; clock.start(); frame(); }
  function stop() { running = false; cancelAnimationFrame(raf); }
  document.addEventListener('visibilitychange', () => { if (document.hidden) { if (running) { cancelAnimationFrame(raf); raf = 0; } } else if (running && !raf) { clock.getDelta(); frame(); } });

  function dispose() {
    stop(); stopMic(); removeEventListener('resize', resize);
    scene.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) { (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { Object.values(m).forEach(v => { if (v && v.isTexture) v.dispose(); }); m.dispose(); }); } });
    pmrem.dispose(); renderer.dispose(); renderer.forceContextLoss && renderer.forceContextLoss();
  }

  // compile shaders and draw the first frame before we reveal anything
  renderer.compile(scene, camera); renderer.render(scene, camera);

  return { start, stop, dispose, puff, listen, stopMic, get left() { return left; }, total: CANDLES };
}

export function webglAvailable() {
  try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { return false; }
}
