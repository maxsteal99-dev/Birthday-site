/* Happy 30th, Sagarika */

/* ---------------------------------------------------------
   The birthday song.
   By default the page plays its own music box, generated live
   in the browser (no file needed). If you have a recorded song
   file, put it in assets/audio/ and write its path here, e.g.
   var SONG_FILE = 'assets/audio/birthday-song.mp3';
   The player will then play that file instead, and falls back to
   the music box if the file is missing.
   --------------------------------------------------------- */
var SONG_FILE = 'assets/audio/him-and-i-instrumental.mp3';
var SONG_TITLE = 'Him & I (Instrumental)';
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

/* ---------- The birthday song + player ---------- */
var Song = (function () {
var AC = window.AudioContext || window.webkitAudioContext;
var cx = null, mg = null, an = null, tm = null, on = false, step = 0, nt = 0, userPaused = false;
var wanted = false, el = null, mode = SONG_FILE ? 'file' : 'box', elapsed = 0, since = 0, state = 'idle', subs = [];
var PHRASE = 32 * .31;

/* music box: C, Am, F, G with a bell melody, soft pads and an echo */
var ch = [[60, 64, 67, 72], [57, 60, 64, 69], [53, 57, 60, 65], [55, 59, 62, 67]], pat = [0, 2, 1, 3, 2, 1, 3, 2];
function fr(n) { return 440 * Math.pow(2, (n - 69) / 12); }
function bell(n, t, v, d) { var o = cx.createOscillator(), o2 = cx.createOscillator(), g = cx.createGain(), g2 = cx.createGain(); o.frequency.value = fr(n); o2.frequency.value = fr(n) * 2.01; g2.gain.value = .25; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .01); g.gain.exponentialRampToValueAtTime(.0008, t + d); o.connect(g); o2.connect(g2); g2.connect(g); g.connect(mg); o.start(t); o2.start(t); o.stop(t + d + .05); o2.stop(t + d + .05); }
function pad(c, t, d) { c.slice(0, 3).forEach(function (n) { var o = cx.createOscillator(), g = cx.createGain(); o.type = 'triangle'; o.frequency.value = fr(n - 12); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.022, t + .4); g.gain.linearRampToValueAtTime(0, t + d); o.connect(g); g.connect(mg); o.start(t); o.stop(t + d + .05); }); }
function sched() { if (!on) return; while (nt < cx.currentTime + .3) { var e = step % 8, c = ch[Math.floor(step / 8) % 4]; if (e === 0) pad(c, nt, 2.1); bell(c[pat[e]] + (e === 7 ? 12 : 0), nt, .1, 1.4); if (e % 4 === 0) bell(c[0] - 12, nt, .08, 1.2); nt += .31; step++; } }

function ctx() {
  if (cx) return cx;
  cx = new AC(); an = cx.createAnalyser(); an.fftSize = 256; an.smoothingTimeConstant = .82;
  cx.onstatechange = function () { if (cx.state === 'running') dropGestures(); };
  return cx;
}
function setupBox() {
  ctx(); mg = cx.createGain(); mg.gain.value = .5;
  var dl = cx.createDelay(1), fb = cx.createGain(), lp = cx.createBiquadFilter();
  dl.delayTime.value = .37; fb.gain.value = .3; lp.type = 'lowpass'; lp.frequency.value = 2800;
  mg.connect(cx.destination); mg.connect(dl); dl.connect(lp); lp.connect(fb); fb.connect(dl); lp.connect(cx.destination);
  mg.connect(an); lp.connect(an);
  mg.gain.setValueAtTime(0, cx.currentTime); mg.gain.linearRampToValueAtTime(.5, cx.currentTime + 3);
  nt = cx.currentTime + .1;
}
function setupFile() {
  el = new Audio(); el.preload = 'auto'; el.loop = SONG_LOOP; el.src = SONG_FILE;
  el.addEventListener('waiting', function () { if (on) set('loading'); });
  el.addEventListener('playing', function () { set('playing'); });
  el.addEventListener('ended', function () { on = false; set('paused', 'That was your song. Press play to hear it again.'); });
  el.addEventListener('error', function () {
    // the file could not be loaded: fall back to the built-in music box
    on = false; mode = 'box'; el = null; seek.disabled = true; du.textContent = 'Loop';
    if (nowEl) nowEl.textContent = 'Now playing';
    set('idle', 'The song file could not be loaded, so the music box will play instead.');
    if (wanted) play();
  });
  try { var s = ctx().createMediaElementSource(el); s.connect(cx.destination); s.connect(an); } catch (e) {}
}

