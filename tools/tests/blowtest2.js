const { chromium, devices } = require('playwright');
(async () => {
  const [base, wav, secs] = process.argv.slice(2);
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--use-file-for-fake-audio-capture=' + wav, '--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 700 }, permissions: ['microphone'] }); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(base); await p.waitForFunction(() => !document.documentElement.classList.contains('loading'), null, { timeout: 40000 });
  await p.waitForFunction(() => { const m = document.getElementById('gate-mic'); return m && m.dataset.state === 'on'; }, null, { timeout: 20000 }).catch(() => {});
  const log = [];
  for (let s = 0; s < +secs; s++) {
    await p.waitForTimeout(500);
    const r = await p.evaluate(() => ({ c: (document.getElementById('gate-count') || {}).textContent || 'closed', m: (document.getElementById('gate-mic') || {}).dataset?.state }));
    const dbg = await p.evaluate(() => { const d = window.__micDebug && window.__micDebug(); return d ? [d.blow||0, d.rms||0, d.per||0, d.thr||0].map(v => (+v).toFixed(2)).join('/') : '-'; }); log.push(dbg + ' ' + r.c.replace(' candles still burning', '').replace('Just one left. Big breath!', '1') + (s === 0 ? ' [mic ' + r.m + ']' : ''));
    if (r.c === 'closed') break;
  }
  console.log(wav.split('/').pop(), '→', log.join(' | '), errs); await b.close();
})();
