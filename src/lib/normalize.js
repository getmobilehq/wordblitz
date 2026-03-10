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
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}
