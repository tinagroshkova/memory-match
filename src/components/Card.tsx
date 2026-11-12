import { comboMultiplier, type Card as CardModel } from '../game'
import styles from './Card.module.scss'

export interface MatchEffect {
  id: number
  index: number
  points: number
  combo: number
}

interface CardProps {
  card: CardModel
  index: number
  wrong: boolean
  disabled: boolean
  effect: MatchEffect | null
  peeked: boolean
  onFlip: (index: number) => void
}

export const Card = ({
  card,
  index,
  wrong,
  disabled,
  effect,
  peeked,
  onFlip,
}: CardProps) => {
  const revealed = card.flipped || card.matched || peeked

  return (
    <button
      type="button"
      className={[
        styles.card,
        revealed ? styles.isRevealed : '',
        card.matched ? styles.isMatched : '',
        wrong ? styles.isWrong : '',
        effect ? styles.hasEffect : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={() => onFlip(index)}
      disabled={disabled || revealed}
      aria-label={revealed ? card.name : 'Hidden card'}
      aria-pressed={revealed}
    >
      <span className={styles.cardInner}>
        <span className={`${styles.cardFace} ${styles.cardBack}`} aria-hidden="true">
          <span className={styles.cardBackStar}>★</span>
        </span>
        <span className={`${styles.cardFace} ${styles.cardFront}`} aria-hidden="true">
          {card.emoji}
        </span>
      </span>

      {effect && (
        <span key={effect.id} className={styles.matchFx} aria-hidden="true">
          <span className={styles.points}>+{effect.points}</span>
          {effect.combo >= 2 && (
            <span className={styles.comboTag}>
              combo x{comboMultiplier(effect.combo).toFixed(1)}
            </span>
          )}
          <span className={styles.sparks}>
            {Array.from({ length: 6 }, (_, spark) => (
              <span key={spark} className={styles.spark} />
            ))}
          </span>
        </span>
      )}
    </button>
  )
}
