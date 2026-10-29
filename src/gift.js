/* The present inside the birthday box: a pink iPad keyboard.
   It rises out of the box, cute feature bubbles pop in, swipeable photo cards explain
   what it does (no tech jargon), and her name glows on keycaps she can tap through
   the keyboard's 11 backlight colours. Closing it continues to the rest of the surprise. */

const IMG = 'assets/img/gift/';
const GLOW = ['#ff7eb6', '#ff5a5a', '#ff9a3c', '#ffd23f', '#9be15d', '#3ee6c4', '#4fc3ff', '#5b7cff', '#a66bff', '#e36bff', '#ffffff'];
const BUBBLES = [['🌈', 'Glows in 11 colours'], ['🧲', 'Your iPad floats'], ['👆', 'A real trackpad'], ['✏️', 'Holds your Pencil'], ['🪶', 'Super light'], ['🔋', 'Barely needs charging']];
const CARDS = [
  ['rainbow.webp', 'It glows 🌈', 'The keys light up in 11 colours. Pink for latte mornings, purple for movie nights, whatever your mood is.'],
  ['seaside.webp', 'Your iPad floats ✨', 'It clicks on with magnets and hovers above the keys. Tilt it to your perfect angle, like magic.'],
  ['trackpad.webp', 'A real trackpad 👆', 'Scroll, swipe and click just like a laptop. Perfect for planning our next trip together.'],
  ['night.webp', 'Made for cosy nights 🌙', 'Slim and light for the couch, the bed or a café with a Spanish latte. Your Apple Pencil gets its own little spot too.'],
];
// start loading the photos as soon as this module is imported (on her first tap of the box)
const preload = ['keyboard.webp', ...CARDS.map(c => c[0])].map(f => { const i = new Image(); i.decoding = 'async'; i.src = IMG + f; return i; });