function set(s, msg) { state = s; subs.forEach(function (f) { f(s, msg); }); }
function play() {
  if (!AC && mode === 'box') { set('unavailable'); return; }
  userPaused = false; wanted = true;
  try {
    if (mode === 'file') {
      if (!el) setupFile();
      if (cx && cx.state === 'suspended') cx.resume();
      on = true; set('loading');
      var pr = el.play(); if (pr && pr.catch) pr.catch(function () { if (mode !== 'file' || !el || el.error) return; on = false; set('paused', 'Tap play to start the song.'); });
      return;
    }
    if (!mg) setupBox();
    else { mg.gain.cancelScheduledValues(cx.currentTime); mg.gain.setValueAtTime(mg.gain.value, cx.currentTime); mg.gain.linearRampToValueAtTime(.5, cx.currentTime + .8); }
    if (cx.state !== 'running') cx.resume();
    if (nt < cx.currentTime) nt = cx.currentTime + .05;
    if (!tm) tm = setInterval(sched, 100);
    on = true; since = performance.now(); set('playing');
  } catch (e) { on = false; set('unavailable'); }
}
function pause() {
  userPaused = true; wanted = false;
  if (!on) return;
  on = false;
  if (mode === 'file') { if (el) el.pause(); set('paused'); return; }
  elapsed += (performance.now() - since) / 1000;
  try { var t = cx.currentTime; mg.gain.cancelScheduledValues(t); mg.gain.setValueAtTime(mg.gain.value, t); mg.gain.linearRampToValueAtTime(0, t + .35); setTimeout(function () { if (!on) cx.suspend(); }, 420); } catch (e) {}
  set('paused');
}
function toggle() { if (on) pause(); else play(); }
function time() {
  if (mode === 'file' && el) return { t: el.currentTime || 0, d: isFinite(el.duration) ? el.duration : 0 };
  var t = elapsed + (on ? (performance.now() - since) / 1000 : 0);
  return { t: t, d: 0, phase: (t % PHRASE) / PHRASE };
}

/* As before: her first tap, click or key press anywhere starts the song
   (browsers only allow sound after a gesture). On iPhone a scroll swipe
   is not enough, so we keep listening until sound is really running. */
var G = ['click', 'touchend', 'keydown'];
function gesture(e) {
  if (e && e.target && e.target.closest && e.target.closest('[data-song-control]')) return;
  if (userPaused) { dropGestures(); return; }
  if (!on) play();
  else if (cx && cx.state === 'suspended' && !document.hidden) cx.resume();
  if (mode === 'file' && on) dropGestures();
}
function dropGestures() { G.forEach(function (ev) { removeEventListener(ev, gesture); }); }
G.forEach(function (ev) { addEventListener(ev, gesture, { passive: true }); });

document.addEventListener('visibilitychange', function () {
  if (!on) return;
  if (mode === 'file') return;
  if (document.hidden) { cx.suspend(); } else { cx.resume(); }
});

