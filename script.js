import { tick as buzzTick, rumble, vibrate } from './src/haptics.js';
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


/* ---------- The cake: blow out 30 candles to open the site ---------- */
(function () {
var gate = document.getElementById('gate'), root = document.documentElement;
function finish(ctx) { window.__cakeDone = true; var ev; try { ev = new CustomEvent('cakedone', { detail: { ctx: ctx || null } }); } catch (e) { ev = new Event('cakedone'); } dispatchEvent(ev); }
function hasGL() { try { var c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { return false; } }
if (!gate || !hasGL()) { finish(); return; }

root.classList.add('gated'); gate.hidden = false;
var canvas = document.getElementById('cake-canvas'), count = document.getElementById('gate-count'), toast = document.getElementById('gate-toast');
var micBtn = document.getElementById('gate-mic'), cake = null, closed = false, tt = 0;
function say(t, ms) { toast.textContent = t; toast.classList.add('show'); clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove('show'); }, ms || 2200); }
function progress(n) { count.textContent = n === 0 ? 'All out!' : n === 1 ? 'Just one left. Big breath!' : n + ' candles still burning'; }

function close(celebrate) {
  if (closed) return; closed = true;
  // the mic's audio channel is already allowed to make sound (no tap needed),
  // so hand it to the song: it starts the moment the last candle goes out
  var live = cake && cake.micContext && cake.micContext.state === 'running' ? cake.micContext : null;
  if (cake) cake.stopMic(!!live);
  // open the surprise underneath, then let the cake fade away
  var main = document.querySelector('main'); main.classList.add('open'); document.body.classList.add('opened');
  if (celebrate) { say('Your wish is on its way ✨', 2600); if (window.burst) { burst(); setTimeout(burst, 450); } }
  finish(live);
  setTimeout(function () {
    gate.classList.add('leaving'); root.classList.remove('gated');
    setTimeout(function () { if (cake) cake.dispose(); gate.remove(); }, 1400);
  }, celebrate ? 1500 : 0);
}

window.__cakeReady = import('./src/cake.js').then(function (mod) {
  cake = mod.createCake(canvas, {
    onProgress: progress,
    onTrick: function () { say('Trick candle! 😜 One more time…'); vibrate([60, 60, 60]); },
    // vibration: a buzz for every candle, a rumble for as long as she blows, a big one at the end
    onCandleOut: function () { buzzTick(); },
    onBlowing: function () { rumble(170); },
    onAllOut: function () { vibrate([380, 90, 380, 90, 750]); close(true); }
  });
  cake.start();
  window.__micDebug = function () { return cake && cake.micDebug; };
}).catch(function () { close(false); });

/* the microphone is the main way: ask for it as soon as the cake is on screen */
var micText = document.getElementById('gate-mic-text'), hint = document.getElementById('gate-hint');
function micSay(state, text) { micBtn.setAttribute('data-state', state); micText.textContent = text; }
function startMic() {
  if (!cake || closed) return;
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.isSecureContext) { micOff(); return; }
  micSay('asking', 'Allow the microphone, then blow on your phone');
  cake.listen().then(function (state) {
    if (state === 'running') micSay('on', 'Listening… blow on your phone 🌬️');
    else { // some phones need one touch before they will listen
      micSay('tap', 'Tap the cake once, then blow');
      var wake = function () { cake.resumeMic().then(function () { micSay('on', 'Listening… blow on your phone 🌬️'); }); removeEventListener('pointerdown', wake, true); };
      addEventListener('pointerdown', wake, true);
    }
  }).catch(micOff);
}
function micOff() { micSay('off', 'Swipe across the flames to blow them out'); hint.textContent = 'tap a single flame, or drag to spin the cake'; }
function whenVisible(fn) {
  if (!root.classList.contains('loading')) { fn(); return; }
  var mo = new MutationObserver(function () { if (!root.classList.contains('loading')) { mo.disconnect(); setTimeout(fn, 500); } });
  mo.observe(root, { attributes: true, attributeFilter: ['class'] });
}
/* one tap to begin: it lets the phone vibrate, play sound and use the mic */
var beginBox = document.getElementById('gate-begin');
function begin() {
  if (root.classList.contains('begun')) return;
  root.classList.add('begun'); beginBox.classList.add('gone');
  vibrate(40);
  startMic();
}
document.getElementById('begin-btn').addEventListener('click', begin);
beginBox.addEventListener('click', begin);
window.__cakeReady.then(function () { whenVisible(function () { try { document.getElementById('begin-btn').focus({ preventScroll: true }); } catch (e) {} }); });
canvas.addEventListener('keydown', function (e) { if (cake && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); cake.puff(.3); } });
document.getElementById('gate-skip').addEventListener('click', function () { root.classList.add('begun'); close(false); });
})();

