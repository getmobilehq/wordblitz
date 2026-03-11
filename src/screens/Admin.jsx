import { useState, useEffect, useCallback } from 'react';
import useGameStore from '../store/gameStore';
import { supabase } from '../lib/supabase';
import styles from './Admin.module.css';

export default function Admin() {
  const setScreen = useGameStore(s => s.setScreen);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    if (!supabase) { setError('Supabase not configured'); setLoading(false); return; }
    setLoading(true);
    setError('');
    try {
      // Fetch all rooms with their players
      const { data: rooms, error: roomErr } = await supabase
        .from('rooms')
        .select('*')
        .order('created_at', { ascending: false });
      if (roomErr) throw roomErr;

      // Fetch all players
      const { data: players, error: playerErr } = await supabase
        .from('room_players')
        .select('*');
      if (playerErr) throw playerErr;

      // Fetch game events for duration/winner info
      const { data: events, error: evtErr } = await supabase
        .from('game_events')
        .select('*');
      if (evtErr) throw evtErr;

      // Combine data
      const enriched = (rooms || []).map(room => {
        const roomPlayers = (players || []).filter(p => p.room_id === room.id);
        const roomEvents = (events || []).filter(e => e.room_id === room.id);

        const startEvent = roomEvents.find(e => e.event_type === 'game_start');
        const lastEvent = roomEvents.length
          ? roomEvents.reduce((a, b) => new Date(a.created_at) > new Date(b.created_at) ? a : b)
          : null;

        let durationMs = 0;
        if (startEvent && lastEvent && startEvent !== lastEvent) {
          durationMs = new Date(lastEvent.created_at) - new Date(startEvent.created_at);
        }

        // Find winner (player with highest score)
        const winner = roomPlayers.length
          ? roomPlayers.reduce((a, b) => (a.score || 0) > (b.score || 0) ? a : b)
          : null;

        const roundsWon = roomEvents.filter(e => e.event_type === 'round_won');

        return {
          ...room,
          players: roomPlayers,
          events: roomEvents,
          durationMs,
          winner: winner?.score > 0 ? winner : null,
          roundsPlayed: roundsWon.length,
        };
      });

      setGames(enriched);
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Computed stats ──
  const totalGames = games.length;
  const finishedGames = games.filter(g => g.status === 'finished');
  const activeGames = games.filter(g => g.status === 'playing');
  const uniquePlayers = new Set(games.flatMap(g => g.players.map(p => p.user_id)));
  const totalRounds = games.reduce((sum, g) => sum + g.roundsPlayed, 0);

  const avgDuration = finishedGames.length
    ? finishedGames.reduce((sum, g) => sum + g.durationMs, 0) / finishedGames.length
    : 0;

  // Category breakdown
  const categoryMap = {};
  games.forEach(g => {
    const cat = g.category || 'unknown';
    categoryMap[cat] = (categoryMap[cat] || 0) + 1;
  });
  const categories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);

  function formatDuration(ms) {
    if (!ms) return '--';
    const secs = Math.floor(ms / 1000);
    if (secs < 60) return `${secs}s`;
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}m ${rem}s`;
  }

  function formatDate(iso) {
    if (!iso) return '--';
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' })
      + ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Admin Dashboard</h1>
        </div>
        <div className={styles.loading}>Loading game data...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Admin Dashboard</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className={styles.refreshBtn} onClick={fetchData}>Refresh</button>
          <button className={styles.backBtn} onClick={() => setScreen('splash')}>Back</button>
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {/* Summary Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{totalGames}</span>
          <span className={styles.statLabel}>Total Games</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{finishedGames.length}</span>
          <span className={styles.statLabel}>Completed</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{activeGames.length}</span>
          <span className={styles.statLabel}>Active Now</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{uniquePlayers.size}</span>
          <span className={styles.statLabel}>Unique Players</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{totalRounds}</span>
          <span className={styles.statLabel}>Rounds Played</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{formatDuration(avgDuration)}</span>
          <span className={styles.statLabel}>Avg Duration</span>
        </div>
      </div>

      {/* Category Breakdown */}
      {categories.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Categories</h2>
          <div className={styles.categoryGrid}>
            {categories.map(([cat, count]) => (
              <div key={cat} className={styles.categoryChip}>
                <span className={styles.categoryName}>{cat}</span>
                <span className={styles.categoryCount}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Games Table */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>All Games ({totalGames})</h2>
        {games.length === 0 ? (
          <p className={styles.empty}>No games have been created yet.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Status</th>
                  <th>Category</th>
                  <th>Rounds</th>
                  <th>Players</th>
                  <th>Winner</th>
                  <th>Duration</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {games.map(game => (
                  <tr key={game.id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{game.code}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${
                        game.status === 'waiting' ? styles.statusWaiting
                          : game.status === 'playing' ? styles.statusPlaying
                          : styles.statusFinished
                      }`}>
                        {game.status}
                      </span>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{game.category || '--'}</td>
                    <td>{game.roundsPlayed}/{game.rounds}</td>
                    <td>
                      <div className={styles.playerList}>
                        {game.players.map(p => (
                          <span
                            key={p.id}
                            className={game.winner?.id === p.id ? styles.winnerTag : styles.playerTag}
                          >
                            {p.display_name} ({p.score || 0})
                          </span>
                        ))}
                        {game.players.length === 0 && <span className={styles.playerTag}>--</span>}
                      </div>
                    </td>
                    <td style={{ color: game.winner ? 'var(--color-gold)' : 'var(--color-steel)' }}>
                      {game.winner?.display_name || '--'}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{formatDuration(game.durationMs)}</td>
                    <td>{formatDate(game.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
