/* Shared rendering quality for the 3D scenes.
   - Full screen resolution (up to 3x on iPhone), shadows always on.
   - Only if frames stay slow for about two seconds (scrolling hiccups don't count)
     does the resolution step down, and never below 2x.
   - Shadows are re-rendered only when something that casts one has moved or an
     animation is running, so a still scene costs half as much with identical pixels. */

export function makeQuality(renderer, onChange) {
  const top = Math.min(window.devicePixelRatio || 1, 3), floor = Math.min(top, 2);
  renderer.setPixelRatio(top);
  let slow = 0, last = 0;
  return function adapt(now) {
    const ms = last ? now - last : 16; last = now;
    if (window.__scrolling && window.__scrolling()) return;
    if (renderer.getPixelRatio() <= floor) return;
    slow = ms > 40 ? slow + 1 : Math.max(0, slow - 2);
    if (slow < 60) return;
    slow = 0; renderer.setPixelRatio(Math.max(floor, renderer.getPixelRatio() - 0.5)); onChange && onChange();
  };
}

export function smartShadows(renderer, scene) {
  renderer.shadowMap.autoUpdate = false; renderer.shadowMap.needsUpdate = true;
  let casters = [], seen = new Map(), n = 0;
  const collect = () => { casters = []; scene.traverse(o => { if (o.castShadow) casters.push(o); }); };
  collect();
  // call right before renderer.render(); `busy` = an animation is running
  return function update(busy) {
    if (++n % 120 === 0) collect(); // objects added later (ice, drops…)
    scene.updateMatrixWorld();
    let moved = busy || n % 30 === 0;
    for (const o of casters) {
      const e = o.matrixWorld.elements, v = o.visible && (!o.parent || o.parent.visible), prev = seen.get(o);
      if (!prev) { seen.set(o, { m: e.slice(), v }); moved = true; continue; }
      if (prev.v !== v) { prev.v = v; moved = true; }
      for (let i = 0; i < 16; i++) if (prev.m[i] !== e[i]) { prev.m = e.slice(); moved = true; break; }
    }
    if (moved) renderer.shadowMap.needsUpdate = true;
  };
}
