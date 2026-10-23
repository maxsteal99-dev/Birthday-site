/* Stitch at the finale (the owner's Stitch picture, layered): he strums a ukulele (plucked-string synth) and
   "sings" Happy Birthday to her, bobbing to the beat, with lyrics in his
   speech bubble and hearts and notes floating up. The background song is
   turned down while he plays. Tap him when he's not playing for a giggle. */

const BEAT = 0.43; // seconds per beat
const N = { C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392, A4: 440, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99 };
const CH = { C: ['G4', 'C4', 'E4', 'C5'], G7: ['G4', 'D4', 'F4', 'B4'], F: ['A4', 'C4', 'F4', 'A4'] };
const LINES = ['Happy birthday to you 🎶', 'Happy birthday to you 🎶', 'Happy birthday, dear Sagarika 💙', 'Happy birthday to you! 🎉'];
// [note, beats, chord to strum on this note, lyric line]
const SONG = [
  ['G4', .75, 'C', 0], ['G4', .25, 0, 0], ['A4', 1, 0, 0], ['G4', 1, 0, 0], ['C5', 1, 0, 0], ['B4', 2, 'G7', 0],
  ['G4', .75, 'G7', 1], ['G4', .25, 0, 1], ['A4', 1, 0, 1], ['G4', 1, 0, 1], ['D5', 1, 0, 1], ['C5', 2, 'C', 1],
  ['G4', .75, 'C', 2], ['G4', .25, 0, 2], ['G5', 1, 0, 2], ['E5', 1, 0, 2], ['C5', 1, 'F', 2], ['B4', .5, 0, 2], ['B4', .5, 0, 2], ['A4', 2, 0, 2],
  ['F5', .75, 'F', 3], ['F5', .25, 0, 3], ['E5', 1, 'C', 3], ['C5', 1, 0, 3], ['D5', 1, 'G7', 3], ['C5', 3, 'C', 3]
];
const GIGGLES = ['Aloha! 🌺', 'Ohana! 💙', 'Hehehe 😆', 'Ih! 👽', 'Sagarika! 💙', 'Cake? 🎂', 'Again? 🎸'];

