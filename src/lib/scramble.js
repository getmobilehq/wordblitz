export function scrambleWord(word, seed = null) {
  const arr = word.split('');
  let scrambled;
  let attempts = 0;
  const rng = seed !== null ? seededRandom(seed) : Math.random;
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
