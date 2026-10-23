// Finale Stitch: skip the cake, tap once (unlocks sound), scroll to the finale; Stitch should start,
// show the lyrics, duck the song, schedule plucks, and say "Ohana…" at the end. Tapping him plays an encore.
const { chromium, devices } = require('playwright');
(async () => {
  const base = process.argv[2], out = process.argv[3], dev = process.argv[4] || 'iPhone 13';
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext(dev === 'desktop' ? { viewport: { width: 1280, height: 800 } } : { ...devices[dev] });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(() => { window.__plucks = 0; const S = AudioBufferSourceNode.prototype.start; AudioBufferSourceNode.prototype.start = function () { if (!this.loop) window.__plucks++; return S.apply(this, arguments); }; });
  await p.addInitScript(d => { window.__maxDPR = d; }, +process.env.DPR || 2); await p.goto(base); await p.waitForFunction(() => !document.documentElement.classList.contains('loading'), null, { timeout: 20000 });
  await p.click('#gate-skip', { force: true }); await p.waitForTimeout(1800);
  await p.mouse.click(10, 10); await p.waitForTimeout(800);
  await p.evaluate(() => document.getElementById('stitch-stage').scrollIntoView({ block: 'center' }));
  await p.waitForTimeout(1500); await p.screenshot({ path: out + '/stitch-1.png' });
  const r = { hello: await p.textContent('#stitch-bubble') };
  const lyrics = new Set(); const t0 = Date.now();
  while (Date.now() - t0 < 16000) { lyrics.add(await p.textContent('#stitch-bubble')); if (Date.now() - t0 > 6000 && Date.now() - t0 < 6400) await p.screenshot({ path: out + '/stitch-2.png' }); await p.waitForTimeout(300); }
  r.lyrics = [...lyrics]; r.plucks = await p.evaluate(() => window.__plucks);
  r.playing = await p.evaluate(() => document.getElementById('stitch-stage').classList.contains('playing'));
  r.hint = await p.textContent('.stitch-hint');
  await p.screenshot({ path: out + '/stitch-3.png' });
  await p.click('#stitch'); await p.waitForTimeout(2500); r.encore = await p.evaluate(() => document.getElementById('stitch-stage').classList.contains('playing'));
  console.log(JSON.stringify(r, null, 1), errs.slice(0, 8)); await b.close();
})();
