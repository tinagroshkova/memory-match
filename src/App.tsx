import { useCallback, useEffect, useRef, useState } from 'react'
import styles from './App.module.scss'
import { Background } from './components/Background'
import { Board } from './components/Board'
import type { MatchEffect } from './components/Card'
import { Confetti } from './components/Confetti'
import { Hud } from './components/Hud'
import { MilestoneBurst, type MilestoneEvent } from './components/MilestoneBurst'
import { PowerBar } from './components/PowerBar'
import { StartScreen } from './components/StartScreen'
import { WinScreen } from './components/WinScreen'
import {
  createDailyDeck,
  createDeck,
  dailyConfig,
  dateKey,
  difficultyConfig,
  formatTime,
  initialPowerUses,
  milestoneForCombo,
  scoreMatch,
  shuffle,
  SPEED_BONUS_WINDOW_MS,
  starsFor,
  timeBonus,
  type Card,
  type Difficulty,
  type PowerName,
  type PowerUses,
} from './game'
import { playSound } from './sound'
import {
  getBestResults,
  getDailyResult,
  getPreferredTheme,
  getSoundEnabled,
  isBetter,
  storeBestResults,
  storeDailyResult,
  storeSoundEnabled,
  storeTheme,
  type BestResult,
  type BestResults,
  type Theme,
} from './storage'

type Screen = 'start' | 'playing' | 'won'
type GameMode = 'classic' | 'daily'

