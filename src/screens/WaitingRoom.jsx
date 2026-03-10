import { useState, useEffect, useCallback } from 'react';
import useGameStore from '../store/gameStore';
import { supabase } from '../lib/supabase';
import { useRoom } from '../hooks/useRoom';
import { PLAYER_COLORS } from '../components/PlayerColors';
import { formatCode } from '../lib/roomCode';
import { getWordPool } from '../data/wordBanks';
import GlowButton from '../components/GlowButton';
import styles from './WaitingRoom.module.css';

export default function WaitingRoom() {
  const { room, players, myId, setScreen, setPlayers } = useGameStore();
  const [copied, setCopied] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [loading, setLoading] = useState(false);

  const isHost = players[0]?.id === myId;
  const inviteUrl = room?.code
    ? `${window.location.origin}?code=${room.code}`
    : '';

  // Subscribe to room channel for real-time updates
  useRoom(room?.id);

  // Poll for new players (backup for broadcast)
  useEffect(() => {
    if (!room?.id || !supabase) return;
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('room_players')
        .select('*')
        .eq('room_id', room.id)
        .order('join_order');
      if (data) {
        setPlayers(data.map(p => ({
          id: p.user_id,
          name: p.display_name,
          score: 0, streak: 0,
          isReady: p.is_ready,
          isConnected: true,
          joinOrder: p.join_order,
        })));
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [room?.id, setPlayers]);

  // Copy room code
  const copyCode = async () => {
    if (!room?.code) return;
    try {
      await navigator.clipboard.writeText(room.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  // Copy invite URL
  const copyUrl = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {}
  };

  // Share via Web Share API (mobile)
  const shareInvite = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'WordBlitz',
          text: `Join my WordBlitz game! Room code: ${room?.code}`,
          url: inviteUrl,
        });
      } catch {}
    } else {
      copyUrl();
    }
  };

  // Host starts the game
  const handleStartGame = async () => {
    if (!room?.id || !supabase) return;
    setLoading(true);
    try {
      const pool = getWordPool(room.category, room.difficulty);
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      const wordQueue = shuffled.slice(0, room.rounds || 8);

      const { error } = await supabase.functions.invoke('start-game', {
        body: { room_id: room.id, word_queue: wordQueue },
      });
      if (error) throw error;
      // The useRoom hook will receive the game:start broadcast and navigate
    } catch (err) {
      console.error('Failed to start game:', err);
    } finally {
      setLoading(false);
    }
  };

  // Guest toggles ready
  const toggleReady = async () => {
    if (!room?.id || !supabase) return;
    const me = players.find(p => p.id === myId);
    if (!me) return;
    const newReady = !me.isReady;
    await supabase
      .from('room_players')
      .update({ is_ready: newReady })
      .eq('room_id', room.id)
      .eq('user_id', myId);
    useGameStore.getState().updatePlayer(myId, { isReady: newReady });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Waiting Room</h1>

      {/* Room code */}
      <div className={styles.codeSection}>
        <span className={styles.codeLabel}>Room Code</span>
        <div className={styles.code} onClick={copyCode}>
          {room?.code ? formatCode(room.code) : '------'}
        </div>
        {copied && <span className={styles.copied}>Code copied!</span>}
      </div>

      {/* Invite URL */}
      <div className={styles.inviteSection}>
        <span className={styles.codeLabel}>Invite Link</span>
        <div className={styles.urlRow}>
          <div className={styles.urlBox} onClick={copyUrl}>
            {inviteUrl || '...'}
          </div>
          <GlowButton variant="ghost" onClick={shareInvite} style={{ flexShrink: 0 }}>
            {'\u{1F4E4}'} SHARE
          </GlowButton>
        </div>
        {copiedUrl && <span className={styles.copied}>Link copied!</span>}
      </div>

      {/* Player list */}
      <div className={styles.playersList}>
        <span className={styles.codeLabel}>Players ({players.length})</span>
        {players.map((p) => {
          const color = PLAYER_COLORS[p.joinOrder] || PLAYER_COLORS[1];
          return (
            <div key={p.id} className={styles.playerRow}>
              <div className={styles.playerDot} style={{ background: color.main, boxShadow: color.glow }} />
              <span className={styles.playerName}>
                {p.name} {p.id === myId ? '(You)' : ''}
              </span>
              {p.id === players[0]?.id && <span className={styles.hostBadge}>HOST</span>}
              <span className={`${styles.readyBadge} ${p.isReady ? styles.ready : styles.waiting}`}>
                {p.isReady ? 'Ready' : 'Waiting'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        {isHost ? (
          <GlowButton
            onClick={handleStartGame}
            disabled={players.length < 2 || loading}
          >
            {loading ? 'STARTING...' : 'START GAME'}
          </GlowButton>
        ) : (
          <GlowButton variant="cyan" onClick={toggleReady}>
            {players.find(p => p.id === myId)?.isReady ? 'NOT READY' : 'READY'}
          </GlowButton>
        )}
        <GlowButton variant="ghost" onClick={() => { useGameStore.getState().resetGame(); setScreen('lobby'); }}>
          LEAVE
        </GlowButton>
      </div>
    </div>
  );
}
