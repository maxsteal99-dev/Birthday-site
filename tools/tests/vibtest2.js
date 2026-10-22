const { chromium, devices } = require('playwright');
(async () => {
  const [base, wav, mode] = process.argv.slice(2);
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--use-file-for-fake-audio-capture=' + wav, '--autoplay-policy=user-gesture-required'] });
  const p = await (await b.newContext({ ...devices['Pixel 7'], permissions: ['microphone'] })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.addInitScript(mode => {
    window.__vib = []; window.__ticks = 0;
    if (mode === 'iphone') { try { delete Navigator.prototype.vibrate; } catch (e) {} Object.defineProperty(navigator, 'vibrate', { value: undefined }); document.addEventListener('click', e => { if (e.target && e.target.type === 'checkbox') window.__ticks++; }, true); }
    else navigator.vibrate = function (pt) { window.__vib.push([Math.round(performance.now()), JSON.stringify(pt)]); return true; };
    const S = AudioBufferSourceNode.prototype.start; AudioBufferSourceNode.prototype.start = function () { if (this.loop && this.buffer && this.buffer.duration > 60) window.__song = Math.round(performance.now()); return S.apply(this, arguments); };
  }, mode);
  await p.goto(base); await p.waitForFunction(() => !document.documentElement.classList.contains('loading'), null, { timeout: 40000 });
  await p.waitForTimeout(800); await p.screenshot({ path: process.argv[5] + '/nobegin-' + mode + '.png' });
  await p.waitForTimeout(1500); const micBefore = await p.evaluate(() => document.getElementById('gate-mic').dataset.state || 'idle');
  await p.evaluate(() => { window.__shakes = 0; new MutationObserver(() => { if (document.getElementById('cake-canvas') && document.getElementById('cake-canvas').style.transform) window.__shakes++; }).observe(document.getElementById('cake-canvas'), { attributes: true, attributeFilter: ['style'] }); });
  for (let i = 0; i < 90; i++) { await p.waitForTimeout(500); if (await p.evaluate(() => !document.getElementById('gate') || /All out/.test((document.getElementById('gate-count') || {}).textContent || ''))) { await p.waitForTimeout(3600); break; } }
  const r = await p.evaluate(() => ({ vib: window.__vib, ticks: window.__ticks, song: window.__song, gateGone: !document.getElementById('gate'), shakes: window.__shakes }));
  const long = r.vib.filter(v => v[1].includes('750'));
  console.log(mode, '| mic before tap:', micBefore, '| vibrate calls:', r.vib.length, '| rumbles(170ms):', r.vib.filter(v => v[1] === '170').length, '| candle ticks(28):', r.vib.filter(v => v[1] === '28').length, '| finale:', long.map(v => v[1]).join(), '| iPhone ticks:', r.ticks, '| song:', !!r.song, '| site open:', r.gateGone, '| screen shake frames:', r.shakes, errs);
  await b.close();
})();
