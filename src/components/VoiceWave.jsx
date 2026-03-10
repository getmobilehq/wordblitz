import styles from './VoiceWave.module.css';

const BAR_COUNT = 12;
const DURATIONS = [0.4, 0.55, 0.7, 0.45, 0.85, 0.6, 0.5, 0.75, 0.9, 0.65, 0.4, 0.8];

export default function VoiceWave({ active, color = 'var(--color-cyan)' }) {
  return (
    <div className={styles.container}>
      {Array.from({ length: BAR_COUNT }, (_, i) => {
        const brightness = 1 - (i / BAR_COUNT) * 0.4;
        return (
          <div
            key={i}
            className={`${styles.bar} ${active ? styles.active : styles.inactive}`}
            style={{
              backgroundColor: color,
              opacity: active ? brightness : 0.3,
              animationDuration: `${DURATIONS[i]}s`,
              animationDelay: `${i * 0.05}s`,
              height: active ? undefined : '20%',
            }}
          />
        );
      })}
    </div>
  );
}
