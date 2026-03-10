# WORDBLITZ — CLAUDE CODE MASTER BUILD PROMPT
# ═══════════════════════════════════════════════════════════════════════════════
# Copy this entire file as the initial prompt to Claude Code.
# Claude Code should read this in full before writing a single line of code.
# ═══════════════════════════════════════════════════════════════════════════════

---

## MISSION

Build **WordBlitz** — a production-ready, real-time multiplayer voice-powered word unscrambling PWA. Two or more players join a shared room and race to shout the correct unscrambled word first. Voice recognition via Web Speech API detects the winner. The app is a Progressive Web App built with React + Vite + Supabase Realtime.

This is a complete, deployable application. Build everything end-to-end: all screens, all components, all hooks, Supabase schema and Edge Functions, PWA config, and the full Volcanic Chrome design system. Do not scaffold placeholders — every screen must be fully implemented and functional.

---

## CONSTRAINTS & APPROACH

- **Single-pass build**: Scaffold the complete project structure first, then implement each module fully before moving to the next.
- **No placeholders**: Every component must render real UI and handle real state. No `// TODO` markers in final code.
- **Mobile-first**: All layouts designed for 375px viewport upward. Touch targets ≥ 44px.
- **Voice + fallback**: Every round has both voice detection AND manual tap-to-answer. Never block gameplay on microphone availability.
- **Design fidelity**: Implement the Volcanic Chrome design system exactly as specified. No generic white backgrounds, no Inter font, no purple gradients.

---

## TECH STACK

```
React 18 + Vite 5
vite-plugin-pwa (Workbox)
Zustand 4 (state management)
Supabase JS v2 (auth + realtime + database + edge functions)
GSAP 3 (animations — countdown, tile flip orchestration)
CSS Modules + CSS custom properties (no Tailwind)
Google Fonts: BricolageGrotesque, Lora, InstrumentSans, GeistMono (self-hosted via @fontsource)
qrcode (QR code generation)
html2canvas (share card PNG generation)
Sentry (error tracking)
```

---

## INITIALISATION COMMANDS

Run these in sequence to scaffold the project:

```bash
npm create vite@latest wordblitz -- --template react
cd wordblitz
npm install

# Core dependencies
npm install @supabase/supabase-js zustand gsap qrcode html2canvas @sentry/react

# PWA
npm install -D vite-plugin-pwa workbox-window

# Fonts
npm install @fontsource/bricolage-grotesque @fontsource/lora @fontsource/instrument-sans @fontsource/geist-mono

# Dev tools
npm install -D eslint eslint-plugin-react @vitejs/plugin-react
```

---

## ENVIRONMENT VARIABLES

