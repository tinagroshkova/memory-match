import styles from './Background.module.scss'

export const Background = () => (
  <div className={styles.background} aria-hidden="true">
    <span className={`${styles.orb} ${styles.orbOne}`} />
    <span className={`${styles.orb} ${styles.orbTwo}`} />
    <span className={`${styles.orb} ${styles.orbThree}`} />
  </div>
)
