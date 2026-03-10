import { useState, useEffect } from 'react';
import styles from './ScoreOrb.module.css';

export default function ScoreOrb({ name, score, color, dimColor, glowShadow }) {
  const [pulsing, setPulsing] = useState(false);

  useEffect(() => {
    if (score > 0) {
      setPulsing(true);
      const t = setTimeout(() => setPulsing(false), 500);
      return () => clearTimeout(t);
    }
  }, [score]);

  return (
    <div
      className={`${styles.orb} ${pulsing ? styles.pulse : ''}`}
      style={{
        background: dimColor,
        boxShadow: glowShadow,
        color,
      }}
    >
      <span className={styles.score}>{score}</span>
      <span className={styles.name}>{name}</span>
    </div>
  );
}
