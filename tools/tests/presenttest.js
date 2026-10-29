// Gift box → present reveal: 3 taps, the keyboard rises, bubbles pop, keycaps glow, cards swipe, then on to the letter.
// Usage: base outDir [device|desktop]
const { chromium, devices } = require('playwright');
(async () => {
  const base = process.argv[2], out = process.argv[3], dev = process.argv[4] || 'iPhone 13';
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext(dev === 'desktop' ? { viewport: { width: 1280, height: 800 } } : { ...devices[dev] });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(d => { window.__maxDPR = d; }, +process.env.DPR || 2); await p.goto(base);
  await p.waitForFunction(() => !document.documentElement.classList.contains('loading'), null, { timeout: 30000 });
  await p.click('#gate-skip', { force: true }); await p.waitForTimeout(2200);
  const r = {};
  for (let i = 0; i < 3; i++) { await p.click('#open', { force: true }); await p.waitForTimeout(i < 2 ? 700 : 400); }
  await p.waitForSelector('.gift-reveal', { timeout: 8000 }); await p.waitForTimeout(1300); await p.screenshot({ path: out + '/present-1.png' });
  await p.waitForTimeout(3600);
  r.title = await p.textContent('.gr-title'); r.bubbles = await p.$$eval('.gr-bubbles li', e => e.map(x => x.textContent.trim()));
  r.imgLoaded = await p.$eval('.gr-product', i => i.complete && i.naturalWidth > 0);
  r.cardImgs = await p.$$eval('.gr-card img', e => e.every(i => i.complete && i.naturalWidth > 0));
  r.scrollLocked = await p.evaluate(() => getComputedStyle(document.documentElement).overflow);
  await p.screenshot({ path: out + '/present-2.png' });
  await p.evaluate(() => document.querySelector('.gr-name').scrollIntoView({ block: 'center' })); await p.waitForTimeout(300);
  r.colour0 = await p.textContent('.gr-colour'); await p.click('.gr-key:nth-child(3)'); await p.waitForTimeout(300); r.colour1 = await p.textContent('.gr-colour');
  await p.evaluate(() => document.querySelector('.gr-cards').scrollIntoView({ block: 'center' })); await p.waitForTimeout(400);
  await p.screenshot({ path: out + '/present-3.png' });
  await p.evaluate(() => { const c = document.querySelector('.gr-cards'); c.scrollTo({ left: c.firstElementChild.offsetWidth * 2 + 28, behavior: 'instant' }); }); await p.waitForTimeout(400);
  r.dot = await p.$$eval('.gr-dots i', e => e.findIndex(x => x.classList.contains('on')));
  await p.screenshot({ path: out + '/present-4.png' });
  await p.click('.gr-go'); await p.waitForTimeout(2400);
  r.closed = !(await p.$('.gift-reveal')); r.unlocked = await p.evaluate(() => !document.documentElement.classList.contains('gifting'));
  r.atLetter = await p.evaluate(() => Math.abs(document.getElementById('hello').getBoundingClientRect().top) < 200);
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(800); await p.click('#open', { force: true }); await p.waitForTimeout(1200);
  r.reopens = !!(await p.$('.gift-reveal'));
  console.log(JSON.stringify(r, null, 1), errs.slice(0, 6)); await b.close();
})();
