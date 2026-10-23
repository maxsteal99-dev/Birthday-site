// Blow out the cake (swipe), then play the germ gag: sanitize, then wipe, and check the site opens.
const { chromium, devices } = require('playwright');
(async () => {
  const base = process.argv[2], out = process.argv[3], dev = process.argv[4] || 'iPhone 13';
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext(dev === 'desktop' ? { viewport: { width: 1280, height: 800 }, permissions: ['microphone'] } : { ...devices[dev], permissions: ['microphone'] });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(base); await p.waitForFunction(() => !document.documentElement.classList.contains('loading'), null, { timeout: 20000 });
  const { width: vw, height: vh } = p.viewportSize(); await p.waitForTimeout(3000);
  for (let k = 0; k < 50; k++) {
    if (await p.evaluate(() => !document.getElementById('gate') || document.body.classList.contains('opened'))) break;
    const y = vh * (0.3 + (k % 8) * 0.03); await p.mouse.move(20, y); await p.mouse.down(); await p.mouse.move(vw - 20, y, { steps: 18 }); await p.mouse.up(); await p.waitForTimeout(250);
  }
  await p.waitForSelector('.germs', { timeout: 8000 }); await p.waitForTimeout(900);
  const r = { msg0: await p.textContent('.g-msg'), stats0: await p.textContent('.g-stats'), scroll: await p.evaluate(() => getComputedStyle(document.documentElement).overflow) };
  await p.screenshot({ path: out + '/germ-1.png' });
  // wipe first: germs should dodge and nag
  await p.click('[data-tool=wipe]'); await p.mouse.move(vw / 2, vh / 2); await p.mouse.down(); await p.mouse.move(vw / 2 + 60, vh / 2 + 40, { steps: 10 }); await p.waitForTimeout(300); r.nag = await p.textContent('.g-msg'); await p.mouse.up();
  await p.click('[data-tool=spray]');
  for (let pass = 0; pass < 6 && !/^🦠 0/.test(await p.textContent('.g-left')); pass++)
    for (let y = vh * 0.15; y < vh * 0.85; y += vh * 0.12) for (let x = vw * 0.12; x < vw; x += vw * 0.12) { await p.mouse.click(x, y); await p.waitForTimeout(40); if (/^🦠 0/.test(await p.textContent('.g-left'))) break; }
  r.afterSpray = await p.textContent('.g-stats'); r.msg1 = await p.textContent('.g-msg'); r.tool = await p.getAttribute('[data-tool=wipe]', 'aria-pressed');
  await p.screenshot({ path: out + '/germ-2.png' });
  for (let y = 0; y < vh + 40 && await p.$('.germs:not(.done)'); y += 40) { await p.mouse.move(0, y); await p.mouse.down(); await p.mouse.move(vw, y, { steps: 14 }); await p.mouse.up(); if (y === 320) await p.screenshot({ path: out + '/germ-3.png' }); }
  r.final = await p.evaluate(() => document.querySelector('.g-stats') && document.querySelector('.g-stats').textContent);
  r.winMsg = await p.evaluate(() => document.querySelector('.g-msg') && document.querySelector('.g-msg').textContent);
  await p.waitForTimeout(500); await p.screenshot({ path: out + '/germ-4.png' });
  await p.waitForTimeout(2600); r.gone = !(await p.$('.germs')); r.cleaningClass = await p.evaluate(() => document.documentElement.classList.contains('cleaning'));
  await p.mouse.wheel(0, 800); await p.waitForTimeout(500); r.scrollY = await p.evaluate(() => scrollY);
  await p.screenshot({ path: out + '/germ-5.png' });
  console.log(JSON.stringify(r, null, 1), errs.slice(0, 8)); await b.close();
})();
