import { formatTime, type DifficultyConfig } from '../game'
import type { BestResult, Theme } from '../storage'
import shared from '../styles/shared.module.scss'
import { AnimatedNumber } from './AnimatedNumber'
import { ThemeToggle } from './ThemeToggle'
import styles from './WinScreen.module.scss'

interface WinScreenProps {
  config: DifficultyConfig
  mode: 'classic' | 'daily'
  moves: number
  elapsed: string
  stars: number
  score: number
  timeBonus: number
  bestCombo: number
  newBest: boolean
  best: BestResult | null
  soundOn: boolean
  theme: Theme
  onToggleSound: () => void
  onToggleTheme: () => void
  onReplay: () => void
  onHome: () => void
}

export const WinScreen = ({
  config,
  mode,
  moves,
  elapsed,
  stars,
  score,
  timeBonus,
  bestCombo,
  newBest,
  best,
  soundOn,
  theme,
  onToggleSound,
  onToggleTheme,
  onReplay,
  onHome,
}: WinScreenProps) => (
  <main className={styles.win}>
    <div className={styles.winCard}>
      <div className={styles.stars} aria-label={`${stars} out of 3 stars`}>
        {[1, 2, 3].map((value) => (
          <span
            key={value}
            className={`${styles.star}${value <= stars ? ` ${styles.isEarned}` : ''}`}
            aria-hidden="true"
          >
            ⭐
          </span>
        ))}
      </div>

      <h1 className={styles.title}>{newBest ? 'New best!' : 'You did it!'}</h1>
      <p className={styles.winLede}>
        {mode === 'daily'
          ? `📅 Daily Challenge · ${config.pairs} pairs`
          : `${config.emoji} ${config.label} · ${config.pairs} pairs`}
      </p>

      <div className={styles.scorePanel} aria-label={`Score: ${score} points`}>
        <span className={styles.scoreValue}>
          <AnimatedNumber value={score} />
        </span>
        <span className={styles.scoreLabel}>points</span>
        {timeBonus > 0 && (
          <span className={styles.timeBonus}>+{timeBonus} time bonus</span>
        )}
      </div>

      <dl className={styles.winStats}>
        <div>
          <dt>Moves</dt>
          <dd>{moves}</dd>
        </div>
        <div>
          <dt>Time</dt>
          <dd>{elapsed}</dd>
        </div>
        <div>
          <dt>Best combo</dt>
          <dd>{bestCombo}×</dd>
        </div>
      </dl>

      <p className={styles.winBest}>
        {mode === 'daily' ? "Today's best" : 'Best score'}:{' '}
        {best
          ? `${best.score} pts · ${best.moves} moves · ${formatTime(best.timeMs)}`
          : '—'}
      </p>

      <div className={styles.winActions}>
        <button type="button" className={shared.playButton} onClick={onReplay}>
          Play again
        </button>
        <button type="button" className={shared.secondaryButton} onClick={onHome}>
          Choose level
        </button>
      </div>

      <ThemeToggle theme={theme} onToggle={onToggleTheme} />

      <button
        type="button"
        className={shared.iconButton}
        onClick={onToggleSound}
        aria-label={soundOn ? 'Mute sound' : 'Unmute sound'}
      >
        {soundOn ? '🔊 Sound on' : '🔇 Sound off'}
      </button>
    </div>
  </main>
)
