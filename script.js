/* Happy 30th, Sagarika */

/* ---------------------------------------------------------
   Background song: "Him & I" piano cover, looping.
   To change it, replace the file or point SONG_FILE at another
   one. Set it to '' to use the page's built-in music box.
   --------------------------------------------------------- */
var SONG_FILE = 'assets/audio/him-and-i-instrumental.mp3';
var SONG_LOOP = true;

document.documentElement.classList.add('js');
try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}

/* ---------- Confetti (gold foil) ---------- */
var m = document.querySelector('main'), c = document.getElementById('cf'), x = c.getContext('2d'), P = [];
var H = [[43, 78, 62], [38, 60, 78], [350, 45, 70], [20, 55, 64], [40, 30, 92]];
function fit() { var r = Math.min(window.devicePixelRatio || 1, 2); c.width = innerWidth * r; c.height = innerHeight * r; x.setTransform(r, 0, 0, r, 0, 0); }
fit(); addEventListener('resize', fit);
function tick() {
  x.clearRect(0, 0, innerWidth, innerHeight);
  P = P.filter(function (p) { return p.y < innerHeight + 20; });
  P.forEach(function (p) {
    p.x += p.vx; p.y += p.vy; p.vy += .35; p.vx *= .99; p.r += .15;
    var sh = .55 + .45 * Math.abs(Math.cos(p.r * 1.7));
    x.save(); x.translate(p.x, p.y); x.rotate(p.r);
    x.fillStyle = 'hsl(' + p.h[0] + ',' + p.h[1] + '%,' + Math.round(p.h[2] * sh) + '%)';
    x.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * .6); x.restore();
  });
  if (P.length) requestAnimationFrame(tick);
}
function burst() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var was = P.length;
  for (var i = 0; i < 140; i++) P.push({ x: innerWidth / 2, y: innerHeight * .6, vx: (Math.random() - .5) * 14, vy: -Math.random() * 15 - 4, s: 5 + Math.random() * 6, r: Math.random() * 6, h: H[i % 5] });
  if (!was) tick();
}

/* ---------- Countdown to paradise ---------- */
try {
  var d = Math.ceil((new Date(2026, 10, 1) - new Date()) / 864e5);
  document.getElementById('cd').textContent = d > 0 ? d + (d === 1 ? ' day' : ' days') + ' until paradise' : 'Paradise starts now';
} catch (e) {}

/* ---------- Open the birthday box ---------- */
document.getElementById('open').onclick = function () {
  m.classList.add('open'); document.body.classList.add('opened'); burst();
  setTimeout(function () {
    document.getElementById('hello').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }, 500);
};
document.getElementById('again').onclick = burst;

/* ---------- Latte tally ---------- */
var n = 0, tnN = document.getElementById('tn-n'), latte = document.getElementById('latte');
document.getElementById('tally').onclick = function () {
  n++; tnN.textContent = n;
  [tnN, latte].forEach(function (el, i) { var k = i ? 'sip' : 'bump'; el.classList.remove(k); void el.offsetWidth; el.classList.add(k); });
};

/* ---------- Scene reveals + scene moods ---------- */
var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: .15 });
document.querySelectorAll('.reveal,.reveal-mask').forEach(function (el) { io.observe(el); });
var moodIo = new IntersectionObserver(function (es) {
  es.forEach(function (e) { if (e.isIntersecting) document.body.setAttribute('data-mood', e.target.getAttribute('data-mood')); });
}, { rootMargin: '-50% 0px -50% 0px' });
document.querySelectorAll('[data-mood]:not(body)').forEach(function (el) { moodIo.observe(el); });

