import { comboMultiplier, type DifficultyConfig } from '../game'
import type { Theme } from '../storage'
import shared from '../styles/shared.module.scss'
import styles from './Hud.module.scss'
import { ThemeToggle } from './ThemeToggle'

interface HudProps {
  difficulty: DifficultyConfig
  mode: 'classic' | 'daily'
  moves: number
  matches: number
  elapsed: string
  score: number
  combo: number
  soundOn: boolean
  theme: Theme
  onToggleSound: () => void
  onToggleTheme: () => void
  onHome: () => void
  onRestart: () => void
}

export const Hud = ({
  difficulty,
  mode,
  moves,
  matches,
  elapsed,
  score,
  combo,
  soundOn,
  theme,
  onToggleSound,
  onToggleTheme,
  onHome,
  onRestart,
}: HudProps) => (
  <header className={styles.hud}>
    <button
      type="button"
      className={shared.iconButton}
      onClick={onHome}
      aria-label="Back to menu"
      title="Back to menu"
    >
      🏠
    </button>

    <span className={styles.hudBadge}>
      {mode === 'daily' ? '📅 Daily' : `${difficulty.emoji} ${difficulty.label}`}
    </span>

    <div className={styles.hudStats}>
      <span className={styles.hudStat} aria-label={`Score: ${score}`}>
        ⭐ {score}
      </span>
      <span className={styles.hudStat} aria-label={`Moves: ${moves}`}>
        🔁 {moves}
      </span>
      <span
        className={styles.hudStat}
        aria-label={`Pairs found: ${matches} of ${difficulty.pairs}`}
      >
        🧩 {matches}/{difficulty.pairs}
      </span>
      <span className={styles.hudStat} aria-label={`Time: ${elapsed}`}>
        ⏱️ {elapsed}
      </span>
      {combo >= 2 && (
        <span
          key={combo}
          className={`${styles.hudStat} ${styles.combo}`}
          aria-label={`Combo multiplier x${comboMultiplier(combo).toFixed(1)}`}
          title={`${combo} matches in a row`}
        >
          🔥 x{comboMultiplier(combo).toFixed(1)}
        </span>
      )}
    </div>

    <div className={styles.hudActions}>
      <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      <button
        type="button"
        className={shared.iconButton}
        onClick={onToggleSound}
        aria-label={soundOn ? 'Mute sound' : 'Unmute sound'}
        title={soundOn ? 'Mute sound' : 'Unmute sound'}
      >
        {soundOn ? '🔊' : '🔇'}
      </button>
      <button
        type="button"
        className={shared.iconButton}
        onClick={onRestart}
        aria-label="Restart game"
        title="Restart game"
      >
        🔄
      </button>
    </div>
  </header>
)
