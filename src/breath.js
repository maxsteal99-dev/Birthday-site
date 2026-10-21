/* Breath detection from the microphone.
   Blowing on a phone mic makes broadband "rushing" noise: loud, with a flat
   spectrum and most of its energy low down. Voices and music are made of
   tones (peaky spectrum), so spectral flatness tells them apart.
   update() returns { level, blow }:
     level 0..1  how loud the mic is right now (used to make the flames flutter)
     blow  0..1  how hard she is blowing (0 unless it really sounds like a breath) */
export function createBreathDetector(analyser, sampleRate) {
  const n = analyser.fftSize, td = new Float32Array(n), fd = new Float32Array(analyser.frequencyBinCount);
  const hz = sampleRate / n;
  const b0 = Math.max(1, Math.round(80 / hz)), b1 = Math.round(700 / hz), b2 = Math.round(4000 / hz);
  const st = { floor: 0.004, warm: 0, held: 0, smooth: 0, flat: 0 };

  function update(dt) {
    analyser.getFloatTimeDomainData(td);
    analyser.getFloatFrequencyData(fd);
    let sq = 0; for (let i = 0; i < n; i++) sq += td[i] * td[i];
    const rms = Math.sqrt(sq / n);

    // spectral flatness (geometric mean / arithmetic mean of power) and how low-heavy it is
    let logSum = 0, sum = 0, low = 0, cnt = 0;
    for (let i = b0; i < b2; i++) {
      const p = Math.pow(10, Math.max(-140, fd[i]) / 10) + 1e-14;
      logSum += Math.log(p); sum += p; cnt++; if (i < b1) low += p;
    }
    const flat = Math.exp(logSum / cnt) / (sum / cnt), lowShare = low / sum;
    st.flat += (flat - st.flat) * Math.min(1, dt * 18);

    // learn the room's quiet level: fast during the first moment, then only while quiet
    if (st.warm < 0.8) { st.warm += dt; st.floor = st.warm < 0.1 ? rms : Math.min(st.floor * 1.02 + 0.0002, Math.max(st.floor * 0.9, rms)); }

    const thr = Math.max(0.018, st.floor * 3.2);
    const loud = (rms - thr) / (thr * 3);
    const noisy = (st.flat - 0.16) / 0.22;          // breath ≳ 0.25, voices/music ≲ 0.15
    const airy = lowShare > 0.35 ? 1 : lowShare / 0.35;
    let raw = Math.max(0, Math.min(1, loud)) * Math.max(0, Math.min(1, noisy)) * airy;
    // a single click or bump is not a breath: it has to last ~70 ms
    st.held = raw > 0.05 ? st.held + dt : 0;
    if (st.held < 0.07) raw = 0;
    st.smooth += (raw - st.smooth) * Math.min(1, dt * (raw > st.smooth ? 20 : 8));
    if (raw === 0 && rms < thr) st.floor += (Math.max(0.002, rms) - st.floor) * Math.min(1, dt * 0.5);

    const level = Math.max(0, Math.min(1, rms / (thr * 2.5)));
    return { level, blow: st.smooth > 0.03 ? Math.min(1, st.smooth * 1.4) : 0, rms, flat: st.flat, thr };
  }
  return { update, state: st };
}
