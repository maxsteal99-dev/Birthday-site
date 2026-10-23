const { chromium, devices } = require('playwright');
(async () => {
  const out = process.argv[3], base = process.argv[2];
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ ...devices['iPhone 13'], permissions: ['microphone'] }); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text().slice(0, 200)) });
  await p.addInitScript(() => { const S = AudioBufferSourceNode.prototype.start; AudioBufferSourceNode.prototype.start = function () { if (this.loop) window.__song = performance.now(); return S.apply(this, arguments); }; });
  const t0 = Date.now(); await p.addInitScript(d => { window.__maxDPR = d; }, +process.env.DPR || 2); await p.goto(base);
  await p.waitForFunction(() => !document.documentElement.classList.contains('loading'), null, { timeout: 15000 });
  const r = { readyMs: Date.now() - t0 };
  await p.waitForTimeout(2500); await p.screenshot({ path: out + '/cake-1.png' });
  r.count0 = await p.textContent('#gate-count');
  // tap the mic button (fake device)
  await p.waitForTimeout(1500); r.mic = await p.textContent('#gate-mic');
  // keyboard puff
  await p.focus('#cake-canvas'); await p.keyboard.press('Space'); await p.waitForTimeout(700); r.afterPuff = await p.textContent('#gate-count');
  await p.screenshot({ path: out + '/cake-2.png' });
  r.songDuringCake = await p.evaluate(() => !!window.__song);
  // swipe back and forth across the flame area until all out
  const vw = 390, vh = 664;
  for (let k = 0; k < 40; k++) {
    const done = await p.evaluate(() => !document.getElementById('gate') || document.getElementById('gate').classList.contains('leaving') || /All out/.test(document.getElementById('gate-count').textContent));
    if (done) break;
    const y = vh * (0.3 + (k % 8) * 0.03); if (k % 4 === 0) console.log('swipe', k, await p.evaluate(() => document.getElementById('gate-count') && document.getElementById('gate-count').textContent));
    await p.mouse.move(20, y); await p.mouse.down(); await p.mouse.move(vw - 20, y, { steps: 18 }); await p.mouse.up(); await p.waitForTimeout(250);
    if (k === 2) await p.screenshot({ path: out + '/cake-3.png' });
  }
  r.count1 = await p.evaluate(() => document.getElementById('gate-count') && document.getElementById('gate-count').textContent);
  await p.waitForTimeout(800); await p.screenshot({ path: out + '/cake-4.png' });
  await p.waitForTimeout(3500);
  r.gateGone = await p.evaluate(() => !document.getElementById('gate'));
  r.mainOpen = await p.evaluate(() => document.querySelector('main').classList.contains('open'));
  r.song = await p.evaluate(() => !!window.__song);
  await p.screenshot({ path: out + '/cake-5.png' });
  console.log(JSON.stringify(r, null, 1), errs.filter(e => !/GPU stall|swiftshader|WebGL/i.test(e)).slice(0, 10));
  await b.close();
})();
