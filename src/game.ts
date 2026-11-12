export type Difficulty = 'easy' | 'medium' | 'hard'

export interface DifficultyConfig {
  id: Difficulty
  label: string
  emoji: string
  pairs: number
  columns: number
  blurb: string
}

const EASY: DifficultyConfig = {
  id: 'easy',
  label: 'Easy',
  emoji: '🌱',
  pairs: 4,
  columns: 4,
  blurb: '8 cards',
}

const MEDIUM: DifficultyConfig = {
  id: 'medium',
  label: 'Medium',
  emoji: '🌻',
  pairs: 6,
  columns: 4,
  blurb: '12 cards',
}

const HARD: DifficultyConfig = {
  id: 'hard',
  label: 'Hard',
  emoji: '🚀',
  pairs: 8,
  columns: 4,
  blurb: '16 cards',
}

const DIFFICULTY_BY_ID: Record<Difficulty, DifficultyConfig> = {
  easy: EASY,
  medium: MEDIUM,
  hard: HARD,
}

export const DIFFICULTIES: readonly DifficultyConfig[] = [EASY, MEDIUM, HARD]

export const difficultyConfig = (id: Difficulty): DifficultyConfig => DIFFICULTY_BY_ID[id]

export interface EmojiEntry {
  emoji: string
  name: string
}

export const EMOJI_POOL: readonly EmojiEntry[] = [
  { emoji: '🐶', name: 'Dog' },
  { emoji: '🐱', name: 'Cat' },
  { emoji: '🐭', name: 'Mouse' },
  { emoji: '🐹', name: 'Hamster' },
  { emoji: '🐰', name: 'Rabbit' },
  { emoji: '🦊', name: 'Fox' },
  { emoji: '🐻', name: 'Bear' },
  { emoji: '🐼', name: 'Panda' },
  { emoji: '🐨', name: 'Koala' },
  { emoji: '🐯', name: 'Tiger' },
  { emoji: '🦁', name: 'Lion' },
  { emoji: '🐮', name: 'Cow' },
  { emoji: '🐷', name: 'Pig' },
  { emoji: '🐸', name: 'Frog' },
  { emoji: '🐵', name: 'Monkey' },
  { emoji: '🐔', name: 'Chicken' },
  { emoji: '🐧', name: 'Penguin' },
  { emoji: '🦄', name: 'Unicorn' },
  { emoji: '🐢', name: 'Turtle' },
  { emoji: '🐙', name: 'Octopus' },
  { emoji: '🦋', name: 'Butterfly' },
  { emoji: '🐝', name: 'Bee' },
  { emoji: '🐳', name: 'Whale' },
  { emoji: '🦖', name: 'Dinosaur' },
]

export interface Card {
  id: string
  pairKey: string
  emoji: string
  name: string
  flipped: boolean
  matched: boolean
}

export const shuffle = <T>(
  items: readonly T[],
  random: () => number = Math.random,
): T[] => {
  const result = [...items]

  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    const a = result[i]
    const b = result[j]
    if (a === undefined || b === undefined) {
      continue
    }
    result[i] = b
    result[j] = a
  }

  return result
}

export const createDeck = (
  pairs: number,
  random: () => number = Math.random,
): Card[] => {
  const pool = [...EMOJI_POOL]
  const chosen: EmojiEntry[] = []
  const count = Math.max(0, Math.min(Math.floor(pairs), pool.length))

  for (let i = 0; i < count; i += 1) {
    const index = Math.floor(random() * pool.length)
    const [entry] = pool.splice(index, 1)
    if (entry) {
      chosen.push(entry)
    }
  }

  const cards: Card[] = chosen.flatMap((entry, pairIndex) => [
    {
      id: `${pairIndex}-a`,
      pairKey: `pair-${pairIndex}`,
      emoji: entry.emoji,
      name: entry.name,
      flipped: false,
      matched: false,
    },
    {
      id: `${pairIndex}-b`,
      pairKey: `pair-${pairIndex}`,
      emoji: entry.emoji,
      name: entry.name,
      flipped: false,
      matched: false,
    },
  ])

  return shuffle(cards, random)
}

