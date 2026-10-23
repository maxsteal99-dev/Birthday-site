const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  for (const [name, opts] of [['iphone', devices['iPhone 13']], ['desktop', { viewport: { width: 1280, height: 800 } }]]) {
    const p = await (await b.newContext(opts)).newPage();
    const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()) }); p.on('response', r => { if (r.status() >= 400) errs.push(r.status() + ' ' + r.url()) });
    await p.goto(process.argv[3]); await p.waitForFunction(() => !document.documentElement.classList.contains('loading'), null, { timeout: 40000 }); if (await p.$('#gate-skip')) { await p.click('#gate-skip'); await p.waitForTimeout(1600); } await p.click('#open'); await p.waitForTimeout(800);
    await p.evaluate(() => document.getElementById('memories').scrollIntoView()); await p.waitForTimeout(2600);
    await p.screenshot({ path: `${process.argv[2]}/al-${name}-1.png` });
    const c = () => p.textContent('#al-count');
    const r = { start: await c() };
    const box = await p.locator('.pc.top').boundingBox();
    await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await p.mouse.down(); await p.mouse.move(box.x + box.width / 2 - 160, box.y + box.height / 2, { steps: 8 }); await p.mouse.up(); await p.waitForTimeout(500);
    r.afterSwipe = await c();
    await p.click('#al-next'); await p.waitForTimeout(450); r.afterNext = await c();
    await p.click('#al-prev'); await p.waitForTimeout(450); r.afterPrev = await c();
    await p.locator('.pc.top').scrollIntoViewIfNeeded(); await p.waitForTimeout(700); const b2 = await p.locator('.pc.top').boundingBox(); await p.mouse.click(b2.x + b2.width / 2, b2.y + b2.height / 2); await p.waitForTimeout(900);
    r.flipped = await p.$eval('.pc.top', e => e.classList.contains('flipped'));
    await p.screenshot({ path: `${process.argv[2]}/al-${name}-flip.png` });
    await p.focus('#album'); await p.keyboard.press('ArrowRight'); await p.waitForTimeout(400); r.afterKey = await c();
    for (let i = 0; i < 20 && (await c()) !== '17 / 17'; i++) { await p.click('#al-next'); await p.waitForTimeout(380); }
    r.end = await c(); await p.waitForTimeout(1000); await p.screenshot({ path: `${process.argv[2]}/al-${name}-end.png` });
    r.brokenImgs = await p.$$eval('.pc img[src]', is => is.filter(i => i.complete && !i.naturalWidth).length);
    r.overflowX = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    console.log(name, JSON.stringify(r), errs);
  }
  await b.close();
})();
