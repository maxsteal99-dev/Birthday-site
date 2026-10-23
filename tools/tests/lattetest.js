const { chromium, devices } = require('playwright');
(async () => {
  const [base, out, dev] = process.argv.slice(2);
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const opts = dev === 'desktop' ? { viewport: { width: 1280, height: 860 } } : devices['iPhone 13'];
  const p = await (await b.newContext(opts)).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)) });
  await p.addInitScript(d => { window.__maxDPR = d; }, +process.env.DPR || 2); await p.goto(base); await p.waitForFunction(() => !document.documentElement.classList.contains('loading'), null, { timeout: 40000 });
  if (await p.$('#gate-skip')) { await p.click('#gate-skip'); await p.waitForTimeout(1600); }
  await p.evaluate(() => document.getElementById('barista').scrollIntoView({ block: 'center' })); 
  await p.waitForFunction(() => document.getElementById('barista-msg').textContent.length > 5, null, { timeout: 30000 });
  await p.waitForTimeout(1500); await p.screenshot({ path: `${out}/lt-${dev}-0.png` });
  const msgs = [];
  // wrong order first
  await p.click('.step[data-step="milk"]'); await p.waitForTimeout(300); msgs.push(await p.textContent('#barista-msg'));
  for (const s of ['cm', 'ice', 'milk', 'esp']) {
    await p.click(`.step[data-step="${s}"]`);
    await p.waitForFunction(st => document.querySelector(`.step[data-step="${st}"]`).classList.contains('done'), s, { timeout: 60000 });
    msgs.push(s + ': ' + await p.textContent('#barista-msg'));
    await p.screenshot({ path: `${out}/lt-${dev}-${s}.png` });
  }
  // stir by drawing circles over the glass
  const box = await p.locator('#latte-canvas').boundingBox();
  const cx = box.x + box.width / 2, cy = box.y + box.height * 0.6, r = Math.min(box.width, box.height) * 0.12;
  await p.mouse.move(cx + r, cy); await p.mouse.down();
  for (let k = 0; k <= 200; k++) { const a = k / 200 * Math.PI * 8; await p.mouse.move(cx + Math.cos(a) * r, cy + Math.sin(a) * r); if (k === 60) await p.screenshot({ path: `${out}/lt-${dev}-stirring.png` }); }
  await p.mouse.up(); await p.waitForTimeout(800);
  let stirDone = await p.evaluate(() => document.querySelector('.step[data-step="stir"]').classList.contains('done'));
  if (!stirDone) { await p.click('.step[data-step="stir"]'); await p.waitForTimeout(4000); }
  msgs.push('stir: ' + await p.textContent('#barista-msg'));
  await p.waitForTimeout(1200); await p.screenshot({ path: `${out}/lt-${dev}-done.png` });
  const r2 = { stirByFinger: stirDone, tally: await p.textContent('#tn-n'), again: await p.evaluate(() => !document.getElementById('latte-again').hidden) };
  // sip by tapping the glass
  await p.mouse.click(cx, box.y + box.height * 0.62); await p.waitForTimeout(500); msgs.push('sip: ' + await p.textContent('#barista-msg'));
  await p.click('#latte-again'); await p.waitForTimeout(500); msgs.push('again: ' + await p.textContent('#barista-msg'));
  console.log(JSON.stringify(r2), '\n' + msgs.join('\n'), errs); await b.close();
})();
