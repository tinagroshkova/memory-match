import type { CSSProperties } from 'react'
import styles from './Confetti.module.scss'

const COLORS = ['#ffb703', '#ff6b9a', '#6c5ce7', '#00b8d9', '#2ec27e', '#ff8a3d']

const PIECES = Array.from({ length: 44 }, (_, index) => ({
  left: `${(index * 29) % 100}%`,
  delay: `${(index % 11) * 0.07}s`,
  duration: `${2.2 + (index % 6) * 0.28}s`,
  drift: `${((index * 17) % 120) - 60}px`,
  spin: `${360 + (index % 5) * 180}deg`,
  color: COLORS[index % COLORS.length] ?? '#ffb703',
  size: `${6 + (index % 4) * 3}px`,
  round: index % 3 === 0,
}))

export const Confetti = () => (
  <div className={styles.confetti} aria-hidden="true">
    {PIECES.map((piece, index) => (
      <span
        key={index}
        className={styles.confettiPiece}
        style={
          {
            left: piece.left,
            animationDelay: piece.delay,
            animationDuration: piece.duration,
            '--drift': piece.drift,
            '--spin': piece.spin,
            '--color': piece.color,
            '--size': piece.size,
            '--radius-piece': piece.round ? '50%' : '2px',
          } as CSSProperties
        }
      />
    ))}
  </div>
)
