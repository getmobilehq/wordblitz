import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';

const useGameStore = create(immer(persist((set, get) => ({
  // ── Navigation
  screen: 'splash',
  setScreen: (s) => set(state => { state.screen = s; }),

  // ── Player identity (persisted)
  myId: crypto.randomUUID(),
  myName: '',
  setMyName: (name) => set(state => { state.myName = name; }),

  // ── Room
  room: null,
  setRoom: (room) => set(state => { state.room = room; }),
  clearRoom: () => set(state => { state.room = null; }),

  // ── Players in room
  players: [],
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
  gamePhase: 'idle',
  roundResult: null,
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