export const App = () => {
  const [screen, setScreen] = useState<Screen>('start')
  const [mode, setMode] = useState<GameMode>('classic')
  const [difficulty, setDifficulty] = useState<Difficulty>('easy')
  const [cards, setCards] = useState<Card[]>([])
  const [firstIndex, setFirstIndex] = useState<number | null>(null)
  const [wrongIndexes, setWrongIndexes] = useState<[number, number] | null>(null)
  const [locked, setLocked] = useState(false)
  const [moves, setMoves] = useState(0)
  const [matches, setMatches] = useState(0)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [bestCombo, setBestCombo] = useState(0)
  const [timeBonusPoints, setTimeBonusPoints] = useState(0)
  const [matchEffect, setMatchEffect] = useState<MatchEffect | null>(null)
  const [powerUses, setPowerUses] = useState<PowerUses>(initialPowerUses)
  const [peeking, setPeeking] = useState(false)
  const [shielded, setShielded] = useState(false)
  const [milestone, setMilestone] = useState<MilestoneEvent | null>(null)
  const [soundOn, setSoundOn] = useState(getSoundEnabled)
  const [best, setBest] = useState<BestResults>(getBestResults)
  const [dailyBest, setDailyBest] = useState<BestResult | null>(() =>
    getDailyResult(dateKey()),
  )
  const [newBest, setNewBest] = useState(false)
  const [theme, setTheme] = useState<Theme>(getPreferredTheme)

  const dailyDate = dateKey()
  const startedAtRef = useRef<number | null>(null)
  const firstFlipAtRef = useRef<number | null>(null)
  const flipTimer = useRef<number | null>(null)
  const winTimer = useRef<number | null>(null)
  const effectTimer = useRef<number | null>(null)
  const peekTimer = useRef<number | null>(null)
  const milestoneTimer = useRef<number | null>(null)
  const effectIdRef = useRef(0)
  const milestoneIdRef = useRef(0)
  const shieldedRef = useRef(false)
  const soundRef = useRef(soundOn)
  const scoreRef = useRef(0)
  const comboRef = useRef(0)
  const bestComboRef = useRef(0)
  soundRef.current = soundOn

  const config = mode === 'daily' ? dailyConfig : difficultyConfig(difficulty)

  const clearTimers = useCallback(() => {
    if (flipTimer.current !== null) {
      window.clearTimeout(flipTimer.current)
      flipTimer.current = null
    }
    if (winTimer.current !== null) {
      window.clearTimeout(winTimer.current)
      winTimer.current = null
    }
    if (effectTimer.current !== null) {
      window.clearTimeout(effectTimer.current)
      effectTimer.current = null
    }
    if (peekTimer.current !== null) {
      window.clearTimeout(peekTimer.current)
      peekTimer.current = null
    }
    if (milestoneTimer.current !== null) {
      window.clearTimeout(milestoneTimer.current)
      milestoneTimer.current = null
    }
  }, [])

  useEffect(() => clearTimers, [clearTimers])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    storeTheme(theme)

    const meta = document.querySelector('meta[name="theme-color"]')
    meta?.setAttribute('content', theme === 'dark' ? '#0b1220' : '#eef4ff')
  }, [theme])

  useEffect(() => {
    setDailyBest(getDailyResult(dailyDate))
  }, [dailyDate])

  useEffect(() => {
    if (screen !== 'playing') {
      return
    }

    const id = window.setInterval(() => {
      if (startedAtRef.current !== null) {
        setElapsedMs(Date.now() - startedAtRef.current)
      }
    }, 250)

    return () => window.clearInterval(id)
  }, [screen])

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }, [])

  const toggleSound = useCallback(() => {
    const next = !soundRef.current
    soundRef.current = next
    setSoundOn(next)
    storeSoundEnabled(next)
    if (next) {
      playSound('flip', true)
    }
  }, [])

  const startGame = useCallback(
    (level: Difficulty, nextMode: GameMode = 'classic') => {
      clearTimers()
      const nextConfig = nextMode === 'daily' ? dailyConfig : difficultyConfig(level)

      setMode(nextMode)
      setDifficulty(nextMode === 'daily' ? 'medium' : level)
      setCards(
        nextMode === 'daily'
          ? createDailyDeck(new Date())
          : createDeck(nextConfig.pairs),
      )
      setFirstIndex(null)
      setWrongIndexes(null)
      setLocked(false)
      setMoves(0)
      setMatches(0)
      setElapsedMs(0)
      setScore(0)
      setCombo(0)
      setBestCombo(0)
      setTimeBonusPoints(0)
      setMatchEffect(null)
      setPowerUses(initialPowerUses())
      setPeeking(false)
      setShielded(false)
      shieldedRef.current = false
      setMilestone(null)
      setNewBest(false)
      scoreRef.current = 0
      comboRef.current = 0
      bestComboRef.current = 0
      firstFlipAtRef.current = null
      startedAtRef.current = Date.now()
      setScreen('playing')
      playSound('flip', soundRef.current)
    },
    [clearTimers],
  )

  const usePower = useCallback(
    (power: PowerName) => {
      if (screen !== 'playing' || locked || peeking) {
        return
      }
      if (powerUses[power] <= 0) {
        return
      }
      if (power === 'shield' && shieldedRef.current) {
        return
      }

      setPowerUses((prev) => ({ ...prev, [power]: Math.max(0, prev[power] - 1) }))
      playSound('power', soundRef.current)

      if (power === 'peek') {
        setPeeking(true)
        if (peekTimer.current !== null) {
          window.clearTimeout(peekTimer.current)
        }
        peekTimer.current = window.setTimeout(() => {
          setPeeking(false)
          peekTimer.current = null
        }, 1300)
        return
      }

      if (power === 'shuffle') {
        setFirstIndex(null)
        setWrongIndexes(null)
        setLocked(false)
        firstFlipAtRef.current = null
        setCards((prev) => {
          const hidden = shuffle(
            prev
              .filter((card) => !card.matched)
              .map((card) => ({ ...card, flipped: false })),
          )
          let cursor = 0

          return prev.map((card) => {
            if (card.matched) {
              return card
            }
            const nextCard = hidden[cursor]
            cursor += 1
            return nextCard ?? card
          })
        })
        return
      }

      shieldedRef.current = true
      setShielded(true)
    },
    [locked, peeking, powerUses, screen],
  )

  const finishGame = useCallback(
    (finalMoves: number) => {
      const timeMs = startedAtRef.current !== null ? Date.now() - startedAtRef.current : 0
      const bonus = timeBonus(timeMs, config.pairs)
      const finalScore = scoreRef.current + bonus
      setElapsedMs(timeMs)
      setTimeBonusPoints(bonus)
      setScore(finalScore)
      scoreRef.current = finalScore
      setScreen('won')
      playSound('win', soundRef.current)

      const next = { moves: finalMoves, timeMs, score: finalScore }
      const currentBest = mode === 'daily' ? dailyBest : best[difficulty]

      if (isBetter(next, currentBest)) {
        if (mode === 'daily') {
          setDailyBest(next)
          storeDailyResult(dailyDate, next)
        } else {
          const updated = { ...best, [difficulty]: next }
          setBest(updated)
          storeBestResults(updated)
        }
        setNewBest(true)
      } else {
        setNewBest(false)
      }
    },
    [best, config.pairs, dailyBest, dailyDate, difficulty, mode],
  )

  const goHome = useCallback(() => {
    clearTimers()
    setScreen('start')
    setCards([])
    setFirstIndex(null)
    setWrongIndexes(null)
    setLocked(false)
    setScore(0)
    setCombo(0)
    setBestCombo(0)
    setTimeBonusPoints(0)
    setMatchEffect(null)
    setPowerUses(initialPowerUses())
    setPeeking(false)
    setShielded(false)
    shieldedRef.current = false
    setMilestone(null)
    scoreRef.current = 0
    comboRef.current = 0
    bestComboRef.current = 0
    firstFlipAtRef.current = null
  }, [clearTimers])

  const handleFlip = (index: number) => {
    if (screen !== 'playing' || locked) {
      return
    }

    const card = cards[index]
    if (!card || card.flipped || card.matched) {
      return
    }

    if (firstIndex === null) {
      firstFlipAtRef.current = Date.now()
      setCards((prev) =>
        prev.map((item, i) => (i === index ? { ...item, flipped: true } : item)),
      )
      setFirstIndex(index)
      playSound('flip', soundRef.current)
      return
    }

    if (firstIndex === index) {
      return
    }

    const firstCard = cards[firstIndex]
    if (!firstCard) {
      return
    }

    const nextMoves = moves + 1
    setMoves(nextMoves)
    setCards((prev) =>
      prev.map((item, i) => (i === index ? { ...item, flipped: true } : item)),
    )

    if (firstCard.pairKey === card.pairKey) {
      const matchDurationMs =
        firstFlipAtRef.current !== null
          ? Date.now() - firstFlipAtRef.current
          : SPEED_BONUS_WINDOW_MS
      firstFlipAtRef.current = null

      const nextCombo = comboRef.current + 1
      const earned = scoreMatch({ combo: nextCombo, matchDurationMs })
      const milestoneHit = milestoneForCombo(nextCombo)
      const milestoneBonus = milestoneHit?.bonus ?? 0
      const nextScore = scoreRef.current + earned.points + milestoneBonus

      comboRef.current = nextCombo
      scoreRef.current = nextScore
      setCombo(nextCombo)
      setScore(nextScore)

      if (nextCombo > bestComboRef.current) {
        bestComboRef.current = nextCombo
        setBestCombo(nextCombo)
      }

      if (milestoneHit) {
        milestoneIdRef.current += 1
        if (milestoneTimer.current !== null) {
          window.clearTimeout(milestoneTimer.current)
        }
        setMilestone({ id: milestoneIdRef.current, milestone: milestoneHit })
        milestoneTimer.current = window.setTimeout(() => {
          setMilestone(null)
          milestoneTimer.current = null
        }, 1800)
      }

      effectIdRef.current += 1
      if (effectTimer.current !== null) {
        window.clearTimeout(effectTimer.current)
      }
      setMatchEffect({
        id: effectIdRef.current,
        index,
        points: earned.points,
        combo: nextCombo,
      })
      effectTimer.current = window.setTimeout(() => {
        setMatchEffect(null)
        effectTimer.current = null
      }, 1000)

      playSound(milestoneHit ? 'milestone' : 'match', soundRef.current)
      setCards((prev) =>
        prev.map((item, i) =>
          i === firstIndex || i === index
            ? { ...item, matched: true, flipped: true }
            : item,
        ),
      )
      setFirstIndex(null)

      const nextMatches = matches + 1
      setMatches(nextMatches)

      if (nextMatches === config.pairs) {
        winTimer.current = window.setTimeout(() => finishGame(nextMoves), 650)
      }

      return
    }

    if (shieldedRef.current) {
      shieldedRef.current = false
      setShielded(false)
    } else {
      comboRef.current = 0
      setCombo(0)
    }
    firstFlipAtRef.current = null
    playSound('mismatch', soundRef.current)
    setLocked(true)
    setWrongIndexes([firstIndex, index])

    flipTimer.current = window.setTimeout(() => {
      setCards((prev) =>
        prev.map((item, i) =>
          i === firstIndex || i === index ? { ...item, flipped: false } : item,
        ),
      )
      setFirstIndex(null)
      setWrongIndexes(null)
      setLocked(false)
    }, 900)
  }

  return (
    <>
      <Background />
      <div className={styles.app}>
        {screen === 'start' && (
        <StartScreen
          selected={difficulty}
          soundOn={soundOn}
          best={best}
          dailyBest={dailyBest}
          dailyDate={dailyDate}
          theme={theme}
          onSelect={setDifficulty}
          onPlay={() => startGame(difficulty)}
          onPlayDaily={() => startGame('medium', 'daily')}
          onToggleSound={toggleSound}
          onToggleTheme={toggleTheme}
        />
      )}

      {screen === 'playing' && (
        <div className={styles.game}>
          <Hud
            difficulty={config}
            mode={mode}
            moves={moves}
            matches={matches}
            elapsed={formatTime(elapsedMs)}
            score={score}
            combo={combo}
            soundOn={soundOn}
            theme={theme}
            onToggleSound={toggleSound}
            onToggleTheme={toggleTheme}
            onHome={goHome}
            onRestart={() => startGame(difficulty, mode)}
          />
          <PowerBar
            uses={powerUses}
            disabled={locked || peeking || screen !== 'playing'}
            peeking={peeking}
            shielded={shielded}
            onUse={usePower}
          />
          <Board
            cards={cards}
            columns={config.columns}
            wrongIndexes={wrongIndexes}
            effect={matchEffect}
            peeked={peeking}
            disabled={locked || peeking || screen !== 'playing'}
            onFlip={handleFlip}
          />
          <p className={styles.gameTip}>
            Flip two cards. Chain matches to grow your combo!
          </p>
        </div>
      )}

      {screen === 'won' && (
        <>
          <Confetti />
          <WinScreen
            config={config}
            mode={mode}
            moves={moves}
            elapsed={formatTime(elapsedMs)}
            stars={starsFor(moves, config.pairs)}
            score={score}
            timeBonus={timeBonusPoints}
            bestCombo={bestCombo}
            newBest={newBest}
            best={mode === 'daily' ? dailyBest : best[difficulty]}
            soundOn={soundOn}
            theme={theme}
            onToggleSound={toggleSound}
            onToggleTheme={toggleTheme}
            onReplay={() => startGame(difficulty, mode)}
            onHome={goHome}
          />
        </>
      )}
      </div>
      <MilestoneBurst event={milestone} />
    </>
  )
}