Create `.env.local`:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SENTRY_DSN=your_sentry_dsn
VITE_APP_URL=https://wordblitz.app
```

---

## COMPLETE FILE STRUCTURE

Build every file in this tree:

```
wordblitz/
├── public/
│   ├── manifest.json
│   ├── offline.html
│   └── icons/
│       ├── icon-72.png        (generate programmatically or use placeholder)
│       ├── icon-96.png
│       ├── icon-128.png
│       ├── icon-192.png
│       └── icon-512.png
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── screens/
│   │   ├── Splash.jsx
│   │   ├── Lobby.jsx
│   │   ├── Setup.jsx
│   │   ├── WaitingRoom.jsx
│   │   ├── Countdown.jsx
│   │   ├── Game.jsx
│   │   └── Results.jsx
│   ├── components/
│   │   ├── LetterTile.jsx
│   │   ├── ScoreOrb.jsx
│   │   ├── RadialTimer.jsx
│   │   ├── VoiceWave.jsx
│   │   ├── CategoryCard.jsx
│   │   ├── ParticleField.jsx
│   │   ├── RoomCode.jsx
│   │   ├── QRCodeDisplay.jsx
│   │   ├── GlowButton.jsx
│   │   ├── PillToggle.jsx
│   │   └── PlayerList.jsx
│   ├── hooks/
│   │   ├── useSpeech.js
│   │   ├── useRoom.js
│   │   └── useTimer.js
│   ├── store/
│   │   └── gameStore.js
│   ├── lib/
│   │   ├── supabase.js
│   │   ├── scramble.js
│   │   ├── normalize.js
│   │   ├── roomCode.js
│   │   └── shareCard.js
│   ├── data/
│   │   └── wordBanks.js
│   └── styles/
│       ├── tokens.css
│       ├── global.css
│       └── animations.css
├── supabase/
│   ├── functions/
│   │   ├── create-room/index.ts
│   │   ├── start-game/index.ts
│   │   └── validate-answer/index.ts
│   └── migrations/
│       └── 001_initial_schema.sql
├── vite.config.js
├── .env.local
├── .env.example
└── package.json
```

---

## DESIGN SYSTEM — VOLCANIC CHROME

Implement these exactly. Every CSS token must be defined in `styles/tokens.css` and used consistently.

### Colour Tokens

```css
:root {
  /* Surfaces — matte obsidian stack */
  --color-void:        #04040A;
  --color-obsidian:    #07080F;
  --color-matte-1:     #0C0D12;
  --color-matte-2:     #10121A;
  --color-matte-3:     #161C2E;
  --color-matte-4:     #1E2438;
  --color-matte-5:     #262D44;

  /* Chromatic accents — luminous, glow-capable */
  --color-gold:        #D4AF37;
  --color-gold-pale:   #EBD470;
  --color-gold-dark:   #8C6E1E;
  --color-cyan:        #00D4FF;
  --color-cyan-dim:    rgba(0,212,255,0.15);
  --color-coral:       #FF4D6D;
  --color-coral-dim:   rgba(255,77,109,0.15);
  --color-volt:        #AAFF00;
  --color-volt-dim:    rgba(170,255,0,0.12);
  --color-violet:      #B464FF;
  --color-violet-dim:  rgba(180,100,255,0.12);
  --color-ember:       #FF8C28;
  --color-ember-dim:   rgba(255,140,40,0.12);

  /* Text */
  --color-white-95:    rgba(255,255,255,0.95);
  --color-white-70:    rgba(255,255,255,0.70);
  --color-white-40:    rgba(255,255,255,0.40);
  --color-white-15:    rgba(255,255,255,0.15);
  --color-seam:        rgba(255,255,255,0.07);
  --color-steel:       #8A96AA;
  --color-steel-dim:   #505868;

  /* Typography */
  --font-display:  'BricolageGrotesque', sans-serif;
  --font-serif:    'Lora', serif;
  --font-ui:       'InstrumentSans', sans-serif;
  --font-mono:     'GeistMono', monospace;

  /* Spacing */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px;
  --space-4: 16px; --space-5: 20px; --space-6: 24px;
  --space-8: 32px; --space-10: 40px; --space-12: 48px;
  --space-16: 64px;

  /* Radii */
  --radius-sm:   8px;
  --radius-md:   12px;
  --radius-card: 20px;
  --radius-tile: 14px;
  --radius-pill: 100px;

  /* Shadows */
  --shadow-card:       0 20px 60px rgba(0,0,0,0.65);
  --shadow-tile:       0 6px 0 rgba(0,0,0,0.5), 0 10px 24px rgba(0,0,0,0.4);
  --shadow-glow-cyan:  0 0 24px rgba(0,212,255,0.40), 0 0 48px rgba(0,212,255,0.15);
  --shadow-glow-coral: 0 0 24px rgba(255,77,109,0.40), 0 0 48px rgba(255,77,109,0.15);
  --shadow-glow-gold:  0 0 20px rgba(212,175,55,0.45), 0 0 40px rgba(212,175,55,0.15);
  --shadow-glow-volt:  0 0 20px rgba(170,255,0,0.40),  0 0 40px rgba(170,255,0,0.12);

  /* Easing */
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-snap:   cubic-bezier(0.25, 0, 0, 1);
  --ease-out:    cubic-bezier(0, 0, 0.2, 1);
}
```

### Player Colour Assignment (by join order)

```javascript
export const PLAYER_COLORS = {
  1: { main: '#00D4FF', dim: 'rgba(0,212,255,0.15)', glow: '0 0 24px rgba(0,212,255,0.4)' },
  2: { main: '#FF4D6D', dim: 'rgba(255,77,109,0.15)', glow: '0 0 24px rgba(255,77,109,0.4)' },
  3: { main: '#AAFF00', dim: 'rgba(170,255,0,0.12)',  glow: '0 0 24px rgba(170,255,0,0.4)' },
  4: { main: '#B464FF', dim: 'rgba(180,100,255,0.12)',glow: '0 0 24px rgba(180,100,255,0.4)'},
  5: { main: '#FF8C28', dim: 'rgba(255,140,40,0.12)', glow: '0 0 24px rgba(255,140,40,0.4)' },
  6: { main: '#D4AF37', dim: 'rgba(212,175,55,0.12)', glow: '0 0 24px rgba(212,175,55,0.4)' },
};
```

---

## DATA — WORD BANKS

`src/data/wordBanks.js` — export this object exactly:

```javascript
export const WORD_BANKS = {
  "📖 Bible Books": {
    icon: "📖", color: "#B464FF",
    words: {
      easy:   ["RUTH","JOB","ACTS","AMOS","JOEL","JOHN","MARK","LUKE","EZRA","TITUS","JAMES"],
      medium: ["GENESIS","EXODUS","JUDGES","SAMUEL","KINGS","PSALMS","ISAIAH","DANIEL","ROMANS","MATTHEW","REVELATION"],
      hard:   ["LEVITICUS","NUMBERS","DEUTERONOMY","CHRONICLES","NEHEMIAH","PROVERBS","ECCLESIASTES","EZEKIEL","PHILIPPIANS","COLOSSIANS","THESSALONIANS","CORINTHIANS","GALATIANS","EPHESIANS","HABAKKUK","ZEPHANIAH"]
    }
  },
  "🦁 Animals": {
    icon: "🦁", color: "#FF8C28",
    words: {
      easy:   ["CAT","DOG","FOX","OWL","APE","ELK","GNU","YAK","EMU","COD","RAM"],
      medium: ["ELEPHANT","GIRAFFE","PENGUIN","DOLPHIN","CHEETAH","PANTHER","GORILLA","OCTOPUS","FLAMINGO","PLATYPUS","SCORPION"],
      hard:   ["RHINOCEROS","HIPPOPOTAMUS","CHIMPANZEE","ORANGUTAN","CHAMELEON","CROCODILE","WOLVERINE","PORCUPINE","ARMADILLO","NARWHAL","ALBATROSS","MONGOOSE","PIRANHA"]
    }
  },
  "🌍 Countries": {
    icon: "🌍", color: "#00D4FF",
    words: {
      easy:   ["CHAD","IRAN","IRAQ","CUBA","PERU","TOGO","FIJI","LAOS","MALI","OMAN","NIUE"],
      medium: ["NIGERIA","ETHIOPIA","TANZANIA","ZIMBABWE","CAMEROON","SENEGAL","VIETNAM","THAILAND","INDONESIA","COLOMBIA","PORTUGAL"],
      hard:   ["MOZAMBIQUE","MADAGASCAR","AFGHANISTAN","PHILIPPINES","KAZAKHSTAN","UZBEKISTAN","AZERBAIJAN","GUATEMALA","NICARAGUA","BANGLADESH","BOTSWANA","NAMIBIA"]
    }
  },
  "🏙️ Capitals": {
    icon: "🏙️", color: "#AAFF00",
    words: {
      easy:   ["ROME","LIMA","OSLO","RIGA","BERN","KIEV","DOHA","LIMA","OSLO","SUVA","NIUE"],
      medium: ["LONDON","PARIS","BERLIN","MADRID","NAIROBI","ACCRA","ABUJA","BANGKOK","JAKARTA","MANILA","ANKARA"],
      hard:   ["REYKJAVIK","AMSTERDAM","STOCKHOLM","COPENHAGEN","HELSINKI","ISLAMABAD","ANTANANARIVO","ADDISABABA","OUAGADOUGOU","ULAANBAATAR","BRATISLAVA"]
    }
  },
  "🍎 Fruits": {
    icon: "🍎", color: "#FF4D6D",
    words: {
      easy:   ["FIG","PLUM","LIME","PEAR","KIWI","DATE","GUAVA","MANGO","PEACH","GRAPE","LEMON"],
      medium: ["APRICOT","CHERRY","PAPAYA","LYCHEE","COCONUT","AVOCADO","NECTARINE","PLANTAIN","MULBERRY","STARFRUIT","TAMARIND"],
      hard:   ["STRAWBERRY","BLUEBERRY","RASPBERRY","BLACKBERRY","CRANBERRY","PINEAPPLE","WATERMELON","CANTALOUPE","POMEGRANATE","PERSIMMON","MANGOSTEEN","DRAGONFRUIT","RAMBUTAN","JACKFRUIT","SOURSOP"]
    }
  },
  "🎬 Movies": {
    icon: "🎬", color: "#D4AF37",
    words: {
      easy:   ["JAWS","TRON","THOR","COCO","MULAN","AVATAR","LOKI","VENOM","BAMBI"],
      medium: ["INCEPTION","GLADIATOR","BRAVEHEART","TITANIC","AQUAMAN","ENCANTO","MOANA","ALADDIN","HERCULES","BEETLEJUICE","RATATOUILLE"],
      hard:   ["INTERSTELLAR","TERMINATOR","GHOSTBUSTERS","PREDATOR","PINOCCHIO","LABYRINTH","FANTASTIC","WOLVERINE","CINDERELLA","ANASTASIA","FANTASIA"]
    }
  }
};