/* ---------- Loading screen: wait for fonts and the first photos, then begin ---------- */
(function () {
var root = document.documentElement, fill = document.getElementById('ld-fill'), t0 = performance.now(), done = 0;
function img(src, srcset) { return new Promise(function (ok) { var i = new Image(); if (srcset) { i.sizes = '(max-width: 520px) 86vw, 420px'; i.srcset = srcset; } i.src = src; (i.decode ? i.decode() : Promise.reject()).then(ok, function () { i.onload = i.onerror = ok; if (i.complete) ok(); }); }); }
var first = [].slice.call(document.querySelectorAll('.pc img')).slice(0, 2).map(function (i) { return img(i.getAttribute('data-src'), i.getAttribute('data-srcset')); });
var hero = document.getElementById('p1');
var jobs = [document.fonts ? document.fonts.ready : Promise.resolve(), img(hero.currentSrc || hero.src)].concat(first);
jobs.forEach(function (p) { p.then(function () { done++; if (fill) fill.style.setProperty('--p', Math.max(.05, done / jobs.length)); }); });
function reveal() { setTimeout(function () { root.classList.remove('loading'); }, Math.max(0, 900 - (performance.now() - t0))); }
if (window.__cakeReady) { var cj = window.__cakeReady.catch(function () {}); jobs.push(cj); cj.then(function () { done++; if (fill) fill.style.setProperty('--p', Math.max(.05, done / jobs.length)); }); }
Promise.race([Promise.all(jobs), new Promise(function (r) { setTimeout(r, 7000); })]).then(reveal, reveal);
})();

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
window.burst = burst;
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
function addLatte() {
  n++; tnN.textContent = n;
  [tnN, latte].forEach(function (el, i) { var k = i ? 'sip' : 'bump'; el.classList.remove(k); void el.offsetWidth; el.classList.add(k); });
}
document.getElementById('tally').onclick = addLatte;

/* ---------- Barista Sagarika: make your own Spanish latte (3D, loads when near) ---------- */
(function () {
var box = document.getElementById('barista'); if (!box) return;
var canvas = document.getElementById('latte-canvas'), msg = document.getElementById('barista-msg'), again = document.getElementById('latte-again');
var steps = [].slice.call(box.querySelectorAll('.step')), game = null, visible = false, loading = false;
function hasGL() { try { var c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { return false; } }
if (!hasGL()) { box.classList.add('no-gl'); return; }
function mark(i, state) {
  var b = steps[i]; if (!b) return;
  if (state === 'done') { b.classList.remove('next', 'active'); b.classList.add('done'); }
  else if (state === 'next') { b.classList.add('next'); }
  else if (state === 'active') { b.classList.add('active'); }
  box.classList.toggle('stirring', !!(game && game.step === 'stir') || (state === 'done' && i === 3));
}
function load() {
  if (loading) return; loading = true;
  import('./src/latte.js').then(function (mod) {
    game = mod.createLatte(canvas, {
      onStep: mark,
      onMessage: function (t) { msg.textContent = t; },
      onDone: function () { box.classList.remove('stirring'); addLatte(); again.hidden = false; if (window.burst) burst(); }
    });
    if (visible) game.start();
  }).catch(function () { box.classList.add('no-gl'); });
}
new IntersectionObserver(function (es) { if (es[0].isIntersecting) load(); }, { rootMargin: '900px 0px' }).observe(box);
new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (game) { if (visible) game.start(); else game.stop(); } }, { threshold: 0.05 }).observe(canvas);
steps.forEach(function (b) { b.addEventListener('click', function () { if (game) game.doStep(b.getAttribute('data-step')); }); });
again.addEventListener('click', function () {
  if (!game) return; game.reset(); again.hidden = true;
  steps.forEach(function (b, i) { b.classList.remove('done', 'active', 'next'); if (!i) b.classList.add('next'); });
});
})();

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
  draw(now); if (onScreen) requestAnimationFrame(frame); else running = false;
}
// only animate the court while it is on screen
var onScreen = false, running = false;
new IntersectionObserver(function (es) { onScreen = es[0].isIntersecting; if (onScreen && !running) { running = true; requestAnimationFrame(frame); } }).observe(cv);
upd(); draw(performance.now());
})();

