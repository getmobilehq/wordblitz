import { useState, useCallback, useEffect, useRef } from 'react';
import useGameStore from '../store/gameStore';
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
    room, players, wordQueue, currentIndex, scrambledWord,
    gamePhase, roundResult, transcript, setTranscript,
    setRoundResult, updatePlayer, setCurrentWord, setScreen, setGamePhase,
  } = store;

  const [manualAnswer, setManualAnswer] = useState('');
  const [currentPlayerTurn, setCurrentPlayerTurn] = useState(0);
  const answerInputRef = useRef(null);

  const totalRounds = room?.rounds || wordQueue.length;
  const timerTotal = room?.timerSeconds || 15;
  const currentWord = wordQueue[currentIndex] || '';
  const categoryData = room?.category ? WORD_BANKS[room.category] : null;

  // Handle correct answer
  const handleCorrectAnswer = useCallback((playerId) => {
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
    setRoundResult({
      winnerId: null,
      winnerName: null,
      correctWord: currentWord,
    });
  }, [currentWord, setRoundResult]);

  // Timer hook
  const { timeLeft } = useTimer(handleTimeout);

  // Voice recognition
  const handleVoiceResult = useCallback((text, isFinal) => {
    setTranscript(text);
    if (checkAnswer(text, currentWord)) {
      // In local mode, current player gets the point
      const activePlayer = players[currentPlayerTurn] || players[0];
      handleCorrectAnswer(activePlayer.id);
    }
  }, [currentWord, players, currentPlayerTurn, handleCorrectAnswer, setTranscript]);

  const { isSupported: voiceSupported } = useSpeech({
    onResult: handleVoiceResult,
    active: gamePhase === 'listening',
    onError: () => {},
  });

  // Manual answer submit
  const handleManualSubmit = () => {
    if (!manualAnswer.trim()) return;
    if (checkAnswer(manualAnswer, currentWord)) {
      const activePlayer = players[currentPlayerTurn] || players[0];
      handleCorrectAnswer(activePlayer.id);
    }
    setManualAnswer('');
  };

  // Advance to next round after result
  useEffect(() => {
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
  }, [gamePhase, currentIndex, totalRounds, wordQueue, setCurrentWord, setGamePhase, setScreen]);

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

        {/* Voice transcript */}
        {voiceSupported && gamePhase === 'listening' && (
          <div className={styles.transcript}>
            {transcript || 'Listening...'}
          </div>
        )}

        {/* Manual answer */}
        {gamePhase === 'listening' && (
          <div className={styles.manualSection}>
            <span className={styles.manualLabel}>
              {players.length > 1
                ? `${(players[currentPlayerTurn] || players[0]).name}'s turn to type`
                : 'Type your answer'}
            </span>
            <div className={styles.manualInput}>
              <input
                ref={answerInputRef}
                className={styles.answerInput}
                value={manualAnswer}
                onChange={(e) => setManualAnswer(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
                placeholder="TYPE ANSWER"
                maxLength={30}
              />
              <GlowButton variant="cyan" onClick={handleManualSubmit}>
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