export const CATEGORIES = Object.keys(WORD_BANKS);

export function getWordPool(category, difficulty = 'mixed') {
  const bank = WORD_BANKS[category];
  if (!bank) return [];
  if (difficulty === 'mixed') return [...bank.words.easy, ...bank.words.medium, ...bank.words.hard];
  return bank.words[difficulty] || bank.words.medium;
}
```

---

## CORE UTILITIES

### `src/lib/scramble.js`

```javascript
export function scrambleWord(word, seed = null) {
  const arr = word.split('');
  let scrambled;
  let attempts = 0;
  const rng = seed ? seededRandom(seed) : Math.random;
  do {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    scrambled = arr.join('');
    attempts++;
  } while (scrambled === word && attempts < 30);
  return scrambled;
}

function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}
```

### `src/lib/normalize.js`

```javascript
export function normalizeAnswer(text) {
  return text.toUpperCase().replace(/[^A-Z]/g, '').trim();
}

export function checkAnswer(transcript, targetWord) {
  const norm = normalizeAnswer(transcript);
  const target = normalizeAnswer(targetWord);
  return norm.includes(target) || (norm.length >= target.length - 1 && levenshtein(norm, target) <= 1);
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}
```

### `src/lib/roomCode.js`

```javascript
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function generateRoomCode(length = 6) {
  return Array.from({ length }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');
}
export function formatCode(code) {
  return code.slice(0, 3) + '-' + code.slice(3);
}
```

---

## ZUSTAND STORE

### `src/store/gameStore.js`

Implement a Zustand store with these slices. Use `immer` middleware for nested updates.

```javascript
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';

const useGameStore = create(immer(persist((set, get) => ({
  // ── Navigation
  screen: 'splash',        // splash|lobby|setup|waiting|countdown|game|results
  setScreen: (s) => set(state => { state.screen = s; }),

  // ── Player identity (persisted)
  myId: null,
  myName: '',
  setMyName: (name) => set(state => { state.myName = name; }),

  // ── Room
  room: null,              // { id, code, status, category, rounds, timerSeconds, difficulty }
  setRoom: (room) => set(state => { state.room = room; }),
  clearRoom: () => set(state => { state.room = null; }),

  // ── Players in room
  players: [],             // [{ id, name, score, streak, isReady, isConnected, joinOrder }]
  setPlayers: (players) => set(state => { state.players = players; }),
  updatePlayer: (id, patch) => set(state => {
    const idx = state.players.findIndex(p => p.id === id);
    if (idx >= 0) Object.assign(state.players[idx], patch);
  }),
  addPlayer: (player) => set(state => { state.players.push(player); }),

  // ── Game state
  wordQueue: [],
  currentIndex: 0,
  scrambledWord: '',
  timeLeft: 15,
  gamePhase: 'idle',       // idle|countdown|listening|result|finished
  roundResult: null,       // { winnerId, winnerName, correctWord } | null
  transcript: '',
  countdownValue: null,

  // ── Actions
  initGame: (wordQueue, config) => set(state => {
    state.wordQueue = wordQueue;
    state.currentIndex = 0;
    state.scrambledWord = '';
    state.timeLeft = config.timerSeconds;
    state.gamePhase = 'countdown';
    state.roundResult = null;
    state.transcript = '';
    state.players.forEach(p => { p.score = 0; p.streak = 0; });
  }),
  setCurrentWord: (index, scrambled) => set(state => {
    state.currentIndex = index;
    state.scrambledWord = scrambled;
    state.gamePhase = 'listening';
    state.roundResult = null;
    state.transcript = '';
    state.timeLeft = state.room?.timerSeconds || 15;
  }),
  setRoundResult: (result) => set(state => {
    state.roundResult = result;
    state.gamePhase = 'result';
  }),
  setTranscript: (text) => set(state => { state.transcript = text; }),
  tickTimer: () => set(state => { if (state.timeLeft > 0) state.timeLeft -= 1; }),
  setGamePhase: (phase) => set(state => { state.gamePhase = phase; }),
  setCountdown: (n) => set(state => { state.countdownValue = n; }),

  // ── Reset
  resetGame: () => set(state => {
    state.room = null; state.players = []; state.wordQueue = [];
    state.currentIndex = 0; state.scrambledWord = ''; state.timeLeft = 15;
    state.gamePhase = 'idle'; state.roundResult = null; state.transcript = '';
    state.countdownValue = null;
  }),
}), { name: 'wordblitz-storage', partialize: (s) => ({ myId: s.myId, myName: s.myName }) })));

export default useGameStore;
```

---

## SUPABASE CLIENT

### `src/lib/supabase.js`

```javascript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: { persistSession: true, autoRefreshToken: true },
    realtime: { params: { eventsPerSecond: 10 } }
  }
);

