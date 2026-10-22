const { chromium, devices } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  for (const [n, o] of [['iphone', devices['iPhone 13']], ['desktop', { viewport: { width: 1440, height: 900 } }]]) {
    const p = await (await b.newContext(o)).newPage(); await p.goto('http://localhost:8766/');
    await p.waitForFunction(() => !document.documentElement.classList.contains('loading'), null, { timeout: 40000 }); console.log(n, 'ready'); await p.waitForTimeout(2500);
    await p.screenshot({ path: process.argv[2] + '/cs-' + n + '.png' });
  }
  await b.close();
})();