export const DAILY_PAIRS = 6
export const DAILY_COLUMNS = 4

export const dateKey = (date: Date = new Date()): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const dailySeed = (date: Date = new Date()): number => {
  const key = dateKey(date)
  let hash = 2166136261

  for (let i = 0; i < key.length; i += 1) {
    hash ^= key.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

export const createSeededRandom = (seed: number): (() => number) => {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 4294967296
  }
}

export const createDailyDeck = (date: Date = new Date()): Card[] =>
  createDeck(DAILY_PAIRS, createSeededRandom(dailySeed(date)))

export const dailyConfig: DifficultyConfig = {
  id: 'medium',
  label: 'Daily',
  emoji: '📅',
  pairs: DAILY_PAIRS,
  columns: DAILY_COLUMNS,
  blurb: `${DAILY_PAIRS * 2} cards`,
}

export const starsFor = (moves: number, pairs: number): number => {
  if (moves <= pairs + 2) {
    return 3
  }
  if (moves <= pairs * 2) {
    return 2
  }
  return 1
}

export const BASE_MATCH_POINTS = 100
export const SPEED_BONUS_POINTS = 50
export const SPEED_BONUS_WINDOW_MS = 4000
export const COMBO_STEP = 0.5
export const MAX_COMBO_MULTIPLIER = 5
export const TIME_BONUS_PER_SECOND = 25
export const TIME_BONUS_SECONDS_PER_PAIR = 8

export const comboMultiplier = (combo: number): number =>
  Math.min(MAX_COMBO_MULTIPLIER, 1 + Math.max(0, combo - 1) * COMBO_STEP)

export interface MatchScoreInput {
  combo: number
  matchDurationMs: number
}

export interface MatchScore {
  points: number
  base: number
  speedBonus: number
  multiplier: number
}

export const scoreMatch = ({
  combo,
  matchDurationMs,
}: MatchScoreInput): MatchScore => {
  const multiplier = comboMultiplier(combo)
  const base = Math.round(BASE_MATCH_POINTS * multiplier)
  const speedBonus =
    matchDurationMs <= SPEED_BONUS_WINDOW_MS
      ? Math.round(SPEED_BONUS_POINTS * multiplier)
      : 0

  return { points: base + speedBonus, base, speedBonus, multiplier }
}

export const timeBonus = (elapsedMs: number, pairs: number): number => {
  const targetSeconds = pairs * TIME_BONUS_SECONDS_PER_PAIR
  const elapsedSeconds = Math.max(0, Math.floor(elapsedMs / 1000))
  const remainingSeconds = Math.max(0, targetSeconds - elapsedSeconds)

  return remainingSeconds * TIME_BONUS_PER_SECOND
}

export type PowerName = 'peek' | 'shuffle' | 'shield'

export type PowerUses = Record<PowerName, number>

export interface PowerUpDefinition {
  id: PowerName
  label: string
  emoji: string
  blurb: string
}

export const POWER_UPS: readonly PowerUpDefinition[] = [
  { id: 'peek', label: 'Peek', emoji: '👁️', blurb: 'Reveal the board' },
  { id: 'shuffle', label: 'Shuffle', emoji: '🔀', blurb: 'Mix hidden cards' },
  { id: 'shield', label: 'Shield', emoji: '🛡️', blurb: 'Save your combo' },
]

export const initialPowerUses = (): PowerUses => ({
  peek: 1,
  shuffle: 1,
  shield: 1,
})

export interface ComboMilestone {
  combo: number
  bonus: number
  label: string
}

export const COMBO_MILESTONES: readonly ComboMilestone[] = [
  { combo: 3, bonus: 150, label: 'On fire!' },
  { combo: 5, bonus: 300, label: 'Unstoppable!' },
  { combo: 8, bonus: 600, label: 'Legendary!' },
]

export const milestoneForCombo = (combo: number): ComboMilestone | null =>
  COMBO_MILESTONES.find((milestone) => milestone.combo === combo) ?? null

export const formatTime = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