/* ---------- Her other fuel: the can ----------
   Pull the ring tab up with a finger (or press the button): it clicks, the seal
   cracks with a hiss, droplets spray, and the drink fizzes. All sounds are
   synthesized live. */
(function () {
var w = document.getElementById('canbox'), fx = document.getElementById('fx'), pb = document.getElementById('pop'), cm = document.getElementById('cmsg');
var tab = document.getElementById('tab'), grab = document.getElementById('can-grab'), spray = document.getElementById('spray'), ac = null;
var lift = 0, opened = false, clicked = false, drag = null, raf = 0;
var rm = matchMedia('(prefers-reduced-motion: reduce)').matches;

function audio() { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); return ac; } catch (e) { return null; } }
function noise(d) { var n = ac.createBuffer(1, Math.max(1, Math.floor(ac.sampleRate * d)), ac.sampleRate), a = n.getChannelData(0); for (var i = 0; i < a.length; i++) a[i] = Math.random() * 2 - 1; var s = ac.createBufferSource(); s.buffer = n; return s; }
function burstAt(t, dur, type, freq, q, gain, decay) {
  var s = noise(dur), f = ac.createBiquadFilter(), g = ac.createGain();
  f.type = type; f.frequency.value = freq; f.Q.value = q;
  g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
  s.connect(f); f.connect(g); g.connect(ac.destination); s.start(t); s.stop(t + dur + 0.02);
}
function ping(t, freq, gain, decay) { var o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = freq; g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + decay); o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + decay + 0.02); }

/* the little metallic click as the tab lever starts to bite */
function clickSound() { if (!audio()) return; var t = ac.currentTime; burstAt(t, 0.008, 'bandpass', 3800, 3, 0.5, 0.03); ping(t, 2900, 0.05, 0.05); ping(t, 5200, 0.025, 0.03); }
/* the crack of the seal, the hiss of gas, then the fizz */
function openSound() {
  if (!audio()) return; var t = ac.currentTime;
  // seal snaps: two sharp transients and a small body thump
  burstAt(t, 0.004, 'highpass', 1500, 0.7, 1.0, 0.02);
  burstAt(t + 0.013, 0.006, 'bandpass', 2200, 1.2, 0.8, 0.04);
  var o = ac.createOscillator(), og = ac.createGain(); o.frequency.setValueAtTime(170, t); o.frequency.exponentialRampToValueAtTime(60, t + 0.09); og.gain.setValueAtTime(0.35, t); og.gain.exponentialRampToValueAtTime(0.0001, t + 0.11); o.connect(og); og.connect(ac.destination); o.start(t); o.stop(t + 0.13);
  // pressurised hiss: bright noise that falls in pitch and fades
  var h = noise(1.3), hp = ac.createBiquadFilter(), pk = ac.createBiquadFilter(), hg = ac.createGain();
  hp.type = 'highpass'; hp.frequency.setValueAtTime(2600, t); hp.frequency.exponentialRampToValueAtTime(1300, t + 1.1);
  pk.type = 'peaking'; pk.frequency.setValueAtTime(7200, t); pk.frequency.exponentialRampToValueAtTime(3600, t + 1.0); pk.gain.value = 9; pk.Q.value = 0.9;
  hg.gain.setValueAtTime(0.0001, t + 0.008); hg.gain.exponentialRampToValueAtTime(0.42, t + 0.03); hg.gain.exponentialRampToValueAtTime(0.12, t + 0.35); hg.gain.exponentialRampToValueAtTime(0.0001, t + 1.25);
  h.connect(hp); hp.connect(pk); pk.connect(hg); hg.connect(ac.destination); h.start(t + 0.008); h.stop(t + 1.3);
  // fizz: hundreds of tiny bubble pops that slowly thin out
  for (var i = 0; i < 260; i++) { var tt = t + 0.12 + Math.pow(Math.random(), 1.8) * 3.2; burstAt(tt, 0.0015, 'highpass', 3500 + Math.random() * 4000, 0.7, 0.04 + Math.random() * 0.12 * (1 - (tt - t) / 3.4), 0.006 + Math.random() * 0.01); }
}
function buzz(p) { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) {} }

