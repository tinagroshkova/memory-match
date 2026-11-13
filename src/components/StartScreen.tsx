import {
  DAILY_PAIRS,
  DAILY_WILDCARDS,
  DIFFICULTIES,
  formatTime,
  type Difficulty,
} from '../game'
import type { BestResult, BestResults, Theme } from '../storage'
import shared from '../styles/shared.module.scss'
import styles from './StartScreen.module.scss'
import { ThemeToggle } from './ThemeToggle'

interface StartScreenProps {
  selected: Difficulty
  soundOn: boolean
  best: BestResults
  dailyBest: BestResult | null
  dailyDate: string
  theme: Theme
  onSelect: (level: Difficulty) => void
  onPlay: () => void
  onPlayDaily: () => void
  onToggleSound: () => void
  onToggleTheme: () => void
}

export const StartScreen = ({
  selected,
  soundOn,
  best,
  dailyBest,
  dailyDate,
  theme,
  onSelect,
  onPlay,
  onPlayDaily,
  onToggleSound,
  onToggleTheme,
}: StartScreenProps) => (
  <main className={styles.start}>
    <div className={styles.startHead}>
      <span className={styles.startLogo} aria-hidden="true">
        🧠
      </span>
      <h1 className={styles.title}>Memory Match</h1>
      <p className={styles.startLede}>Flip two cards. Find the matching pairs!</p>
    </div>

    <div className={styles.levels} role="radiogroup" aria-label="Choose a level">
      {DIFFICULTIES.map((config) => {
        const record = best[config.id]
        const active = config.id === selected

        return (
          <button
            key={config.id}
            type="button"
            role="radio"
            aria-checked={active}
            className={`${styles.level}${active ? ` ${styles.isActive}` : ''}`}
            onClick={() => onSelect(config.id)}
          >
            <span className={styles.levelEmoji} aria-hidden="true">
              {config.emoji}
            </span>
            <span className={styles.levelName}>{config.label}</span>
            <span className={styles.levelMeta}>
              {config.pairs} pairs · {config.blurb}
            </span>
            <span className={styles.levelBest}>
              {record
                ? `Best: ${record.score} pts · ${formatTime(record.timeMs)}`
                : 'No best yet'}
            </span>
          </button>
        )
      })}
    </div>

    <button type="button" className={styles.daily} onClick={onPlayDaily}>
      <span className={styles.dailyEmoji} aria-hidden="true">
        📅
      </span>
      <span className={styles.dailyBody}>
        <span className={styles.dailyTitle}>Daily Challenge</span>
        <span className={styles.dailyMeta}>
          {dailyDate} · {DAILY_PAIRS} pairs · {DAILY_WILDCARDS} wild · one deck a
          day
        </span>
        <span className={styles.dailyBest}>
          {dailyBest
            ? `Today's best: ${dailyBest.score} pts · ${formatTime(dailyBest.timeMs)}`
            : 'No score today — set the pace!'}
        </span>
      </span>
      <span className={styles.dailyPlay}>Play</span>
    </button>

    <button type="button" className={shared.playButton} onClick={onPlay}>
      ▶ Play
    </button>

    <div className={styles.startFoot}>
      <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      <button
        type="button"
        className={shared.iconButton}
        onClick={onToggleSound}
        aria-label={soundOn ? 'Mute sound' : 'Unmute sound'}
      >
        {soundOn ? '🔊' : '🔇'} <span>{soundOn ? 'Sound on' : 'Sound off'}</span>
      </button>
      <p className={styles.startHint}>
        Chain matches for combo multipliers. Finish fast for a time bonus. Match
        a 🌈 wildcard with any card to clear its whole pair!
      </p>
    </div>
  </main>
)
