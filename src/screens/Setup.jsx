import { useState } from 'react';
import useGameStore from '../store/gameStore';
import { WORD_BANKS, CATEGORIES, getWordPool } from '../data/wordBanks';
import { scrambleWord } from '../lib/scramble';
import CategoryCard from '../components/CategoryCard';
import GlowButton from '../components/GlowButton';
import styles from './Setup.module.css';

const ROUND_OPTIONS = [5, 8, 10, 15];
const TIMER_OPTIONS = [10, 15, 20];
const DIFFICULTY_OPTIONS = ['easy', 'mixed', 'hard'];

export default function Setup() {
  const { setScreen, setRoom, initGame, players } = useGameStore();
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [rounds, setRounds] = useState(8);
  const [timerSeconds, setTimerSeconds] = useState(15);
  const [difficulty, setDifficulty] = useState('mixed');

  const pool = getWordPool(category, difficulty);

  const handleStart = () => {
    // Build word queue from pool
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const wordQueue = shuffled.slice(0, rounds);
    const seed = Date.now();

    const config = { category, rounds, timerSeconds, difficulty };
    setRoom({ id: 'local', code: 'LOCAL', status: 'playing', ...config });
    initGame(wordQueue, config);

    // Set first word
    const firstWord = wordQueue[0];
    const scrambled = scrambleWord(firstWord, seed);
    useGameStore.getState().setCurrentWord(0, scrambled);

    setScreen('countdown');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Game Setup</h1>
        <p className={styles.subtitle}>{players.length} players ready</p>
      </div>

      <div className={styles.section}>
        <span className={styles.sectionLabel}>Category</span>
        <div className={styles.categoryGrid}>
          {CATEGORIES.map(cat => (
            <CategoryCard
              key={cat}
              category={cat}
              categoryData={WORD_BANKS[cat]}
              selected={category === cat}
              onClick={() => setCategory(cat)}
              wordCount={getWordPool(cat, difficulty).length}
            />
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <span className={styles.sectionLabel}>Rounds</span>
        <div className={styles.pillRow}>
          {ROUND_OPTIONS.map(n => (
            <button
              key={n}
              className={`${styles.pill} ${rounds === n ? styles.active : ''}`}
              onClick={() => setRounds(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <span className={styles.sectionLabel}>Timer (seconds)</span>
        <div className={styles.pillRow}>
          {TIMER_OPTIONS.map(n => (
            <button
              key={n}
              className={`${styles.pill} ${timerSeconds === n ? styles.active : ''}`}
              onClick={() => setTimerSeconds(n)}
            >
              {n}s
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <span className={styles.sectionLabel}>Difficulty</span>
        <div className={styles.pillRow}>
          {DIFFICULTY_OPTIONS.map(d => (
            <button
              key={d}
              className={`${styles.pill} ${difficulty === d ? styles.active : ''}`}
              onClick={() => setDifficulty(d)}
            >
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <p className={styles.poolInfo}>{pool.length} words available</p>

      <div className={styles.actions}>
        <GlowButton variant="ghost" onClick={() => setScreen('lobby')}>
          BACK
        </GlowButton>
        <GlowButton onClick={handleStart} disabled={pool.length < rounds}>
          START GAME
        </GlowButton>
      </div>
    </div>
  );
}