export function initStitch(stage, music) {
  const btn = stage.querySelector('#stitch'), bubble = stage.querySelector('#stitch-bubble');
  const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let ac = null, playing = false, played = false, timers = [];
  stage.style.setProperty('--beat', BEAT + 's');

  const say = t => { bubble.textContent = t; bubble.classList.remove('pop'); void bubble.offsetWidth; bubble.classList.add('pop'); };
  function audio() {
    const m = music && music.ctx && music.ctx(); if (m) return (ac = m);
    try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch (e) { ac = null; }
    return ac;
  }
  /* Karplus–Strong plucked string, cached per pitch */
  const cache = new Map();
  function string(f) {
    const key = f.toFixed(2); if (cache.has(key)) return cache.get(key);
    const sr = ac.sampleRate, len = Math.floor(sr * 1.6), b = ac.createBuffer(1, len, sr), d = b.getChannelData(0), p = Math.max(2, Math.round(sr / f)), ring = new Float32Array(p);
    for (let i = 0; i < p; i++) ring[i] = Math.random() * 2 - 1;
    let k = 0, prev = 0;
    for (let i = 0; i < len; i++) { const cur = ring[k], nx = ring[(k + 1) % p], v = 0.4985 * (cur + nx); ring[k] = v; d[i] = cur * 0.6 + prev * 0.4; prev = cur; k = (k + 1) % p; }
    cache.set(key, b); return b;
  }
  function out() {
    if (!out.node || out.ctx !== ac) {
      const g = ac.createGain(), lp = ac.createBiquadFilter(), body = ac.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.value = 4200; body.type = 'peaking'; body.frequency.value = 420; body.Q.value = 1.2; body.gain.value = 5; g.gain.value = 0.9;
      g.connect(body); body.connect(lp); lp.connect(ac.destination); out.node = g; out.ctx = ac;
    }
    return out.node;
  }
  function pluck(f, t, gain) {
    const s = ac.createBufferSource(), g = ac.createGain(); s.buffer = string(f);
    g.gain.setValueAtTime(gain, t); g.gain.setTargetAtTime(0.0001, t + 1.1, 0.2);
    s.connect(g); g.connect(out()); s.start(t); s.stop(t + 1.6);
  }
  function strum(chord, t, down) { const ns = CH[chord].slice(); if (!down) ns.reverse(); ns.forEach((n, i) => pluck(N[n], t + i * 0.018, 0.16)); }
  /* a soft "ooh" for the melody so he sounds like he's singing along */
  function hum(f, t, d) {
    const o = ac.createOscillator(), v = ac.createOscillator(), vg = ac.createGain(), bp = ac.createBiquadFilter(), g = ac.createGain();
    o.type = 'sawtooth'; o.frequency.value = f; v.frequency.value = 5.5; vg.gain.value = f * 0.012; v.connect(vg); vg.connect(o.frequency);
    bp.type = 'bandpass'; bp.frequency.value = 700; bp.Q.value = 2.2;
    const end = t + Math.max(0.15, d * 0.92);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.05, t + 0.05); g.gain.setValueAtTime(0.05, end - 0.08); g.gain.linearRampToValueAtTime(0.0001, end);
    o.connect(bp); bp.connect(g); g.connect(out()); o.start(t); v.start(t); o.stop(end + 0.02); v.stop(end + 0.02);
  }
  function giggle() {
    if (!audio()) return; const t = ac.currentTime;
    [0, 0.11, 0.22].forEach((dt, i) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(700 + i * 90, t + dt); o.frequency.exponentialRampToValueAtTime(420 + i * 60, t + dt + 0.09); g.gain.setValueAtTime(0.0001, t + dt); g.gain.linearRampToValueAtTime(0.08, t + dt + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + dt + 0.1); o.connect(g); g.connect(ac.destination); o.start(t + dt); o.stop(t + dt + 0.12); });
  }

  function float(chars, n) {
    if (rm) return;
    for (let i = 0; i < n; i++) {
      const s = document.createElement('span'); s.className = 'st-float'; s.setAttribute('aria-hidden', 'true');
      s.textContent = chars[Math.random() * chars.length | 0];
      s.style.setProperty('--x0', (Math.random() * 120 - 60) + 'px'); s.style.setProperty('--x1', (Math.random() * 200 - 100) + 'px'); s.style.setProperty('--r', (Math.random() * 40 - 20) + 'deg');
      s.style.animationDelay = (i * 0.12) + 's';
      stage.appendChild(s); setTimeout(() => s.remove(), 2600 + i * 120);
    }
  }
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  function flash(cls, ms) { btn.classList.remove(cls); void btn.getBoundingClientRect(); btn.classList.add(cls); later(() => btn.classList.remove(cls), ms); }

  function play() {
    if (playing || !audio()) return;
    if (ac.state === 'suspended') ac.resume();
    playing = true; played = true; stage.classList.add('playing'); music && music.duck && music.duck(true);
    say('Aloha, Sagarika! 🌺 This one’s for you…');
    const t0 = ac.currentTime + 1.4; let t = t0, down = true, line = -1;
    // a little intro strum
    [0, 0.5, 1].forEach(b => strum('C', ac.currentTime + 0.3 + b * BEAT, (down = !down)));
    for (const [n, beats, chord, ln] of SONG) {
      const d = beats * BEAT, at = t, ms = (at - ac.currentTime) * 1000;
      pluck(N[n], at, 0.26); hum(N[n], at, d);
      if (chord) strum(chord, at, (down = !down));
      // strum on the other beats of long notes too
      for (let b = 1; b < beats; b++) { const c = chord || prevChord(n, ln); strum(c, at + b * BEAT, (down = !down)); later(() => flash('strum', 220), ms + b * BEAT * 1000); }
      later(() => { btn.classList.add('open'); flash('strum', 220); if (ln !== line) { line = ln; say(LINES[ln]); } if (Math.random() < 0.6) float(['🎵', '🎶', '💙', '❤️'], 1); }, ms);
      later(() => btn.classList.remove('open'), ms + d * 820);
      t += d;
    }
    const end = (t - ac.currentTime) * 1000;
    // a final flourish strum
    strum('C', t + 0.05, true); strum('C', t + 0.2, false);
    later(() => { flash('strum', 220); float(['💙', '❤️', '🌺', '✨', '🎉'], 12); if (window.burst) window.burst(); say('Ohana means family. Happy 30th, Sagarika 💙'); }, end + 100);
    later(() => { playing = false; stage.classList.remove('playing'); btn.setAttribute('aria-label', 'Stitch with a ukulele. Tap him to play it again'); stage.querySelector('.stitch-hint').textContent = 'Tap Stitch for an encore 🎸'; music && music.duck && music.duck(false); }, end + 1600);
  }
  function prevChord(n, ln) { let c = 'C'; for (const s of SONG) { if (s[2]) c = s[2]; if (s[3] === ln && s[0] === n) break; } return c; }

  btn.addEventListener('click', () => {
    audio(); // iPhone: sound must be unlocked inside the tap itself
    if (playing) { flash('wiggle', 1000); giggle(); float(['💙'], 2); return; }
    if (!played || Math.random() < 0.5) { flash('wiggle', 1000); giggle(); later(play, 500); }
    else { flash('wiggle', 1000); giggle(); say(GIGGLES[Math.random() * GIGGLES.length | 0]); float(['💙', '❤️'], 3); later(play, 900); }
  });

  // he starts by himself the first time she scrolls down to him (if sound is already allowed)
  const io = new IntersectionObserver(es => {
    for (const e of es) if (e.isIntersecting && e.intersectionRatio > 0.6) {
      io.disconnect();
      later(() => { flash('wiggle', 1000); say('Aloha! 🌺'); if (music && music.ctx && music.ctx()) later(play, 1200); }, 500);
    }
  }, { threshold: [0, 0.6, 1] });
  io.observe(btn);
  addEventListener('pagehide', () => timers.forEach(clearTimeout));
}
