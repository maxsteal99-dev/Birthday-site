/* Barista Sagarika: build a Spanish latte in a real-time 3D café scene.
   Condensed milk → ice → milk → espresso → stir, then take a sip. */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

const V2 = THREE.Vector2, V3 = THREE.Vector3;
export const STEPS = ['cm', 'ice', 'milk', 'esp', 'stir'];

export function createLatte(canvas, { onStep, onMessage, onDone } = {}) {
  /* ---------- renderer / scene / camera ---------- */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;
  const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 40);

  scene.add(new THREE.HemisphereLight(0xffe6cc, 0x1a0f0a, 0.45));
  const key = new THREE.SpotLight(0xffe0b8, 40, 14, 0.55, 0.8, 1.5);
  key.position.set(2.2, 4.5, 3); key.target.position.set(0, 0.4, 0); key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.0004; key.shadow.radius = 5;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0xbfd0ff, 1.1); rim.position.set(-3, 2.5, -3); scene.add(rim);

  /* ---------- canvas textures ---------- */
  function tex(w, h, draw, srgb = true) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
  const woodTex = tex(1024, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#3a2318'); gr.addColorStop(1, '#2a170f'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) { g.strokeStyle = `rgba(${90 + Math.random() * 60},${50 + Math.random() * 30},${30 + Math.random() * 20},${0.05 + Math.random() * 0.12})`; g.lineWidth = 0.5 + Math.random() * 2.5; g.beginPath(); let y = Math.random() * h; g.moveTo(0, y); for (let x = 0; x <= w; x += 32) { y += (Math.random() - .5) * 3; g.lineTo(x, y); } g.stroke(); }
  });
  woodTex.wrapS = woodTex.wrapT = THREE.RepeatWrapping; woodTex.repeat.set(2, 1);
  const fade = tex(256, 256, (g) => { const r = g.createRadialGradient(128, 128, 20, 128, 128, 128); r.addColorStop(0, '#fff'); r.addColorStop(.6, '#ccc'); r.addColorStop(1, '#000'); g.fillStyle = r; g.fillRect(0, 0, 256, 256); }, false);
  const canLabel = tex(1024, 400, (g, w, h) => {
    g.fillStyle = '#f5ecd6'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#1f4c8f'; g.fillRect(0, 0, w, 70); g.fillRect(0, h - 60, w, 60);
    g.fillStyle = '#c9a046'; g.fillRect(0, 70, w, 8); g.fillRect(0, h - 68, w, 8);
    for (let k = 0; k < 2; k++) {
      const cx = k * w / 2 + w / 4;
      g.fillStyle = '#1f4c8f'; g.font = '600 34px Georgia, serif'; g.textAlign = 'center'; g.fillText('SWEETENED', cx, 140);
      g.font = 'italic 700 74px Georgia, serif'; g.fillText('Condensed', cx, 220); g.fillText('Milk', cx, 292);
      g.fillStyle = '#c9a046'; g.font = '600 22px Georgia, serif'; g.fillText('FULL CREAM · 400 g', cx, 322);
    }
    g.fillStyle = '#fff'; g.font = '600 26px Georgia, serif'; g.textAlign = 'center'; g.fillText('SINCE 1930 · PERFECT FOR SPANISH LATTE', w / 2, 46);
  });
  const milkLabel = tex(512, 256, (g, w, h) => {
    g.fillStyle = '#fbf7ef'; g.fillRect(0, 0, w, h); g.fillStyle = '#b5293a'; g.fillRect(0, 0, w, 36); g.fillRect(0, h - 30, w, 30);
    g.fillStyle = '#b5293a'; g.font = 'italic 700 86px Georgia, serif'; g.textAlign = 'center'; g.fillText('Fresh', w / 2, 128);
    g.font = '600 52px Georgia, serif'; g.fillText('MILK', w / 2, 190);
    g.fillStyle = '#fff'; g.font = '600 20px Georgia, serif'; g.fillText('FARM DAIRY · 1 L', w / 2, 26);
  });
  const crema = tex(256, 256, (g) => {
    const r = g.createRadialGradient(128, 128, 0, 128, 128, 128); r.addColorStop(0, '#c98a4a'); r.addColorStop(.55, '#a8662e'); r.addColorStop(.85, '#6b3a17'); r.addColorStop(1, '#3a1c0b');
    g.fillStyle = r; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(255,${200 + Math.random() * 40},${150 + Math.random() * 40},${Math.random() * .12})`; g.beginPath(); g.arc(128 + (Math.random() - .5) * 200, 128 + (Math.random() - .5) * 200, Math.random() * 3, 0, 7); g.fill(); }
  });
  const dewTex = tex(512, 512, (g, w, h) => {
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) { const r = Math.random() * Math.random() * 6 + .6, x = Math.random() * w, y = Math.random() * h; const gr = g.createRadialGradient(x - r * .3, y - r * .3, 0, x, y, r); gr.addColorStop(0, '#fff'); gr.addColorStop(1, 'rgba(255,255,255,.15)'); g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, r, r * 1.15, 0, 0, 7); g.fill(); }
  }, false);
  dewTex.wrapS = dewTex.wrapT = THREE.RepeatWrapping; dewTex.repeat.set(3, 2);

  /* ---------- materials ---------- */
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: 0.04, transparent: true, opacity: 0.16, clearcoat: 1, clearcoatRoughness: 0.03, specularIntensity: 1, envMapIntensity: 1.6, side: THREE.DoubleSide, depthWrite: false });
  const dewMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.15, transparent: true, opacity: 0, alphaMap: dewTex, clearcoat: 1, depthWrite: false, envMapIntensity: 2 });
  const iceMat = new THREE.MeshPhysicalMaterial({ color: 0xeaf6ff, roughness: 0.08, transparent: true, opacity: 0.55, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 2.2, depthWrite: false });
  const steel = new THREE.MeshPhysicalMaterial({ color: 0xd9dde2, metalness: 1, roughness: 0.18 });
  const ceramic = new THREE.MeshPhysicalMaterial({ color: 0xfaf8f4, roughness: 0.25, clearcoat: 0.8, clearcoatRoughness: 0.1 });

  const world = new THREE.Group(); scene.add(world);
  const counter = new THREE.Mesh(new THREE.CircleGeometry(4.2, 64), new THREE.MeshStandardMaterial({ map: woodTex, roughness: 0.42, metalness: 0.05, transparent: true, alphaMap: fade }));
  counter.rotation.x = -Math.PI / 2; counter.receiveShadow = true; world.add(counter);

  /* ---------- the glass ---------- */
  const GH = 1.0, R0 = 0.27, R1 = 0.33, WALL = 0.022, BASE = 0.07;
  const outerPts = [new V2(0, 0), new V2(R0 + WALL, 0), new V2(R0 + WALL + 0.006, 0.01)];
  for (let i = 1; i <= 20; i++) { const y = i / 20 * GH; outerPts.push(new V2(R0 + WALL + (R1 - R0) * y / GH, y)); }
  outerPts.push(new V2(R1 + WALL * 0.5, GH + 0.006), new V2(R1, GH));
  for (let i = 20; i >= 0; i--) { const y = BASE + i / 20 * (GH - BASE); outerPts.push(new V2(R0 + (R1 - R0) * y / GH, y)); }
  outerPts.push(new V2(0, BASE));
  const glassGeo = new THREE.LatheGeometry(outerPts, 72);
  const glass = new THREE.Mesh(glassGeo, glassMat); glass.renderOrder = 10;
  const dew = new THREE.Mesh(new THREE.LatheGeometry(outerPts.slice(2, 23).map(p => new V2(p.x + 0.003, p.y)), 72), dewMat); dew.renderOrder = 11;
  const glassGroup = new THREE.Group(); glassGroup.position.set(0, 0, 0.42); glassGroup.add(glass, dew); world.add(glassGroup);
  const shadowCatcher = new THREE.Mesh(new THREE.CylinderGeometry(R0 + WALL, R0 + WALL, BASE, 48), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.08 }));
  shadowCatcher.position.y = BASE / 2; shadowCatcher.castShadow = true; glassGroup.add(shadowCatcher);

  /* ---------- the liquid: one tapered cylinder whose colour depends on height ---------- */
  const L = { level: 0, b1: 0, b2: 9, soft: 0, mix: 0, swirl: 0, time: 0 };
  const liqU = { uLevel: { value: 0.0001 }, uB1: { value: 0 }, uB2: { value: 9 }, uSoft: { value: 0 }, uMix: { value: 0 }, uTime: { value: 0 }, uSwirl: { value: 0 }, uR0: { value: R0 - 0.004 }, uRk: { value: (R1 - R0) / GH } };
  const liqMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.18, clearcoat: 0.6, clearcoatRoughness: 0.2, sheen: 0.3 });
  liqMat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, liqU);
    sh.vertexShader = 'uniform float uLevel; uniform float uR0; uniform float uRk; varying float vLiqY; varying vec2 vLiqXZ;\n' + sh.vertexShader.replace('#include <begin_vertex>', `
      vec3 transformed = vec3(position);
      float yy = (position.y + 0.5) * uLevel;
      float rr = uR0 + uRk * (yy + ${BASE.toFixed(3)});
      transformed.xz *= rr; transformed.y = yy;
      vLiqY = yy; vLiqXZ = transformed.xz;`);
    sh.fragmentShader = 'uniform float uB1; uniform float uB2; uniform float uSoft; uniform float uMix; uniform float uTime; uniform float uSwirl; varying float vLiqY; varying vec2 vLiqXZ;\n' + sh.fragmentShader.replace('vec4 diffuseColor = vec4( diffuse, opacity );', `
      float ang = atan(vLiqXZ.y, vLiqXZ.x);
      float n = sin(ang * 5.0 + uTime * 0.8 + vLiqY * 9.0) * 0.012 + sin(ang * 11.0 - uTime * 1.3) * 0.006;
      n *= 1.0 + uSwirl * 4.0;
      vec3 cCM = vec3(0.86, 0.72, 0.47), cMilk = vec3(0.92, 0.89, 0.83), cEsp = vec3(0.075, 0.032, 0.014), cMix = vec3(0.56, 0.33, 0.17);
      float y = vLiqY + n;
      vec3 col = mix(cCM, cMilk, smoothstep(uB1 - 0.015, uB1 + 0.015, y));
      float espBand = smoothstep(uB2 - uSoft, uB2 + 0.015, y + n * 3.0 * (1.0 + uSoft * 6.0));
      col = mix(col, cEsp, espBand);
      // the espresso trickles down through the milk in streaks
      float streak = smoothstep(0.55, 1.0, sin(ang * 7.0 + vLiqY * 6.0 + uTime * 0.3)) * smoothstep(uB2 - uSoft * 1.6, uB2, vLiqY) * step(uB2, 5.0) * min(1.0, uSoft * 4.0);
      col = mix(col, mix(cMilk, cEsp, 0.55), streak * (1.0 - espBand));
      col = mix(col, cMix * (0.94 + vLiqY * 0.12), uMix);
      vec4 diffuseColor = vec4(col, opacity);`);
  };
  const liquid = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 64, 24), liqMat);
  liquid.position.y = BASE; liquid.visible = false; liquid.renderOrder = 1; liquid.raycast = () => {}; glassGroup.add(liquid);

  /* ice cubes */
  const iceGeo = new RoundedBoxGeometry(0.14, 0.14, 0.14, 3, 0.03);
  const cubes = [];
  for (let i = 0; i < 6; i++) {
    const c = new THREE.Mesh(iceGeo, iceMat); c.visible = false; c.renderOrder = 5;
    const a = i / 6 * Math.PI * 2 + 0.3, r = i % 2 ? 0.13 : 0.08;
    c.userData = { rest: new V3(Math.cos(a) * r, 0, Math.sin(a) * r), rot: new THREE.Euler(Math.random() * 3, Math.random() * 3, Math.random() * 3), stack: i < 3 ? 0 : 1, y: 2, vy: 0, active: false, seed: Math.random() * 10 };
    glassGroup.add(c); cubes.push(c);
  }

  /* spoon for stirring */
  const spoon = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 1.3, 10), steel); shaft.position.y = 0.65;
  const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.05, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), steel); bowl.scale.set(1, 0.4, 1.6); bowl.rotation.x = Math.PI;
  const twist = new THREE.Mesh(new THREE.TorusGeometry(0.014, 0.004, 6, 16), steel); twist.position.y = 1.0; twist.rotation.x = Math.PI / 2;
  spoon.add(shaft, bowl, twist); spoon.visible = false; spoon.position.y = BASE + 0.05; spoon.rotation.z = 0.12; glassGroup.add(spoon);

  /* ---------- ingredients on the back of the counter ---------- */
  const props = {};
  function lathe(pts, mat, seg = 48) { const m = new THREE.Mesh(new THREE.LatheGeometry(pts.map(p => new V2(p[0], p[1])), seg), mat); m.castShadow = m.receiveShadow = true; return m; }

  // condensed milk can (opened, with a ring of thick cream inside)
  { const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.3, 48, 1, true), new THREE.MeshPhysicalMaterial({ map: canLabel, roughness: 0.35, clearcoat: 0.6 })); body.position.y = 0.17; body.castShadow = true;
    const rimTop = lathe([[0.145, 0.32], [0.163, 0.32], [0.163, 0.335], [0.15, 0.338]], steel), rimBot = lathe([[0.15, 0.0], [0.163, 0.004], [0.163, 0.022], [0.15, 0.024], [0, 0.024]], steel);
    const cream = new THREE.Mesh(new THREE.CircleGeometry(0.146, 40), new THREE.MeshPhysicalMaterial({ color: 0xe9d5a8, roughness: 0.25, clearcoat: 0.8 })); cream.rotation.x = -Math.PI / 2; cream.position.y = 0.31;
    g.add(body, rimTop, rimBot, cream); g.userData = { spout: new V3(0.16, 0.335, 0), color: 0xe6cf9c, thick: 0.03, tilt: 1.75, name: 'condensed milk' }; props.cm = g; }

  // a glass bowl of ice
  { const g = new THREE.Group();
    const b = lathe([[0, 0], [0.12, 0], [0.2, 0.05], [0.25, 0.16], [0.26, 0.17], [0.24, 0.165], [0.19, 0.06], [0.11, 0.02], [0, 0.02]], glassMat.clone()); b.material.opacity = 0.22; b.renderOrder = 9;
    g.add(b);
    for (let i = 0; i < 6; i++) { const c = new THREE.Mesh(iceGeo, iceMat); c.scale.setScalar(0.85); c.position.set(Math.cos(i * 1.1) * 0.1, 0.08 + (i % 2) * 0.06, Math.sin(i * 1.1) * 0.1); c.rotation.set(i, i * 2, i * 3); c.renderOrder = 6; g.add(c); }
    g.userData = { spout: new V3(0.25, 0.17, 0), color: 0xffffff, thick: 0, tilt: 1.2, name: 'ice' }; props.ice = g; }

  // milk bottle
  { const g = new THREE.Group();
    const shape = [[0, 0], [0.13, 0], [0.135, 0.02], [0.135, 0.36], [0.11, 0.46], [0.06, 0.53], [0.055, 0.6], [0.06, 0.62], [0.05, 0.63], [0, 0.63]];
    const bottle = lathe(shape, glassMat.clone()); bottle.material.opacity = 0.25; bottle.renderOrder = 9;
    const milk = lathe([[0, 0.012], [0.124, 0.012], [0.124, 0.35], [0.1, 0.44], [0.0, 0.44]], new THREE.MeshPhysicalMaterial({ color: 0xfbf9f4, roughness: 0.3, sheen: 0.6 }));
    const label = new THREE.Mesh(new THREE.CylinderGeometry(0.137, 0.137, 0.16, 48, 1, true, -Math.PI * 0.55, Math.PI * 1.1), new THREE.MeshPhysicalMaterial({ map: milkLabel, roughness: 0.6 })); label.position.y = 0.2; label.rotation.y = Math.PI / 2 * 0;
    const cap = lathe([[0, 0.6], [0.064, 0.6], [0.066, 0.66], [0.06, 0.67], [0, 0.67]], new THREE.MeshPhysicalMaterial({ color: 0xb5293a, roughness: 0.35, clearcoat: 0.8 }));
    g.add(milk, bottle, label, cap); g.userData = { spout: new V3(0.06, 0.62, 0), color: 0xfbf9f4, thick: 0.022, tilt: 2.1, name: 'milk', cap }; props.milk = g; }

  // espresso cup with crema, on a saucer
  { const g = new THREE.Group();
    const saucer = lathe([[0, 0], [0.16, 0.0], [0.2, 0.025], [0.205, 0.03], [0.17, 0.022], [0.07, 0.012], [0, 0.014]], ceramic);
    const cup = lathe([[0, 0.014], [0.06, 0.014], [0.075, 0.03], [0.1, 0.1], [0.105, 0.17], [0.098, 0.17], [0.093, 0.1], [0.07, 0.036], [0, 0.03]], ceramic);
    const coffee = new THREE.Mesh(new THREE.CircleGeometry(0.094, 40), new THREE.MeshPhysicalMaterial({ map: crema, roughness: 0.3, clearcoat: 0.8 })); coffee.rotation.x = -Math.PI / 2; coffee.position.y = 0.14;
    const handle = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.011, 10, 24, Math.PI * 1.3), ceramic); handle.position.set(-0.115, 0.11, 0); handle.rotation.z = Math.PI * 0.62; handle.castShadow = true;
    g.add(saucer, cup, coffee, handle); g.userData = { spout: new V3(0.105, 0.17, 0), color: 0x2b130a, thick: 0.016, tilt: 1.9, name: 'espresso', coffee, carry: [cup, coffee, handle] }; props.esp = g; }

  const home = { cm: [-0.95, 0.0], ice: [-0.62, -0.5], milk: [0.62, -0.5], esp: [0.95, 0.0] };
  for (const k in props) { const p = props[k]; p.position.set(home[k][0], 0, home[k][1]); p.userData.home = p.position.clone(); p.traverse(o => { if (o.isMesh) { o.castShadow = true; o.userData.prop = k; } }); world.add(p); }

  /* pour stream */
  const streamMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.15, clearcoat: 0.6 });
  const stream = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 14), streamMat); stream.visible = false; world.add(stream);

  /* ---------- sound effects (tiny, synthesized) ---------- */
  let ac = null;
  function audio() { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); return ac; } catch (e) { return null; } }
  function clink(delay = 0) { const a = audio(); if (!a) return; const t = a.currentTime + delay; [2600, 3900, 5200].forEach((f, i) => { const o = a.createOscillator(), g = a.createGain(); o.frequency.value = f * (0.95 + Math.random() * .1); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.06 / (i + 1), t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25); o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + 0.3); }); }
  function pourSound(dur, thick) { const a = audio(); if (!a) return; const n = a.createBuffer(1, a.sampleRate * dur, a.sampleRate), d = n.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; const s = a.createBufferSource(); s.buffer = n; const f = a.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = thick ? 500 : 1400; f.Q.value = 0.8; const g = a.createGain(), t = a.currentTime; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(thick ? 0.05 : 0.08, t + 0.2); g.gain.linearRampToValueAtTime(0.0001, t + dur); s.connect(f); f.connect(g); g.connect(a.destination); s.start(); }
  function ding() { const a = audio(); if (!a) return; const t = a.currentTime; [1046, 1318, 1568].forEach((f, i) => { const o = a.createOscillator(), g = a.createGain(); o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t + i * 0.09); g.gain.linearRampToValueAtTime(0.08, t + i * 0.09 + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.09 + 0.9); o.connect(g); g.connect(a.destination); o.start(t + i * 0.09); o.stop(t + i * 0.09 + 1); }); }

  /* ---------- animation helpers ---------- */
  const tweens = [];
  function tween(dur, fn, ease = e => e < .5 ? 2 * e * e : 1 - Math.pow(-2 * e + 2, 2) / 2) { return new Promise(res => tweens.push({ t: 0, dur, fn, ease, res })); }
  const wait = s => tween(s, () => {});
  const ease3 = e => 1 - Math.pow(1 - e, 3);

  /* ---------- state machine ---------- */
  let step = 0, busy = false, done = false, sips = 0;
  const say = (t) => onMessage && onMessage(t);
  const NEXT = { cm: 'the condensed milk', ice: 'the ice', milk: 'the milk', esp: 'the espresso', stir: 'a good stir' };

  async function pour(k) {
    const p = props[k], u = p.userData, from = u.home.clone();
    const above = new V3(-0.5, 1.28, 0.42);
    if (u.cap) await tween(0.25, e => { u.cap.position.y = e * 0.25; u.cap.material.opacity = 1; });
    await tween(0.7, e => { p.position.lerpVectors(from, above, ease3(e)); p.position.y += Math.sin(e * Math.PI) * 0.2; });
    const sp = new V3(), target = -0.06;
    const tilt = -u.tilt;
    await tween(0.45, e => { p.rotation.z = tilt * ease3(e); p.updateMatrixWorld(); sp.copy(u.spout); p.localToWorld(sp); p.position.x += (target - sp.x) * 0.5; });
    return { p, u, from, sp };
  }
  async function putBack({ p, u, from }) {
    stream.visible = false;
    const start = p.position.clone();
    await tween(0.35, e => { p.rotation.z = -u.tilt * (1 - e); });
    await tween(0.7, e => { p.position.lerpVectors(start, from, ease3(e)); p.position.y += Math.sin(e * Math.PI) * 0.15; });
    if (u.cap) await tween(0.25, e => { u.cap.position.y = (1 - e) * 0.25; });
  }
  function streamTo(sp, u, w) {
    const top = new V3(), surf = glassGroup.position.y + BASE + L.level;
    top.copy(sp); const len = Math.max(0.01, top.y - surf);
    stream.visible = w > 0.01; stream.material.color.set(u.color);
    stream.scale.set(u.thick * w, len, u.thick * w);
    stream.position.set(top.x + 0.01, surf + len / 2, top.z);
  }

  async function doStep(k) {
    if (busy || done) return;
    if (STEPS[step] !== k) { say(`Not yet! First, ${NEXT[STEPS[step]]}.`); return; }
    if (k === 'stir') { autoStir(); return; }
    busy = true; onStep && onStep(step, 'active');
    if (k === 'cm') {
      say('A slow, golden ribbon of condensed milk. That’s the Spanish part.');
      const s = await pour('cm'); liquid.visible = true; pourSound(2.2, true);
      await tween(2.2, e => { L.level = 0.14 * e; L.b1 = L.level; streamTo(s.sp, s.u, Math.min(1, e * 4, (1 - e) * 5)); });
      await putBack(s);
    } else if (k === 'ice') {
      say('Clink, clink, clink. Ice in.');
      const s = await pour('ice');
      const bowlCubes = props.ice.children.filter(c => c.geometry === iceGeo);
      bowlCubes.forEach(c => (c.visible = false));
      cubes.forEach((c, i) => { const d = c.userData; c.visible = true; d.active = true; d.y = 1.15 + i * 0.12; d.vy = 0; d.delay = i * 0.14; });
      for (let i = 0; i < cubes.length; i++) clink(0.35 + i * 0.14 + Math.random() * .05);
      await wait(1.4);
      await putBack(s); bowlCubes.forEach(c => (c.visible = true));
      tween(1.5, e => { dewMat.opacity = 0.55 * e; });
    } else if (k === 'milk') {
      say('Cold milk, almost to the top.');
      const s = await pour('milk'); pourSound(2.4, false);
      const l0 = L.level;
      await tween(2.4, e => { L.level = l0 + (0.66 - l0) * e; L.b2 = 9; streamTo(s.sp, s.u, Math.min(1, e * 4, (1 - e) * 5)); });
      await putBack(s);
    } else if (k === 'esp') {
      say('And now the espresso… watch it cascade.');
      const s = await pour('esp'); pourSound(1.6, false);
      L.b2 = L.level;
      const l0 = L.level;
      await tween(1.6, e => { L.level = l0 + 0.16 * e; streamTo(s.sp, s.u, Math.min(1, e * 4, (1 - e) * 5)); props.esp.userData.coffee.position.y = 0.14 - 0.1 * e; });
      await putBack(s); props.esp.userData.coffee.position.y = 0.14;
      tween(3.5, e => { L.soft = 0.3 * e; }, ease3);
      spoon.visible = true; spoon.position.set(0.12, BASE + 0.05, 0); tween(0.6, e => { spoon.position.y = BASE + 0.05 + (1 - ease3(e)) * 0.8; });
      say('Now stir! Draw circles over the glass with your finger.');
    }
    onStep && onStep(step, 'done');
    step++;
    if (step < STEPS.length) onStep && onStep(step, 'next');
    busy = false;
    if (step === STEPS.length) finish();
  }

  /* stirring: circles over the glass mix it, or tap Stir to let it stir itself */
  let stirAngle = 0, stirLast = null;
  function stirBy(delta) {
    if (STEPS[step] !== 'stir' || done) return;
    stirAngle += delta; L.mix = Math.min(1, L.mix + Math.abs(delta) / (Math.PI * 7)); L.swirl = Math.min(1, L.swirl + Math.abs(delta) * 0.25);
    spoon.position.x = Math.cos(stirAngle) * 0.13; spoon.position.z = Math.sin(stirAngle) * 0.13;
    if (L.mix >= 1) { onStep && onStep(step, 'done'); step++; finish(); }
  }
  let autoStirring = false;
  async function autoStir() { if (autoStirring || STEPS[step] !== 'stir') return; autoStirring = true; const a0 = stirAngle; await tween(2.6, e => { const a = a0 + e * Math.PI * 7.2; stirBy(a - stirAngle); }, x => x); autoStirring = false; }

  function finish() {
    if (done) return; done = true; ding();
    tween(0.8, e => { spoon.position.y = BASE + 0.05 + e * 1.4; }).then(() => { spoon.visible = false; });
    say('Perfect Spanish latte! 10/10, would order again. ☕ Tap the glass for a sip.');
    onDone && onDone();
  }
  function sip() {
    if (!done || busy || L.level < 0.3) return;
    busy = true; sips++;
    const l0 = L.level;
    tween(0.9, e => { L.level = l0 - 0.12 * Math.sin(e * Math.PI / 2); glassGroup.rotation.z = Math.sin(e * Math.PI) * 0.12; }).then(() => { busy = false; });
    say(sips === 1 ? 'Mmm. Sweet, strong and creamy, just like someone I know.' : sips === 2 ? 'Another sip? Okay, one more…' : 'Time for a refill!');
  }

  function reset() {
    step = 0; done = false; busy = false; sips = 0; L.level = 0; L.b1 = 0; L.b2 = 9; L.soft = 0; L.mix = 0; L.swirl = 0; stirAngle = 0;
    liquid.visible = false; dewMat.opacity = 0; spoon.visible = false; glassGroup.rotation.z = 0;
    cubes.forEach(c => { c.visible = false; c.userData.active = false; });
    say('A fresh glass. Start with the condensed milk.');
  }

  /* ---------- pointer: tap ingredients, tap the glass, circle to stir ---------- */
  const ray = new THREE.Raycaster(), ndc = new V2();
  function pick(e) {
    const r = canvas.getBoundingClientRect(); ndc.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObjects([...Object.values(props), glassGroup], true);
    for (const h of hits) { if (h.object.userData.prop) return h.object.userData.prop; if (glassGroup.children.includes(h.object) || h.object.parent === glassGroup) return 'glass'; }
    return null;
  }
  function glassScreen() { const v = new V3(0, BASE + L.level * 0.6, 0); glassGroup.localToWorld(v); v.project(camera); const r = canvas.getBoundingClientRect(); return { x: (v.x + 1) / 2 * r.width + r.left, y: (1 - v.y) / 2 * r.height + r.top }; }
  let down = null;
  canvas.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY, moved: false }; stirLast = null; if (STEPS[step] === 'stir' && !done) try { canvas.setPointerCapture(e.pointerId); } catch (er) {} });
  canvas.addEventListener('pointermove', e => {
    if (!down) return;
    if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 8) down.moved = true;
    if (STEPS[step] === 'stir' && !done) {
      const c = glassScreen(), a = Math.atan2(e.clientY - c.y, e.clientX - c.x);
      if (stirLast !== null) { let d = a - stirLast; if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; stirBy(d); }
      stirLast = a;
    }
  });
  canvas.addEventListener('pointerup', e => {
    if (down && !down.moved) { const k = pick(e); if (k === 'glass') { if (done) sip(); else if (STEPS[step] === 'stir') autoStir(); else say(`Next up: ${NEXT[STEPS[step]]}. Tap it on the counter.`); } else if (k) doStep(k); }
    down = null; stirLast = null;
  });
  canvas.addEventListener('pointercancel', () => { down = null; });

  /* hover highlight on desktop */
  canvas.addEventListener('pointermove', e => { if (e.pointerType !== 'mouse' || down) return; const k = pick(e); canvas.style.cursor = k ? 'pointer' : (STEPS[step] === 'stir' && !done ? 'grab' : 'default'); });

  /* ---------- sizing ---------- */
  const look = new V3(0, 0.5, 0.05);
  function resize() {
    const w = canvas.clientWidth || 400, h = canvas.clientHeight || 400;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    const vf = THREE.MathUtils.degToRad(camera.fov) / 2, hf = Math.atan(Math.tan(vf) * camera.aspect);
    const dist = Math.max(1.02 / Math.tan(vf), (camera.aspect < 1 ? 1.14 : 1.24) / Math.tan(hf));
    camera.position.copy(look).add(new V3(0, 0.62, 1).normalize().multiplyScalar(dist));
    camera.lookAt(look); camera.updateProjectionMatrix();
  }
  resize();
  const ro = new ResizeObserver(resize); ro.observe(canvas);

  /* ---------- loop ---------- */
  const clock = new THREE.Clock(); let raf = 0, running = false, slow = 0, level = 0, lastWall = 0;
  function adapt(now) { const ms = lastWall ? now - lastWall : 16; lastWall = now; if (level >= 2) return; slow = ms > 45 ? slow + 1 : Math.max(0, slow - 1); if (slow < 8) return; slow = 0; level++; if (level === 1) renderer.setPixelRatio(Math.min(renderer.getPixelRatio(), 1.25)); else { renderer.setPixelRatio(1); renderer.shadowMap.enabled = false; key.castShadow = false; scene.traverse(o => { if (o.material) o.material.needsUpdate = true; }); } resize(); }
  function frame(now) {
    raf = requestAnimationFrame(frame); adapt(now || performance.now());
    const rawDt = clock.getDelta(), dt = Math.min(rawDt, 0.05), tdt = Math.min(rawDt, 0.25); L.time += dt;
    for (let i = tweens.length - 1; i >= 0; i--) { const tw = tweens[i]; tw.t = Math.min(1, tw.t + tdt / tw.dur); tw.fn(tw.ease(tw.t)); if (tw.t >= 1) { tweens.splice(i, 1); tw.res(); } }
    // ice: fall, bounce, then float near the surface once there is milk
    cubes.forEach((c, i) => {
      const d = c.userData; if (!d.active) return;
      if (d.delay > 0) { d.delay -= dt; c.position.set(-0.08 + d.rest.x * 0.3, d.y, d.rest.z * 0.3); return; }
      const floor = L.level > 0.3 ? BASE + L.level - 0.1 + d.stack * 0.03 + Math.sin(L.time * 1.3 + d.seed) * 0.008 : BASE + L.level + 0.07 + d.stack * 0.13;
      d.vy -= 9.8 * dt * 0.6; d.y += d.vy * dt;
      if (d.y < floor) { d.y = floor; d.vy = L.level > 0.3 ? 0 : -d.vy * 0.25; if (L.level > 0.3) d.y += (floor - d.y) * 0.1; }
      c.position.set(c.position.x + (d.rest.x - c.position.x) * Math.min(1, dt * 4), d.y, c.position.z + (d.rest.z - c.position.z) * Math.min(1, dt * 4));
      c.rotation.set(d.rot.x + L.swirl * L.time * (i % 2 ? 1 : -1) * .5, d.rot.y + stirAngle * 0.6, d.rot.z);
    });
    L.swirl *= Math.pow(0.4, dt);
    liqU.uLevel.value = Math.max(0.0001, L.level); liqU.uB1.value = L.b1; liqU.uB2.value = L.b2; liqU.uSoft.value = L.soft; liqU.uMix.value = L.mix; liqU.uTime.value = L.time; liqU.uSwirl.value = L.swirl;
    renderer.render(scene, camera);
  }
  function start() { if (running) return; running = true; clock.getDelta(); frame(); }
  function stop() { running = false; cancelAnimationFrame(raf); raf = 0; }

  renderer.compile(scene, camera); renderer.render(scene, camera);
  say('Your café is open, Barista Sagarika. Start with the condensed milk.');
  return { start, stop, doStep, reset, sip, autoStir, get step() { return STEPS[step]; }, get done() { return done; } };
}