function setLift(v) {
  lift = Math.max(0, Math.min(1, v));
  // the tab is seen edge-on lying flat; it rises into view as it is lifted
  var s = 0.2 + 0.8 * Math.sin(lift * Math.PI / 2);
  tab.setAttribute('transform', 'translate(0 ' + (-lift * 0.6).toFixed(2) + ') scale(1 ' + s.toFixed(3) + ')');
  if (!clicked && lift > 0.18) { clicked = true; clickSound(); buzz(8); }
  if (!opened && lift >= 0.82) crack();
}
function animateLift(to, ms, done) {
  cancelAnimationFrame(raf); var from = lift, t0 = performance.now();
  (function step(now) { var e = Math.min(1, (now - t0) / ms); setLift(from + (to - from) * (1 - Math.pow(1 - e, 3))); if (e < 1) raf = requestAnimationFrame(step); else if (done) done(); })(t0);
}

function sprayDrops() {
  if (rm) return;
  for (var i = 0; i < 18; i++) {
    var d = document.createElement('i'), s = 2 + Math.random() * 5; d.style.width = d.style.height = s + 'px'; spray.appendChild(d);
    var x0 = 100 + (Math.random() - .5) * 14, y0 = 144, vx = (Math.random() - .5) * 180, vy = -(160 + Math.random() * 240), T = 0.9 + Math.random() * 0.5, frames = [];
    for (var k = 0; k <= 10; k++) { var t = k / 10 * T; frames.push({ transform: 'translate(' + (x0 + vx * t).toFixed(1) + 'px,' + (y0 + vy * t + 420 * t * t).toFixed(1) + 'px)', opacity: k < 8 ? 1 : (10 - k) / 3 }); }
    d.animate(frames, { duration: T * 1000, easing: 'linear', fill: 'forwards' }).onfinish = function () { this.effect.target.remove(); };
  }
}
function fizz() {
  for (var i = 0; i < 26; i++) { var b = document.createElement('span'); b.className = 'b';
    b.style.setProperty('--x', (Math.random() * 40 - 20) + 'px'); b.style.setProperty('--dx', (Math.random() * 90 - 45) + 'px'); b.style.setProperty('--h', (80 + Math.random() * 150) + 'px');
    b.style.setProperty('--s', (5 + Math.random() * 10) + 'px'); b.style.setProperty('--d', (Math.random() * .5) + 's'); fx.appendChild(b); }
  setTimeout(function () { fx.innerHTML = ''; }, 2600);
}
function crack() {
  opened = true; openSound(); buzz([18, 30, 12]);
  w.classList.add('open'); w.classList.remove('jolt'); void w.offsetWidth; w.classList.add('jolt');
  sprayDrops(); fizz(); cm.classList.add('show'); pb.textContent = 'Crack open another 🥤';
  // like a real can: the tab drops back down after the seal breaks
  setTimeout(function () { if (!drag) animateLift(0.3, 380); }, 260);
}
function reset() { opened = false; clicked = false; w.classList.remove('open', 'jolt'); cm.classList.remove('show'); setLift(0); }

