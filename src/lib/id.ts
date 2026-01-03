// 安全なID生成ユーティリティ：crypto.randomUUID が無い環境でも動作
export function generateId(): string {
  const g = globalThis as any;
  if (g?.crypto?.randomUUID) {
    return g.crypto.randomUUID();
  }
  // フォールバック（十分ユニークでテスト向き）
  return `id_${Date.now()}_${Math.floor(Math.random() * 1e9)}`;
}
