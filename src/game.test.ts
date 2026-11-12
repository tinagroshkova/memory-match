import { describe, expect, it } from 'vitest'
import {
  comboMultiplier,
  createDailyDeck,
  createDeck,
  createSeededRandom,
  dateKey,
  DAILY_PAIRS,
  DIFFICULTIES,
  formatTime,
  initialPowerUses,
  milestoneForCombo,
  scoreMatch,
  shuffle,
  starsFor,
  timeBonus,
} from './game'

const seeded = (seed: number): (() => number) => {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 4294967296
  }
}

describe('createDeck', () => {
  it('creates two cards per pair for every difficulty', () => {
    for (const config of DIFFICULTIES) {
      const deck = createDeck(config.pairs, seeded(config.pairs))
      expect(deck).toHaveLength(config.pairs * 2)

      const counts = new Map<string, number>()
      for (const card of deck) {
        counts.set(card.emoji, (counts.get(card.emoji) ?? 0) + 1)
      }

      expect(counts.size).toBe(config.pairs)
      expect([...counts.values()].every((count) => count === 2)).toBe(true)
    }
  })

  it('gives every card a unique id', () => {
    const deck = createDeck(8, seeded(42))
    expect(new Set(deck.map((card) => card.id)).size).toBe(deck.length)
  })

  it('starts with all cards face down and unmatched', () => {
    const deck = createDeck(6, seeded(7))
    expect(deck.every((card) => !card.flipped && !card.matched)).toBe(true)
  })
})

describe('shuffle', () => {
  it('keeps every item', () => {
    const input = [1, 2, 3, 4, 5]
    const result = shuffle(input, seeded(3))
    expect([...result].sort()).toEqual([...input].sort())
  })

  it('is deterministic with the same random source', () => {
    expect(shuffle([1, 2, 3, 4, 5], seeded(9))).toEqual(
      shuffle([1, 2, 3, 4, 5], seeded(9)),
    )
  })
})

describe('starsFor', () => {
  it('awards three stars for a near-perfect game', () => {
    expect(starsFor(4, 4)).toBe(3)
    expect(starsFor(6, 4)).toBe(3)
  })

  it('awards two stars for a decent game', () => {
    expect(starsFor(8, 4)).toBe(2)
  })

  it('always awards at least one star', () => {
    expect(starsFor(50, 4)).toBe(1)
  })
})

describe('formatTime', () => {
  it('formats minutes and padded seconds', () => {
    expect(formatTime(0)).toBe('0:00')
    expect(formatTime(9_000)).toBe('0:09')
    expect(formatTime(65_000)).toBe('1:05')
  })
})

describe('comboMultiplier', () => {
  it('starts at 1x and grows by half a step per combo', () => {
    expect(comboMultiplier(1)).toBe(1)
    expect(comboMultiplier(2)).toBe(1.5)
    expect(comboMultiplier(3)).toBe(2)
  })

  it('caps at the maximum multiplier', () => {
    expect(comboMultiplier(9)).toBe(5)
    expect(comboMultiplier(50)).toBe(5)
  })
})

describe('scoreMatch', () => {
  it('awards base points plus a speed bonus for quick matches', () => {
    const result = scoreMatch({ combo: 1, matchDurationMs: 1_000 })
    expect(result.multiplier).toBe(1)
    expect(result.base).toBe(100)
    expect(result.speedBonus).toBe(50)
    expect(result.points).toBe(150)
  })

  it('applies the combo multiplier to both base and speed bonus', () => {
    const result = scoreMatch({ combo: 3, matchDurationMs: 1_500 })
    expect(result.multiplier).toBe(2)
    expect(result.base).toBe(200)
    expect(result.speedBonus).toBe(100)
    expect(result.points).toBe(300)
  })

  it('drops the speed bonus for slow matches', () => {
    const result = scoreMatch({ combo: 2, matchDurationMs: 5_000 })
    expect(result.speedBonus).toBe(0)
    expect(result.points).toBe(150)
  })
})

describe('timeBonus', () => {
  it('rewards finishing before the target time', () => {
    expect(timeBonus(10_000, 4)).toBe(550)
  })

  it('never goes negative', () => {
    expect(timeBonus(60_000, 4)).toBe(0)
  })
})

describe('power-ups', () => {
  it('starts every game with one of each power-up', () => {
    expect(initialPowerUses()).toEqual({ peek: 1, shuffle: 1, shield: 1 })
  })
})

describe('combo milestones', () => {
  it('returns the matching milestone bonus', () => {
    expect(milestoneForCombo(3)?.bonus).toBe(150)
    expect(milestoneForCombo(5)?.bonus).toBe(300)
    expect(milestoneForCombo(8)?.bonus).toBe(600)
  })

  it('does not reward non-milestone combos', () => {
    expect(milestoneForCombo(4)).toBeNull()
    expect(milestoneForCombo(1)).toBeNull()
  })
})

describe('daily challenge', () => {
  it('formats local dates as YYYY-MM-DD', () => {
    expect(dateKey(new Date(2026, 0, 5))).toBe('2026-01-05')
  })

  it('creates the same deck for the same day', () => {
    const date = new Date(2026, 3, 20)
    const first = createDailyDeck(date).map((card) => card.emoji)
    const second = createDailyDeck(date).map((card) => card.emoji)

    expect(first).toEqual(second)
    expect(first).toHaveLength(DAILY_PAIRS * 2)
  })

  it('creates a different deck on another day', () => {
    const first = createDailyDeck(new Date(2026, 3, 20)).map((card) => card.emoji)
    const second = createDailyDeck(new Date(2026, 3, 21)).map((card) => card.emoji)

    expect(first).not.toEqual(second)
  })

  it('creates deterministic seeded random values', () => {
    const a = createSeededRandom(123)
    const b = createSeededRandom(123)

    expect([a(), a(), a()]).toEqual([b(), b(), b()])
  })
})