/* finger: drag up on the top of the can */
grab.addEventListener('pointerdown', function (e) { if (opened) reset(); drag = { y: e.clientY, l: lift }; w.classList.add('pulling'); try { grab.setPointerCapture(e.pointerId); } catch (er) {} cancelAnimationFrame(raf); audio(); });
grab.addEventListener('pointermove', function (e) { if (!drag) return; setLift(drag.l + (drag.y - e.clientY) / 75); });
function release() { if (!drag) return; drag = null; w.classList.remove('pulling'); if (opened) animateLift(0.3, 380); else animateLift(0, 300, function () { clicked = false; }); }
grab.addEventListener('pointerup', release); grab.addEventListener('pointercancel', release);

/* button (and keyboard): plays the whole opening */
pb.addEventListener('click', function () {
  if (window.__can3d) { window.__can3d.autoOpen(); return; }
  if (opened) { reset(); setTimeout(function () { animateLift(1, 520); }, 150); } else animateLift(1, 520);
});
setLift(0);
})();
/* the 3D can (top view → open → swing to front → pour), loaded when she gets near */
(function () {
var box = document.getElementById('can3d'); if (!box) return;
function hasGL() { try { var c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { return false; } }
if (!hasGL()) return;
var canvas = document.getElementById('can-canvas'), msg = document.getElementById('can3d-msg'), pb = document.getElementById('pop'), game = null, visible = false, loading = false;
function load() {
  if (loading) return; loading = true;
  import('./src/monster.js').then(function (mod) {
    box.hidden = false; box.classList.add('on');
    game = mod.createMonster(canvas, {
      photo: 'assets/img/monster-can.webp',
      onMessage: function (t) { msg.textContent = t; },
      onPhase: function (p) {
        pb.disabled = p === 'swing' || p === 'pour' || p === 'lifting';
        if (p === 'done') pb.textContent = 'Crack open another 🥤';
        if (p === 'top') pb.textContent = 'Crack it open 🥤';
      }
    });
    window.__can3d = game;
    if (visible) game.start();
  }).catch(function () { box.hidden = true; box.classList.remove('on'); });
}
new IntersectionObserver(function (es) { if (es[0].isIntersecting) load(); }, { rootMargin: '900px 0px' }).observe(document.getElementById('canbox'));
new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (game) { if (visible) game.start(); else game.stop(); } }, { threshold: 0.05 }).observe(box);
})();
(function () { var d = document.getElementById('drops'); for (var i = 0; i < 46; i++) { var s = document.createElement('span'), z = 2.5 + Math.random() * 6.5; s.className = 'dr'; s.style.cssText = 'left:' + (10 + Math.random() * 125) + 'px;top:' + (14 + Math.random() * 365) + 'px;width:' + z + 'px;height:' + (Math.random() < .35 ? z * 1.6 : z) + 'px'; d.appendChild(s); } })();

