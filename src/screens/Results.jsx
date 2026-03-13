import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import useGameStore from '../store/gameStore';
import { PLAYER_COLORS } from '../components/PlayerColors';
import GlowButton from '../components/GlowButton';
import styles from './Results.module.css';

const RANK_MEDALS = ['gold', 'silver', 'bronze'];
const RANK_LABELS = ['\u{1F947}', '\u{1F948}', '\u{1F949}'];

function fireConfetti() {
  const duration = 4000;
  const end = Date.now() + duration;

  // Big initial burst
  confetti({
    particleCount: 150,
    spread: 100,
    origin: { y: 0.6 },
    colors: ['#FFD700', '#00D4FF', '#FF4D6D', '#BAFF39', '#A855F7'],
    startVelocity: 45,
    gravity: 0.8,
    ticks: 300,
  });

  // Side cannons
  setTimeout(() => {
    confetti({
      particleCount: 80,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: ['#FFD700', '#00D4FF', '#FF4D6D'],
      startVelocity: 50,
    });
    confetti({
      particleCount: 80,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: ['#FFD700', '#BAFF39', '#A855F7'],
      startVelocity: 50,
    });
  }, 300);

  // Sustained shower
  const interval = setInterval(() => {
    if (Date.now() > end) { clearInterval(interval); return; }
    confetti({
      particleCount: 15,
      spread: 80,
      origin: { x: Math.random(), y: -0.1 },
      colors: ['#FFD700', '#00D4FF', '#FF4D6D', '#BAFF39'],
      startVelocity: 20,
      gravity: 1.2,
      ticks: 200,
      scalar: 1.2,
    });
  }, 200);

  return () => clearInterval(interval);
}

export default function Results() {
  const { players, wordQueue, room, setScreen, resetGame } = useGameStore();
  const confettiDone = useRef(false);

  const sorted = [...players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];
  const isDraw = sorted.length > 1 && sorted[0].score === sorted[1].score;
  const isSolo = players.length === 1;
  const totalRounds = room?.rounds || wordQueue.length;

  // Fire confetti on mount
  useEffect(() => {
    if (confettiDone.current) return;
    confettiDone.current = true;
    const cleanup = fireConfetti();
    return cleanup;
  }, []);

  const handleRematch = () => {
    const resetPlayers = players.map(p => ({ ...p, score: 0, streak: 0 }));
    useGameStore.getState().setPlayers(resetPlayers);
    useGameStore.getState().setRoom(null);
    useGameStore.getState().setGamePhase('idle');
    setScreen('setup');
  };

  const handleMainMenu = () => {
    resetGame();
    setScreen('splash');
  };

  // Solo results
  if (isSolo) {
    const accuracy = totalRounds > 0 ? Math.round((winner.score / totalRounds) * 100) : 0;
    const perfect = winner.score === totalRounds;
    return (
      <div className={styles.container}>
        <div className={styles.trophy}>{perfect ? '\u{1F31F}' : '\u{1F3C6}'}</div>

        <h1 className={styles.title}>{perfect ? 'Perfect!' : 'Game Over'}</h1>
        <p className={styles.winnerName} style={{ color: PLAYER_COLORS[1].main }}>
          {winner.name}
        </p>

        <div className={styles.soloStats}>
          <div className={styles.soloStatCard}>
            <span className={styles.soloStatValue}>{winner.score}/{totalRounds}</span>
            <span className={styles.soloStatLabel}>Words Solved</span>
          </div>
          <div className={styles.soloStatCard}>
            <span className={styles.soloStatValue}>{accuracy}%</span>
            <span className={styles.soloStatLabel}>Accuracy</span>
          </div>
        </div>

        <div className={styles.actions}>
          <GlowButton onClick={handleRematch}>
            PLAY AGAIN
          </GlowButton>
          <GlowButton variant="ghost" onClick={handleMainMenu}>
            MAIN MENU
          </GlowButton>
        </div>
      </div>
    );
  }

  // Multiplayer results
  return (
    <div className={styles.container}>
      <div className={styles.trophy}>{isDraw ? '\u{1F91D}' : '\u{1F3C6}'}</div>

      {isDraw ? (
        <>
          <h1 className={styles.title}>It's a Draw!</h1>
          <p className={`${styles.winnerName} ${styles.draw}`}>
            {sorted.filter(p => p.score === winner.score).map(p => p.name).join(' & ')}
          </p>
        </>
      ) : (
        <>
          <h1 className={styles.title}>Winner!</h1>
          <p
            className={styles.winnerName}
            style={{ color: PLAYER_COLORS[winner.joinOrder]?.main }}
          >
            {winner.name}
          </p>
        </>
      )}

      <div className={styles.podium}>
        {sorted.map((p, i) => {
          const color = PLAYER_COLORS[p.joinOrder] || PLAYER_COLORS[1];
          const accuracy = totalRounds > 0
            ? Math.round((p.score / totalRounds) * 100)
            : 0;

          return (
            <div
              key={p.id}
              className={`${styles.podiumRow} ${i === 0 ? styles.first : ''}`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <span className={`${styles.rank} ${styles[RANK_MEDALS[i]] || ''}`}>
                {RANK_LABELS[i] || i + 1}
              </span>
              <div className={styles.playerInfo}>
                <span className={styles.playerName} style={{ color: color.main }}>
                  {p.name}
                </span>
                <span className={styles.playerStats}>
                  {accuracy}% accuracy
                </span>
              </div>
              <span className={styles.playerScore} style={{ color: color.main }}>
                {p.score}
              </span>
            </div>
          );
        })}
      </div>

      <div className={styles.actions}>
        <GlowButton onClick={handleRematch}>
          REMATCH
        </GlowButton>
        <GlowButton variant="ghost" onClick={handleMainMenu}>
          MAIN MENU
        </GlowButton>
      </div>
    </div>
  );
}
