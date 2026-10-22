const { chromium, devices } = require('playwright');
(async () => {
  const out = process.argv[2];
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await (await b.newContext(devices['iPhone 13'])).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8766/'); await p.waitForFunction(() => !document.documentElement.classList.contains('loading'), null, { timeout: 40000 });
  if (await p.$('#gate-skip')) { await p.click('#gate-skip'); await p.waitForTimeout(3200); }
  await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(800);
  await p.screenshot({ path: out + '/g-0.png' });
  const msgs = [];
  for (let k = 1; k <= 3; k++) { await p.click('#open', { force: true }); await p.waitForTimeout(k < 3 ? 250 : 450); msgs.push(await p.textContent('#gift-label')); await p.screenshot({ path: out + '/g-' + k + '.png' }); await p.waitForTimeout(400); }
  await p.waitForTimeout(2500);
  const r = await p.evaluate(() => ({ y: Math.round(scrollY), helloTop: Math.round(document.getElementById('hello').getBoundingClientRect().top), opened: document.getElementById('open').classList.contains('opened') }));
  console.log(msgs, r, errs); await b.close();
})();