export function showGift({ from, onClose, buzz } = {}) {
  const rm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const box = document.createElement('div');
  box.className = 'gift-reveal'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'Your birthday present');
  box.innerHTML = `
    <div class="gr-backdrop"></div>
    <div class="gr-scroll">
      <div class="gr-stage">
        <span class="gr-halo" aria-hidden="true"></span>
        <span class="gr-rays" aria-hidden="true"></span>
        <img class="gr-product" src="${IMG}keyboard.webp" width="1190" height="833" alt="A pink keyboard case holding an iPad, floating on its stand">
        <span class="gr-shadow" aria-hidden="true"></span>
      </div>
      <p class="gr-kicker">Surprise! 🎁</p>
      <h2 class="gr-title">A pink keyboard for your iPad</h2>
      <p class="gr-sub">Your iPad just turned into a little pink laptop 💗</p>
      <ul class="gr-bubbles">${BUBBLES.map(([e, t], i) => `<li style="--i:${i}"><span aria-hidden="true">${e}</span>${t}</li>`).join('')}</ul>
      <div class="gr-name lg" role="group" aria-label="Tap the glowing keys to change the colour">
        <p>Tap the keys to change the glow</p>
        <div class="gr-keys">${'SAGARIKA'.split('').map((c, i) => `<button type="button" class="gr-key" style="--i:${i}" aria-label="${c}">${c}</button>`).join('')}</div>
        <p class="gr-colour" aria-live="polite">Colour 1 of 11</p>
      </div>
      <div class="gr-cards" tabindex="0" aria-label="What it can do (swipe)">
        ${CARDS.map(([img, h, p], i) => `<article class="gr-card lg" style="--i:${i}"><img src="${IMG}${img}" alt="" loading="eager" decoding="async"><h3>${h}</h3><p>${p}</p></article>`).join('')}
      </div>
      <div class="gr-dots" aria-hidden="true">${CARDS.map((_, i) => `<i${i ? '' : ' class="on"'}></i>`).join('')}</div>
      <p class="gr-from">From Mani, with love 💗</p>
      <button type="button" class="btn btn-lux gr-go">Open the rest of your surprise ↓</button>
    </div>
    <button type="button" class="gr-close lg" aria-label="Close">✕</button>`;
  document.body.appendChild(box); root.classList.add('gifting');
  const product = box.querySelector('.gr-product'), stage = box.querySelector('.gr-stage');

  /* ---- sounds ---- */
  let ac = null;
  const audio = () => { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); return ac; } catch (e) { return null; } };
  function tone(f, t, d, v, type = 'sine') { const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + d + 0.02); }
  function magic() { if (!audio()) return; const t = ac.currentTime; [523, 659, 784, 1047, 1319, 1568, 2093].forEach((f, i) => tone(f, t + i * 0.07, 1.1, 0.05)); tone(196, t, 1.4, 0.06, 'triangle'); }
  function pop(i) { if (!audio()) return; const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(500 + i * 70, t); o.frequency.exponentialRampToValueAtTime(900 + i * 90, t + 0.06); g.gain.setValueAtTime(0.06, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12); o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + 0.13); }
  function click() { if (!audio()) return; const t = ac.currentTime, n = ac.createBuffer(1, ac.sampleRate * 0.02 | 0, ac.sampleRate), d = n.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length) ** 3; const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = n; f.type = 'bandpass'; f.frequency.value = 3200; g.gain.value = 0.5; s.connect(f); f.connect(g); g.connect(ac.destination); s.start(t); }

  /* ---- the product flies out of the box ---- */
  requestAnimationFrame(() => {
    const r = stage.getBoundingClientRect();
    if (from && !rm) {
      const dx = from.left + from.width / 2 - (r.left + r.width / 2), dy = from.top + from.height * 0.4 - (r.top + r.height / 2);
      product.animate([
        { transform: `translate(${dx}px, ${dy}px) scale(.12) rotate(-14deg)`, opacity: 0 },
        { transform: `translate(${dx * 0.2}px, ${dy * 0.1 - 60}px) scale(.85) rotate(4deg)`, opacity: 1, offset: 0.62 },
        { transform: 'translate(0, 8px) scale(1.04) rotate(-1deg)', offset: 0.84 },
        { transform: 'none', opacity: 1 }
      ], { duration: 1500, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' });
    }
    box.classList.add('in'); magic(); buzz && buzz([20, 40, 30]);
    if (window.burst) setTimeout(() => window.burst(innerWidth / 2, r.top + r.height / 2), 900);
  });
  // bubbles pop in one by one
  BUBBLES.forEach((_, i) => setTimeout(() => { if (box.isConnected) pop(i); }, (rm ? 0 : 1700) + i * 230));

  /* ---- her name on glowing keycaps ---- */
  let colour = 0;
  const keys = [...box.querySelectorAll('.gr-key')], label = box.querySelector('.gr-colour'), nameBox = box.querySelector('.gr-name');
  function glow(k, wave) {
    colour = (colour + 1) % GLOW.length; nameBox.style.setProperty('--glow', GLOW[colour]); label.textContent = `Colour ${colour + 1} of 11`;
    keys.forEach((el, i) => { el.classList.remove('press'); setTimeout(() => { el.classList.add('press'); setTimeout(() => el.classList.remove('press'), 180); }, wave ? Math.abs(i - k) * 55 : 0); });
    click(); buzz && buzz(10);
  }
  nameBox.style.setProperty('--glow', GLOW[0]);
  keys.forEach((el, i) => el.addEventListener('click', () => glow(i, true)));
  // a gentle demo wave once the keys appear, so she sees they glow
  setTimeout(() => { if (box.isConnected && !rm) { keys.forEach((el, i) => setTimeout(() => { el.classList.add('press'); setTimeout(() => el.classList.remove('press'), 200); }, i * 90)); } }, 3600);

  /* ---- swipe cards: dots follow ---- */
  const cards = box.querySelector('.gr-cards'), dots = [...box.querySelectorAll('.gr-dots i')];
  cards.addEventListener('scroll', () => { const i = Math.round(cards.scrollLeft / Math.max(1, cards.firstElementChild.offsetWidth + 14)); dots.forEach((d, k) => d.classList.toggle('on', k === i)); }, { passive: true });

  /* ---- close: on to the rest of the surprise ---- */
  let closed = false;
  function close() {
    if (closed) return; closed = true;
    box.classList.add('out'); root.classList.remove('gifting');
    setTimeout(() => { box.remove(); onClose && onClose(); }, rm ? 0 : 650);
  }
  box.querySelector('.gr-go').addEventListener('click', close);
  box.querySelector('.gr-close').addEventListener('click', close);
  addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { removeEventListener('keydown', esc); close(); } });
  setTimeout(() => box.querySelector('.gr-close').focus({ preventScroll: true }), 50);
  return { close, preload };
}
