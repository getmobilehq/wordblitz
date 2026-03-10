import styles from './LetterTile.module.css';

export default function LetterTile({ letter, revealLetter, flipped, result, delay = 0 }) {
  return (
    <div className={styles.tileWrapper}>
      <div
        className={`${styles.tile} ${flipped ? styles.flipped : ''}`}
        style={{ animationDelay: `${delay}ms` }}
      >
        <div className={`${styles.face} ${styles.front}`}>
          {letter}
        </div>
        <div className={`${styles.face} ${styles.back} ${styles[result] || ''}`}>
          {revealLetter || letter}
        </div>
      </div>
    </div>
  );
}
