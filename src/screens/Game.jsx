import { useState, useCallback, useEffect, useRef } from 'react';
import useGameStore from '../store/gameStore';
import { supabase } from '../lib/supabase';
import { useRoom } from '../hooks/useRoom';
import { useSpeech } from '../hooks/useSpeech';
import { useTimer } from '../hooks/useTimer';
import { checkAnswer } from '../lib/normalize';
import { scrambleWord } from '../lib/scramble';
import { PLAYER_COLORS } from '../components/PlayerColors';
import { WORD_BANKS } from '../data/wordBanks';
import LetterTile from '../components/LetterTile';
import RadialTimer from '../components/RadialTimer';
import VoiceWave from '../components/VoiceWave';
import ScoreOrb from '../components/ScoreOrb';
import GlowButton from '../components/GlowButton';
import styles from './Game.module.css';

export default function Game() {
  const store = useGameStore();
  const {
    room, players, myId, wordQueue, currentIndex, scrambledWord,
    gamePhase, roundResult, transcript, setTranscript,
    setRoundResult, updatePlayer, setCurrentWord, setScreen, setGamePhase,
  } = store;

  const [manualAnswer, setManualAnswer] = useState('');
  const [currentPlayerTurn, setCurrentPlayerTurn] = useState(0);
  const [micActive, setMicActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const answerInputRef = useRef(null);

  const isOnline = room && room.id !== 'local' && !!supabase;
  const totalRounds = room?.rounds || wordQueue.length;
  const timerTotal = room?.timerSeconds || 15;
  const currentWord = wordQueue[currentIndex] || '';
  const categoryData = room?.category ? WORD_BANKS[room.category] : null;

  // Subscribe to room channel for real-time sync (online mode)
  useRoom(isOnline ? room?.id : null);

  // ── Online: submit answer to server ──
  const submitOnlineAnswer = useCallback(async (answer) => {
    if (!isOnline || submitting || gamePhase !== 'listening') return;
    if (!checkAnswer(answer, currentWord)) return;

    setSubmitting(true);
    try {
      // Find this player's room_players ID
      const { data: rp } = await supabase
        .from('room_players')
        .select('id')
        .eq('room_id', room.id)
        .eq('user_id', myId)
        .single();

      if (!rp) return;

      const { data, error } = await supabase.functions.invoke('validate-answer', {
        body: {
          room_id: room.id,
          player_id: rp.id,
          answer,
          timestamp_ms: Date.now(),
        },
      });

      if (error) console.error('validate-answer error:', error);

      // If already won by someone else, the broadcast will handle it
      // If we won, the broadcast will also handle it for both players
    } catch (err) {
      console.error('Submit answer failed:', err);
    } finally {
      setSubmitting(false);
    }
  }, [isOnline, submitting, gamePhase, currentWord, room?.id, myId]);

  // ── Local: handle correct answer ──
  const handleLocalCorrectAnswer = useCallback((playerId) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    updatePlayer(playerId, { score: player.score + 1 });
    setRoundResult({
      winnerId: playerId,
      winnerName: player.name,
      correctWord: currentWord,
    });
  }, [currentWord, players, updatePlayer, setRoundResult]);

  // Handle timeout
  const handleTimeout = useCallback(() => {
    if (isOnline) {
      // In online mode, timeout should be handled server-side
      // For now, show timeout locally — server will also broadcast
      setRoundResult({
        winnerId: null,
        winnerName: null,
        correctWord: currentWord,
      });
    } else {
      setRoundResult({
        winnerId: null,
        winnerName: null,
        correctWord: currentWord,
      });
    }
  }, [currentWord, setRoundResult, isOnline]);

  // Timer hook
  const { timeLeft } = useTimer(handleTimeout);

  // Voice recognition — feeds spoken words into the answer input
  const handleVoiceResult = useCallback((text, isFinal) => {
    setTranscript(text);
    const spoken = text.toUpperCase().replace(/[^A-Z]/g, '');
    if (spoken) setManualAnswer(spoken);

    if (checkAnswer(text, currentWord)) {
      if (isOnline) {
        submitOnlineAnswer(text);
      } else {
        const activePlayer = players[currentPlayerTurn] || players[0];
        handleLocalCorrectAnswer(activePlayer.id);
      }
    }
  }, [currentWord, players, currentPlayerTurn, handleLocalCorrectAnswer, setTranscript, isOnline, submitOnlineAnswer]);

  const { isSupported: voiceSupported } = useSpeech({
    onResult: handleVoiceResult,
    active: gamePhase === 'listening' && micActive,
    onError: () => {},
  });

  // Manual answer submit
  const handleManualSubmit = () => {
    if (!manualAnswer.trim()) return;
    if (isOnline) {
      submitOnlineAnswer(manualAnswer);
    } else if (checkAnswer(manualAnswer, currentWord)) {
      const activePlayer = players[currentPlayerTurn] || players[0];
      handleLocalCorrectAnswer(activePlayer.id);
    }
    setManualAnswer('');
  };

  // ── Local mode only: advance to next round after result ──
  useEffect(() => {
    if (isOnline) return; // Online mode advances via useRoom broadcast
    if (gamePhase !== 'result') return;
    const timer = setTimeout(() => {
      const nextIndex = currentIndex + 1;
      if (nextIndex >= totalRounds) {
        setGamePhase('finished');
        setScreen('results');
      } else {
        const nextWord = wordQueue[nextIndex];
        const scrambled = scrambleWord(nextWord, Date.now() + nextIndex);
        setCurrentWord(nextIndex, scrambled);
        setManualAnswer('');
        setCurrentPlayerTurn(0);
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [isOnline, gamePhase, currentIndex, totalRounds, wordQueue, setCurrentWord, setGamePhase, setScreen]);

  // Reset answer input when round changes
  useEffect(() => {
    setManualAnswer('');
  }, [currentIndex]);

  // Focus input when listening
  useEffect(() => {
    if (gamePhase === 'listening' && answerInputRef.current) {
      answerInputRef.current.focus();
    }
  }, [gamePhase, currentIndex]);

  const tiles = scrambledWord.split('');
  const revealTiles = currentWord.split('');

  return (
    <div className={styles.container}>
      {/* Score orbs */}
      <div className={styles.topBar}>
        {players.map(p => {
          const color = PLAYER_COLORS[p.joinOrder] || PLAYER_COLORS[1];
          return (
            <ScoreOrb
              key={p.id}
              name={p.name}
              score={p.score}
              color={color.main}
              dimColor={color.dim}
              glowShadow={color.glow}
            />
          );
        })}
        <span className={styles.roundBadge}>
          {currentIndex + 1} / {totalRounds}
        </span>
      </div>

      {/* Progress strip */}
      <div className={styles.progressStrip}>
        {Array.from({ length: totalRounds }, (_, i) => (
          <div
            key={i}
            className={`${styles.progressDot} ${
              i < currentIndex ? styles.done : i === currentIndex ? styles.current : ''
            }`}
          />
        ))}
      </div>

      {/* Category chip */}
      {categoryData && (
        <div className={styles.categoryChip}>
          <span>{categoryData.icon}</span>
          <span>{room?.category?.replace(/^.+\s/, '')}</span>
        </div>
      )}

      {/* Main game card */}
      <div className={styles.gameCard}>
        {/* Letter tiles */}
        <div className={styles.tilesRow}>
          {tiles.map((letter, i) => (
            <LetterTile
              key={`${currentIndex}-${i}`}
              letter={letter}
              revealLetter={revealTiles[i]}
              flipped={gamePhase === 'result'}
              result={roundResult?.winnerId ? 'correct' : 'timeout'}
              delay={i * 60}
            />
          ))}
        </div>

        {/* Timer + Voice wave */}
        <div className={styles.middleSection}>
          <RadialTimer timeLeft={timeLeft} totalTime={timerTotal} />
          <VoiceWave
            active={gamePhase === 'listening' && voiceSupported}
            color={categoryData?.color || 'var(--color-cyan)'}
          />
        </div>

        {/* Answer input — type or speak */}
        {gamePhase === 'listening' && (
          <div className={styles.manualSection}>
            <span className={styles.manualLabel}>
              {micActive && voiceSupported
                ? 'Speak or type your answer'
                : players.length > 1 && !isOnline
                  ? `${(players[currentPlayerTurn] || players[0]).name}'s turn`
                  : 'Type your answer'}
            </span>
            <div className={styles.manualInput}>
              {voiceSupported && (
                <button
                  className={`${styles.micBtn} ${micActive ? styles.micActive : ''}`}
                  onClick={() => setMicActive(v => !v)}
                  title={micActive ? 'Mute mic' : 'Enable mic'}
                  type="button"
                >
                  {micActive ? '\u{1F3A4}' : '\u{1F507}'}
                </button>
              )}
              <input
                ref={answerInputRef}
                className={styles.answerInput}
                value={manualAnswer}
                onChange={(e) => setManualAnswer(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
                placeholder={submitting ? 'CHECKING...' : micActive && voiceSupported ? 'LISTENING...' : 'TYPE ANSWER'}
                maxLength={30}
                disabled={submitting}
              />
              <GlowButton variant="cyan" onClick={handleManualSubmit} disabled={submitting}>
                GO
              </GlowButton>
            </div>
          </div>
        )}

        {/* Round result overlay */}
        {gamePhase === 'result' && roundResult && (
          <div className={styles.resultOverlay}>
            <div
              className={styles.resultWord}
              style={{ color: roundResult.winnerId ? 'var(--color-volt)' : 'var(--color-steel)' }}
            >
              {roundResult.correctWord}
            </div>
            {roundResult.winnerId ? (
              <div className={styles.resultWinner} style={{
                color: PLAYER_COLORS[
                  players.find(p => p.id === roundResult.winnerId)?.joinOrder || 1
                ]?.main
              }}>
                {roundResult.winnerName} got it!
              </div>
            ) : (
              <div className={`${styles.resultWinner} ${styles.resultTimeout}`}>
                Time's up!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
