import { useEffect } from 'react';
import useGameStore from './store/gameStore';
import { ensureAnonymousAuth } from './lib/supabase';
import Splash from './screens/Splash';
import Lobby from './screens/Lobby';
import Setup from './screens/Setup';
import WaitingRoom from './screens/WaitingRoom';
import Countdown from './screens/Countdown';
import Game from './screens/Game';
import Results from './screens/Results';

const screens = {
  splash: Splash,
  lobby: Lobby,
  setup: Setup,
  waiting: WaitingRoom,
  countdown: Countdown,
  game: Game,
  results: Results,
};

export default function App() {
  const screen = useGameStore(s => s.screen);

  useEffect(() => {
    ensureAnonymousAuth().catch(() => {});
    // Handle deep link /join?code=XXXXX
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      useGameStore.getState().setScreen('lobby');
      sessionStorage.setItem('joinCode', code.toUpperCase());
    }
  }, []);

  const Screen = screens[screen] || Splash;

  return (
    <div style={{ minHeight: '100svh', position: 'relative', overflow: 'hidden' }}>
      <Screen />
    </div>
  );
}
