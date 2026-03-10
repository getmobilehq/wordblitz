import useGameStore from '../store/gameStore';
import { PLAYER_COLORS } from '../components/PlayerColors';
import GlowButton from '../components/GlowButton';
import styles from './Results.module.css';

const RANK_MEDALS = ['gold', 'silver', 'bronze'];
const RANK_LABELS = ['\u{1F947}', '\u{1F948}', '\u{1F949}'];

export default function Results() {
  const { players, wordQueue, room, setScreen, resetGame } = useGameStore();

  const sorted = [...players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];
  const isDraw = sorted.length > 1 && sorted[0].score === sorted[1].score;
  const totalRounds = room?.rounds || wordQueue.length;

  const handleRematch = () => {
    // Keep same players, go back to setup
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