/* ---------- Chidi Shika (badminton) ---------- */
(function () {
var cv = document.getElementById('gm'), g = cv.getContext('2d'), st = 'idle', side = 0, t0 = 0, T = 1.3, p = 0, rally = 0, best = 0, wins = 0, failAt = 8, hitT = [-999, -999], drop = { x: 90, y: 250 };
var br = document.getElementById('br'), sv = document.getElementById('sv'), sc = document.getElementById('sc'), mg = document.getElementById('mg');
function pos(q, from) { var a = from ? 630 : 90, b = from ? 90 : 630; return { x: a + (b - a) * q, y: 250 - 520 * q * (1 - q) }; }
function win0() { return Math.min(.85, .55 + .01 * rally); }
var fx2 = [], trail = [], pts = 0, combo = 0, shake = 0, pop = { t: -999, txt: '' }, ax = null;
function tone(f1, f2, d, v, ty) { try { ax = ax || new (window.AudioContext || window.webkitAudioContext)(); if (ax.state === 'suspended') ax.resume(); var t = ax.currentTime, o = ax.createOscillator(), gg = ax.createGain(); o.type = ty || 'triangle'; o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(f2, t + d); gg.gain.setValueAtTime(v, t); gg.gain.exponentialRampToValueAtTime(.001, t + d); o.connect(gg); gg.connect(ax.destination); o.start(t); o.stop(t + d + .02); } catch (e) {} }
function burstAt(x, y, n, c) { for (var i = 0; i < n; i++) { var a = Math.random() * 6.28, s = 2 + Math.random() * 5; fx2.push({ x: x, y: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 2, l: 1, c: c[i % c.length], h: Math.random() < .35 }); } }
function upd() { sc.textContent = 'Rally ' + rally + ' · Points ' + pts + ' · Best ' + best + ' · Wins ' + wins; }
function fault(m) { tone(330, 110, .35, .12); combo = 0; st = 'over'; best = Math.max(best, rally); var q = pos(Math.min(p, 1), side === 1); drop = { x: q.x, y: q.y }; mg.textContent = m + ' Final rally: ' + rally; sv.textContent = 'Play again'; sv.style.display = ''; br.classList.remove('on'); upd(); }
function botMiss() { st = 'over'; wins++; best = Math.max(best, rally); var q = pos(Math.min(p, 1), true); drop = { x: q.x, y: q.y }; mg.textContent = 'Mani missed! You win, Sagarika! 🎉 Happy birthday!'; sv.textContent = 'Play again'; sv.style.display = ''; br.classList.remove('on'); upd(); if (window.burst) burst(); burstAt(360, 180, 46, ['#ecd7b2', '#c98a95', '#fff']); [523, 659, 784, 1046].forEach(function (f, i) { setTimeout(function () { tone(f, f * 1.01, .28, .14); }, i * 140); }); }
function hit(s) {
  if (st !== 'fly' || s !== 1 - side) return;
  var now = performance.now(); p = (now - t0) / 1000 / T;
  if (p < win0()) { fault('Too early!'); return; }
  var perfect = p >= .86; combo = perfect ? combo + 1 : 0; pts += perfect ? 2 + Math.min(combo, 5) : 1;
  var q = pos(Math.min(p, 1), side === 1); burstAt(q.x, q.y, perfect ? 24 : 10, perfect ? ['#fff', '#f3dfb6', '#c98a95'] : ['#fff', '#ecd7b2']);
  if (perfect) { shake = 9; tone(900, 1800, .12, .16, 'square'); } else tone(520, 880, .09, .14);
  pop = { t: now, txt: perfect ? (combo > 1 ? 'SMASH x' + combo + '!' : 'PERFECT!') : 'Nice!' };
  hitT[s] = now; rally++; side = s; t0 = now; T = Math.max(.7, 1.3 - .025 * rally);
  mg.textContent = rally + (rally === 1 ? ' hit' : ' hits') + (perfect ? '. Perfect timing!' : '. Keep going!');
  upd();
}
function press(el, s) { el.addEventListener('pointerdown', function (e) { e.preventDefault(); hit(s); }); }
press(br, 1);
addEventListener('keydown', function (e) { var k = (e.key || '').toLowerCase(); if (k === 'a' || k === 'l') hit(1); });
sv.onclick = function () { pts = 0; combo = 0; rally = 0; side = 0; failAt = 5 + Math.floor(Math.random() * 10); T = 1.3; t0 = performance.now(); st = 'fly'; sv.style.display = 'none'; mg.textContent = 'Wait for the glow, then tap Sagarika’s button!'; upd(); };
function racket(x, tilt) { g.save(); g.translate(x, 268); g.rotate(tilt); g.strokeStyle = '#e3c58e'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, 34); g.stroke(); g.lineWidth = 5; g.beginPath(); g.ellipse(0, -30, 18, 26, 0, 0, 7); g.stroke(); g.lineWidth = 1; g.strokeStyle = 'rgba(255,255,255,.5)'; g.beginPath(); for (var i = -12; i <= 12; i += 6) { g.moveTo(i, -52); g.lineTo(i, -8); } for (var j = -44; j <= -14; j += 7) { g.moveTo(-17, j); g.lineTo(17, j); } g.stroke(); g.restore(); }
function shuttle(x, y, a) { g.save(); g.translate(x, y); g.rotate(a); g.fillStyle = 'rgba(255,255,255,.94)'; g.beginPath(); g.moveTo(-3, 0); g.lineTo(-20, -9); g.lineTo(-20, 9); g.closePath(); g.fill(); g.fillStyle = '#ecd7b2'; g.beginPath(); g.arc(0, 0, 6, 0, 7); g.fill(); g.restore(); }
function draw(now) {
  g.save(); if (shake > 0) { g.translate((Math.random() - .5) * shake, (Math.random() - .5) * shake); shake *= .85; if (shake < .5) shake = 0; }
  var gr = g.createLinearGradient(0, 0, 0, 360); gr.addColorStop(0, '#1a1030'); gr.addColorStop(.62, '#4a1430'); gr.addColorStop(1, '#2a0a1a'); g.fillStyle = gr; g.fillRect(0, 0, 720, 360);
  g.fillStyle = '#1c0812'; g.fillRect(0, 310, 720, 50); for (var k = 0; k < 5; k++) { var lx = 80 + k * 140, lg = g.createRadialGradient(lx, 18, 0, lx, 18, 80); lg.addColorStop(0, 'rgba(255,236,205,.45)'); lg.addColorStop(1, 'rgba(255,236,205,0)'); g.fillStyle = lg; g.fillRect(lx - 80, 0, 160, 100); } g.strokeStyle = 'rgba(236,215,178,.3)'; g.lineWidth = 2; g.beginPath(); g.moveTo(40, 310); g.lineTo(0, 360); g.moveTo(680, 310); g.lineTo(720, 360); g.moveTo(200, 310); g.lineTo(184, 360); g.moveTo(520, 310); g.lineTo(536, 360); g.stroke(); g.fillStyle = 'rgba(236,215,178,.3)'; g.fillRect(0, 310, 720, 2);
  g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 3; g.beginPath(); g.moveTo(360, 310); g.lineTo(360, 205); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.14)'; g.fillRect(352, 205, 16, 105); g.lineWidth = 1; g.strokeStyle = 'rgba(255,255,255,.45)'; g.beginPath(); for (var y = 215; y < 310; y += 10) { g.moveTo(352, y); g.lineTo(368, y); } g.stroke();
  var s0 = Math.max(0, 1 - (now - hitT[0]) / 180), s1 = Math.max(0, 1 - (now - hitT[1]) / 180);
  racket(90, .4 + .9 * s0); racket(630, -.4 - .9 * s1);
  if (st === 'fly') { var q = pos(Math.min(p, 1), side === 1), q2 = pos(Math.min(p + .02, 1.02), side === 1); shuttle(q.x, q.y, Math.atan2(q2.y - q.y, q2.x - q.x)); }
  else if (st === 'over') { if (drop.y < 302) { drop.y += 6; drop.x += (side === 1 ? -2 : 2); } shuttle(drop.x, drop.y, 1.2); }
  else { var q0 = pos(0, false); shuttle(q0.x + 14, q0.y - 10, -.6); }
  extra(now); g.restore();
}
function heart(x, y, s) { g.beginPath(); g.moveTo(x, y + s * .3); g.bezierCurveTo(x, y - s * .5, x - s, y - s * .5, x - s, y + s * .1); g.bezierCurveTo(x - s, y + s * .6, x, y + s, x, y + s * 1.2); g.bezierCurveTo(x, y + s, x + s, y + s * .6, x + s, y + s * .1); g.bezierCurveTo(x + s, y - s * .5, x, y - s * .5, x, y + s * .3); g.fill(); }
function extra(now) {
  if (st === 'fly') { var q = pos(Math.min(p, 1), side === 1); trail.push({ x: q.x, y: q.y }); if (trail.length > 12) trail.shift(); } else trail.length = 0;
  trail.forEach(function (t, i) { g.fillStyle = 'rgba(255,240,215,' + (i / trail.length * .35) + ')'; g.beginPath(); g.arc(t.x, t.y, 2 + i * .35, 0, 7); g.fill(); });
  fx2 = fx2.filter(function (f) { return f.l > 0; }); fx2.forEach(function (f) { f.x += f.vx; f.y += f.vy; f.vy += .15; f.l -= .022; g.globalAlpha = Math.max(f.l, 0); g.fillStyle = f.c; if (f.h) heart(f.x, f.y, 6); else { g.beginPath(); g.arc(f.x, f.y, 3, 0, 7); g.fill(); } }); g.globalAlpha = 1;
  g.textAlign = 'center'; g.fillStyle = 'rgba(246,238,227,.92)'; g.font = '600 18px "DM Sans",sans-serif'; g.fillText('Mani 🤖', 90, 345); g.fillText('Sagarika 👑', 630, 345);
  g.font = '700 22px "DM Sans",sans-serif'; g.fillText(pts + ' pts', 360, 40);
  var a = (now - pop.t) / 900; if (a < 1) { g.globalAlpha = 1 - a; g.font = 'italic 700 ' + Math.round(34 + a * 10) + 'px "Cormorant Garamond",serif'; g.fillStyle = '#f3dfb6'; g.fillText(pop.txt, 360, 150 - a * 30); g.globalAlpha = 1; }
}
function frame(now) {
  if (st === 'fly') { p = (now - t0) / 1000 / T;
    if (side === 0) { if (p >= 1) fault('Missed it!'); else br.classList.toggle('on', p >= win0()); }
    else { br.classList.remove('on'); if (p >= .93) { if (rally >= failAt) botMiss(); else { tone(440, 700, .08, .1); hitT[0] = now; side = 0; t0 = now; T = Math.max(.7, 1.3 - .025 * rally); } } } }
  draw(now); requestAnimationFrame(frame);
}
upd(); requestAnimationFrame(frame);
})();

