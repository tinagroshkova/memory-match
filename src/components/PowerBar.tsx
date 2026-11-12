import { POWER_UPS, type PowerName, type PowerUses } from '../game'
import styles from './PowerBar.module.scss'

interface PowerBarProps {
  uses: PowerUses
  disabled: boolean
  peeking: boolean
  shielded: boolean
  onUse: (power: PowerName) => void
}

export const PowerBar = ({
  uses,
  disabled,
  peeking,
  shielded,
  onUse,
}: PowerBarProps) => (
  <div className={styles.powerBar} role="group" aria-label="Power-ups">
    {POWER_UPS.map((power) => {
      const remaining = uses[power.id]
      const active =
        power.id === 'peek' ? peeking : power.id === 'shield' ? shielded : false
      const isDisabled = disabled || remaining <= 0

      return (
        <button
          key={power.id}
          type="button"
          className={`${styles.power}${active ? ` ${styles.isActive}` : ''}`}
          onClick={() => onUse(power.id)}
          disabled={isDisabled}
          aria-label={`${power.label}: ${power.blurb} (${remaining} left)`}
          title={`${power.label} — ${power.blurb} (${remaining} left)`}
        >
          <span className={styles.emoji} aria-hidden="true">
            {power.emoji}
          </span>
          <span className={styles.text}>
            <span className={styles.label}>{power.label}</span>
            <span className={styles.blurb}>{power.blurb}</span>
          </span>
          <span className={styles.count}>{remaining}</span>
        </button>
      )
    })}
  </div>
)
