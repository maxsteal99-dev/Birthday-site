/* "A sky full of us": 30 memories, 30 years.
   Thirty photo-stars twinkle scattered across a night sky. "Light up the sky" sends them
   gliding into a golden "30", with threads of light drawn between them. Tapping a star opens
   that memory (swipe through all of them); every star she has seen turns gold. When all 30
   have been relived, the stars flow into a heart. The memories are read from the album. */

const N = 30;
const STORE = 'sky30-seen';

/* target shapes, in fractions of the sky's width/height. Points are spaced evenly along each curve's
   length (not its angle), so the stars never bunch up where a curve bends. */
function even(curve, n, closed) { // curve: dense list of points
  const pts = closed ? [...curve, curve[0]] : curve, len = [0];
  for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], (pts[i][1] - pts[i - 1][1]) * 0.8));
  const total = len[len.length - 1], out = [];
  for (let k = 0; k < n; k++) {
    const d = total * k / (closed ? n : n - 1); let i = 1; while (i < len.length - 1 && len[i] < d) i++;
    const t = (d - len[i - 1]) / ((len[i] - len[i - 1]) || 1); out.push([pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t]);
  }
  return out;
}
function arc(cx, cy, rx, ry, a0, a1, m = 120) { const p = []; for (let i = 0; i <= m; i++) { const a = (a0 + (a1 - a0) * i / m) * Math.PI / 180; p.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]); } return p; }
function shape30() {
  const three = [...arc(0.27, 0.30, 0.13, 0.19, -160, 90), ...arc(0.27, 0.70, 0.14, 0.20, -90, 160).slice(1)]; // top bowl into bottom bowl
  return [...even(three, 13, false), ...even(arc(0.715, 0.50, 0.145, 0.39, -90, 270), 17, true)];
}
function shapeHeart() {
  const c = [];
  for (let i = 0; i < 400; i++) { const t = i / 400 * Math.PI * 2, x = 16 * Math.sin(t) ** 3, y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t); c.push([0.5 + x * 0.0275, 0.45 - y * 0.026]); }
  return even(c, N, true);
}
function scatter() {
  const p = [];
  for (let i = 0; i < N; i++) {
    let x, y, ok, tries = 0;
    do { x = 0.06 + Math.random() * 0.88; y = 0.07 + Math.random() * 0.86; ok = p.every(q => Math.hypot(q[0] - x, (q[1] - y) * 0.8) > 0.11); } while (!ok && ++tries < 60);
    p.push([x, y]);
  }
  return p;
}

