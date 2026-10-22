const { chromium, devices } = require('playwright');
(async () => {
  const [base, out, dev] = process.argv.slice(2);
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
  const p = await (await b.newContext(dev === 'desktop' ? { viewport: { width: 1280, height: 860 } } : devices['iPhone 13'])).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)) });
  await p.goto(base); await p.waitForFunction(() => !document.documentElement.classList.contains('loading'), null, { timeout: 40000 });
  if (await p.$('#gate-skip')) { await p.click('#gate-skip'); await p.waitForTimeout(1600); }
  await p.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; document.getElementById('canbox').scrollIntoView({ block: 'center' }); }); await p.waitForTimeout(500);
  await p.waitForFunction(() => window.__can3d, null, { timeout: 30000 });
  await p.evaluate(() => document.getElementById('can3d').scrollIntoView({ block: 'center' })); await p.waitForTimeout(2500);
  const shot = n => p.locator('#can3d').screenshot({ path: `${out}/m-${dev}-${n}.png` });
  await shot('0top');
  const bx = await p.locator('#can-canvas').boundingBox(); const x = bx.x + bx.width / 2, y = bx.y + bx.height * 0.6;
  await p.mouse.move(x, y); await p.mouse.down(); await p.mouse.move(x, y - 50, { steps: 6 }); await p.waitForTimeout(300); await shot('1lift');
  await p.mouse.move(x, y - 160, { steps: 8 }); await p.mouse.up(); await p.waitForTimeout(250); await shot('2crack');
  const phases = [];
  for (let i = 0; i < 40; i++) { await p.waitForTimeout(500); const ph = await p.evaluate(() => window.__can3d.phase); phases.push(ph); if (i === 3) await shot('3swing'); if (ph === 'pour' && !phases.includes('shotpour')) { await p.waitForTimeout(1600); await shot('4pour'); phases.push('shotpour'); } if (ph === 'done') break; }
  await p.waitForTimeout(600); await shot('5done');
  const msg = await p.textContent('#can3d-msg'), btn = await p.textContent('#pop');
  console.log('phases', phases.join(',')); if (!(await p.$eval('#pop', b => b.disabled))) await p.click('#pop'); await p.waitForTimeout(400); const after = await p.evaluate(() => window.__can3d.phase);
  console.log(dev, [...new Set(phases)].join('>'), '|', msg, '|', btn, '| after button:', after, errs); await b.close();
})();