export async function ensureAnonymousAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) throw error;
    return data.user;
  }
  return session.user;
}
```

---

## HOOKS

### `src/hooks/useSpeech.js`

```javascript
import { useEffect, useRef, useCallback } from 'react';

export function useSpeech({ onResult, active, onError }) {
  const recRef = useRef(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  const isSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => {
    if (!isSupported) { onError?.('not_supported'); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.maxAlternatives = 3;
    recRef.current = rec;

    rec.onresult = (event) => {
      if (!activeRef.current) return;
      let bestTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        bestTranscript = event.results[i][0].transcript;
        onResult?.(bestTranscript, event.results[i].isFinal);
      }
    };
    rec.onerror = (e) => {
      if (e.error === 'not-allowed') onError?.('permission_denied');
      else if (e.error === 'no-speech') { /* silent */ }
      else onError?.(e.error);
    };
    rec.onend = () => {
      if (activeRef.current) {
        try { rec.start(); } catch (_) {}
      }
    };
    return () => { try { rec.abort(); } catch (_) {} };
  }, []);

  useEffect(() => {
    const rec = recRef.current;
    if (!rec) return;
    if (active) { try { rec.start(); } catch (_) {} }
    else         { try { rec.stop();  } catch (_) {} }
  }, [active]);

  return { isSupported };
}
```

### `src/hooks/useRoom.js`

```javascript
import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import useGameStore from '../store/gameStore';

