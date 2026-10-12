/** Tiny synthesized sounds via Web Audio. No asset files. Safe to call before any user gesture. */

let ctx: AudioContext | null = null
let enabled = true

export function setSoundEnabled(on: boolean) {
  enabled = on
}

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  if (!ctx) {
    try {
      ctx = new Ctor()
    } catch {
      return null
    }
  }
  if (ctx.state === 'suspended') void ctx.resume().catch(() => {})
  return ctx
}

/** Call from a user gesture (first keypress) so the browser allows audio. */
export function unlockAudio() {
  getCtx()
}

function tone(freq: number, start: number, dur: number, type: OscillatorType, gain: number, endFreq?: number) {
  const c = getCtx()
  if (!c) return
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, c.currentTime + start)
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, c.currentTime + start + dur)
  g.gain.setValueAtTime(0.0001, c.currentTime + start)
  g.gain.exponentialRampToValueAtTime(gain, c.currentTime + start + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur)
  osc.connect(g).connect(c.destination)
  osc.start(c.currentTime + start)
  osc.stop(c.currentTime + start + dur + 0.02)
}

/** Bright little arpeggio: C5 → E5 → G5 → C6. */
export function playCorrect() {
  if (!enabled) return
  const notes = [523.25, 659.25, 783.99, 1046.5]
  notes.forEach((f, i) => tone(f, i * 0.09, 0.18, 'sine', 0.25))
  tone(1046.5, 0.36, 0.35, 'triangle', 0.12)
}

/** Soft, low "hmm" glide — kind, not punishing. */
export function playWrong() {
  if (!enabled) return
  tone(220, 0, 0.28, 'triangle', 0.18, 160)
}

/** Tiny blip on each typed digit. */
export function playTick() {
  if (!enabled) return
  tone(880, 0, 0.04, 'square', 0.05)
}
