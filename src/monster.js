/* Her other fuel: a real-time 3D Monster Ultra can.
   The real can photo is wrapped onto a 3D can whose profile is traced from the
   photo itself, so from the front it looks exactly like the photo.
   Top view → lift the tab with a finger → seal cracks, droplets spray →
   the camera swings round to the front → the can pours into a glass. */
import * as THREE from 'three';
import { makeQuality, smartShadows } from './quality.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const V2 = THREE.Vector2, V3 = THREE.Vector3;

export function createMonster(canvas, { photo, onPhase, onMessage } = {}) {
  /* ---------- renderer / scene ---------- */
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  const adapt = makeQuality(renderer, () => resize()); // final resolution before the first sizing: the canvas buffer is allocated once
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.debug.checkShaderErrors = false; // the checks read shader logs synchronously and stall the page
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.03).texture; scene.environmentIntensity = 0.8;
  const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 50);
  scene.add(new THREE.HemisphereLight(0xe8f0ff, 0x101218, 0.5));
  const key = new THREE.SpotLight(0xffffff, 42, 16, 0.5, 0.75, 1.4); key.position.set(2.4, 5.5, 3.2); key.target.position.set(0, 0.9, 0);
  key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.0004; key.shadow.radius = 5; scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0xcfe0ff, 1.4); rim.position.set(-3, 3, -3.5); scene.add(rim);
  const fill = new THREE.DirectionalLight(0xffffff, 0.5); fill.position.set(0, 2, 5); scene.add(fill);

  /* ---------- the can, traced from the photo ---------- */
  const IMG_W = 300, IMG_H = 795, CX = 151, TOP_PX = 8, BOT_PX = 794;
  // half-widths (px) of the can silhouette in the photo, top to bottom
  const SIL = [[8, 128], [10, 135.5], [20, 135.5], [40, 137.5], [60, 143], [90, 145], [400, 145], [740, 145], [760, 142], [770, 140], [780, 123.5], [790, 106.5], [794, 102.5]];
  const R = 0.33, PX = R / 145, H = (BOT_PX - TOP_PX) * PX;
  const hwAt = y => { for (let i = 1; i < SIL.length; i++) if (y <= SIL[i][0]) { const a = SIL[i - 1], b = SIL[i], t = (y - a[0]) / (b[0] - a[0]); return a[1] + (b[1] - a[1]) * t; } return SIL[SIL.length - 1][1]; };
  const pts = [], meta = [];
  for (let y = BOT_PX; y >= TOP_PX; y -= 3) { const hw = hwAt(y); pts.push(new V2(hw * PX, (BOT_PX - y) * PX)); meta.push([y, hw]); }
  const SEG = 128, bodyGeo = new THREE.LatheGeometry(pts, SEG);
  { // u = horizontal position in the photo (sin of the angle), v = row in the photo
    const pos = bodyGeo.attributes.position, uv = bodyGeo.attributes.uv, np = pts.length;
    for (let i = 0; i < pos.count; i++) {
      const j = i % np, [ypx, hw] = meta[j], x = pos.getX(i), z = pos.getZ(i), r = Math.hypot(x, z) || 1;
      uv.setXY(i, (CX + (x / r) * (hw - 1.5)) / IMG_W, 1 - ypx / IMG_H);
    }
    uv.needsUpdate = true;
  }
  const loader = new THREE.TextureLoader();
  const photoTex = loader.load(photo || 'assets/img/monster-can.webp');
  photoTex.colorSpace = THREE.SRGBColorSpace; photoTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const bodyMat = new THREE.MeshPhysicalMaterial({ map: photoTex, emissiveMap: photoTex, emissive: 0xffffff, emissiveIntensity: 0.32, roughness: 0.34, metalness: 0.2, clearcoat: 0.7, clearcoatRoughness: 0.18, envMapIntensity: 0.6 });
  const alu = new THREE.MeshPhysicalMaterial({ color: 0xaab2b9, metalness: 1, roughness: 0.3, clearcoat: 0.3, envMapIntensity: 0.75 });
  const aluDark = new THREE.MeshPhysicalMaterial({ color: 0x7d868e, metalness: 1, roughness: 0.4, envMapIntensity: 0.7 });

  const can = new THREE.Group(), canInner = new THREE.Group(); can.add(canInner); scene.add(can);
  can.rotation.order = 'ZYX'; // spin the can about its own axis, then tilt it in the world
  const body = new THREE.Mesh(bodyGeo, bodyMat); body.castShadow = true; body.receiveShadow = true; canInner.add(body);
  // bottom dome
  const rb = SIL[SIL.length - 1][1] * PX;
  const bottom = new THREE.Mesh(new THREE.LatheGeometry([new V2(0, 0.06), new V2(rb * 0.6, 0.045), new V2(rb * 0.92, 0.008), new V2(rb, 0.001)], 64), aluDark); canInner.add(bottom);
  // rim lip, countersink and lid
  const rTop = SIL[0][1] * PX, LID = H - 0.028;
  const rimGeo = new THREE.LatheGeometry([new V2(rTop - 0.004, H - 0.006), new V2(rTop + 0.004, H + 0.004), new V2(rTop - 0.004, H + 0.012), new V2(rTop - 0.016, H + 0.004), new V2(rTop - 0.022, LID - 0.012), new V2(rTop - 0.03, LID - 0.014), new V2(rTop - 0.036, LID)], 96);
  const rimMesh = new THREE.Mesh(rimGeo, alu); rimMesh.castShadow = true; canInner.add(rimMesh);
  const RL = rTop - 0.036;
  // the drinking opening: a rounded teardrop in front of the rivet
  const OZ = 0.155, OW = 0.07, OL = 0.085;
  const openShape = (s) => { const p = new THREE.Path(); p.moveTo(-OW * s, -OL * 0.55 * s); p.bezierCurveTo(-OW * 1.15 * s, OL * 0.5 * s, -OW * 0.55 * s, OL * s, 0, OL * s); p.bezierCurveTo(OW * 0.55 * s, OL * s, OW * 1.15 * s, OL * 0.5 * s, OW * s, -OL * 0.55 * s); p.bezierCurveTo(OW * 0.6 * s, -OL * 0.9 * s, -OW * 0.6 * s, -OL * 0.9 * s, -OW * s, -OL * 0.55 * s); return p; };
  const lidShape = new THREE.Shape(); lidShape.absarc(0, 0, RL, 0, Math.PI * 2);
  const holePath = new THREE.Path(openShape(1.0).getPoints(40).map(p => new V2(p.x, -(p.y) - OZ)));
  lidShape.holes.push(holePath);
  const lid = new THREE.Mesh(new THREE.ShapeGeometry(lidShape, 48), alu); lid.rotation.x = -Math.PI / 2; lid.position.y = LID; lid.receiveShadow = true; canInner.add(lid);
  // a stamped ring on the lid
  const ring = new THREE.Mesh(new THREE.RingGeometry(RL * 0.83, RL * 0.86, 64), aluDark); ring.rotation.x = -Math.PI / 2; ring.position.y = LID + 0.0008; canInner.add(ring);
  // score line around the opening
  const score = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape(openShape(1.12).getPoints(40).map(p => new V2(p.x, -(p.y) - OZ)))), new THREE.MeshStandardMaterial({ color: 0x5d666d, metalness: 1, roughness: 0.5 }));
  score.rotation.x = -Math.PI / 2; score.position.y = LID - 0.0006; canInner.add(score);
  // inside the can: the drink, seen through the opening once it's open
  const inside = new THREE.Mesh(new THREE.CircleGeometry(RL, 48), new THREE.MeshPhysicalMaterial({ color: 0x3b3a1c, roughness: 0.1, clearcoat: 1 })); inside.rotation.x = -Math.PI / 2; inside.position.y = LID - 0.06; canInner.add(inside);
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(RL, RL, 0.06, 48, 1, true), new THREE.MeshStandardMaterial({ color: 0x8c949a, metalness: 1, roughness: 0.4, side: THREE.BackSide })); wall.position.y = LID - 0.03; canInner.add(wall);
  // the flap that folds into the can
  const flapPivot = new THREE.Group(); flapPivot.position.set(0, LID + 0.0005, OZ - OL * 0.62); canInner.add(flapPivot);
  const flapShape = new THREE.Shape(openShape(0.96).getPoints(40).map(p => new V2(p.x, -(p.y) - OL * 0.62 + 0.0)));
  const flap = new THREE.Mesh(new THREE.ShapeGeometry(flapShape), alu); flap.rotation.x = -Math.PI / 2; flapPivot.add(flap);
  // the ring-pull tab, hinged at the rivet
  const tabShape = new THREE.Shape();
  (function rr(s, x0, y0, x1, y1, r) { s.moveTo(x0 + r, y0); s.lineTo(x1 - r, y0); s.quadraticCurveTo(x1, y0, x1, y0 + r); s.lineTo(x1, y1 - r); s.quadraticCurveTo(x1, y1, x1 - r, y1); s.lineTo(x0 + r, y1); s.quadraticCurveTo(x0, y1, x0, y1 - r); s.lineTo(x0, y0 + r); s.quadraticCurveTo(x0, y0, x0 + r, y0); })(tabShape, -0.075, -0.085, 0.075, 0.24, 0.055);
  const finger = new THREE.Path(); (function rr(s, x0, y0, x1, y1, r) { s.moveTo(x0 + r, y0); s.lineTo(x1 - r, y0); s.quadraticCurveTo(x1, y0, x1, y0 + r); s.lineTo(x1, y1 - r); s.quadraticCurveTo(x1, y1, x1 - r, y1); s.lineTo(x0 + r, y1); s.quadraticCurveTo(x0, y1, x0, y1 - r); s.lineTo(x0, y0 + r); s.quadraticCurveTo(x0, y0, x0 + r, y0); })(finger, -0.05, 0.065, 0.05, 0.205, 0.04);
  tabShape.holes.push(finger);
  const tabGeo = new THREE.ExtrudeGeometry(tabShape, { depth: 0.006, bevelEnabled: true, bevelThickness: 0.0025, bevelSize: 0.003, bevelSegments: 2, curveSegments: 16 });
  tabGeo.rotateX(Math.PI / 2); // lay it flat: shape +y points to -z (the ring end is at the back)
  const tabPivot = new THREE.Group(); tabPivot.position.set(0, LID + 0.011, 0.0); canInner.add(tabPivot);
  const tabMat = new THREE.MeshPhysicalMaterial({ color: 0xb9c1c8, metalness: 1, roughness: 0.2, clearcoat: 0.6, envMapIntensity: 0.9 });
  const tab = new THREE.Mesh(tabGeo, tabMat); tab.castShadow = true; tab.rotation.y = Math.PI; tabPivot.add(tab);
  const rivet = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.024, 0.014, 24), alu); rivet.position.set(0, LID + 0.008, 0); canInner.add(rivet);
  canInner.traverse(o => { if (o.isMesh) o.castShadow = true; });
  // pivot the can about its middle so it can tilt and pour naturally
  const MID = H / 2; canInner.position.y = -MID; can.position.y = MID;

  /* ---------- the floor + the glass ---------- */
  const fadeTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); const r = g.createRadialGradient(128, 128, 10, 128, 128, 128); r.addColorStop(0, '#fff'); r.addColorStop(.6, '#999'); r.addColorStop(1, '#000'); g.fillStyle = r; g.fillRect(0, 0, 256, 256); return new THREE.CanvasTexture(c); })();
  const floor = new THREE.Mesh(new THREE.CircleGeometry(4, 64), new THREE.MeshStandardMaterial({ color: 0x15171d, roughness: 0.35, metalness: 0.3, transparent: true, alphaMap: fadeTex }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

  const GR0 = 0.24, GR1 = 0.3, GH = 0.95, GB = 0.06, GW = 0.018;
  const gPts = [new V2(0, 0), new V2(GR0 + GW, 0)]; for (let i = 1; i <= 16; i++) { const y = i / 16 * GH; gPts.push(new V2(GR0 + GW + (GR1 - GR0) * y / GH, y)); }
  gPts.push(new V2(GR1 + GW * 0.5, GH + 0.005), new V2(GR1, GH)); for (let i = 16; i >= 0; i--) { const y = GB + i / 16 * (GH - GB); gPts.push(new V2(GR0 + (GR1 - GR0) * y / GH, y)); } gPts.push(new V2(0, GB));
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.03, transparent: true, opacity: 0.15, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 1.8, side: THREE.DoubleSide, depthWrite: false });
  const glass = new THREE.Group(); const gMesh = new THREE.Mesh(new THREE.LatheGeometry(gPts, 64), glassMat); gMesh.renderOrder = 10; glass.add(gMesh); scene.add(glass);
  const glassShadow = new THREE.Mesh(new THREE.CylinderGeometry(GR0 + GW, GR0 + GW, GB, 32), new THREE.MeshStandardMaterial({ transparent: true, opacity: 0.06 })); glassShadow.position.y = GB / 2; glassShadow.castShadow = true; glass.add(glassShadow);
  // the drink in the glass: pale, sparkling Monster Ultra
  const drinkU = { uLevel: { value: 0.0001 }, uR0: { value: GR0 - 0.004 }, uRk: { value: (GR1 - GR0) / GH } };
  const drinkMat = new THREE.MeshPhysicalMaterial({ color: 0xeee39a, roughness: 0.03, transparent: true, opacity: 0.42, clearcoat: 1, envMapIntensity: 1.2, depthWrite: false });
  drinkMat.onBeforeCompile = sh => { Object.assign(sh.uniforms, drinkU); sh.vertexShader = 'uniform float uLevel; uniform float uR0; uniform float uRk;\n' + sh.vertexShader.replace('#include <begin_vertex>', `vec3 transformed = vec3(position); float yy = (position.y + 0.5) * uLevel; transformed.xz *= uR0 + uRk * (yy + ${GB.toFixed(3)}); transformed.y = yy;`); };
  const drink = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 48, 8), drinkMat); drink.position.y = GB; drink.renderOrder = 6; drink.visible = false; drink.raycast = () => {}; glass.add(drink);
  const foam = new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.6, transparent: true, opacity: 0.85, sheen: 1 })); foam.rotation.x = -Math.PI / 2; foam.visible = false; foam.renderOrder = 7; glass.add(foam);
  // rising bubbles in the glass
  const NB = 70, bubbles = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0, transparent: true, opacity: 0.75, clearcoat: 1, depthWrite: false, envMapIntensity: 2.5 }), NB);
  bubbles.renderOrder = 8; bubbles.visible = false; glass.add(bubbles);
  const bub = []; for (let i = 0; i < NB; i++) bub.push({ a: Math.random() * 6.28, r: Math.random() * 0.8, y: Math.random(), s: 0.004 + Math.random() * 0.008, v: 0.15 + Math.random() * 0.3 });

  /* pour stream */
  const stream = new THREE.Mesh(new THREE.CylinderGeometry(1, 0.8, 1, 14, 1, true), new THREE.MeshPhysicalMaterial({ color: 0xf2e7a8, roughness: 0.02, transparent: true, opacity: 0.5, clearcoat: 1, depthWrite: false }));
  stream.visible = false; stream.renderOrder = 9; scene.add(stream);

  /* droplets that burst out of the opening, plus a puff of gas */
  const ND = 46, drops = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 12, 8), new THREE.MeshPhysicalMaterial({ color: 0xfbf6d8, roughness: 0.02, transparent: true, opacity: 0.8, clearcoat: 1, envMapIntensity: 2.2 }), ND);
  drops.frustumCulled = false; canInner.add(drops);
  const D = []; for (let i = 0; i < ND; i++) D.push({ p: new V3(), v: new V3(), life: 0, stuck: false, s: 0 });
  const mistTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,.9)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  const mist = []; for (let i = 0; i < 14; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: mistTex, transparent: true, opacity: 0, depthWrite: false })); s.visible = false; canInner.add(s); mist.push({ s, v: new V3(), life: 0 }); }
  const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), S3 = new V3();
  function burst() {
    D.forEach((d, i) => {
      d.p.set((Math.random() - 0.5) * OW, LID + 0.01, OZ + (Math.random() - 0.5) * OL * 0.6);
      const sp = 0.6 + Math.random() * 1.3, a = Math.random() * Math.PI * 2;
      d.v.set(Math.cos(a) * sp * 0.35, 1.0 + Math.random() * 1.6, Math.sin(a) * sp * 0.35 + 0.15);
      d.life = 0.9 + Math.random() * 2.4; d.stuck = false; d.s = 0.006 + Math.random() * 0.014; d.delay = Math.random() * 0.12;
    });
    mist.forEach(m => { m.s.visible = true; m.s.position.set((Math.random() - .5) * 0.05, LID + 0.02, OZ); m.v.set((Math.random() - .5) * 0.3, 0.5 + Math.random() * 0.5, (Math.random() - .5) * 0.3); m.life = 1; m.s.scale.setScalar(0.05); });
  }

  /* ---------- sound: click, seal snap, hiss, fizz, pour ---------- */
  let ac = null;
  function audio() { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); return ac; } catch (e) { return null; } }
  function noise(d) { const n = ac.createBuffer(1, Math.max(1, Math.floor(ac.sampleRate * d)), ac.sampleRate), a = n.getChannelData(0); for (let i = 0; i < a.length; i++) a[i] = Math.random() * 2 - 1; const s = ac.createBufferSource(); s.buffer = n; return s; }
  function burstAt(t, dur, type, freq, q, gain, decay) { const s = noise(dur), f = ac.createBiquadFilter(), g = ac.createGain(); f.type = type; f.frequency.value = freq; f.Q.value = q; g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + decay); s.connect(f); f.connect(g); g.connect(ac.destination); s.start(t); s.stop(t + dur + 0.02); }
  function ping(t, f, gain, decay) { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = f; g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + decay); o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + decay + 0.02); }
  function clickSound() { if (!audio()) return; const t = ac.currentTime; burstAt(t, 0.008, 'bandpass', 3800, 3, 0.5, 0.03); ping(t, 2900, 0.05, 0.05); ping(t, 5200, 0.025, 0.03); }
  function openSound() {
    if (!audio()) return; const t = ac.currentTime;
    burstAt(t, 0.004, 'highpass', 1500, 0.7, 1.0, 0.02); burstAt(t + 0.013, 0.006, 'bandpass', 2200, 1.2, 0.8, 0.04);
    const o = ac.createOscillator(), og = ac.createGain(); o.frequency.setValueAtTime(170, t); o.frequency.exponentialRampToValueAtTime(60, t + 0.09); og.gain.setValueAtTime(0.35, t); og.gain.exponentialRampToValueAtTime(0.0001, t + 0.11); o.connect(og); og.connect(ac.destination); o.start(t); o.stop(t + 0.13);
    const h = noise(1.3), hp = ac.createBiquadFilter(), pk = ac.createBiquadFilter(), hg = ac.createGain();
    hp.type = 'highpass'; hp.frequency.setValueAtTime(2600, t); hp.frequency.exponentialRampToValueAtTime(1300, t + 1.1);
    pk.type = 'peaking'; pk.frequency.setValueAtTime(7200, t); pk.frequency.exponentialRampToValueAtTime(3600, t + 1.0); pk.gain.value = 9; pk.Q.value = 0.9;
    hg.gain.setValueAtTime(0.0001, t + 0.008); hg.gain.exponentialRampToValueAtTime(0.42, t + 0.03); hg.gain.exponentialRampToValueAtTime(0.12, t + 0.35); hg.gain.exponentialRampToValueAtTime(0.0001, t + 1.25);
    h.connect(hp); hp.connect(pk); pk.connect(hg); hg.connect(ac.destination); h.start(t + 0.008); h.stop(t + 1.3);
    fizzSound(t + 0.12, 3.2, 260, 0.12);
  }
  function fizzSound(t0, len, n, amp) { for (let i = 0; i < n; i++) { const tt = t0 + Math.pow(Math.random(), 1.8) * len; burstAt(tt, 0.0015, 'highpass', 3500 + Math.random() * 4000, 0.7, 0.03 + Math.random() * amp * (1 - (tt - t0) / (len + 0.2)), 0.006 + Math.random() * 0.01); } }
  function pourSound(dur) { if (!audio()) return; const t = ac.currentTime, s = noise(dur), f = ac.createBiquadFilter(), g = ac.createGain(); f.type = 'bandpass'; f.frequency.setValueAtTime(900, t); f.frequency.linearRampToValueAtTime(1600, t + dur); f.Q.value = 0.7; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.09, t + 0.25); g.gain.linearRampToValueAtTime(0.0001, t + dur); s.connect(f); f.connect(g); g.connect(ac.destination); s.start(); fizzSound(t + 0.3, dur + 1.5, 220, 0.09); }
  const buzz = p => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };

  /* ---------- camera rig ---------- */
  const look = new V3(), camPos = new V3();
  let framing = { w: 1, h: 1 };
  function shots() {
    const asp = camera.aspect, vf = THREE.MathUtils.degToRad(camera.fov) / 2, hf = Math.atan(Math.tan(vf) * asp);
    const topDist = Math.max(0.44 / Math.tan(vf), 0.44 / Math.tan(hf));
    const frontDist = Math.max(1.15 / Math.tan(vf), 1.2 / Math.tan(hf));
    return {
      top: { target: new V3(0, LID, 0.02), dist: topDist, polar: 0.2, az: 0 },
      front: { target: new V3(0.15, 0.95, 0), dist: frontDist, polar: 1.36, az: 0 }
    };
  }
  let rig = null;
  function place(c) { camPos.set(Math.sin(c.polar) * Math.sin(c.az), Math.cos(c.polar), Math.sin(c.polar) * Math.cos(c.az)).multiplyScalar(c.dist).add(c.target); camera.position.copy(camPos); camera.lookAt(c.target); }
  function lerpShot(a, b, e) { return { target: a.target.clone().lerp(b.target, e), dist: a.dist + (b.dist - a.dist) * e, polar: a.polar + (b.polar - a.polar) * e, az: a.az + (b.az - a.az) * e }; }

  function resize() {
    const w = canvas.clientWidth || 400, h = canvas.clientHeight || 400;
    renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    framing = shots(); if (!rig) rig = framing.top; else rig = phase === 'top' || phase === 'lifting' ? framing.top : (phase === 'swing' ? rig : framing.front); place(rig);
  }

  /* ---------- tweens ---------- */
  const tweens = [];
  const ease = e => e < .5 ? 4 * e * e * e : 1 - Math.pow(-2 * e + 2, 3) / 2, out3 = e => 1 - Math.pow(1 - e, 3);
  function tween(dur, fn, ez = ease) { return new Promise(res => tweens.push({ t: 0, dur, fn, ez, res })); }
  const wait = s => tween(s, () => {});

  /* ---------- the story ---------- */
  let phase = 'top', lift = 0, clicked = false, opened = false, fillLevel = 0, foamH = 0, spin = 0;
  const setPhase = p => { phase = p; onPhase && onPhase(p); };
  const say = t => onMessage && onMessage(t);
  function setLift(v) {
    lift = THREE.MathUtils.clamp(v, 0, 1);
    tabPivot.rotation.x = lift * 1.15;
    if (!opened) flapPivot.rotation.x = Math.max(0, (lift - 0.55) / 0.45) * 0.25;
    if (!clicked && lift > 0.2) { clicked = true; clickSound(); buzz(8); }
    if (!opened && lift >= 0.85) crack();
  }
  async function crack() {
    opened = true; openSound(); buzz([18, 30, 12]); burst();
    tween(0.25, e => { flapPivot.rotation.x = 0.25 + e * 1.05; }, out3);
    say('Psssht! Fuel up, birthday girl! ⚡');
    await wait(0.35);
    await tween(0.5, e => setLift(1 - e * 0.7), out3);
    await wait(0.9);
    swingAndPour();
  }
  async function swingAndPour() {
    setPhase('swing');
    // the camera swings down from the top to the front while the can turns to face her
    glass.position.set(2.6, 0, 0.25); glass.visible = true;
    const a = framing.top, b = framing.front, spin0 = spin;
    await tween(2.4, e => { rig = lerpShot(a, { ...b, target: new V3(0, 0.95, 0) }, e); place(rig); spin = spin0 + e * Math.PI * 2; can.position.x = -0.0 * e; }, ease);
    await tween(0.9, e => { can.position.x = -0.42 * e; rig = lerpShot({ ...b, target: new V3(0, 0.95, 0) }, b, e); place(rig); glass.position.x = 2.6 + (0.62 - 2.6) * out3(e); });
    setPhase('pour');
    // lift and tilt the can over the glass
    const start = can.position.clone(), turn0 = spin;
    await tween(0.9, e => { can.position.set(start.x + (0.05 - start.x) * e, MID + 0.85 * Math.sin(e * Math.PI / 2), 0); spin = turn0 + e * 0.75; can.rotation.z = -1.7 * ease(e); });
    pourSound(2.6); drink.visible = bubbles.visible = foam.visible = true;
    const sp = new V3();
    await tween(2.6, e => {
      can.rotation.z = -1.7 - e * 0.35;
      fillLevel = 0.68 * e; foamH = Math.min(0.05, e * 0.08);
      sp.set(0, LID + 0.01, OZ + 0.03); canInner.localToWorld(sp);
      const surf = glass.position.y + GB + fillLevel, len = Math.max(0.01, sp.y - surf), w = Math.min(1, e * 6, (1 - e) * 8) * 0.032;
      stream.visible = w > 0.002; stream.scale.set(w, len, w); stream.position.set(sp.x, surf + len / 2, sp.z);
      can.position.x += ((glass.position.x - 0.06) - sp.x) * 0.15;
    }, x => x);
    stream.visible = false;
    const p0 = can.position.clone(), r0 = can.rotation.z, s0 = spin;
    await tween(1.0, e => { can.rotation.z = r0 * (1 - ease(e)); can.position.set(p0.x + (-0.42 - p0.x) * ease(e), p0.y + (MID - p0.y) * ease(e), 0); spin = s0 - 0.75 * ease(e); });
    setPhase('done');
    say('Cheers! One ice-cold Monster Ultra, poured just for you. ⚡');
  }

  function reset() {
    if (phase === 'swing' || phase === 'pour') return;
    opened = false; clicked = false; fillLevel = 0; foamH = 0; spin = 0; can.position.set(0, MID, 0); can.rotation.set(0, 0, 0);
    drink.visible = bubbles.visible = foam.visible = false; glass.visible = false; flapPivot.rotation.x = 0; setLift(0);
    D.forEach(d => { d.life = 0; }); rig = framing.top; place(rig); setPhase('top');
    say('Lift the tab with your finger ↑');
  }
  function autoOpen() { if (phase !== 'top') { if (phase === 'done') { reset(); setTimeout(autoOpen, 250); } return; } setPhase('lifting'); tween(0.7, e => setLift(e), out3); }

  /* ---------- finger: drag up to lift the tab ---------- */
  let drag = null;
  canvas.addEventListener('pointerdown', e => { if (phase === 'done') { reset(); return; } if (phase !== 'top' && phase !== 'lifting') return; drag = { y: e.clientY, l: lift }; audio(); try { canvas.setPointerCapture(e.pointerId); } catch (er) {} });
  canvas.addEventListener('pointermove', e => { if (!drag || opened) return; setLift(drag.l + (drag.y - e.clientY) / Math.max(90, canvas.clientHeight * 0.18)); });
  const up = () => { if (!drag) return; drag = null; if (!opened) tween(0.3, (e => { const l0 = lift; return f => setLift(l0 * (1 - f)); })(), out3).then(() => { clicked = false; }); };
  canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);

  /* ---------- loop ---------- */
  const clock = new THREE.Clock(); let raf = 0, running = false;
  const shadowsTick = smartShadows(renderer, scene);
  function frame(now) {
    raf = requestAnimationFrame(frame);
    adapt(now || performance.now());
    const rawDt = clock.getDelta(), dt = Math.min(rawDt, 0.05), tdt = Math.min(rawDt, 0.25), t = clock.elapsedTime;
    for (let i = tweens.length - 1; i >= 0; i--) { const tw = tweens[i]; tw.t = Math.min(1, tw.t + tdt / tw.dur); tw.fn(tw.ez(tw.t)); if (tw.t >= 1) { tweens.splice(i, 1); tw.res(); } }
    can.rotation.y = spin;
    if (phase === 'top') can.rotation.y = spin + Math.sin(t * 0.4) * 0.04;
    // droplets: fly, fall, bead on the lid, fade
    for (let i = 0; i < ND; i++) {
      const d = D[i]; let s = 0;
      if (d.life > 0) {
        if (d.delay > 0) d.delay -= dt; else {
          d.life -= dt;
          if (!d.stuck) { d.v.y -= 6 * dt; d.p.addScaledVector(d.v, dt * 0.45); if (d.p.y < LID + d.s * 0.6 && Math.hypot(d.p.x, d.p.z) < RL) { d.p.y = LID + d.s * 0.6; d.stuck = true; d.v.set(0, 0, 0); } }
          s = d.s * Math.min(1, d.life * 2);
        }
      }
      M4.compose(d.p, Q, S3.set(s, s * (d.stuck ? 0.7 : 1.1), s)); drops.setMatrixAt(i, M4);
    }
    drops.instanceMatrix.needsUpdate = true;
    mist.forEach(m => { if (m.life <= 0) { m.s.visible = false; return; } m.life -= dt * 0.9; m.s.position.addScaledVector(m.v, dt * 0.35); m.s.scale.setScalar(0.05 + (1 - m.life) * 0.35); m.s.material.opacity = Math.max(0, m.life) * 0.35; });
    // drink, foam, bubbles
    drinkU.uLevel.value = Math.max(0.0001, fillLevel);
    const rTopL = GR0 + (GR1 - GR0) * (GB + fillLevel) / GH;
    foam.position.y = GB + fillLevel + 0.002; foam.scale.setScalar(rTopL - 0.006); foam.material.opacity = 0.25 + foamH * 9;
    if (bubbles.visible) for (let i = 0; i < NB; i++) { const b = bub[i]; b.y += b.v * dt / Math.max(0.2, fillLevel + 0.01) * 0.25; if (b.y > 1) { b.y = 0; b.a = Math.random() * 6.28; } const yy = GB + 0.01 + b.y * fillLevel * 0.96, rr = (GR0 + (GR1 - GR0) * yy / GH - 0.02) * b.r; M4.compose(S3.set(Math.cos(b.a) * rr, yy, Math.sin(b.a) * rr), Q, new V3(b.s, b.s, b.s)); bubbles.setMatrixAt(i, M4); }
    bubbles.instanceMatrix.needsUpdate = true;
    if (!ready) return;
    shadowsTick(tweens.length > 0 || !!drag);
    renderer.render(scene, camera);
  }
  function start() { if (running) return; running = true; clock.getDelta(); frame(); }
  function stop() { running = false; cancelAnimationFrame(raf); raf = 0; }

  glass.visible = false;
  resize(); new ResizeObserver(resize).observe(canvas);
  setLift(0); clicked = false;
  // compile shaders in the background (parallel compile where supported) instead of blocking the page
  let ready = false;
  renderer.compileAsync(scene, camera).catch(() => {}).then(() => { ready = true; });
  say('Lift the tab with your finger ↑');
  return { start, stop, reset, autoOpen, get phase() { return phase; }, ready: new Promise(r => { if (photoTex.image) r(); else photoTex.onUpdate = r; const iv = setInterval(() => { if (photoTex.image && photoTex.image.complete) { clearInterval(iv); r(); } }, 50); }) };
}
