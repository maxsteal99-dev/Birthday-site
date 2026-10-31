// "A sky full of us": scattered stars → light up into "30" → open a star → page through all 30 → heart.
// Usage: base outDir [device|desktop]
const { chromium, devices } = require('playwright');
(async () => {
  const base = process.argv[2], out = process.argv[3], dev = process.argv[4] || 'iPhone 13';
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await (await b.newContext(dev === 'desktop' ? { viewport: { width: 1280, height: 800 } } : { ...devices[dev] })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(d => { window.__maxDPR = d; }, +process.env.DPR || 2); await p.goto(base);
  await p.waitForFunction(() => !document.documentElement.classList.contains('loading'), null, { timeout: 30000 });
  await p.click('#gate-skip', { force: true }); await p.waitForTimeout(1800);
  await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; document.getElementById('sky30').scrollIntoView({ block: 'center' }); });
  await p.waitForSelector('.star30', { timeout: 15000 }); await p.waitForTimeout(1500);
  const r = { stars: await p.$$eval('.star30', e => e.length), status0: await p.textContent('#sky30-status') };
  await p.screenshot({ path: out + '/sky-1.png' });
  await p.click('#sky30-go'); await p.waitForTimeout(4200);
  r.lit = await p.evaluate(() => document.getElementById('sky30').classList.contains('lit')); r.paths = await p.$$eval('.sky30-lines path', e => e.length);
  await p.screenshot({ path: out + '/sky-2.png' });
  await p.click('.star30:nth-of-type(5)', { force: true }); await p.waitForSelector('.mem30'); await p.waitForTimeout(2200);
  r.viewer = await p.textContent('.mem30-n'); r.tag = await p.textContent('.mem30-tag'); r.imgOk = await p.$eval('.mem30-photo img', i => i.complete && i.naturalWidth > 0);
  await p.screenshot({ path: out + '/sky-3.png' });
  for (let i = 0; i < 29; i++) { await p.click('.mem30-next'); await p.waitForTimeout(60); }
  r.after = await p.textContent('.mem30-n'); r.seen = await p.$$eval('.star30.seen', e => e.length);
  await p.click('.mem30-close'); await p.waitForTimeout(3600);
  r.heart = await p.evaluate(() => document.getElementById('sky30').classList.contains('heart')); r.final = await p.textContent('#sky30-status');
  await p.evaluate(() => document.getElementById('sky30').scrollIntoView({ block: 'center' })); await p.waitForTimeout(400);
  await p.screenshot({ path: out + '/sky-4.png' });
  r.unlocked = await p.evaluate(() => !document.documentElement.classList.contains('gifting'));
  console.log(JSON.stringify(r, null, 1), errs.slice(0, 6)); await b.close();
})();
