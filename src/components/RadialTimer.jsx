import styles from './RadialTimer.module.css';

const RADIUS = 32;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function RadialTimer({ timeLeft, totalTime }) {
  const fraction = totalTime > 0 ? timeLeft / totalTime : 1;
  const offset = CIRCUMFERENCE * (1 - fraction);

  let color = 'var(--color-volt)';
  if (fraction <= 0.25) color = 'var(--color-coral)';
  else if (fraction <= 0.5) color = 'var(--color-gold)';

  return (
    <div className={styles.wrapper}>
      <svg className={styles.svg} viewBox="0 0 72 72">
        <circle className={styles.bgCircle} cx="36" cy="36" r={RADIUS} />
        <circle
          className={styles.activeCircle}
          cx="36" cy="36" r={RADIUS}
          stroke={color}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>
      <div className={styles.number} style={{ color }}>
        {timeLeft}
      </div>
    </div>
  );
}