/* ---------- Her other fuel: the can ---------- */
(function () {
var w = document.getElementById('canbox'), fx = document.getElementById('fx'), pb = document.getElementById('pop'), cm = document.getElementById('cmsg'), ac = null;
function noise(d) { var n = ac.createBuffer(1, Math.floor(ac.sampleRate * d), ac.sampleRate), a = n.getChannelData(0); for (var i = 0; i < a.length; i++) a[i] = Math.random() * 2 - 1; var s = ac.createBufferSource(); s.buffer = n; return s; }
function snd() { try {
  ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); var t = ac.currentTime;
  var c = noise(.05), bp = ac.createBiquadFilter(), cg = ac.createGain(); bp.type = 'bandpass'; bp.frequency.value = 2200; bp.Q.value = 1.2; cg.gain.setValueAtTime(.9, t); cg.gain.exponentialRampToValueAtTime(.001, t + .05); c.connect(bp); bp.connect(cg); cg.connect(ac.destination); c.start(t);
  var o = ac.createOscillator(), og = ac.createGain(); o.frequency.setValueAtTime(220, t + .02); o.frequency.exponentialRampToValueAtTime(70, t + .12); og.gain.setValueAtTime(.5, t + .02); og.gain.exponentialRampToValueAtTime(.001, t + .14); o.connect(og); og.connect(ac.destination); o.start(t + .02); o.stop(t + .16);
  var f = noise(2), hp = ac.createBiquadFilter(), fg = ac.createGain(); hp.type = 'highpass'; hp.frequency.value = 3500; fg.gain.setValueAtTime(.0001, t + .08); fg.gain.exponentialRampToValueAtTime(.45, t + .15); fg.gain.exponentialRampToValueAtTime(.001, t + 2); f.connect(hp); hp.connect(fg); fg.connect(ac.destination); f.start(t + .08);
} catch (e) {} }
function fizz() {
  for (var i = 0; i < 26; i++) { var b = document.createElement('span'); b.className = 'b';
    b.style.setProperty('--x', (Math.random() * 40 - 20) + 'px'); b.style.setProperty('--dx', (Math.random() * 90 - 45) + 'px'); b.style.setProperty('--h', (80 + Math.random() * 150) + 'px');
    b.style.setProperty('--s', (5 + Math.random() * 10) + 'px'); b.style.setProperty('--d', (Math.random() * .5) + 's'); fx.appendChild(b); }
  setTimeout(function () { fx.innerHTML = ''; }, 2600);
}
function go() { snd(); w.classList.add('open'); fizz(); cm.classList.add('show'); pb.textContent = 'Crack open another 🥤'; }
pb.addEventListener('click', function () {
  if (w.classList.contains('open')) { w.classList.remove('open'); cm.classList.remove('show'); setTimeout(go, 120); } else go();
});
})();
(function () { var d = document.getElementById('drops'); for (var i = 0; i < 46; i++) { var s = document.createElement('span'), z = 2.5 + Math.random() * 6.5; s.className = 'dr'; s.style.cssText = 'left:' + (10 + Math.random() * 125) + 'px;top:' + (14 + Math.random() * 365) + 'px;width:' + z + 'px;height:' + (Math.random() < .35 ? z * 1.6 : z) + 'px'; d.appendChild(s); } })();

