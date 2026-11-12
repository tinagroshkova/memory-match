type SoundName = 'flip' | 'match' | 'mismatch' | 'win' | 'power' | 'milestone'

interface Tone {
  frequency: number
  start: number
  duration: number
  type: OscillatorType
  volume: number
}

const SOUNDS: Record<SoundName, Tone[]> = {
  flip: [{ frequency: 520, start: 0, duration: 0.07, type: 'sine', volume: 0.16 }],
  match: [
    { frequency: 660, start: 0, duration: 0.1, type: 'sine', volume: 0.2 },
    { frequency: 880, start: 0.09, duration: 0.14, type: 'sine', volume: 0.2 },
  ],
  mismatch: [
    { frequency: 220, start: 0, duration: 0.12, type: 'triangle', volume: 0.14 },
    { frequency: 180, start: 0.1, duration: 0.16, type: 'triangle', volume: 0.14 },
  ],
  win: [
    { frequency: 523.25, start: 0, duration: 0.14, type: 'sine', volume: 0.2 },
    { frequency: 659.25, start: 0.12, duration: 0.14, type: 'sine', volume: 0.2 },
    { frequency: 783.99, start: 0.24, duration: 0.14, type: 'sine', volume: 0.2 },
    { frequency: 1046.5, start: 0.36, duration: 0.32, type: 'sine', volume: 0.22 },
  ],
  power: [
    { frequency: 440, start: 0, duration: 0.08, type: 'triangle', volume: 0.16 },
    { frequency: 660, start: 0.07, duration: 0.12, type: 'triangle', volume: 0.18 },
  ],
  milestone: [
    { frequency: 587.33, start: 0, duration: 0.1, type: 'sine', volume: 0.18 },
    { frequency: 783.99, start: 0.09, duration: 0.1, type: 'sine', volume: 0.2 },
    { frequency: 1174.66, start: 0.18, duration: 0.28, type: 'sine', volume: 0.22 },
  ],
}

let context: AudioContext | null = null

const getContext = (): AudioContext | null => {
  if (typeof window === 'undefined') {
    return null
  }

  const Ctor =
    window.AudioContext ??
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) {
    return null
  }

  if (!context) {
    context = new Ctor()
  }

  return context
}

export const playSound = (name: SoundName, enabled: boolean): void => {
  if (!enabled) {
    return
  }

  const audio = getContext()
  if (!audio) {
    return
  }

  if (audio.state === 'suspended') {
    void audio.resume()
  }

  const now = audio.currentTime

  for (const tone of SOUNDS[name]) {
    const oscillator = audio.createOscillator()
    const gain = audio.createGain()
    const startAt = now + tone.start
    const endAt = startAt + tone.duration

    oscillator.type = tone.type
    oscillator.frequency.setValueAtTime(tone.frequency, startAt)
    gain.gain.setValueAtTime(0.0001, startAt)
    gain.gain.exponentialRampToValueAtTime(tone.volume, startAt + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.0001, endAt)

    oscillator.connect(gain)
    gain.connect(audio.destination)
    oscillator.start(startAt)
    oscillator.stop(endAt + 0.02)
  }
}
