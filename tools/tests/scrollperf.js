// Scroll the whole page top→bottom at a steady speed under 4x CPU throttle and record frame times
// (overall and per section). Usage: base [label]
const { chromium, devices } = require('playwright');
(async () => {
  const base = process.argv[2];
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await b.newContext({ ...devices['iPhone 13'] }); const p = await ctx.newPage();
  await p.goto(base); await p.waitForFunction(() => !document.documentElement.classList.contains('loading'), null, { timeout: 20000 });
  await p.click('#gate-skip', { force: true }); await p.waitForTimeout(2500);
  const cdp = await ctx.newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await cdp.send('Performance.enable'); const prof = process.argv[4] === 'profile'; if (prof) { await cdp.send('Profiler.enable'); await cdp.send('Profiler.setSamplingInterval', { interval: 500 }); await cdp.send('Profiler.start'); }
  const m0 = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
  const r = await p.evaluate(() => new Promise(done => {
    const H = document.documentElement.scrollHeight - innerHeight, secs = [...document.querySelectorAll('header, section')].map(s => [s.getBoundingClientRect().top + scrollY, (s.className || s.id || s.tagName).replace('scene ', '').split(' ')[0]]);
    const out = []; let last = performance.now(), y = 0;
    function name() { const mid = scrollY + innerHeight / 2; let n = 'top'; for (const [t, k] of secs) if (t <= mid) n = k; return n; }
    (function step(now) {
      out.push([now - last, name()]); last = now;
      y += 14; scrollTo({ top: y, behavior: 'instant' });   // ~840 px/s at 60 fps
      if (y < H) requestAnimationFrame(step); else done(out);
    })(last);
  }));
  if (prof) { const { profile } = await cdp.send('Profiler.stop'); const self = {}, dt = {}; const ids = profile.samples; const td = profile.timeDeltas;
    const byId = Object.fromEntries(profile.nodes.map(n => [n.id, n])); ids.forEach((id, i) => { const n = byId[id], f = n.callFrame, k = (f.functionName || '(anon)') + ' ' + (f.url.split('/').pop() || '') + ':' + f.lineNumber; self[k] = (self[k] || 0) + (td[i] || 0) / 1000; });
    console.log(Object.entries(self).sort((a, b) => b[1] - a[1]).slice(0, 25).map(([k, v]) => v.toFixed(0) + 'ms  ' + k).join('\n')); }
  const m1 = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
  const f = r.map(x => x[0]).slice(2).sort((a, b) => a - b), avg = f.reduce((a, c) => a + c, 0) / f.length;
  const per = {}; r.slice(2).forEach(([d, n]) => { (per[n] = per[n] || []).push(d); });
  const ps = Object.fromEntries(Object.entries(per).map(([k, v]) => [k, (v.reduce((a, c) => a + c, 0) / v.length).toFixed(1) + 'ms x' + v.length]));
  console.log(JSON.stringify({ label: process.argv[3], frames: f.length, avgMs: avg.toFixed(1), p95: f[Math.floor(f.length * .95)].toFixed(1), over50: f.filter(x => x > 50).length,
    layouts: m1.LayoutCount - m0.LayoutCount, recalcs: m1.RecalcStyleCount - m0.RecalcStyleCount, layoutMs: ((m1.LayoutDuration - m0.LayoutDuration) * 1000).toFixed(0), styleMs: ((m1.RecalcStyleDuration - m0.RecalcStyleDuration) * 1000).toFixed(0), scriptMs: ((m1.ScriptDuration - m0.ScriptDuration) * 1000).toFixed(0), perSection: ps }, null, 1));
  await b.close();
})();
