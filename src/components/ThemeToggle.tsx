import type { Theme } from '../storage'
import shared from '../styles/shared.module.scss'

interface ThemeToggleProps {
  theme: Theme
  onToggle: () => void
}

export const ThemeToggle = ({ theme, onToggle }: ThemeToggleProps) => {
  const label = theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'

  return (
    <button
      type="button"
      className={shared.iconButton}
      onClick={onToggle}
      aria-label={label}
      title={label}
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}
