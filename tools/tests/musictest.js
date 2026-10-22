const { chromium } = require('playwright');
(async () => {
  const [base, wav] = process.argv.slice(2);
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--use-file-for-fake-audio-capture=' + wav, '--autoplay-policy=user-gesture-required'] });
  const p = await (await b.newContext({ viewport: { width: 390, height: 700 }, permissions: ['microphone'] })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => {
    const S = AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start = function () { if (this.loop && this.buffer && this.buffer.duration > 60) { window.__songAt = performance.now(); window.__songCtxState = this.context.state; } return S.apply(this, arguments); };
    const iv = setInterval(() => { const c = document.getElementById('gate-count'); if (c && /All out/.test(c.textContent) && !window.__outAt) window.__outAt = performance.now(); if (!c && !window.__outAt) window.__outAt = performance.now(); }, 20);
  });
  await p.goto(base);
  for (let i = 0; i < 60; i++) { await p.waitForTimeout(500); const r = await p.evaluate(() => ({ out: window.__outAt, song: window.__songAt, st: window.__songCtxState })); if (r.song) { await p.waitForTimeout(1200); break; } }
  const r = await p.evaluate(() => ({ out: window.__outAt, song: window.__songAt, st: window.__songCtxState, ctx: (() => { return null; })() }));
  console.log(r.out && r.song ? `song started ${Math.round(r.song - r.out)} ms after the last candle went out (context ${r.st})` : 'NO SONG ' + JSON.stringify(r), errs);
  await b.close();
})();
