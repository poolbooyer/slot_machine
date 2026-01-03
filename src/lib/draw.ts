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

// 履歴を管理する純関数群（テストしやすくするためUIから分離）
export type DrawRecord = {
  value: number;
  timestamp: number; // epoch millis
};

export function appendRecord(
  history: DrawRecord[],
  record: DrawRecord,
  limit?: number
): DrawRecord[] {
  const next = [record, ...history];
  if (typeof limit === 'number' && limit > 0) {
    return next.slice(0, limit);
  }
  return next;
}

// 履歴に出現した番号を除外した候補配列を作成
export function buildCandidates(min: number, max: number, history: DrawRecord[]): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) throw new Error('min/max must be finite numbers');
  if (Math.floor(min) !== min || Math.floor(max) !== max) throw new Error('min/max must be integers');
  if (max < min) throw new Error('max must be >= min');

  const used = new Set<number>(history.map(h => h.value));
  const candidates: number[] = [];
  for (let n = min; n <= max; n++) {
    if (!used.has(n)) candidates.push(n);
  }
  return candidates;
}

// 候補からランダムに1つ選ぶ（候補が無ければ例外）
export function drawFromCandidates(candidates: number[]): number {
  if (candidates.length === 0) {
    throw new Error('No candidates left');
  }
  const idx = Math.floor(Math.random() * candidates.length);
  return candidates[idx];
}
