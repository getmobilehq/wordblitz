import useGameStore from '../store/gameStore';
import ParticleField from '../components/ParticleField';
import GlowButton from '../components/GlowButton';
import styles from './Splash.module.css';

export default function Splash() {
  const setScreen = useGameStore(s => s.setScreen);

  return (
    <div className={styles.container}>
      <ParticleField />
      <div className={styles.glow1} />
      <div className={styles.glow2} />

      <div className={styles.content}>
        <h1 className={styles.logo}>
          <span className={styles.word}>WORD</span>
          <span className={styles.blitz}>BLITZ</span>
        </h1>

        <p className={styles.tagline}>Say it faster.</p>

        <div className={styles.pills}>
          <span className={styles.pill}>VOICE POWERED</span>
          <span className={styles.pill}>REAL-TIME</span>
          <span className={styles.pill}>MULTIPLAYER</span>
        </div>

        <div className={styles.cta}>
          <GlowButton onClick={() => setScreen('lobby')}>
            TAP TO PLAY
          </GlowButton>
        </div>
      </div>

      <span className={styles.version}>
        v1.0.0
        <button className={styles.adminLink} onClick={() => setScreen('admin')}>Admin</button>
      </span>
    </div>
  );
}
