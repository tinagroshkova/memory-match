import type { Difficulty } from './game'

export interface BestResult {
  moves: number
  timeMs: number
  score: number
}

export type BestResults = Record<Difficulty, BestResult | null>

export type Theme = 'light' | 'dark'

const BEST_KEY = 'memory-match:best'
const SOUND_KEY = 'memory-match:sound'
const THEME_KEY = 'memory-match:theme'
const DAILY_KEY = 'memory-match:daily'

const read = (key: string): string | null => {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

const write = (key: string, value: string): void => {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // storage can be unavailable in private mode
  }
}

export const emptyBest = (): BestResults => ({ easy: null, medium: null, hard: null })

export const getBestResults = (): BestResults => {
  const raw = read(BEST_KEY)
  if (!raw) {
    return emptyBest()
  }

  try {
    const parsed = JSON.parse(raw) as Partial<
      Record<Difficulty, Partial<BestResult> | null>
    >
    const results = emptyBest()

    for (const level of ['easy', 'medium', 'hard'] as const) {
      const entry = parsed[level]
      if (entry && typeof entry.moves === 'number' && typeof entry.timeMs === 'number') {
        results[level] = {
          moves: entry.moves,
          timeMs: entry.timeMs,
          score: typeof entry.score === 'number' ? entry.score : 0,
        }
      }
    }

    return results
  } catch {
    return emptyBest()
  }
}

export const storeBestResults = (results: BestResults): void => {
  write(BEST_KEY, JSON.stringify(results))
}

const parseBestResult = (entry: Partial<BestResult> | null): BestResult | null => {
  if (!entry || typeof entry.moves !== 'number' || typeof entry.timeMs !== 'number') {
    return null
  }

  return {
    moves: entry.moves,
    timeMs: entry.timeMs,
    score: typeof entry.score === 'number' ? entry.score : 0,
  }
}

export const getDailyResult = (date: string): BestResult | null => {
  const raw = read(DAILY_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as {
      date?: string
      best?: Partial<BestResult> | null
    }

    if (parsed.date !== date) {
      return null
    }

    return parseBestResult(parsed.best ?? null)
  } catch {
    return null
  }
}

export const storeDailyResult = (date: string, best: BestResult): void => {
  write(DAILY_KEY, JSON.stringify({ date, best }))
}

export const isBetter = (next: BestResult, current: BestResult | null): boolean => {
  if (!current) {
    return true
  }
  if (next.score !== current.score) {
    return next.score > current.score
  }
  if (next.moves !== current.moves) {
    return next.moves < current.moves
  }
  return next.timeMs < current.timeMs
}

export const getSoundEnabled = (): boolean => read(SOUND_KEY) !== 'off'

export const storeSoundEnabled = (enabled: boolean): void => {
  write(SOUND_KEY, enabled ? 'on' : 'off')
}

export const getPreferredTheme = (): Theme => {
  const stored = read(THEME_KEY)
  if (stored === 'light' || stored === 'dark') {
    return stored
  }

  if (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark'
  }

  return 'light'
}

export const storeTheme = (theme: Theme): void => {
  write(THEME_KEY, theme)
}
