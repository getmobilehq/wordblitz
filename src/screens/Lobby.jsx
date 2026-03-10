import { useState, useEffect } from 'react';
import useGameStore from '../store/gameStore';
import { PLAYER_COLORS } from '../components/PlayerColors';
import GlowButton from '../components/GlowButton';
import styles from './Lobby.module.css';

export default function Lobby() {
  const { myId, myName, setMyName, setScreen, setPlayers } = useGameStore();
  const [names, setNames] = useState([myName || '', '']);
  const [joinCode, setJoinCode] = useState('');

  useEffect(() => {
    const stored = sessionStorage.getItem('joinCode');
    if (stored) {
      setJoinCode(stored);
      sessionStorage.removeItem('joinCode');
    }
  }, []);

  const updateName = (idx, value) => {
    const next = [...names];
    next[idx] = value;
    setNames(next);
    if (idx === 0) setMyName(value);
  };

  const addPlayer = () => {
    if (names.length < 6) setNames([...names, '']);
  };

  const canStart = names.filter(n => n.trim().length > 0).length >= 2;

  const handleStart = () => {
    const activePlayers = names
      .map((name, i) => ({
        id: i === 0 ? myId : `local-${i}`,
        name: name.trim(),
        score: 0,
        streak: 0,
        isReady: true,
        isConnected: true,
        joinOrder: i + 1,
      }))
      .filter(p => p.name.length > 0);

    setPlayers(activePlayers);
    setScreen('setup');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Players</h1>
        <p className={styles.subtitle}>Enter names to begin</p>
      </div>

      <div className={styles.players}>
        {names.map((name, i) => {
          const color = PLAYER_COLORS[(i + 1)] || PLAYER_COLORS[1];
          return (
            <div
              key={i}
              className={styles.playerCard}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className={styles.colorDot} style={{ background: color.main, boxShadow: color.glow }} />
              <input
                className={styles.nameInput}
                placeholder={`Player ${i + 1}`}
                value={name}
                onChange={(e) => updateName(i, e.target.value)}
                maxLength={16}
                autoFocus={i === 0}
              />
              <span className={styles.playerLabel}>P{i + 1}</span>
            </div>
          );
        })}

        {names.length < 6 && (
          <button className={styles.addBtn} onClick={addPlayer}>
            + Add Player
          </button>
        )}
      </div>

      <div className={styles.actions}>
        <GlowButton onClick={handleStart} disabled={!canStart}>
          CREATE GAME
        </GlowButton>

        <div className={styles.divider}>OR JOIN</div>

        <div className={styles.joinRow}>
          <input
            className={styles.joinInput}
            placeholder="ROOM CODE"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
            maxLength={6}
          />
          <GlowButton
            variant="cyan"
            disabled={joinCode.length < 6}
            onClick={() => {/* TODO: join room flow */}}
          >
            JOIN
          </GlowButton>
        </div>
      </div>
    </div>
  );
}
