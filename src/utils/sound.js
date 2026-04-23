// Synthesized bell alert via Web Audio API — no audio file needed
export function playTimerDone() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    ctx.resume().then(() => {
      // Three-note ascending bell chord
      const notes = [
        { freq: 880,  start: 0.00, dur: 1.0 },
        { freq: 1100, start: 0.15, dur: 0.9 },
        { freq: 1320, start: 0.30, dur: 1.2 },
      ]
      notes.forEach(({ freq, start, dur }) => {
        const osc  = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.type = 'sine'
        osc.frequency.value = freq
        const t0 = ctx.currentTime + start
        gain.gain.setValueAtTime(0, t0)
        gain.gain.linearRampToValueAtTime(0.22, t0 + 0.015)
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur)
        osc.start(t0)
        osc.stop(t0 + dur)
      })
    })
  } catch {
    // Audio unavailable — silent fail
  }
}
