// Phuket itinerary: open a day plan, stamp all days (persists across reload), and fake the date to 4 Nov 2026
// to check the "today" highlight. Usage: base outDir [device]
const { chromium, devices } = require('playwright');
(async () => {
  const base = process.argv[2], out = process.argv[3], dev = process.argv[4] || 'iPhone 13';
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const open = async (ctx) => { const p = await ctx.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message)); await p.goto(base); await p.waitForFunction(() => !document.documentElement.classList.contains('loading'), null, { timeout: 20000 }); await p.click('#gate-skip', { force: true }); await p.waitForTimeout(1600); return p; };
  const ctx = await b.newContext(dev === 'desktop' ? { viewport: { width: 1280, height: 800 } } : { ...devices[dev] });
  let p = await open(ctx); const r = {};
  r.villa = await p.textContent('.villa h3'); r.stay = (await p.textContent('.stay')).replace(/\s+/g, ' ');
  await p.evaluate(() => document.querySelector('.day[data-date="2026-11-03"]').scrollIntoView({ block: 'start' })); await p.waitForTimeout(600);
  await p.click('.day[data-date="2026-11-03"] summary'); await p.waitForTimeout(700);
  r.planOpen = await p.evaluate(() => document.querySelector('.day[data-date="2026-11-03"] details').open);
  await p.screenshot({ path: out + '/itin-1.png' });
  for (const d of ['01', '02', '03', '04', '05']) { await p.click(`.day[data-date="2026-11-${d}"] .stamp-btn`); await p.waitForTimeout(150); }
  r.note = await p.textContent('#passport-note'); r.stamps = await p.$$eval('.pstamp', e => e.length);
  await p.evaluate(() => document.getElementById('passport').scrollIntoView({ block: 'center' })); await p.waitForTimeout(700); await p.screenshot({ path: out + '/itin-2.png' });
  await p.close(); p = await open(ctx); r.afterReload = await p.$$eval('.pstamp', e => e.length);
  await p.click('.day[data-date="2026-11-02"] .stamp-btn'); r.unstamp = await p.textContent('#passport-note');
  const c2 = await b.newContext({ ...devices['iPhone 13'] });
  await c2.addInitScript(() => { const T = Date.UTC(2026, 10, 4, 3, 0, 0); const D = Date; window.Date = class extends D { constructor(...a) { super(...(a.length ? a : [T])); } static now() { return T; } }; });
  const q = await open(c2); r.todayPill = await q.textContent('#today-pill'); r.todayOpen = await q.evaluate(() => document.querySelector('.day.today details').open);
  await q.evaluate(() => document.querySelector('.day.today').scrollIntoView({ block: 'start' })); await q.waitForTimeout(700); await q.screenshot({ path: out + '/itin-3.png' });
  console.log(JSON.stringify(r, null, 1), p.errs.concat(q.errs).slice(0, 6)); await b.close();
})();
