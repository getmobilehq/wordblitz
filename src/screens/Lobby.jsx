import { useState, useEffect } from 'react';
import useGameStore from '../store/gameStore';
import { supabase, ensureAnonymousAuth } from '../lib/supabase';
import { PLAYER_COLORS } from '../components/PlayerColors';
import GlowButton from '../components/GlowButton';
import styles from './Lobby.module.css';

export default function Lobby() {
  const { myId, myName, setMyName, setScreen, setPlayers, setRoom } = useGameStore();
  const [name, setName] = useState(myName || '');
  const [joinCode, setJoinCode] = useState('');
  const [mode, setMode] = useState(null); // null | 'local' | 'online'
  const [localNames, setLocalNames] = useState(['', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isOnlineAvailable = !!supabase;

  useEffect(() => {
    const stored = sessionStorage.getItem('joinCode');
    if (stored) {
      setJoinCode(stored);
      sessionStorage.removeItem('joinCode');
    }
  }, []);

  const updateLocalName = (idx, value) => {
    const next = [...localNames];
    next[idx] = value;
    setLocalNames(next);
    if (idx === 0) { setName(value); setMyName(value); }
  };

  // ── Local multiplayer (same device) ──
  const canStartLocal = localNames.filter(n => n.trim().length > 0).length >= 2;

  const handleLocalStart = () => {
    const activePlayers = localNames
      .map((n, i) => ({
        id: i === 0 ? myId : `local-${i}`,
        name: n.trim(),
        score: 0, streak: 0,
        isReady: true, isConnected: true,
        joinOrder: i + 1,
      }))
      .filter(p => p.name.length > 0);
    setPlayers(activePlayers);
    setScreen('setup');
  };

  // ── Online: Create room ──
  const handleCreateOnline = async () => {
    if (!name.trim()) { setError('Enter your name first'); return; }
    setLoading(true);
    setError('');
    try {
      await ensureAnonymousAuth();
      setMyName(name.trim());

      const { data, error: fnErr } = await supabase.functions.invoke('create-room', {
        body: { display_name: name.trim() },
      });
      if (fnErr) throw fnErr;

      const { room_id, code } = data;
      setRoom({
        id: room_id, code, status: 'waiting',
        category: null, rounds: 8, timerSeconds: 15, difficulty: 'mixed',
      });
      setPlayers([{
        id: myId, name: name.trim(),
        score: 0, streak: 0,
        isReady: true, isConnected: true,
        joinOrder: 1,
      }]);
      setScreen('setup');
    } catch (err) {
      setError(err.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  // ── Online: Join room ──
  const handleJoin = async () => {
    if (!name.trim()) { setError('Enter your name first'); return; }
    if (joinCode.length < 6) return;
    setLoading(true);
    setError('');
    try {
      await ensureAnonymousAuth();
      setMyName(name.trim());

      const { data, error: fnErr } = await supabase.functions.invoke('join-room', {
        body: { room_code: joinCode, display_name: name.trim() },
      });
      if (fnErr) throw fnErr;

      setRoom({
        id: data.room_id, code: data.code, status: 'waiting',
        category: data.category, rounds: data.rounds,
        timerSeconds: data.timer_seconds, difficulty: data.difficulty,
      });

      // Fetch existing players
      const { data: existingPlayers } = await supabase
        .from('room_players')
        .select('*')
        .eq('room_id', data.room_id)
        .order('join_order');

      setPlayers((existingPlayers || []).map(p => ({
        id: p.user_id,
        name: p.display_name,
        score: 0, streak: 0,
        isReady: p.is_ready,
        isConnected: true,
        joinOrder: p.join_order,
      })));

      setScreen('waiting');
    } catch (err) {
      setError(err.message || 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  // ── Mode selection view ──
  if (!mode) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>WordBlitz</h1>
          <p className={styles.subtitle}>Choose how to play</p>
        </div>

        <div className={styles.modeCards}>
          <button className={styles.modeCard} onClick={() => setMode('local')}>
            <span className={styles.modeIcon}>{'\u{1F4F1}'}</span>
            <span className={styles.modeTitle}>Local Play</span>
            <span className={styles.modeDesc}>Same device, pass & play</span>
          </button>

          <button
            className={`${styles.modeCard} ${!isOnlineAvailable ? styles.modeDisabled : ''}`}
            onClick={() => isOnlineAvailable && setMode('online')}
            disabled={!isOnlineAvailable}
          >
            <span className={styles.modeIcon}>{'\u{1F310}'}</span>
            <span className={styles.modeTitle}>Online Multiplayer</span>
            <span className={styles.modeDesc}>
              {isOnlineAvailable ? 'Play with anyone, anywhere' : 'Supabase not configured'}
            </span>
          </button>
        </div>

        <GlowButton variant="ghost" onClick={() => setScreen('splash')}>
          BACK
        </GlowButton>
      </div>
    );
  }

  // ── Local mode view ──
  if (mode === 'local') {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Local Players</h1>
          <p className={styles.subtitle}>Enter names for everyone on this device</p>
        </div>

        <div className={styles.players}>
          {localNames.map((n, i) => {
            const color = PLAYER_COLORS[(i + 1)] || PLAYER_COLORS[1];
            return (
              <div key={i} className={styles.playerCard} style={{ animationDelay: `${i * 0.08}s` }}>
                <div className={styles.colorDot} style={{ background: color.main, boxShadow: color.glow }} />
                <input
                  className={styles.nameInput}
                  placeholder={`Player ${i + 1}`}
                  value={n}
                  onChange={(e) => updateLocalName(i, e.target.value)}
                  maxLength={16}
                  autoFocus={i === 0}
                />
                <span className={styles.playerLabel}>P{i + 1}</span>
              </div>
            );
          })}
          {localNames.length < 6 && (
            <button className={styles.addBtn} onClick={() => setLocalNames([...localNames, ''])}>
              + Add Player
            </button>
          )}
        </div>

        <div className={styles.actions}>
          <GlowButton onClick={handleLocalStart} disabled={!canStartLocal}>
            CONTINUE
          </GlowButton>
          <GlowButton variant="ghost" onClick={() => setMode(null)}>
            BACK
          </GlowButton>
        </div>
      </div>
    );
  }

  // ── Online mode view ──
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Online Play</h1>
        <p className={styles.subtitle}>Create or join a game room</p>
      </div>

      {/* Name input */}
      <div className={styles.nameSection}>
        <span className={styles.sectionLabel}>Your Name</span>
        <div className={styles.playerCard}>
          <div className={styles.colorDot} style={{ background: PLAYER_COLORS[1].main, boxShadow: PLAYER_COLORS[1].glow }} />
          <input
            className={styles.nameInput}
            placeholder="Enter your name"
            value={name}
            onChange={(e) => { setName(e.target.value); setMyName(e.target.value); }}
            maxLength={16}
            autoFocus
          />
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.actions}>
        <GlowButton onClick={handleCreateOnline} disabled={loading || !name.trim()}>
          {loading ? 'CREATING...' : 'CREATE ROOM'}
        </GlowButton>

        <div className={styles.divider}>OR JOIN A ROOM</div>

        <div className={styles.joinRow}>
          <input
            className={styles.joinInput}
            placeholder="ROOM CODE"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
            maxLength={6}
          />
          <GlowButton
            variant="cyan"
            disabled={joinCode.length < 6 || loading || !name.trim()}
            onClick={handleJoin}
          >
            {loading ? '...' : 'JOIN'}
          </GlowButton>
        </div>

        <GlowButton variant="ghost" onClick={() => setMode(null)}>
          BACK
        </GlowButton>
      </div>
    </div>
  );
}