/* ---------- Memory album: swipe through, tap to turn over ---------- */
(function () {
var stage = document.getElementById('album'); if (!stage) return;
var cards = [].slice.call(stage.querySelectorAll('.pc')), N = cards.length, order = cards.map(function (c, i) { return i; });
var count = document.getElementById('al-count'), rm = matchMedia('(prefers-reduced-motion: reduce)').matches, celebrated = false, busy = false;
var tilt = cards.map(function (c, i) { return [-4, 3, -2, 5, -3, 2][i % 6]; });

function load(i) { var img = cards[i].querySelector('img'); if (img && !img.src) img.src = img.getAttribute('data-src'); }
function layout() {
  order.forEach(function (ci, k) {
    var c = cards[ci], vis = k < 4;
    c.classList.toggle('top', k === 0);
    c.style.zIndex = N - k;
    c.style.opacity = vis ? 1 : 0;
    c.style.pointerEvents = k === 0 ? 'auto' : 'none';
    c.style.transform = 'translate3d(' + (k ? (k % 2 ? 1 : -1) * k * 7 : 0) + 'px,' + k * 9 + 'px,0) rotate(' + (k ? tilt[ci] : tilt[ci] * .35) + 'deg) scale(' + (1 - k * .04) + ')';
    c.setAttribute('aria-hidden', k === 0 ? 'false' : 'true');
    if (k > 0) c.classList.remove('flipped');
    if (k < 5) load(ci);
  });
  load(order[N - 1]);
  count.textContent = (order[0] + 1) + ' / ' + N;
  if (order[0] === N - 1 && !celebrated) { celebrated = true; if (window.burst) setTimeout(burst, 350); }
}
function go(dir, fromDx) {
  if (busy) return; busy = true;
  var top = cards[order[0]];
  if (dir > 0) {
    // send the top photo away, then tuck it under the pile
    top.style.transform = 'translate3d(' + (fromDx < 0 ? -1 : 1) * 130 + '%,-4%,0) rotate(' + (fromDx < 0 ? -18 : 18) + 'deg)';
    top.style.opacity = 0;
    setTimeout(function () { order.push(order.shift()); top.classList.remove('flipped'); layout(); busy = false; }, rm ? 0 : 320);
  } else {
    // pull the last photo back on top from the side
    var ci = order.pop(), c = cards[ci]; order.unshift(ci);
    c.classList.add('dragging'); c.style.zIndex = N + 1; c.style.opacity = 0;
    c.style.transform = 'translate3d(-130%,-4%,0) rotate(-18deg)';
    void c.offsetWidth; c.classList.remove('dragging');
    layout(); setTimeout(function () { busy = false; }, rm ? 0 : 320);
  }
}
function flip() { cards[order[0]].classList.toggle('flipped'); }

/* drag or swipe the top photo; a tap turns it over */
var sx = 0, sy = 0, dx = 0, dragging = false, moved = false, pid = null;
stage.addEventListener('pointerdown', function (e) {
  var c = e.target.closest('.pc'); if (!c || !c.classList.contains('top') || busy) return;
  dragging = true; moved = false; sx = e.clientX; sy = e.clientY; dx = 0; pid = e.pointerId;
  c.classList.add('dragging'); try { c.setPointerCapture(pid); } catch (er) {}
});
stage.addEventListener('pointermove', function (e) {
  if (!dragging || e.pointerId !== pid) return;
  dx = e.clientX - sx; var dy = e.clientY - sy;
  if (!moved && Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
  if (!moved && Math.abs(dy) > Math.abs(dx)) { end(e, true); return; } // let her scroll the page
  moved = true;
  cards[order[0]].style.transform = 'translate3d(' + dx + 'px,0,0) rotate(' + dx / 18 + 'deg)';
});
function end(e, cancel) {
  if (!dragging) return; dragging = false;
  var c = cards[order[0]]; c.classList.remove('dragging');
  if (cancel) { layout(); return; }
  if (moved && Math.abs(dx) > Math.min(90, stage.offsetWidth * .2)) go(1, dx);
  else if (!moved) flip();
  else layout();
}
stage.addEventListener('pointerup', function (e) { end(e, false); });
stage.addEventListener('pointercancel', function (e) { end(e, true); });
stage.addEventListener('keydown', function (e) {
  if (e.key === 'ArrowRight') { e.preventDefault(); go(1, -1); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
  else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
});
document.getElementById('al-next').addEventListener('click', function () { go(1, -1); });
document.getElementById('al-prev').addEventListener('click', function () { go(-1); });

layout(); stage.classList.add('ready');
if (!rm) new IntersectionObserver(function (es, ob) { if (es[0].isIntersecting) { stage.classList.add('nudge'); ob.disconnect(); } }, { threshold: .6 }).observe(stage);
})();

/* ---------- Snack machine: tap a craving, collect its coupon ---------- */
(function () {
var vend = document.getElementById('vend'); if (!vend) return;
var tray = document.getElementById('tray'), msg = document.getElementById('vend-msg'), wallet = document.getElementById('coupons');
var slots = [].slice.call(vend.querySelectorAll('.slot')), rm = matchMedia('(prefers-reduced-motion: reduce)').matches, busy = false, got = {}, ac = null;
var S = {
  garlic: { code: 'A1', name: 'Garlic bread', say: 'Garlic bread incoming. Extra butter, obviously.',
    coupon: 'Good for one basket of hot garlic bread, extra cheesy. I won’t steal the last piece. (Probably.)' },
  burger: { code: 'B2', name: 'McSpicy Paneer', say: 'One McSpicy Paneer. Hot and spicy, just like you.',
    coupon: 'Good for one McSpicy Paneer with fries, at any hour. Even midnight. Especially midnight.' },
  kurkure: { code: 'C3', name: 'Kurkure Solid Masti Twisteez', say: 'Crunchy, twisty, full of masti. Sounds like someone I know.',
    coupon: 'Good for one packet of Solid Masti Twisteez, all to yourself. I’ll buy my own this time.' }
};
var AGAIN = 'You already have that coupon, but here’s seconds anyway.';

function clunk() { try {
  ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume();
  var t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
  o.type = 'triangle'; o.frequency.setValueAtTime(180, t + .38); o.frequency.exponentialRampToValueAtTime(60, t + .5);
  g.gain.setValueAtTime(.0001, t); g.gain.setValueAtTime(.35, t + .38); g.gain.exponentialRampToValueAtTime(.001, t + .55);
  o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + .6);
} catch (e) {} }

function coupon(k, combo) {
  var d = document.createElement('div'); d.className = 'coupon' + (combo ? ' combo' : '');
  var no = combo ? 'No. 0411 · Combo' : 'No. 0411 · ' + S[k].code;
  var title = combo ? 'Snack trifecta' : S[k].name;
  var text = combo ? 'All three, a movie, a blanket and me on the couch. Redeemable any night you like.' : S[k].coupon;
  d.innerHTML = '<div class="cp-main"><span class="cp-no"></span><strong></strong><p></p></div><div class="cp-side"><span>Redeem with</span><b>Mani</b><em>Valid forever</em></div>';
  d.querySelector('.cp-no').textContent = no; d.querySelector('strong').textContent = title; d.querySelector('p').textContent = text;
  wallet.appendChild(d);
}

function vendOut(slot) {
  var k = slot.getAttribute('data-snack'), art = slot.querySelector('.snack');
  busy = true; slot.classList.add('vending'); clunk();
  var done = function () {
    tray.querySelectorAll('.snack').forEach(function (n) { n.remove(); });
    var inTray = art.cloneNode(true); inTray.style.left = (12 + Math.random() * 40) + '%'; tray.appendChild(inTray);
    if (!rm) inTray.animate([{ transform: 'translateY(-30px)' }, { transform: 'translateY(4px)' }, { transform: 'translateY(-6px)' }, { transform: 'none' }], { duration: 420, easing: 'ease-out' });
    slot.classList.add('empty'); slot.classList.remove('vending');
    setTimeout(function () { slot.classList.remove('empty'); }, 900);
    var first = !got[k]; got[k] = true;
    msg.textContent = first ? S[k].say : AGAIN;
    if (first) coupon(k);
    if (first && got.garlic && got.burger && got.kurkure) {
      setTimeout(function () { coupon(null, true); msg.textContent = 'Snack trifecta unlocked! One combo coupon for my favourite girl.'; if (window.burst) burst(); }, 700);
    }
    busy = false;
  };
  if (rm) { done(); return; }
  // let the snack fall from its coil into the tray
  var vr = vend.getBoundingClientRect(), ar = art.getBoundingClientRect(), tr = tray.getBoundingClientRect();
  var fall = art.cloneNode(true); fall.className = 'drop';
  fall.style.cssText = 'left:' + (ar.left - vr.left) + 'px;top:' + (ar.top - vr.top) + 'px;width:' + ar.width + 'px;height:' + ar.height + 'px';
  vend.appendChild(fall); art.style.opacity = 0;
  var dy = tr.top + tr.height - 70 - ar.top, dx = (tr.left + tr.width * .35) - ar.left;
  var an = fall.animate([
    { transform: 'translate(0,0) rotate(0)' },
    { transform: 'translate(0,10px) rotate(-6deg)', offset: .25 },
    { transform: 'translate(' + dx + 'px,' + dy + 'px) rotate(24deg) scale(.7)' }
  ], { duration: 620, delay: 120, easing: 'cubic-bezier(.55,0,.85,.3)', fill: 'forwards' });
  an.onfinish = function () { fall.remove(); art.style.opacity = ''; done(); };
}

slots.forEach(function (s) { s.addEventListener('click', function () { if (!busy) vendOut(s); }); });
document.getElementById('surprise').addEventListener('click', function () {
  if (busy) return; busy = true;
  var pick = Math.floor(Math.random() * 3), steps = rm ? 0 : 10 + pick, i = 0;
  msg.textContent = 'Hmm, what are you craving…';
  (function spin() {
    if (i >= steps) { busy = false; vendOut(slots[pick]); setTimeout(function () { slots[pick].classList.remove('lit'); }, 900); return; }
    slots.forEach(function (s) { s.classList.remove('lit'); });
    slots[i % 3].classList.add('lit'); i++;
    setTimeout(spin, 70 + i * 14);
  })();
});
})();

/* ---------- Scroll: progress bar, parallax, opening fade, timeline rail ---------- */
(function () {
var rm = matchMedia('(prefers-reduced-motion: reduce)').matches, bar = document.getElementById('bar'), pe = [].slice.call(document.querySelectorAll('[data-p]')), tk = false;
var heroIn = document.querySelector('.hero-inner'), days = document.getElementById('days'), rail = document.getElementById('rail');
function sc() {
  tk = false; var y = scrollY, vh = innerHeight, mx = document.documentElement.scrollHeight - vh;
  bar.style.transform = 'scaleX(' + (mx > 0 ? Math.min(1, y / mx) : 0) + ')';
  if (rm) return;
  pe.forEach(function (e) { e.style.setProperty('--py', (y * e.getAttribute('data-p')) + 'px'); });
  if (y < vh * 1.2) { heroIn.style.setProperty('--hy', (y * .28) + 'px'); heroIn.style.setProperty('--ho', Math.max(0, 1 - y / (vh * .85)).toFixed(3)); }
  if (days.offsetParent) { var r = days.getBoundingClientRect(); rail.style.setProperty('--rail', Math.min(1, Math.max(0, (vh * .6 - r.top) / r.height)).toFixed(3)); }
}
addEventListener('scroll', function () { if (!tk) { tk = true; requestAnimationFrame(sc); } }, { passive: true });
addEventListener('resize', sc); sc();
if (rm) rail.style.setProperty('--rail', 1);
})();

/* ---------- Background music ----------
   The song loads as soon as the page opens and loops seamlessly in the
   background (silence at the start and end of the file is trimmed so the
   loop has no gap). It tries to start right away; where the browser
   requires a tap first (most phones), it starts on her first tap, click
   or key press. It pauses while the tab is hidden and resumes after. */
(function () {
var AC = window.AudioContext || window.webkitAudioContext;
var cx = null, out = null, src = null, buf = null, el = null, began = false, wanted = true, fellBack = false;

function ctx() {
  if (cx || !AC) return cx;
  try {
    cx = new AC(); out = cx.createGain(); out.gain.value = 0; out.connect(cx.destination);
    cx.onstatechange = function () { if (cx.state === 'running') { startBuffer(); if (src) stopListening(); } };
  } catch (e) { cx = null; }
  return cx;
}

/* find where the music really starts and ends, so the loop is seamless */
function bounds(b) {
  var d = b.getChannelData(0), d2 = b.numberOfChannels > 1 ? b.getChannelData(1) : d, th = .004, s = 0, e = d.length - 1;
  while (s < e && Math.abs(d[s]) < th && Math.abs(d2[s]) < th) s++;
  while (e > s && Math.abs(d[e]) < th && Math.abs(d2[e]) < th) e--;
  return [s / b.sampleRate, (e + 1) / b.sampleRate];
}
function startBuffer() {
  if (!buf || src || !cx || cx.state !== 'running' || document.hidden) return;
  var lb = bounds(buf);
  src = cx.createBufferSource(); src.buffer = buf; src.loop = true; src.loopStart = lb[0]; src.loopEnd = lb[1];
  src.connect(out); src.start(0, lb[0]);
  if (!began) { began = true; var t = cx.currentTime; out.gain.setValueAtTime(0, t); out.gain.linearRampToValueAtTime(.9, t + 2.5); }
  stopListening();
}

/* fallback for browsers that can't decode the file in Web Audio */
function startElement() {
  if (!el) {
    el = new Audio(SONG_FILE); el.loop = SONG_LOOP; el.preload = 'auto';
    el.addEventListener('playing', function () { began = true; stopListening(); });
    el.addEventListener('error', musicBox);
  }
  var pr = el.play(); if (pr && pr.catch) pr.catch(function () {});
}

/* last resort: the page's original built-in music box */
function musicBox() {
  if (fellBack || !ctx()) return; fellBack = true; el = null;
  var mg = cx.createGain(), nt, step = 0, ch = [[60, 64, 67, 72], [57, 60, 64, 69], [53, 57, 60, 65], [55, 59, 62, 67]], pat = [0, 2, 1, 3, 2, 1, 3, 2];
  function fr(n) { return 440 * Math.pow(2, (n - 69) / 12); }
  function bell(n, t, v, d) { var o = cx.createOscillator(), o2 = cx.createOscillator(), g = cx.createGain(), g2 = cx.createGain(); o.frequency.value = fr(n); o2.frequency.value = fr(n) * 2.01; g2.gain.value = .25; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .01); g.gain.exponentialRampToValueAtTime(.0008, t + d); o.connect(g); o2.connect(g2); g2.connect(g); g.connect(mg); o.start(t); o2.start(t); o.stop(t + d + .05); o2.stop(t + d + .05); }
  function pad(c, t, d) { c.slice(0, 3).forEach(function (n) { var o = cx.createOscillator(), g = cx.createGain(); o.type = 'triangle'; o.frequency.value = fr(n - 12); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.022, t + .4); g.gain.linearRampToValueAtTime(0, t + d); o.connect(g); g.connect(mg); o.start(t); o.stop(t + d + .05); }); }
  var dl = cx.createDelay(1), fb = cx.createGain(), lp = cx.createBiquadFilter();
  dl.delayTime.value = .37; fb.gain.value = .3; lp.type = 'lowpass'; lp.frequency.value = 2800;
  mg.gain.value = .5; mg.connect(out); mg.connect(dl); dl.connect(lp); lp.connect(fb); fb.connect(dl); lp.connect(out);
  nt = cx.currentTime + .1;
  setInterval(function () { if (cx.state !== 'running') return; if (nt < cx.currentTime) nt = cx.currentTime + .05; while (nt < cx.currentTime + .3) { var e = step % 8, c = ch[Math.floor(step / 8) % 4]; if (e === 0) pad(c, nt, 2.1); bell(c[pat[e]] + (e === 7 ? 12 : 0), nt, .1, 1.4); if (e % 4 === 0) bell(c[0] - 12, nt, .08, 1.2); nt += .31; step++; } }, 100);
  var t = cx.currentTime; out.gain.cancelScheduledValues(t); out.gain.setValueAtTime(0, t); out.gain.linearRampToValueAtTime(1, t + 3);
  if (cx.state === 'running') stopListening();
}

/* load the song straight away */
if (!SONG_FILE) musicBox();
else if (ctx() && window.fetch) {
  fetch(SONG_FILE).then(function (r) { if (!r.ok) throw 0; return r.arrayBuffer(); })
    .then(function (ab) { return new Promise(function (ok, no) { var p = cx.decodeAudioData(ab, ok, no); if (p && p.then) p.then(ok, no); }); })
    .then(function (b) { buf = b; startBuffer(); })
    .catch(function () { el = 'pending'; if (cx && cx.state === 'running') { el = null; startElement(); } });
} else { el = 'pending'; }

/* try to start immediately; browsers that need a tap will wait for one */
try { if (cx) cx.resume(); } catch (e) {}

var G = ['pointerdown', 'mousedown', 'touchend', 'click', 'keydown'];
function gesture() {
  if (document.hidden) return;
  if (el === 'pending') { el = null; startElement(); return; }
  if (el && el.paused) { startElement(); return; }
  if (cx && cx.state !== 'running') cx.resume();
  startBuffer();
}
function stopListening() { G.forEach(function (ev) { removeEventListener(ev, gesture, true); }); }
G.forEach(function (ev) { addEventListener(ev, gesture, { capture: true, passive: true }); });

document.addEventListener('visibilitychange', function () {
  if (el && el !== 'pending') { if (document.hidden) el.pause(); else if (began || !el.paused) el.play().catch(function () {}); return; }
  if (!cx) return;
  if (document.hidden) cx.suspend(); else cx.resume();
});
})();

