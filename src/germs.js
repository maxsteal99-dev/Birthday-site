/* "Mrs. Sagarika": after she blows out the candles, the screen is covered in
   spit droplets, breath fog, fingerprints, cake crumbs and germs. Sanitizer
   kills the germs (they dodge the wipe until then), wipes clean the grime.
   Clean enough → the overlay sparkles away and the site is fully visible. */

export function startGermGame({ onDone, buzz } = {}) {
  const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const box = document.createElement('div');
  box.className = 'germs'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Clean the screen: use the sanitizer on the germs, then the wipes on the mess');
  box.innerHTML = `
    <canvas class="g-dirt"></canvas><canvas class="g-live"></canvas>
    <div class="g-top"><p class="g-msg lg" aria-live="polite"></p><p class="g-stats"><span class="g-left"></span> · <span class="g-clean"></span></p></div>
    <div class="g-dock lg" role="toolbar" aria-label="Cleaning tools">
      <button type="button" class="g-tool on" data-tool="spray" aria-pressed="true"><span class="g-ico" aria-hidden="true">🧴</span><span>Sanitizer</span></button>
      <button type="button" class="g-tool" data-tool="wipe" aria-pressed="false"><span class="g-ico" aria-hidden="true">🧻</span><span>Wipes</span></button>
    </div>
    <div class="g-cursor" aria-hidden="true"></div>
    <button type="button" class="g-skip lg">Skip</button>`;
  document.body.appendChild(box); root.classList.add('cleaning');
  const dirt = box.querySelector('.g-dirt'), live = box.querySelector('.g-live'), dg = dirt.getContext('2d'), lg = live.getContext('2d');
  const msg = box.querySelector('.g-msg'), leftEl = box.querySelector('.g-left'), cleanEl = box.querySelector('.g-clean'), cursor = box.querySelector('.g-cursor');
  const tools = [...box.querySelectorAll('.g-tool')];
  let W = innerWidth, H = innerHeight, DPR = Math.min(window.devicePixelRatio || 1, 2), tool = 'spray', done = false, raf = 0;
  const say = t => { msg.textContent = t; };

  /* ---------- sounds ---------- */
  let ac = null;
  const audio = () => { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); return ac; } catch (e) { return null; } };
  function noise(d) { const n = ac.createBuffer(1, Math.max(1, ac.sampleRate * d | 0), ac.sampleRate), a = n.getChannelData(0); for (let i = 0; i < a.length; i++) a[i] = Math.random() * 2 - 1; const s = ac.createBufferSource(); s.buffer = n; return s; }
  function sprayS() { if (!audio()) return; const t = ac.currentTime, s = noise(0.35), f = ac.createBiquadFilter(), g = ac.createGain(); f.type = 'highpass'; f.frequency.value = 3000; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.18, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32); s.connect(f); f.connect(g); g.connect(ac.destination); s.start(t); }
  function popS() { if (!audio()) return; const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain(); o.type = 'square'; o.frequency.setValueAtTime(900 + Math.random() * 300, t); o.frequency.exponentialRampToValueAtTime(140, t + 0.12); g.gain.setValueAtTime(0.06, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14); o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + 0.15); }
  let lastSqueak = 0;
  function squeakS(speed) { const now = performance.now(); if (now - lastSqueak < 140 || !audio()) return; lastSqueak = now; const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain(), f0 = 900 + Math.min(1200, speed * 6); o.type = 'sawtooth'; o.frequency.setValueAtTime(f0, t); o.frequency.linearRampToValueAtTime(f0 * 1.4, t + 0.08); const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f0 * 1.2; bp.Q.value = 6; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.035, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1); o.connect(bp); bp.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + 0.12); }
  function chimeS() { if (!audio()) return; const t = ac.currentTime; [1318, 1568, 2093, 2637].forEach((f, i) => { const o = ac.createOscillator(), g = ac.createGain(), tt = t + i * 0.08; o.frequency.value = f; g.gain.setValueAtTime(0.0001, tt); g.gain.linearRampToValueAtTime(0.07, tt + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, tt + 0.8); o.connect(g); g.connect(ac.destination); o.start(tt); o.stop(tt + 0.85); }); }

  /* ---------- the mess (one layer that the wipes erase) ---------- */
  const GX = 24, GY = 40; let grid = new Uint8Array(GX * GY), cleaned = 0;
  function paintDirt() {
    dirt.width = W; dirt.height = H; dirt.style.width = W + 'px'; dirt.style.height = H + 'px';
    const g = dg; g.clearRect(0, 0, W, H);
    // grimy haze
    g.fillStyle = 'rgba(118,104,86,0.34)'; g.fillRect(0, 0, W, H);
    // breath fog
    for (let i = 0; i < 26; i++) { const x = Math.random() * W, y = Math.random() * H, r = 50 + Math.random() * 140, gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(235,235,230,0.26)'); gr.addColorStop(1, 'rgba(235,235,230,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
    // fingerprints: whorls of faint ridges
    for (let i = 0; i < 9; i++) {
      const x = Math.random() * W, y = Math.random() * H, rot = Math.random() * Math.PI, s = 0.8 + Math.random() * 0.6;
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s * 1.3);
      g.strokeStyle = 'rgba(70,58,50,0.28)'; g.lineWidth = 1.6;
      for (let k = 3; k < 26; k += 3.2) { g.beginPath(); g.ellipse(Math.sin(k) * 1.5, 0, k, k * 0.82, 0, 0.15, Math.PI * 2 - 0.15 - k * 0.01); g.stroke(); }
      g.restore();
    }
    // frosting smears
    for (let i = 0; i < 3; i++) { const x = Math.random() * W, y = H * (0.2 + Math.random() * 0.6); g.save(); g.translate(x, y); g.rotate(Math.random() * 3); g.strokeStyle = 'rgba(245,232,214,0.55)'; g.lineCap = 'round'; g.lineWidth = 14 + Math.random() * 10; g.beginPath(); g.moveTo(-60, 0); g.bezierCurveTo(-20, -20, 20, 20, 70, -5); g.stroke(); g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 3; g.stroke(); g.restore(); }
    // spit droplets
    for (let i = 0; i < 90; i++) {
      const x = Math.random() * W, y = Math.random() * H, r = 2 + Math.random() * Math.random() * 11;
      const gr = g.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,0.55)'); gr.addColorStop(0.5, 'rgba(230,236,240,0.16)'); gr.addColorStop(0.9, 'rgba(60,60,70,0.25)'); gr.addColorStop(1, 'rgba(60,60,70,0)');
      g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, r, r * (0.85 + Math.random() * 0.3), Math.random() * 3, 0, Math.PI * 2); g.fill();
    }
    // red velvet cake crumbs and sponge bits
    for (let i = 0; i < 46; i++) {
      const x = Math.random() * W, y = Math.random() * H, r = 1.5 + Math.random() * 5, red = Math.random() < 0.55;
      g.fillStyle = 'rgba(0,0,0,0.3)'; g.beginPath(); g.ellipse(x + 1.5, y + 2, r, r * 0.8, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = red ? '#7a1f36' : '#d8b98c'; g.beginPath();
      for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2, rr = r * (0.7 + Math.random() * 0.5); k ? g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr) : g.moveTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
      g.closePath(); g.fill();
    }
    grid = new Uint8Array(GX * GY); cleaned = 0;
  }
  /* soft round sprites drawn once and stamped with drawImage (much cheaper on phones than a new gradient per stamp) */
  function sprite(r, inner, color) {
    const c = document.createElement('canvas'); c.width = c.height = Math.ceil(r * 2); const x = c.getContext('2d'), gr = x.createRadialGradient(r, r, r * inner, r, r, r);
    gr.addColorStop(0, color); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.fillRect(0, 0, r * 2, r * 2); return c;
  }
  let brush = null, brushR = 0; const mistImg = sprite(32, 0, 'rgba(220,240,255,0.5)');
  function wipeAt(x, y, px, py) {
    const g = dg; g.save(); g.globalCompositeOperation = 'destination-out';
    const r = Math.max(34, Math.min(W, H) * 0.09), dist = Math.hypot(x - px, y - py), steps = Math.max(1, dist / (r * 0.22) | 0);
    if (!brush || brushR !== r) { brush = sprite(r, 0.35, 'rgba(0,0,0,0.9)'); brushR = r; }
    for (let i = 0; i <= steps; i++) {
      const sx = px + (x - px) * i / steps, sy = py + (y - py) * i / steps;
      g.drawImage(brush, sx - r, sy - r);
      const cx0 = Math.floor((sx - r * 0.7) / W * GX), cx1 = Math.floor((sx + r * 0.7) / W * GX), cy0 = Math.floor((sy - r * 0.7) / H * GY), cy1 = Math.floor((sy + r * 0.7) / H * GY);
      for (let cy = Math.max(0, cy0); cy <= Math.min(GY - 1, cy1); cy++) for (let cx = Math.max(0, cx0); cx <= Math.min(GX - 1, cx1); cx++) { const k = cy * GX + cx; if (!grid[k]) { grid[k] = 1; cleaned++; } }
    }
    g.restore();
  }

  /* ---------- germs ---------- */
  const COLORS = [['#9be27a', '#3d8c3a'], ['#c59cf0', '#6b3fa0'], ['#7fe0d0', '#2a8c80'], ['#f0d36a', '#a5862a']];
  let germs = [];
  function makeGerms() {
    germs = [];
    const n = W < 500 ? 10 : 14;
    for (let i = 0; i < n; i++) {
      const s = 16 + Math.random() * 16, c = COLORS[i % COLORS.length];
      germs.push({ x: 40 + Math.random() * (W - 80), y: H * 0.14 + Math.random() * H * 0.62, vx: (Math.random() - 0.5) * 30, vy: (Math.random() - 0.5) * 30, s, c, ph: Math.random() * 6, spikes: 8 + (Math.random() * 5 | 0), dead: 0, alive: true });
    }
  }
  function drawGerm(g, o, t) {
    const wob = Math.sin(t * 6 + o.ph) * 0.08, s = o.s * (o.dead ? 1 + o.dead * 0.6 : 1), a = o.dead ? Math.max(0, 1 - o.dead) : 1;
    g.save(); g.translate(o.x, o.y); g.globalAlpha = a;
    const gr = g.createRadialGradient(-s * 0.3, -s * 0.35, 1, 0, 0, s * 1.2); gr.addColorStop(0, o.c[0]); gr.addColorStop(1, o.c[1]);
    // soft drop shadow, then the body with wobbly spikes
    g.fillStyle = 'rgba(0,0,0,0.22)'; g.beginPath(); g.ellipse(0, s * 0.18 + 3, s * 1.02, s * 0.92, 0, 0, 7); g.fill(); // (no shadowBlur: slow on phones)
    g.beginPath();
    for (let k = 0; k <= 48; k++) { const ang = k / 48 * Math.PI * 2, sp = 1 + 0.18 * Math.max(0, Math.sin(ang * o.spikes + t * 3 + o.ph)) + wob * Math.sin(ang * 3); const r = s * sp; k ? g.lineTo(Math.cos(ang) * r, Math.sin(ang) * r * 0.92) : g.moveTo(Math.cos(ang) * r, Math.sin(ang) * r * 0.92); }
    g.fillStyle = gr; g.fill();
    // spots
    g.fillStyle = 'rgba(255,255,255,0.18)'; g.beginPath(); g.arc(s * 0.35, s * 0.3, s * 0.14, 0, 7); g.arc(-s * 0.4, s * 0.15, s * 0.09, 0, 7); g.fill();
    // eyes that look at her finger
    const lx = Math.max(-1, Math.min(1, (pointer.x - o.x) / 120)), ly = Math.max(-1, Math.min(1, (pointer.y - o.y) / 120));
    for (const ex of [-0.32, 0.32]) {
      g.fillStyle = '#fff'; g.beginPath(); g.ellipse(ex * s, -s * 0.18, s * 0.24, s * 0.28, 0, 0, 7); g.fill();
      if (o.dead) { g.strokeStyle = '#222'; g.lineWidth = 2; g.beginPath(); const cx = ex * s, cy = -s * 0.18, d = s * 0.13; g.moveTo(cx - d, cy - d); g.lineTo(cx + d, cy + d); g.moveTo(cx + d, cy - d); g.lineTo(cx - d, cy + d); g.stroke(); }
      else { g.fillStyle = '#1b1b22'; g.beginPath(); g.arc(ex * s + lx * s * 0.09, -s * 0.18 + ly * s * 0.1, s * 0.11, 0, 7); g.fill(); }
    }
    // mouth: a cheeky grin, or an "o" when scared
    g.strokeStyle = '#1b1b22'; g.lineWidth = Math.max(1.5, s * 0.08); g.beginPath();
    if (o.scared || o.dead) g.ellipse(0, s * 0.3, s * 0.12, s * 0.14, 0, 0, 7); else g.arc(0, s * 0.18, s * 0.26, 0.25 * Math.PI, 0.75 * Math.PI);
    g.stroke(); g.restore();
  }

  /* spray mist */
  const mist = [];
  function spray(x, y) {
    sprayS(); buzz && buzz(12);
    for (let i = 0; i < 26; i++) { const a = Math.random() * Math.PI * 2, sp = 40 + Math.random() * 160; mist.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 20, life: 1, r: 6 + Math.random() * 14 }); }
    const R = Math.max(70, Math.min(W, H) * 0.17); let hit = 0;
    for (const o of germs) if (o.alive && Math.hypot(o.x - x, o.y - y) < R + o.s) { o.alive = false; o.dead = 0.001; hit++; setTimeout(popS, Math.random() * 120); }
    if (hit) { const left = germs.filter(o => o.alive).length; say(left ? ['Got one! 🦠💥', 'Eww, bye bye germs!', 'Sanitized. Next!', 'Take that, bacteria!'][Math.random() * 4 | 0] + ` ${left} to go.` : 'Germs gone! Now wipe the screen squeaky clean 🧻'); if (!left) setTool('wipe'); }
    stats();
  }

  /* ---------- tools ---------- */
  function setTool(t) { tool = t; tools.forEach(b => { const on = b.dataset.tool === t; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); }); cursor.textContent = t === 'spray' ? '🧴' : '🧻'; }
  tools.forEach(b => b.addEventListener('click', e => { e.stopPropagation(); setTool(b.dataset.tool); }));

  const pointer = { x: -999, y: -999, down: false, px: 0, py: 0, t: 0 };
  let sprayTimer = 0;
  function onDown(e) {
    if (done || e.target.closest('.g-dock,.g-skip')) return;
    pointer.down = true; pointer.x = pointer.px = e.clientX; pointer.y = pointer.py = e.clientY; pointer.t = performance.now();
    try { live.setPointerCapture(e.pointerId); } catch (er) {}
    if (tool === 'spray') { spray(e.clientX, e.clientY); clearInterval(sprayTimer); sprayTimer = setInterval(() => pointer.down && spray(pointer.x, pointer.y), 260); }
    else { wipeAt(e.clientX, e.clientY, e.clientX, e.clientY); stats(); }
    moveCursor(e);
  }
  function onMove(e) {
    pointer.x = e.clientX; pointer.y = e.clientY; moveCursor(e);
    if (!pointer.down || done) return;
    if (tool === 'wipe') {
      const now = performance.now(), sp = Math.hypot(e.clientX - pointer.px, e.clientY - pointer.py) / Math.max(1, now - pointer.t) * 16;
      wipeAt(e.clientX, e.clientY, pointer.px, pointer.py); if (sp > 6) squeakS(sp * 10);
      pointer.t = now; stats();
    }
    pointer.px = e.clientX; pointer.py = e.clientY;
  }
  function onUp() { pointer.down = false; clearInterval(sprayTimer); checkDone(); }
  function moveCursor(e) { cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`; cursor.style.opacity = 1; }
  live.addEventListener('pointerdown', onDown); live.addEventListener('pointermove', onMove);
  live.addEventListener('pointerup', onUp); live.addEventListener('pointercancel', onUp);

  let nagged = 0;
  function stats() {
    const left = germs.filter(o => o.alive).length, pct = Math.min(100, Math.round(cleaned / (GX * GY) * 100 / 0.9));
    leftEl.textContent = left ? `🦠 ${left} germ${left === 1 ? '' : 's'} left` : '🦠 0 germs';
    cleanEl.textContent = `✨ ${Math.min(100, pct)}% clean`;
    checkDone();
  }
  function checkDone() {
    if (done) return;
    const left = germs.filter(o => o.alive).length, pct = cleaned / (GX * GY);
    if (!left && pct >= 0.9) finish();
  }

  function finish(skipped) {
    if (done) return; done = true; clearInterval(sprayTimer);
    if (!skipped) { cleanEl.textContent = '✨ 100% clean'; chimeS(); buzz && buzz([30, 40, 60]); say('Squeaky clean ✨ 99.9% germ-free. Now it’s safe to open your birthday box!'); box.classList.add('sparkle'); }
    box.classList.add('done');
    setTimeout(() => { box.classList.add('gone'); root.classList.remove('cleaning'); }, skipped ? 0 : 1700);
    setTimeout(() => { cancelAnimationFrame(raf); box.remove(); removeEventListener('resize', resize); onDone && onDone(); }, skipped ? 600 : 2700);
  }
  box.querySelector('.g-skip').addEventListener('click', () => finish(true));

  /* ---------- loop ---------- */
  let last = performance.now();
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000); last = now; const t = now / 1000;
    lg.setTransform(DPR, 0, 0, DPR, 0, 0); lg.clearRect(0, 0, W, H);
    // germs wander, and run from the wipe until they're sanitized
    for (const o of germs) {
      if (o.dead) { o.dead += dt * 2.2; if (o.dead < 1) drawGerm(lg, o, t); continue; }
      const d = Math.hypot(o.x - pointer.x, o.y - pointer.y);
      o.scared = tool === 'wipe' && pointer.down && d < 130;
      if (o.scared) { o.vx += (o.x - pointer.x) / d * 900 * dt; o.vy += (o.y - pointer.y) / d * 900 * dt; if (nagged < performance.now()) { say('They’re dodging! Sanitize them first 🧴'); nagged = performance.now() + 2500; } }
      o.vx += (Math.random() - 0.5) * 60 * dt; o.vy += (Math.random() - 0.5) * 60 * dt;
      o.vx *= 0.96; o.vy *= 0.96;
      if (!rm) { o.x += o.vx * dt; o.y += o.vy * dt; }
      if (o.x < 30) { o.x = 30; o.vx = Math.abs(o.vx); } if (o.x > W - 30) { o.x = W - 30; o.vx = -Math.abs(o.vx); }
      if (o.y < H * 0.12) { o.y = H * 0.12; o.vy = Math.abs(o.vy); } if (o.y > H * 0.8) { o.y = H * 0.8; o.vy = -Math.abs(o.vy); }
      drawGerm(lg, o, t);
    }
    // sanitizer mist
    for (let i = mist.length - 1; i >= 0; i--) {
      const p = mist[i]; p.life -= dt * 1.6; if (p.life <= 0) { mist.splice(i, 1); continue; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.92; p.vy *= 0.92;
      const rr = p.r * (2 - p.life); lg.globalAlpha = p.life; lg.drawImage(mistImg, p.x - rr, p.y - rr, rr * 2, rr * 2); lg.globalAlpha = 1;
    }
  }
  function resize() {
    W = innerWidth; H = innerHeight;
    live.width = W * DPR; live.height = H * DPR; live.style.width = W + 'px'; live.style.height = H + 'px';
    // keep what has been wiped: redraw the mess only on first run
  }
  resize(); paintDirt(); makeGerms(); setTool('spray'); stats();
  addEventListener('resize', resize);
  say('Oops! You blew all over the screen 😷 Grab the sanitizer, Mrs. Sagarika.');
  requestAnimationFrame(t => { last = t; frame(t); });
  return { finish };
}
