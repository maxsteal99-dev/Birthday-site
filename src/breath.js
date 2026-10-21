/* Breath detection from the microphone.
   Blowing on a phone mic makes "wind noise": loud, but with no pitch.
   Voices and music have a pitch, so their waveform repeats itself every few
   milliseconds. We measure that (normalised autocorrelation of the high-passed
   signal over pitch lags of 2.5-16 ms): low = breath/wind, high = voice/music.
   A breath must also be louder than the room and last ~50 ms (claps don't).
   update() returns { level, blow }:
     level 0..1  how loud the mic is right now (used to make the flames flutter)
     blow  0..1  how hard she is blowing (0 unless it really sounds like a breath) */
export function createBreathDetector(analyser, sampleRate) {
  const n = analyser.fftSize, td = new Float32Array(n);
  const ds = sampleRate > 30000 ? 2 : 1, m = Math.floor(n / ds) - 1, d = new Float32Array(m);
  const sr = sampleRate / ds, lag0 = Math.round(sr * 0.0025), lag1 = Math.min(Math.round(sr * 0.016), m - 64);
  const st = { floor: 0.003, warm: 0, held: 0, frames: 0, smooth: 0, per: 0 };

  function periodicity() {
    // high-pass (first difference) on a downsampled copy, then the best normalised autocorrelation
    let e = 0;
    for (let i = 0; i < m; i++) { const a = td[(i + 1) * ds] - td[i * ds]; d[i] = a; e += a * a; }
    if (e < 1e-9) return 0;
    let best = 0;
    for (let L = lag0; L <= lag1; L++) {
      let s = 0, e1 = 0, e2 = 0;
      for (let i = 0; i + L < m; i += 2) { const a = d[i], b = d[i + L]; s += a * b; e1 += a * a; e2 += b * b; }
      const r = s / Math.sqrt(e1 * e2 + 1e-12);
      if (r > best) best = r;
    }
    return best;
  }

  function update(dt) {
    analyser.getFloatTimeDomainData(td);
    let sq = 0; for (let i = 0; i < n; i++) sq += td[i] * td[i];
    const rms = Math.sqrt(sq / n);

    // learn how quiet the room is, quickly at first and then only while it is quiet
    if (st.warm < 0.6) { st.warm += dt; st.floor = st.warm < 0.1 ? rms : Math.min(Math.max(st.floor * 0.9, rms), st.floor * 1.05 + 0.0002); }
    const thr = Math.max(0.006, st.floor * 2.2);
    const loud = Math.min(1, Math.max(0, (rms - thr) / (thr * 1.5)));

    let raw = 0;
    if (loud > 0) {
      const per = periodicity();
      st.per += (per - st.per) * Math.min(1, dt * 20);
      // measured: breaths and wind 0.12-0.20, voices and laughter 0.45+, music 0.9+
      const noisy = Math.min(1, Math.max(0, (0.38 - Math.max(per, st.per * 0.8)) / 0.12));
      raw = loud * noisy;
    } else st.per *= 0.9;

    // a clap, click or bump is not a breath: it has to stay loud for 0.15 s
    if (raw > 0.05) { st.held += dt; st.frames++; } else { st.held = 0; st.frames = 0; }
    if (st.held < 0.15 || st.frames < 2) raw = 0;
    st.smooth += (raw - st.smooth) * Math.min(1, dt * (raw > st.smooth ? 25 : 8));
    if (raw === 0 && rms < thr * 1.2) st.floor += (Math.max(0.0015, rms) - st.floor) * Math.min(1, dt * 0.4);

    const level = Math.min(1, Math.max(0, rms / (thr * 2)));
    return { level, blow: st.smooth > 0.04 ? Math.min(1, 0.35 + st.smooth * 1.3) : 0, rms, per: st.per, thr };
  }
  return { update, state: st };
}