/* ---------- Memory album: swipe through, tap to turn over ---------- */
(function () {
var stage = document.getElementById('album'); if (!stage) return;
var cards = [].slice.call(stage.querySelectorAll('.pc')), N = cards.length, order = cards.map(function (c, i) { return i; });
var count = document.getElementById('al-count'), rm = matchMedia('(prefers-reduced-motion: reduce)').matches, celebrated = false, busy = false;
var tilt = cards.map(function (c, i) { return [-4, 3, -2, 5, -3, 2][i % 6]; });

function load(i) { var img = cards[i].querySelector('img'); if (img && !img.getAttribute('src')) { img.srcset = img.getAttribute('data-srcset'); img.src = img.getAttribute('data-src'); } }
function layout() {
  order.forEach(function (ci, k) {
    var c = cards[ci], vis = k < 3;
    c.classList.toggle('top', k === 0);
    c.classList.toggle('off', !vis);
    c.style.zIndex = N - k;
    c.style.opacity = vis ? 1 : 0;
    c.style.pointerEvents = k === 0 ? 'auto' : 'none';
    c.style.transform = vis ? 'translate3d(' + (k ? (k % 2 ? 1 : -1) * k * 7 : 0) + 'px,' + k * 9 + 'px,0) rotate(' + (k ? tilt[ci] : tilt[ci] * .35) + 'deg) scale(' + (1 - k * .04) + ')' : 'translate3d(0,18px,0) scale(.9)';
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
    setTimeout(function () { order.push(order.shift()); top.classList.remove('flipped'); layout(); busy = false; }, rm ? 0 : 260);
  } else {
    // pull the last photo back on top from the side
    var ci = order.pop(), c = cards[ci]; order.unshift(ci);
    c.classList.remove('off'); c.classList.add('dragging'); c.style.zIndex = N + 1; c.style.opacity = 0;
    c.style.transform = 'translate3d(-130%,-4%,0) rotate(-18deg)';
    void c.offsetWidth; c.classList.remove('dragging');
    layout(); setTimeout(function () { busy = false; }, rm ? 0 : 260);
  }
}
function flip() { cards[order[0]].classList.toggle('flipped'); }

/* drag or swipe the top photo; a tap turns it over */
var sx = 0, sy = 0, dx = 0, dragging = false, moved = false, pid = null, raf = 0;
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
  if (!raf) raf = requestAnimationFrame(function () { raf = 0; if (dragging) cards[order[0]].style.transform = 'translate3d(' + dx + 'px,0,0) rotate(' + dx / 18 + 'deg)'; });
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
function held() { return !window.__cakeDone; } // the song waits until the candles are out
var alt = null; // a second, already-running audio channel (the one the mic used), if the phone hasn't unlocked ours
function startBuffer() {
  if (held() || !buf || src || document.hidden) return;
  var c = cx && cx.state === 'running' ? cx : (alt && alt.state === 'running' ? alt : null);
  if (!c) return;
  var o = out;
  if (c !== cx) { o = c.createGain(); o.connect(c.destination); out = o; cx = c; }
  var lb = bounds(buf);
  src = c.createBufferSource(); src.buffer = buf; src.loop = true; src.loopStart = lb[0]; src.loopEnd = lb[1];
  src.connect(o); src.start(0, lb[0]);
  // fade in quickly so it starts right with the celebration
  if (!began) { began = true; var t = c.currentTime; o.gain.setValueAtTime(0.25, t); o.gain.linearRampToValueAtTime(.9, t + 1.0); }
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
  setInterval(function () { if (held() || cx.state !== 'running') return; if (nt < cx.currentTime) nt = cx.currentTime + .05; while (nt < cx.currentTime + .3) { var e = step % 8, c = ch[Math.floor(step / 8) % 4]; if (e === 0) pad(c, nt, 2.1); bell(c[pat[e]] + (e === 7 ? 12 : 0), nt, .1, 1.4); if (e % 4 === 0) bell(c[0] - 12, nt, .08, 1.2); nt += .31; step++; } }, 100);
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
  if (held()) { if (cx && cx.state !== 'running') cx.resume(); return; } // unlock sound now, play it later
  if (el === 'pending') { el = null; startElement(); return; }
  if (el && el.paused) { startElement(); return; }
  if (cx && cx.state !== 'running') cx.resume();
  startBuffer();
}
function stopListening() { G.forEach(function (ev) { removeEventListener(ev, gesture, true); }); }
G.forEach(function (ev) { addEventListener(ev, gesture, { capture: true, passive: true }); });
addEventListener('cakedone', function (e) {
  if (e && e.detail && e.detail.ctx) alt = e.detail.ctx;
  if (cx && cx.state !== 'running') { try { cx.resume(); } catch (er) {} }
  if (el === 'pending') { el = null; startElement(); } else startBuffer();
});

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