export function initStars(section) {
  const sky = section.querySelector('#sky30'), svg = sky.querySelector('.sky30-lines'), status = section.querySelector('#sky30-status'), go = section.querySelector('#sky30-go');
  const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cards = [...document.querySelectorAll('#album .pc')].slice(0, N);
  const mem = cards.map((c, i) => {
    const img = c.querySelector('img'), src = img.getAttribute('data-src'), name = src.split('/').pop().replace('.webp', '');
    return { i, src, srcset: img.getAttribute('data-srcset'), alt: img.alt, pos: img.style.objectPosition, tag: c.querySelector('.pc-tag').textContent, cap: c.querySelector('.pc-cap').textContent, note: (c.querySelector('.pc-back p') || {}).textContent || '', thumb: `assets/img/stars/${name}.webp` };
  });
  let seen = new Set();
  try { seen = new Set(JSON.parse(localStorage.getItem(STORE) || '[]')); } catch (e) {}
  let state = 'scatter', pts = scatter();

  /* ---- the stars ---- */
  const stars = mem.map((m, i) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'star30'; b.style.setProperty('--tw', (2 + Math.random() * 3).toFixed(2) + 's'); b.style.setProperty('--td', (-Math.random() * 4).toFixed(2) + 's');
    b.setAttribute('aria-label', `Memory ${i + 1} of ${N}: ${m.tag}`);
    b.innerHTML = `<img src="${m.thumb}" alt="" width="216" height="216" decoding="async" loading="lazy"><i aria-hidden="true"></i>`;
    if (seen.has(i)) b.classList.add('seen');
    b.addEventListener('click', () => { if (state === 'scatter') light(); else open(i); });
    sky.appendChild(b); return b;
  });
  function place(points, stagger) {
    const W = sky.clientWidth, H = sky.clientHeight;
    stars.forEach((s, i) => { s.style.transitionDelay = stagger ? (i * 0.045).toFixed(3) + 's' : '0s'; s.style.transform = `translate(${(points[i][0] * W).toFixed(1)}px, ${(points[i][1] * H).toFixed(1)}px) translate(-50%, -50%)`; });
  }
  function lines(points, groups) { // groups: [from, to, closed]
    const W = sky.clientWidth, H = sky.clientHeight;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.innerHTML = groups.map(([a, b, closed]) => {
      const seg = points.slice(a, b).map(p => [p[0] * W, p[1] * H]);
      const d = seg.map((p, k) => (k ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ') + (closed ? ' Z' : '');
      return `<path d="${d}" pathLength="1"/>`;
    }).join('');
    if (!rm) [...svg.children].forEach((p, k) => p.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 1600, delay: 900 + k * 500, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'backwards' }));
  }
  function shapeLines() {
    if (state === 'thirty') lines(pts, [[0, 13, false], [13, 30, true]]); // the 3, then the 0
    else if (state === 'heart') lines(pts, [[0, N, true]]);
  }
  place(pts, false);
  new ResizeObserver(() => { place(pts, false); if (state !== 'scatter') shapeLines(); }).observe(sky);

  /* ---- sound ---- */
  let ac = null;
  const audio = () => { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); return ac; } catch (e) { return null; } };
  function bell(f, t, v = 0.05, d = 1.6) { const o = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain(); o.frequency.value = f; o2.frequency.value = f * 2.01; o2.connect(g); o.connect(g); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d); g.connect(ac.destination); o.start(t); o2.start(t); o.stop(t + d); o2.stop(t + d); }
  function sparkle(n = 12) { if (!audio()) return; const t = ac.currentTime, sc = [1047, 1175, 1319, 1568, 1760, 2093]; for (let i = 0; i < n; i++) bell(sc[i % sc.length] * (i >= sc.length ? 2 : 1), t + i * 0.09, 0.03, 1.2); }
  function chord() { if (!audio()) return; const t = ac.currentTime; [523, 659, 784, 1047].forEach((f, i) => bell(f, t + i * 0.12, 0.05, 2.4)); }

  /* ---- light up the sky ---- */
  function count() { return `${seen.size} of ${N} memories relived`; }
  function light() {
    if (state !== 'scatter') return;
    state = 'thirty'; pts = shape30(); sky.classList.add('lit'); place(pts, !rm); shapeLines(); sparkle(14);
    go.textContent = 'Tap a star to relive it'; go.disabled = true; go.classList.add('quiet');
    status.textContent = seen.size >= N ? 'All 30 relived. Open any star again 💛' : `Tap any star · ${count()}`;
    if (window.burst) setTimeout(() => { const r = sky.getBoundingClientRect(); window.burst(r.left + r.width / 2, r.top + r.height / 2); }, rm ? 0 : 2200);
    if (seen.size >= N) setTimeout(heart, rm ? 0 : 2600);
  }
  go.addEventListener('click', light);

  function heart() {
    if (state === 'heart') return;
    state = 'heart'; pts = shapeHeart(); sky.classList.add('heart'); place(pts, !rm); shapeLines(); chord();
    status.innerHTML = '<span class="sky30-final">Thirty memories, and a whole sky of them still to come.<br>Happy 30th, my love. 💛</span>';
    go.parentElement.style.display = 'none';
    if (window.burst) setTimeout(() => { const r = sky.getBoundingClientRect(); window.burst(r.left + r.width / 2, r.top + r.height * 0.45); setTimeout(() => window.burst(), 500); }, rm ? 0 : 1900);
  }

  /* ---- the memory viewer ---- */
  let box = null, cur = 0;
  function open(i) {
    audio(); cur = i;
    box = document.createElement('div'); box.className = 'mem30'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'Memory');
    box.innerHTML = `<div class="mem30-bg"></div>
      <figure class="mem30-card"><div class="mem30-photo"><img alt="" sizes="(max-width: 520px) 88vw, 460px"></div>
        <figcaption><span class="mem30-n"></span><span class="mem30-tag"></span><span class="mem30-cap"></span><span class="mem30-note"></span></figcaption></figure>
      <div class="mem30-nav"><button type="button" class="mem30-prev lg" aria-label="Previous memory">‹</button><button type="button" class="mem30-next lg" aria-label="Next memory">›</button></div>
      <button type="button" class="mem30-close lg" aria-label="Close">✕</button>`;
    document.body.appendChild(box); document.documentElement.classList.add('gifting');
    show(i, 0, stars[i].getBoundingClientRect());
    box.querySelector('.mem30-prev').onclick = () => step(-1); box.querySelector('.mem30-next').onclick = () => step(1);
    box.querySelector('.mem30-close').onclick = close; box.querySelector('.mem30-bg').onclick = close;
    let sx = null; const card = box.querySelector('.mem30-card');
    card.addEventListener('pointerdown', e => { sx = e.clientX; });
    card.addEventListener('pointerup', e => { if (sx === null) return; const dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1); });
    addEventListener('keydown', keys);
    setTimeout(() => box && box.querySelector('.mem30-close').focus({ preventScroll: true }), 30);
  }
  function keys(e) { if (!box) return; if (e.key === 'Escape') close(); else if (e.key === 'ArrowRight') step(1); else if (e.key === 'ArrowLeft') step(-1); }
  function show(i, dir, fromRect) {
    const m = mem[i], img = box.querySelector('.mem30-photo img'), card = box.querySelector('.mem30-card');
    img.srcset = m.srcset; img.src = m.src; img.alt = m.alt; img.style.objectPosition = m.pos;
    box.querySelector('.mem30-n').textContent = `Memory ${i + 1} of ${N}`; box.querySelector('.mem30-tag').textContent = m.tag;
    box.querySelector('.mem30-cap').textContent = m.cap; box.querySelector('.mem30-note').textContent = m.note ? `“${m.note}”` : '';
    if (!rm) {
      if (fromRect) { // grow out of the star she tapped
        const r = card.getBoundingClientRect(), dx = fromRect.left + fromRect.width / 2 - (r.left + r.width / 2), dy = fromRect.top + fromRect.height / 2 - (r.top + r.height / 2);
        card.animate([{ transform: `translate(${dx}px, ${dy}px) scale(${(fromRect.width / r.width).toFixed(3)})`, opacity: 0.4, borderRadius: '50%' }, { transform: 'none', opacity: 1, borderRadius: '6px' }], { duration: 650, easing: 'cubic-bezier(.2,.8,.2,1)' });
      } else card.animate([{ transform: `translateX(${dir * 40}px) rotate(${dir * 2}deg)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.2,.8,.2,1)' });
    }
    if (!seen.has(i)) { seen.add(i); stars[i].classList.add('seen'); try { localStorage.setItem(STORE, JSON.stringify([...seen])); } catch (e) {} }
    if (audio()) bell([523, 587, 659, 784, 880, 1047][i % 6], ac.currentTime, 0.035, 1.4);
    status.textContent = seen.size >= N ? 'All 30 relived 💛' : `Tap any star · ${count()}`;
    // warm the next photo so swiping is instant
    const nx = mem[(i + 1) % N], pre = new Image(); pre.sizes = '(max-width: 520px) 88vw, 460px'; pre.srcset = nx.srcset; pre.src = nx.src;
  }
  function step(d) { cur = (cur + d + N) % N; show(cur, d); }
  function close() {
    if (!box) return; const b = box; box = null; removeEventListener('keydown', keys);
    document.documentElement.classList.remove('gifting');
    if (rm) b.remove(); else { b.classList.add('out'); setTimeout(() => b.remove(), 350); }
    stars[cur].focus({ preventScroll: true });
    if (seen.size >= N && state !== 'heart') setTimeout(heart, rm ? 0 : 500);
  }
  status.textContent = 'Thirty stars, waiting for you ✨';
  return { light, heart };
}
