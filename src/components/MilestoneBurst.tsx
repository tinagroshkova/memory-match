import type { ComboMilestone } from '../game'
import styles from './MilestoneBurst.module.scss'

export interface MilestoneEvent {
  id: number
  milestone: ComboMilestone
}

interface MilestoneBurstProps {
  event: MilestoneEvent | null
}

export const MilestoneBurst = ({ event }: MilestoneBurstProps) => {
  if (!event) {
    return null
  }

  return (
    <div key={event.id} className={styles.burst} role="status" aria-live="polite">
      <div className={styles.badge}>
        <span className={styles.label}>{event.milestone.label}</span>
        <span className={styles.combo}>{event.milestone.combo}× combo</span>
        <span className={styles.bonus}>+{event.milestone.bonus} bonus</span>
      </div>

      <span className={styles.ring} aria-hidden="true" />
      <span className={styles.particles} aria-hidden="true">
        {Array.from({ length: 8 }, (_, index) => (
          <span key={index} className={styles.particle} />
        ))}
      </span>
    </div>
  )
}