/* ---------- Balloons drifting up + sparkles while scrolling ---------- */
(function () {
if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
var sky = document.createElement('div'); sky.className = 'sky'; sky.setAttribute('aria-hidden', 'true'); document.body.appendChild(sky);
var C = [['#f6e7cc', '#d9b77e', '#8a6434'], ['#f3d3d6', '#c98a95', '#6e2638'], ['#e6a3ae', '#8e2a42', '#3e0a19'], ['#ffffff', '#e9dccb', '#9f8b74'], ['#f2c9a8', '#b8744a', '#5a2c14']];
function balloon() { if (document.hidden || sky.childElementCount > 8) return; var b = document.createElement('i'), c = C[Math.floor(Math.random() * C.length)], w = 30 + Math.random() * 40, d = 14 + Math.random() * 10;
  b.style.cssText = '--w:' + w + 'px;--c1:' + c[0] + ';--c2:' + c[1] + ';--c3:' + c[2] + ';left:' + (Math.random() * 92) + '%;animation-duration:' + d + 's,' + (3 + Math.random() * 2) + 's;opacity:' + (.3 + Math.random() * .35);
  sky.appendChild(b); setTimeout(function () { b.remove(); }, d * 1000 + 300); }
for (var i = 0; i < 3; i++) setTimeout(balloon, i * 900); setInterval(balloon, 2600);
var last = 0, E = ['♥', '✦', '✧', '♡', '✦'];
addEventListener('scroll', function () { var y = scrollY; if (Math.abs(y - last) < 140) return; last = y; var e = document.createElement('b'); e.className = 'hrt'; e.setAttribute('aria-hidden', 'true'); e.textContent = E[Math.floor(Math.random() * E.length)]; e.style.setProperty('--fs', (14 + Math.random() * 10) + 'px'); e.style.left = (Math.random() < .5 ? 3 + Math.random() * 12 : 84 + Math.random() * 12) + '%'; e.style.top = (40 + Math.random() * 45) + 'vh'; document.body.appendChild(e); setTimeout(function () { e.remove(); }, 1850); }, { passive: true });
})();
