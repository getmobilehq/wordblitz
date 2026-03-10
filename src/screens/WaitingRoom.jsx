import { useState } from 'react';
import useGameStore from '../store/gameStore';
import { PLAYER_COLORS } from '../components/PlayerColors';
import { formatCode } from '../lib/roomCode';
import GlowButton from '../components/GlowButton';
import styles from './WaitingRoom.module.css';

export default function WaitingRoom() {
  const { room, players, myId, setScreen } = useGameStore();
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    if (room?.code) {
      try {
        await navigator.clipboard.writeText(room.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        /* clipboard not available */
      }
    }
  };

  const isHost = players[0]?.id === myId;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Waiting Room</h1>

      <div className={styles.codeSection}>
        <span className={styles.codeLabel}>Room Code</span>
        <div className={styles.code} onClick={copyCode}>
          {room?.code ? formatCode(room.code) : '------'}
        </div>
        {copied && <span className={styles.copied}>Copied!</span>}
      </div>

      <div className={styles.playersList}>
        {players.map((p, i) => {
          const color = PLAYER_COLORS[p.joinOrder] || PLAYER_COLORS[1];
          return (
            <div key={p.id} className={styles.playerRow}>
              <div className={styles.playerDot} style={{ background: color.main, boxShadow: color.glow }} />
              <span className={styles.playerName}>{p.name}</span>
              <span className={`${styles.readyBadge} ${p.isReady ? styles.ready : styles.waiting}`}>
                {p.isReady ? 'Ready' : 'Waiting'}
              </span>
            </div>
          );
        })}
      </div>

      <div className={styles.actions}>
        {isHost ? (
          <GlowButton
            onClick={() => setScreen('countdown')}
            disabled={players.length < 2}
          >
            START GAME
          </GlowButton>
        ) : (
          <GlowButton variant="cyan">
            READY
          </GlowButton>
        )}
        <GlowButton variant="ghost" onClick={() => setScreen('lobby')}>
          LEAVE
        </GlowButton>
      </div>
    </div>
  );
}
