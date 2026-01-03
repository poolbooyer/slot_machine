// ランダムな整数を生成する純関数（最小値min〜最大値maxの範囲、両端含む）
export function drawRandomInt(min: number, max: number): number {
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    throw new Error('min/max must be finite numbers');
  }
  if (Math.floor(min) !== min || Math.floor(max) !== max) {
    throw new Error('min/max must be integers');
  }
  if (max < min) {
    throw new Error('max must be >= min');
  }
  // 0 <= r < 1 の乱数を使用し、範囲にスケーリング
  const range = max - min + 1; // 包含範囲
  const r = Math.floor(Math.random() * range);
  return min + r;
}