import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import useGameStore from '../store/gameStore';

export function useRoom(roomId) {
  const channelRef = useRef(null);
  const store = useGameStore();

  useEffect(() => {
    if (!roomId || !supabase) return;
    const channel = supabase.channel(`room:${roomId}`, {
      config: { broadcast: { ack: true }, presence: { key: store.myId } }
    });

    channel
      .on('broadcast', { event: 'game:start' }, ({ payload }) => {
        store.initGame(payload.word_queue, payload.config);
        store.setScreen('countdown');
      })
      .on('broadcast', { event: 'round:start' }, ({ payload }) => {
        store.setCurrentWord(payload.word_index, payload.scrambled_word);
      })
      .on('broadcast', { event: 'round:won' }, ({ payload }) => {
        store.setRoundResult({
          winnerId: payload.winner_id,
          winnerName: payload.winner_name,
          correctWord: payload.correct_word,
        });
        store.updatePlayer(payload.winner_id, { score: payload.new_score });
        if (payload.game_over) {
          setTimeout(() => store.setScreen('results'), 2500);
        }
      })
      .on('broadcast', { event: 'round:timeout' }, ({ payload }) => {
        store.setRoundResult({ winnerId: null, winnerName: null, correctWord: payload.correct_word });
      })
      .on('broadcast', { event: 'player:joined' }, ({ payload }) => {
        store.addPlayer(payload.player);
      })
      .on('broadcast', { event: 'player:ready' }, ({ payload }) => {
        store.updatePlayer(payload.player_id, { isReady: payload.is_ready });
      })
      .subscribe();

    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); };
  }, [roomId]);

  const broadcast = useCallback((event, payload) => {
    channelRef.current?.send({ type: 'broadcast', event, payload });
  }, []);

  return { broadcast };
}