export function useRoom(roomId) {
  const channelRef = useRef(null);
  const store = useGameStore();

  useEffect(() => {
    if (!roomId) return;
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
      })
      .on('broadcast', { event: 'round:timeout' }, ({ payload }) => {
        store.setRoundResult({ winnerId: null, correctWord: payload.correct_word });
      })
      .on('broadcast', { event: 'game:end' }, ({ payload }) => {
        store.setGamePhase('finished');
        store.setScreen('results');
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_players', filter: `room_id=eq.${roomId}` }, (payload) => {
        if (payload.eventType === 'INSERT') store.addPlayer(payload.new);
        else if (payload.eventType === 'UPDATE') store.updatePlayer(payload.new.id, payload.new);
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
```

### `src/hooks/useTimer.js`

```javascript
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
      const currentTime = useGameStore.getState().timeLeft;
      if (currentTime <= 1) {
        clearInterval(intervalRef.current);
        onExpire?.();
      } else {
        tickTimer();
      }
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [gamePhase]);
}
```

---

## COMPONENT SPECIFICATIONS

### `LetterTile.jsx`

CSS 3D flip tile. Two faces: front (scrambled letter on dark matte) and back (correct letter revealed, green if correct / red if timeout).

Props: `{ letter, index, revealed, correct, animDelay }`

Implementation requirements:
- `transform-style: preserve-3d` wrapper div with `perspective: 400px`
- Animate entry: `translateY(-40px) rotateX(-90deg)` → normal, delay = `index * 60ms`
- Flip on `revealed`: `rotateY(180deg)` with spring easing
- Front face: `--color-matte-3` background, `--color-seam` border, letter in BricolageGrotesque Bold, white text, coloured crown strip at top matching player colour
- Back face: `rotateY(180deg)`, `backface-visibility: hidden`, green bg for correct, coral for timeout
- 3D shadow: bottom offset block `--color-void` to simulate physical depth
- Gloss: semi-transparent white gradient on top 30% of tile face

### `ScoreOrb.jsx`

Props: `{ player, active, justScored }`

Requirements:
- Circular, radial gradient from `--color-matte-4` (centre) to player colour (edge)
- Specular highlight: small white ellipse top-left at 25% opacity
- Outer glow ring (pulsing animation, 1.5s cycle) when `active === true`
- Score number centred in BigShoulders Bold
- `justScored` triggers: scale to 1.4 → back to 1.0 with bounce easing, duration 500ms
- Player name below orb in InstrumentSans

### `RadialTimer.jsx`

Props: `{ timeLeft, total, warningAt = 7, criticalAt = 3 }`

Requirements:
- SVG circle, `r=32`, `stroke-dasharray` = circumference
- Background circle: `rgba(255,255,255,0.08)`
- Active arc: stroked from `--color-volt` (full) → `--color-gold` (50%) → `--color-coral` (critical)
- Transition: `stroke-dashoffset 0.95s linear` per tick
- `filter: drop-shadow(0 0 6px currentColor)` on active arc
- Number centred: colour matches arc colour, BricolageGrotesque Bold

### `VoiceWave.jsx`

Props: `{ active, color }`

Requirements:
- 12 vertical bars, rounded tops
- Inactive: 20% height, 0.3 opacity
- Active: each bar animates between 20%–100% height independently, different animation durations (0.4s–0.9s), `animation-direction: alternate`, `animation-timing-function: ease-in-out`
- Bar colours: gradient from `color` across the 12 bars (first bar = colour, last bar = colour at 60% brightness)

### `CategoryCard.jsx`

Props: `{ category, categoryData, selected, onClick }`

Requirements:
- Dark matte card, `--color-matte-3` background
- On hover: lift `translateY(-3px)`, subtle shadow increase
- On selected: `translateY(-5px)`, player volt border `2px solid --color-volt`, volt glow box-shadow, volt indicator dot row below name
- Category emoji at 32px
- Category name in InstrumentSans Bold, uppercase, tracked
- Word count badge: small pill, `--color-matte-5` bg, steel text
- `transition: all 0.22s var(--ease-bounce)`

### `GlowButton.jsx`

Props: `{ children, onClick, variant, disabled, color, size }`

Variants:
- `primary`: gold gradient fill `linear-gradient(135deg, #D4AF37, #EBD470)`, text `#04040A`, gold glow on hover
- `ghost`: transparent, 1px seam border, white-60 text, subtle bg on hover
- `danger`: coral-dim fill, coral border, coral text, coral glow on hover
- `cyan`: cyan fill with dark text, cyan glow

All variants: no border-radius default from browser, `font-family: var(--font-ui)`, uppercase, letter-spacing 2px, `transition: all 0.2s var(--ease-bounce)`, hover lifts `translateY(-2px)`, active depresses `translateY(1px)`.

### `ParticleField.jsx`

Canvas element, fixed position, `z-index: 0`, `pointer-events: none`.

Requirements:
- 55 particles at random positions
- Each particle: circle, radius 0.5–2.5px, random hue (full spectrum), opacity 0.1–0.5
- Animation: each particle drifts at vx/vy ≤ ±0.3px per frame
- Wrap at canvas edges
- `requestAnimationFrame` loop with cleanup on unmount
- Resize handler updates canvas dimensions

---

## SCREEN IMPLEMENTATIONS

### `Splash.jsx`

- Full-screen dark matte background with `ParticleField`
- Two radial glow blobs: cyan top-left, coral bottom-right, `position: fixed, pointer-events: none`
- Logo: two spans — "WORD" (BricolageGrotesque, cyan) and "BLITZ" (BricolageGrotesque, coral), both with text-shadow glow
- Tagline: "SAY IT FASTER." in Lora Italic, gold colour
- Sub: "THE MULTIPLAYER VOICE WORD GAME" in Jura/GeistMono, steel, letter-spacing 4px
- Feature pills: Voice-first · Real-time · Family-safe (ghost pill style)
- CTA: `<GlowButton variant="primary" size="large">TAP TO PLAY</GlowButton>`
- Entry animation: everything fades + slides up on mount (staggered, CSS animation)
- PWA install prompt: renders if `window.deferredInstallPrompt` is set, shown as bottom sheet with "Add to Home Screen" button

### `Lobby.jsx`

- Back arrow top-left
- "ENTER PLAYERS" heading in BricolageGrotesque
- Player name input cards: dark matte card per player, border colour = player colour
- Two inputs by default; "+ Add Player" button adds more up to 6
- Each input autofocuses on add
- Names saved to store on change
- Bottom: `<GlowButton variant="primary">NEXT: PICK CATEGORY →</GlowButton>` — disabled until 2+ names
- On submit: if VITE_SUPABASE_URL set → create-room Edge Function call → navigate to WaitingRoom. Otherwise → navigate direct to Setup for local/offline play.

### `Setup.jsx`

- Back arrow
- "GAME SETTINGS" heading
- Category grid: 2 columns CSS Grid, `CategoryCard` per category
- Round count `PillToggle`: options `[5, 8, 10, 15]`, default 8
- Timer `PillToggle`: options `[10, 15, 20]` with "s" suffix, default 15
- Difficulty `PillToggle`: options `['Easy', 'Mixed', 'Hard']`, default Mixed
- Word pool info chip: "Drawing from N words" — computed from selection
- `<GlowButton variant="primary" disabled={!selectedCategory}>START GAME ⚡</GlowButton>`
- On start: shuffle word queue (client seed) → if solo/local → Countdown → Game. If multiplayer → call start-game Edge Function.

### `WaitingRoom.jsx`

- Room code: `<RoomCode code={room.code} />` — gold monospace display, tap-to-copy, copies full join URL
- QR code: `<QRCodeDisplay value={joinUrl} />`
- Share button: Web Share API with join URL; fallback copies to clipboard
- "PLAYERS" section header
- `<PlayerList players={players} myId={myId} />` — real-time from Supabase
- Host sees "START GAME" button (enabled when ≥ 2 players present); calls start-game function
- Guest sees "READY" toggle button; updates `room_players.is_ready`
- Animated pulse dot on each player avatar when they toggle ready

### `Countdown.jsx`

- Full-screen
- Category name and emoji animate in from top
- GSAP timeline: "3" drops in (scale 0.3→1.15→1.0) → fade → "2" → "1" → "GO!" with coral flash
- Each number: BricolageGrotesque, 96px minimum, white glow shadow
- Background pulses with category colour on each beat
- After "GO!": trigger first round:start, navigate to Game screen

### `Game.jsx`

This is the most complex screen. Implement fully.

Layout (mobile portrait):
```
[ ScoreOrb P1 ] [ ScoreOrb P2 ] ... [ Round N/8 ]
[──────── progress strip ────────────────────────]
          [ category chip ]
┌────────────────────────────────────────────────┐
│  UNSCRAMBLE THIS                [RadialTimer]  │
│                                                │
│  [ W ] [ O ] [ R ] [ D ] [ B ] [ L ]  ...     │
│                                                │
│  "heard: word blur..."  [VoiceWave]            │
└────────────────────────────────────────────────┘
[ P1 tap button ]          [ P2 tap button ]
```

On `gamePhase === 'result'`:
- Overlay the main card with result content
- Winner: letter tiles flip to green faces sequentially
- Timeout: flip to coral faces
- Show winner name with glow animation or "TIME'S UP" text
- Score orb bounces if that player won
- After 2.5s: auto-advance to next round or game end

Voice integration:
- `useSpeech` active when `gamePhase === 'listening'`
- On match detected: call `validateAnswer` Edge Function immediately with timestamp
- Lock further submission with `useRef` lock flag
- `setTranscript` on each interim result

Timer integration:
- `useTimer` active when `gamePhase === 'listening'`
- On expire: submit timeout event to Supabase, set round result locally

### `Results.jsx`

- Trophy emoji drop-in (GSAP scale 0.2→1.3→1.0)
- "GAME OVER" label
- Winner announcement or "IT'S A DRAW!"
- Player score cards sorted by score, winner card elevated and gold-bordered
- Each card: rank medal emoji, score number (BigShoulders, player colour), name, accuracy %
- Share card: `<ShareCard players={...} category={...} />` rendered off-screen; export as PNG on share button click
- Two CTAs: Rematch (same players, new word queue) and Main Menu (reset store, go to lobby)

---

## SUPABASE SCHEMA

### `supabase/migrations/001_initial_schema.sql`

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ROOMS
CREATE TABLE rooms (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  code            TEXT        NOT NULL UNIQUE,
  host_id         UUID        REFERENCES auth.users(id),
  status          TEXT        NOT NULL DEFAULT 'waiting'
                              CHECK (status IN ('waiting','playing','finished','abandoned')),
  category        TEXT        NOT NULL,
  rounds          INTEGER     NOT NULL DEFAULT 8,
  timer_seconds   INTEGER     NOT NULL DEFAULT 15,
  difficulty      TEXT        NOT NULL DEFAULT 'mixed',
  word_queue      TEXT[]      DEFAULT '{}',
  current_index   INTEGER     NOT NULL DEFAULT 0,
  seed            INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '2 hours'
);

-- ROOM PLAYERS
CREATE TABLE room_players (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id         UUID        NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id         UUID        NOT NULL REFERENCES auth.users(id),
  display_name    TEXT        NOT NULL,
  score           INTEGER     NOT NULL DEFAULT 0,
  streak          INTEGER     NOT NULL DEFAULT 0,
  is_ready        BOOLEAN     NOT NULL DEFAULT false,
  is_connected    BOOLEAN     NOT NULL DEFAULT true,
  join_order      INTEGER     NOT NULL DEFAULT 1,
  last_seen       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- GAME EVENTS
CREATE TABLE game_events (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id         UUID        NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  event_type      TEXT        NOT NULL,
  player_id       UUID        REFERENCES room_players(id),
  word_index      INTEGER,
  answer_hash     TEXT,
  answer_correct  BOOLEAN,
  response_ms     INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ROW LEVEL SECURITY
ALTER TABLE rooms         ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_players  ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_events   ENABLE ROW LEVEL SECURITY;

-- Rooms: anyone can read; only authenticated users can create
CREATE POLICY "rooms_read"   ON rooms FOR SELECT USING (true);
CREATE POLICY "rooms_insert" ON rooms FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "rooms_update" ON rooms FOR UPDATE USING (auth.uid() = host_id);

-- Room players: anyone can read; authenticated users can insert/update their own
CREATE POLICY "rp_read"   ON room_players FOR SELECT USING (true);
CREATE POLICY "rp_insert" ON room_players FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "rp_update" ON room_players FOR UPDATE USING (auth.uid() = user_id);

-- Game events: readable by all; insertable only via service role (Edge Functions)
CREATE POLICY "ge_read" ON game_events FOR SELECT USING (true);

-- Indexes
CREATE INDEX idx_rooms_code        ON rooms(code);
CREATE INDEX idx_rooms_status      ON rooms(status);
CREATE INDEX idx_rp_room           ON room_players(room_id);
CREATE INDEX idx_ge_room           ON game_events(room_id, word_index);
```

---

## EDGE FUNCTIONS

### `supabase/functions/create-room/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function generateCode(len = 6) {
  return Array.from({ length: len }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');
}

serve(async (req) => {
  try {
    const { display_name, category, rounds = 8, timer_seconds = 15, difficulty = 'mixed' } = await req.json();
    const authHeader = req.headers.get('Authorization');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader! } } }
    );
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    let code, exists = true;
    while (exists) {
      code = generateCode();
      const { data } = await supabase.from('rooms').select('id').eq('code', code).single();
      exists = !!data;
    }

    const { data: room, error } = await supabase.from('rooms').insert({
      code, host_id: user.id, category, rounds, timer_seconds, difficulty, status: 'waiting'
    }).select().single();
    if (error) throw error;

    await supabase.from('room_players').insert({
      room_id: room.id, user_id: user.id, display_name, join_order: 1, is_ready: true
    });

    return new Response(JSON.stringify({ room_id: room.id, code: room.code }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
```

### `supabase/functions/validate-answer/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const { room_id, player_id, answer, timestamp_ms } = await req.json();
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get room and validate status
    const { data: room } = await supabase.from('rooms').select('*').eq('id', room_id).single();
    if (!room || room.status !== 'playing') return new Response(JSON.stringify({ error: 'Invalid room' }), { status: 400 });

    // Check this round not already won
    const { data: existingWin } = await supabase.from('game_events')
      .select('id').eq('room_id', room_id).eq('word_index', room.current_index).eq('answer_correct', true).single();
    if (existingWin) return new Response(JSON.stringify({ already_won: true }), { status: 409 });

    // Validate answer
    const correctWord = room.word_queue[room.current_index];
    const normalised = answer.toUpperCase().replace(/[^A-Z]/g, '');
    const isCorrect = normalised.includes(correctWord.toUpperCase());
    if (!isCorrect) return new Response(JSON.stringify({ correct: false }), { status: 200 });

    // Record win
    await supabase.from('game_events').insert({
      room_id, player_id, event_type: 'round_won', word_index: room.current_index,
      answer_correct: true, response_ms: timestamp_ms
    });

    // Update player score
    const { data: player } = await supabase.from('room_players').select('score, display_name').eq('id', player_id).single();
    await supabase.from('room_players').update({ score: (player?.score || 0) + 1 }).eq('id', player_id);

    // Broadcast round result
    await supabase.channel(`room:${room_id}`).send({
      type: 'broadcast', event: 'round:won',
      payload: {
        winner_id: player_id, winner_name: player?.display_name,
        correct_word: correctWord, new_score: (player?.score || 0) + 1,
        next_index: room.current_index + 1,
        game_over: room.current_index + 1 >= room.rounds
      }
    });

    // Advance round or end game
    if (room.current_index + 1 >= room.rounds) {
      await supabase.from('rooms').update({ status: 'finished' }).eq('id', room_id);
    } else {
      await supabase.from('rooms').update({ current_index: room.current_index + 1 }).eq('id', room_id);
    }

    return new Response(JSON.stringify({ correct: true, winner: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
```

---

## PWA CONFIGURATION

### `public/manifest.json`

```json
{
  "name": "WordBlitz",
  "short_name": "WordBlitz",
  "description": "Real-time multiplayer voice word game. Say it faster.",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#07080F",
  "theme_color": "#D4AF37",
  "icons": [
    { "src": "/icons/icon-72.png",  "sizes": "72x72",   "type": "image/png" },
    { "src": "/icons/icon-96.png",  "sizes": "96x96",   "type": "image/png" },
    { "src": "/icons/icon-128.png", "sizes": "128x128", "type": "image/png" },
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ],
  "categories": ["games", "entertainment"],
  "screenshots": [],
  "share_target": {
    "action": "/join",
    "method": "GET",
    "params": { "title": "title", "text": "text", "url": "url" }
  }
}
```

### `vite.config.js`

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'offline.html'],
      manifest: false, // use public/manifest.json
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-cache', expiration: { maxEntries: 10, maxAgeSeconds: 60*60*24*365 } }
          },
          {
            urlPattern: /\/data\/wordBanks\.js/,
            handler: 'CacheFirst',
            options: { cacheName: 'word-banks', expiration: { maxEntries: 1, maxAgeSeconds: 60*60*24*30 } }
          }
        ],
        navigateFallback: '/offline.html',
        navigateFallbackDenylist: [/^\/api/, /^\/functions/]
      }
    })
  ]
});
```

---

## ANIMATIONS KEYFRAMES

### `src/styles/animations.css`

```css
/* Entry animations */
@keyframes fadeIn      { from { opacity: 0 } to { opacity: 1 } }
@keyframes slideUp     { from { opacity: 0; transform: translateY(28px) } to { opacity: 1; transform: none } }
@keyframes slideDown   { from { opacity: 0; transform: translateY(-20px) } to { opacity: 1; transform: none } }
@keyframes scaleIn     { from { opacity: 0; transform: scale(0.85) } to { opacity: 1; transform: scale(1) } }
@keyframes bounceIn    { 0% { transform: scale(0.2); opacity: 0 } 60% { transform: scale(1.15) } 100% { transform: scale(1); opacity: 1 } }

/* Letter tile */
@keyframes tileDropIn  { from { transform: translateY(-40px) rotateX(-90deg); opacity: 0 } to { transform: none; opacity: 1 } }
@keyframes tileFlip    { from { transform: rotateY(0deg) } to { transform: rotateY(180deg) } }

/* Score orb */
@keyframes orbPulse    { 0%,100% { transform: scale(1); opacity: 0.6 } 50% { transform: scale(1.12); opacity: 1 } }
@keyframes orbBounce   { 0% { transform: scale(1) } 30% { transform: scale(1.4) } 60% { transform: scale(0.95) } 100% { transform: scale(1) } }

/* Countdown */
@keyframes countPop    { 0% { transform: scale(0.1); opacity: 0 } 60% { transform: scale(1.2) } 100% { transform: scale(1); opacity: 1 } }
@keyframes bgFlash     { 0% { opacity: 0 } 20% { opacity: 0.12 } 100% { opacity: 0 } }

/* Voice wave */
@keyframes waveBar     { from { transform: scaleY(0.2) } to { transform: scaleY(1) } }

/* Glow pulse */
@keyframes glowPulse   { 0%,100% { box-shadow: var(--shadow-glow-cyan) } 50% { box-shadow: 0 0 40px rgba(0,212,255,0.7), 0 0 80px rgba(0,212,255,0.3) } }

/* Streak fire */
@keyframes flicker     { 0%,100% { transform: scaleY(1) rotate(-2deg) } 50% { transform: scaleY(1.1) rotate(2deg) } }
```

---

## GLOBAL STYLES

### `src/styles/global.css`

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html, body, #root {
  height: 100%;
  width: 100%;
  overflow-x: hidden;
}

body {
  background: var(--color-obsidian);
  color: var(--color-white-95);
  font-family: var(--font-ui);
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: transparent;
  overscroll-behavior: none;
}

/* Scrollbar — dark matte style */
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: var(--color-matte-1); }
::-webkit-scrollbar-thumb { background: var(--color-matte-5); border-radius: 2px; }

/* Input reset */
input {
  background: transparent;
  border: none;
  outline: none;
  color: var(--color-white-95);
  font-family: var(--font-ui);
}
input::placeholder { color: var(--color-white-30); }

/* Button reset */
button {
  cursor: pointer;
  border: none;
  background: none;
  font-family: var(--font-ui);
}
button:disabled { cursor: not-allowed; opacity: 0.4; }

/* Focus visible */
:focus-visible {
  outline: 2px solid var(--color-gold);
  outline-offset: 3px;
  border-radius: 4px;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## APP ENTRY & ROUTING

### `src/App.jsx`

```jsx
import { useEffect } from 'react';
import useGameStore from './store/gameStore';
import { ensureAnonymousAuth } from './lib/supabase';
import Splash      from './screens/Splash';
import Lobby       from './screens/Lobby';
import Setup       from './screens/Setup';
import WaitingRoom from './screens/WaitingRoom';
import Countdown   from './screens/Countdown';
import Game        from './screens/Game';
import Results     from './screens/Results';

export default function App() {
  const screen = useGameStore(s => s.screen);

  useEffect(() => {
    ensureAnonymousAuth().catch(console.error);
    // Handle deep link /join?code=XXXXX
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    if (code) {
      useGameStore.getState().setScreen('lobby');
      // Store code for Lobby to pick up
      sessionStorage.setItem('joinCode', code.toUpperCase());
    }
  }, []);

  const screens = { splash: Splash, lobby: Lobby, setup: Setup,
    waiting: WaitingRoom, countdown: Countdown, game: Game, results: Results };
  const Screen = screens[screen] || Splash;

  return (
    <div style={{ minHeight: '100svh', position: 'relative', overflow: 'hidden' }}>
      <Screen />
    </div>
  );
}
```

### `src/main.jsx`

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/tokens.css';
import './styles/global.css';
import './styles/animations.css';
import '@fontsource/bricolage-grotesque/700.css';
import '@fontsource/lora/400-italic.css';
import '@fontsource/instrument-sans/400.css';
import '@fontsource/instrument-sans/700.css';
import '@fontsource/geist-mono/400.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
);
```

---

## BUILD & QUALITY GATES

Before marking the build complete, verify all of these pass:

```bash
# Development
npm run dev                    # Should start on localhost:5173

# Build
npm run build                  # Zero warnings or errors
npm run preview                # Preview production build

# Lighthouse (run against preview)
# PWA score ≥ 90
# Performance ≥ 80 on mobile
# Accessibility ≥ 90

# Manual verification checklist:
# [ ] Splash screen loads with particle field and animated logo
# [ ] Player names persist in localStorage on page refresh
# [ ] Category selection highlights correctly
# [ ] Scrambled word never equals original word (run 100 times mentally)
# [ ] Letter tiles animate in with stagger on each new round
# [ ] Radial timer counts down from config value to 0
# [ ] Voice recognition activates (check browser permission prompt)
# [ ] Tap-to-answer buttons work independently of microphone
# [ ] Score orbs update and bounce on point award
# [ ] Results screen shows correct winner and scores
# [ ] App installs to home screen (test on Android Chrome)
# [ ] Offline mode shows cached word bank (disable network in DevTools)
```

---

## OFFLINE FALLBACK

### `public/offline.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>WordBlitz — Offline</title>
  <style>
    body { margin:0; background:#07080F; color:#fff; font-family:sans-serif;
           display:flex; flex-direction:column; align-items:center; justify-content:center;
           min-height:100vh; text-align:center; padding:24px; }
    h1 { font-size:48px; letter-spacing:-1px; margin-bottom:8px; }
    .word { color:#00D4FF; } .blitz { color:#FF4D6D; }
    p { color:rgba(255,255,255,0.5); max-width:320px; line-height:1.6; }
    button { margin-top:32px; padding:16px 32px; background:#D4AF37; color:#07080F;
             border:none; border-radius:12px; font-weight:700; font-size:14px;
             letter-spacing:2px; cursor:pointer; }
  </style>
</head>
<body>
  <h1><span class="word">WORD</span><span class="blitz">BLITZ</span></h1>
  <p>You're offline. Connect to the internet to play multiplayer, or open the app to play solo practice mode.</p>
  <button onclick="window.location.reload()">TRY AGAIN</button>
</body>
</html>
```

---

## COMPLETION CRITERIA

The build is complete when:

1. All 7 screens render without errors
2. Single-device local game plays end-to-end: Splash → Lobby → Setup → Countdown → 8 rounds of Game → Results
3. Voice recognition activates during game rounds (Chrome desktop or Android Chrome)
4. Tap-to-answer fallback works independently
5. Letter tiles animate in, flip correctly on round end
6. Score orbs update and bounce after each correct answer
7. Radial timer counts down and triggers timeout correctly
8. Results screen shows correct winner with accurate scores and accuracy percentage
9. `npm run build` completes with no errors
10. App manifest and service worker registered (check DevTools Application tab)
11. Supabase schema migrated and Edge Functions deployed (if Supabase configured)
12. All CSS tokens in use — zero hardcoded hex colours in component files

---

*WordBlitz — Volcanic Chrome Design System — Build this exactly.*
