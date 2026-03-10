import { useEffect, useRef } from 'react';
import useGameStore from '../store/gameStore';

export function useTimer(onExpire) {
  const { gamePhase, timeLeft, tickTimer } = useGameStore();
  const intervalRef = useRef(null);

  useEffect(() => {
    if (gamePhase !== 'listening') {
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      const current = useGameStore.getState().timeLeft;
      if (current <= 1) {
        clearInterval(intervalRef.current);
        onExpire?.();
      } else {
        tickTimer();
      }
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [gamePhase]);

  return { timeLeft };
}
