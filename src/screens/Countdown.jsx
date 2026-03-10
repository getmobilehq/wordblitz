import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import useGameStore from '../store/gameStore';
import { scrambleWord } from '../lib/scramble';
import { WORD_BANKS } from '../data/wordBanks';
import styles from './Countdown.module.css';

export default function Countdown() {
  const { room, wordQueue, setScreen, setCurrentWord } = useGameStore();
  const containerRef = useRef(null);
  const categoryRef = useRef(null);
  const numberRef = useRef(null);
  const [display, setDisplay] = useState('');
  const [isGo, setIsGo] = useState(false);

  const categoryData = room?.category ? WORD_BANKS[room.category] : null;
  const categoryColor = categoryData?.color || '#D4AF37';

  useEffect(() => {
    const tl = gsap.timeline();

    // Category reveal
    tl.to(categoryRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'power2.out',
    });

    // 3 - 2 - 1 - GO!
    const counts = ['3', '2', '1'];
    counts.forEach((num) => {
      tl.call(() => { setDisplay(num); setIsGo(false); })
        .set(numberRef.current, { opacity: 0, scale: 0.3 })
        .to(numberRef.current, {
          opacity: 1,
          scale: 1.15,
          duration: 0.3,
          ease: 'back.out(1.7)',
        })
        .to(numberRef.current, {
          scale: 1,
          duration: 0.15,
          ease: 'power2.out',
        })
        .to(numberRef.current, {
          opacity: 0,
          scale: 0.8,
          duration: 0.25,
          delay: 0.3,
          ease: 'power2.in',
        });
    });

    // GO!
    tl.call(() => { setDisplay('GO!'); setIsGo(true); })
      .set(numberRef.current, { opacity: 0, scale: 0.3 })
      .to(numberRef.current, {
        opacity: 1,
        scale: 1.15,
        duration: 0.3,
        ease: 'back.out(2)',
      })
      .to(numberRef.current, {
        scale: 1,
        duration: 0.15,
      })
      .to(numberRef.current, {
        opacity: 0,
        delay: 0.5,
        duration: 0.3,
      })
      .call(() => {
        // Start first round
        const seed = Date.now();
        const firstWord = wordQueue[0];
        if (firstWord) {
          setCurrentWord(0, scrambleWord(firstWord, seed));
        }
        setScreen('game');
      });

    return () => tl.kill();
  }, []);

  return (
    <div className={styles.container} ref={containerRef}>
      <div
        className={styles.bgFlash}
        style={{ background: categoryColor }}
      />

      <div
        ref={categoryRef}
        className={styles.categoryReveal}
        style={{ color: categoryColor, transform: 'translateY(-20px)' }}
      >
        {categoryData?.icon} {room?.category?.replace(/^.+\s/, '')}
      </div>

      <div
        ref={numberRef}
        className={`${styles.number} ${isGo ? styles.go : ''}`}
      >
        {display}
      </div>
    </div>
  );
}