/* ---- UI ---- */
var player = document.querySelector('.player'), btn = document.getElementById('play'), mini = document.getElementById('mini'), miniBtn = document.getElementById('mini-play');
var stat = document.getElementById('song-status'), te = document.getElementById('t-el'), du = document.getElementById('t-du'), seek = document.getElementById('seek');
var viz = document.getElementById('viz'), vg = viz.getContext('2d'), songVisible = false, rm = matchMedia('(prefers-reduced-motion: reduce)').matches, buf = null;
var MSG = { idle: 'Turn your sound up, then press play.', loading: 'Loading the song…', playing: 'Playing, just for you', paused: 'Paused', unavailable: 'Sound isn’t available in this browser. Try opening the page in Safari or Chrome.' };
var nowEl = document.getElementById('now-playing');
if (mode === 'file') { seek.disabled = false; du.textContent = '0:00'; if (SONG_TITLE) nowEl.textContent = 'Now playing · ' + SONG_TITLE; }

subs.push(function (s, msg) {
  player.setAttribute('data-state', s);
  var playing = s === 'playing' || s === 'loading';
  [btn, miniBtn].forEach(function (b) { b.setAttribute('aria-pressed', playing ? 'true' : 'false'); b.setAttribute('aria-label', playing ? 'Pause the birthday song' : 'Play the birthday song'); });
  mini.classList.toggle('playing', s === 'playing');
  stat.textContent = msg || MSG[s] || '';
});
btn.addEventListener('click', toggle);
miniBtn.addEventListener('click', toggle);
seek.addEventListener('input', function () { if (mode === 'file' && el && isFinite(el.duration)) el.currentTime = seek.value / 1000 * el.duration; });

function fmt(s) { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); }

new IntersectionObserver(function (es) {
  songVisible = es[0].isIntersecting;
  mini.classList.toggle('show', !songVisible);
  if (songVisible) requestAnimationFrame(loop);
}, { threshold: .25 }).observe(document.getElementById('song'));

function sizeViz() { var r = Math.min(window.devicePixelRatio || 1, 2), b = viz.getBoundingClientRect(); viz.width = Math.max(1, b.width * r); viz.height = Math.max(1, b.height * r); }
addEventListener('resize', sizeViz);

function loop(now) {
  var tt = time();
  te.textContent = fmt(tt.t);
  if (mode === 'file') { if (tt.d) { du.textContent = fmt(tt.d); if (document.activeElement !== seek) seek.value = Math.round(tt.t / tt.d * 1000); } }
  else seek.value = Math.round((tt.phase || 0) * 1000);
  seek.style.setProperty('--p', (seek.value / 10) + '%');
  drawViz(now || 0);
  if (songVisible) requestAnimationFrame(loop);
}
function drawViz(now) {
  if (!viz.width || viz.width < 2) sizeViz();
  var W = viz.width, R = W / 2, N = 72, r0 = R * .7, max = R * .27;
  vg.clearRect(0, 0, W, W);
  if (an && on) { buf = buf || new Uint8Array(an.frequencyBinCount); an.getByteFrequencyData(buf); }
  vg.save(); vg.translate(R, R); vg.lineCap = 'round'; vg.lineWidth = Math.max(1.5, W / 220);
  for (var i = 0; i < N; i++) {
    var k = i < N / 2 ? i : N - i, v;
    if (an && on && buf) { var bin = 1 + Math.floor(k * .42); v = Math.min(1, Math.pow(buf[bin] / 255, 1.4) * (1 + k * .05)); }
    else v = rm ? .08 : .06 + .04 * Math.sin(now / 900 + i * .5);
    var a = i / N * Math.PI * 2 - Math.PI / 2, l = 4 + v * max;
    vg.strokeStyle = 'rgba(236,215,178,' + (.25 + v * .75).toFixed(3) + ')';
    vg.beginPath(); vg.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); vg.lineTo(Math.cos(a) * (r0 + l), Math.sin(a) * (r0 + l)); vg.stroke();
  }
  vg.restore();
}
sizeViz(); drawViz(0); set('idle');

return { play: play, pause: pause, toggle: toggle };
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
