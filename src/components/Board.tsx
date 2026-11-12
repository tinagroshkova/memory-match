import type { CSSProperties } from 'react'
import type { Card } from '../game'
import styles from './Board.module.scss'
import { Card as CardView, type MatchEffect } from './Card'

interface BoardProps {
  cards: Card[]
  columns: number
  wrongIndexes: [number, number] | null
  effect: MatchEffect | null
  peeked: boolean
  disabled: boolean
  onFlip: (index: number) => void
}

export const Board = ({
  cards,
  columns,
  wrongIndexes,
  effect,
  peeked,
  disabled,
  onFlip,
}: BoardProps) => (
  <div
    className={`${styles.board}${wrongIndexes ? ` ${styles.shake}` : ''}`}
    style={{ '--columns': columns } as CSSProperties}
  >
    {cards.map((card, index) => (
      <CardView
        key={card.id}
        card={card}
        index={index}
        wrong={wrongIndexes?.includes(index) ?? false}
        effect={effect?.index === index ? effect : null}
        peeked={peeked}
        disabled={disabled}
        onFlip={onFlip}
      />
    ))}
  </div>
)
