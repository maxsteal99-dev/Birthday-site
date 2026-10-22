const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }); const out = process.argv[2], base = process.argv[3];
  for (const [name, opts] of [['iphone', devices['iPhone 13']]]) {
    const p = await (await b.newContext(opts)).newPage();
    const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()) });
    await p.goto(base); await p.waitForFunction(() => !document.documentElement.classList.contains('loading'), null, { timeout: 40000 }); if (await p.$('#gate-skip')) { await p.click('#gate-skip'); await p.waitForTimeout(1600); } await p.click('#open'); await p.waitForTimeout(800);
    await p.evaluate(() => document.getElementById('vend').scrollIntoView({ block: 'center' })); await p.waitForTimeout(2200);
    await p.screenshot({ path: `${out}/sn-${name}-1.png` });
    const r = {};
    await p.click('.slot[data-snack="burger"]'); await p.waitForTimeout(350); await p.screenshot({ path: `${out}/sn-${name}-mid.png` }); await p.waitForTimeout(1000);
    r.msg1 = await p.textContent('#vend-msg'); r.c1 = await p.$$eval('.coupon', c => c.length);
    await p.click('.slot[data-snack="burger"]'); await p.waitForTimeout(1300); r.again = await p.textContent('#vend-msg'); r.c2 = await p.$$eval('.coupon', c => c.length);
    await p.click('.slot[data-snack="garlic"]'); await p.waitForTimeout(1300);
    await p.click('#surprise'); await p.waitForTimeout(3500);
    if ((await p.$$eval('.coupon', c => c.length)) < 4) { await p.click('.slot[data-snack="kurkure"]'); await p.waitForTimeout(2200); }
    r.final = await p.textContent('#vend-msg'); r.coupons = await p.$$eval('.coupon strong', c => c.map(x => x.textContent));
    await p.evaluate(() => document.getElementById('coupons').scrollIntoView({ block: 'end' })); await p.waitForTimeout(600);
    await p.screenshot({ path: `${out}/sn-${name}-end.png` });
    r.overflowX = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    console.log(name, JSON.stringify(r), errs);
  }
  await b.close();
})();
