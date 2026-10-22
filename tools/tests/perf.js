const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext(devices['iPhone 13']); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(process.argv[2]); await p.click('#open'); await p.waitForTimeout(600);
  await p.evaluate(() => document.getElementById('memories').scrollIntoView()); await p.waitForTimeout(2500);
  const cdp = await ctx.newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await p.evaluate(() => { window.__f = []; let l = performance.now(); (function t(n) { window.__f.push(n - l); l = n; if (window.__f.length < 2000) requestAnimationFrame(t); })(l); });
  for (let i = 0; i < 6; i++) {
    const bx = await p.locator('.pc.top').boundingBox(); const cx = bx.x + bx.width / 2, cy = bx.y + bx.height / 2;
    await p.mouse.move(cx, cy); await p.mouse.down(); await p.mouse.move(cx - 180, cy, { steps: 15 }); await p.mouse.up(); await p.waitForTimeout(500);
    await p.mouse.click(cx, cy); await p.waitForTimeout(800);
  }
  const f = await p.evaluate(() => window.__f.slice(2));
  f.sort((a, b) => a - b); const avg = f.reduce((a, b) => a + b, 0) / f.length;
  console.log({ frames: f.length, avgMs: avg.toFixed(1), p95: f[Math.floor(f.length * .95)].toFixed(1), worst: f[f.length - 1].toFixed(1), count: await p.textContent('#al-count'), rendered: await p.$$eval('.pc', c => c.filter(x => getComputedStyle(x).display !== 'none').length), errs });
  await b.close();
})();
