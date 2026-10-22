const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await (await b.newContext(devices['iPhone 13'])).newPage(); await p.goto('http://localhost:8766/');
  await p.waitForFunction(() => !document.documentElement.classList.contains('loading'), null, { timeout: 40000 });
  if (await p.$('#gate-skip')) { await p.click('#gate-skip'); await p.waitForTimeout(1600); }
  await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; document.getElementById('vend').scrollIntoView({ block: 'center' }); }); await p.waitForTimeout(2500);
  await p.locator('#vend').screenshot({ path: process.argv[2] + '/vend-real.png' });
  await p.click('.slot[data-snack="kurkure"]'); await p.waitForTimeout(1800);
  await p.locator('#vend').screenshot({ path: process.argv[2] + '/vend-real-2.png' });
  await b.close();
})();
