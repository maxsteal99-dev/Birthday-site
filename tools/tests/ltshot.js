const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  for (const [n, o] of [['iphone', devices['iPhone 13']], ['desktop', { viewport: { width: 1280, height: 860 } }]]) {
    const p = await (await b.newContext(o)).newPage(); await p.goto('http://localhost:8766/');
    await p.waitForFunction(() => !document.documentElement.classList.contains('loading'), null, { timeout: 40000 });
    if (await p.$('#gate-skip')) { await p.click('#gate-skip'); await p.waitForTimeout(1600); }
    await p.evaluate(() => document.getElementById('barista').scrollIntoView({ block: 'center' }));
    await p.waitForFunction(() => document.getElementById('barista-msg').textContent.length > 5, null, { timeout: 30000 }); await p.waitForTimeout(1500);
    await p.locator('.barista-stage').screenshot({ path: process.argv[2] + '/lts-' + n + '.png' });
  }
  await b.close();
})();
