const { chromium, devices } = require('playwright');
(async () => {
  const [out, dev] = process.argv.slice(2);
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await (await b.newContext(dev === 'desktop' ? { viewport: { width: 1280, height: 860 } } : devices['iPhone 13'])).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8766/'); await p.waitForFunction(() => !document.documentElement.classList.contains('loading'), null, { timeout: 40000 });
  await p.waitForTimeout(2500); await p.screenshot({ path: `${out}/lg-${dev}-gate.png` });
  await p.click('#gate-skip'); await p.waitForTimeout(3000);
  const shots = [['hello', 'center'], ['memories', 'end'], ['barista', 'end'], ['days', 'start']];
  const villa = await p.$('.villa');
  for (const [id, blk] of shots) { await p.evaluate(([i, bl]) => { document.documentElement.style.scrollBehavior = 'auto'; (document.getElementById(i) || document.querySelector('.' + i)).scrollIntoView({ block: bl }); }, [id, blk]); await p.waitForTimeout(1800); await p.screenshot({ path: `${out}/lg-${dev}-${id}.png` }); }
  await villa.scrollIntoViewIfNeeded(); await p.waitForTimeout(1500); await villa.screenshot({ path: `${out}/lg-${dev}-villa.png` });
  const n = await p.evaluate(() => [document.querySelectorAll('.lg').length, document.querySelectorAll('.lg-refract').length]);
  console.log(dev, 'glass surfaces:', n[0], 'refracting:', n[1], errs); await b.close();
})();
