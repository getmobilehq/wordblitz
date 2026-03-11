import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import useGameStore from '../store/gameStore';
import { scrambleWord } from '../lib/scramble';

export function useRoom(roomId) {
  const channelRef = useRef(null);

  useEffect(() => {
    if (!roomId || !supabase) return;
    const store = useGameStore.getState;

    const channel = supabase.channel(`room:${roomId}`, {
      config: { broadcast: { ack: true }, presence: { key: store().myId } }
    });

    channel
      .on('broadcast', { event: 'game:start' }, ({ payload }) => {
        const s = store();
        s.initGame(payload.word_queue, payload.config);
        s.setScreen('countdown');
      })
      .on('broadcast', { event: 'round:start' }, ({ payload }) => {
        store().setCurrentWord(payload.word_index, payload.scrambled_word);
      })
      .on('broadcast', { event: 'round:won' }, ({ payload }) => {
        const s = store();
        s.setRoundResult({
          winnerId: payload.winner_id,
          winnerName: payload.winner_name,
          correctWord: payload.correct_word,
        });
        s.updatePlayer(payload.winner_id, { score: payload.new_score });

        // After 2.5s result display, advance to next round or finish
        setTimeout(() => {
          const current = store();
          if (payload.game_over) {
            current.setScreen('results');
          } else {
            const nextIndex = payload.next_index;
            const nextWord = current.wordQueue[nextIndex];
            if (nextWord) {
              // Use nextIndex as seed so both clients get the same scramble
              const scrambled = scrambleWord(nextWord, nextIndex * 7919 + 42);
              current.setCurrentWord(nextIndex, scrambled);
            }
          }
        }, 2500);
      })
      .on('broadcast', { event: 'round:timeout' }, ({ payload }) => {
        const s = store();
        s.setRoundResult({ winnerId: null, winnerName: null, correctWord: payload.correct_word });

        // Advance after timeout too
        setTimeout(() => {
          const current = store();
          if (payload.game_over) {
            current.setScreen('results');
          } else if (payload.next_index != null) {
            const nextWord = current.wordQueue[payload.next_index];
            if (nextWord) {
              const scrambled = scrambleWord(nextWord, payload.next_index * 7919 + 42);
              current.setCurrentWord(payload.next_index, scrambled);
            }
          }
        }, 2500);
      })
      .on('broadcast', { event: 'player:joined' }, ({ payload }) => {
        store().addPlayer(payload.player);
      })
      .on('broadcast', { event: 'player:ready' }, ({ payload }) => {
        store().updatePlayer(payload.player_id, { isReady: payload.is_ready });
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
