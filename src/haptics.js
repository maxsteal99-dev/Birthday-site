/* Phone vibration.
   Android phones and tablets: the Vibration API (needs one tap on the page first).
   iPhone: websites can't vibrate, but iOS 18+ plays a light haptic tick when a
   switch-style checkbox is toggled, so we toggle a hidden one for each "tap". */
let label = null, lastTick = 0;
const canVibrate = typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';

function iosTick() {
  try {
    if (!label) {
      label = document.createElement('label');
      label.setAttribute('aria-hidden', 'true');
      label.style.cssText = 'position:fixed;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none';
      const input = document.createElement('input'); input.type = 'checkbox'; input.setAttribute('switch', ''); input.tabIndex = -1;
      label.appendChild(input); document.body.appendChild(label);
    }
    label.click();
  } catch (e) {}
}

/* pattern: a number (ms) or [on, off, on, ...]; on iPhone each "on" becomes a tick */
export function vibrate(pattern) {
  if (canVibrate) { try { navigator.vibrate(pattern); } catch (e) {} return; }
  const ons = Array.isArray(pattern) ? pattern.filter((_, i) => i % 2 === 0) : [pattern];
  let t = 0;
  (Array.isArray(pattern) ? pattern : [pattern]).forEach((ms, i) => { if (i % 2 === 0) setTimeout(iosTick, t); t += ms; });
  return ons.length;
}
/* a short tick, rate-limited so many candles at once don't flood it */
export function tick(minGap = 45) { const now = performance.now(); if (now - lastTick < minGap) return; lastTick = now; vibrate(28); }
/* a strong continuous rumble while something keeps happening (call repeatedly) */
let rumbleUntil = 0;
export function rumble(ms = 160) {
  const now = performance.now(); if (now < rumbleUntil - 60) return;
  rumbleUntil = now + ms;
  if (canVibrate) { try { navigator.vibrate(ms); } catch (e) {} } else tick(90);
}
export function stop() { if (canVibrate) try { navigator.vibrate(0); } catch (e) {} rumbleUntil = 0; }
export const hasRealVibration = canVibrate;
