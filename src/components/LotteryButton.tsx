import { useState } from 'react';
import { appendRecord, buildCandidates, drawFromCandidates, type DrawRecord } from '../lib/draw';

type LotteryButtonProps = {
  min?: number;
  max?: number;
  historyLimit?: number; // 履歴の最大件数（UI表示のため）
};

export default function LotteryButton({
  min = 1,
  max = 100,
  historyLimit,
}: LotteryButtonProps) {
  const [result, setResult] = useState<number | null>(null);
  const [history, setHistory] = useState<DrawRecord[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    setError(null);
    // 履歴を踏まえて未抽選の候補を作る
    const candidates = buildCandidates(min, max, history);
    try {
      const drawn = drawFromCandidates(candidates);
      setResult(drawn);
      const record: DrawRecord = { value: drawn, timestamp: Date.now() };
      setHistory((prev) => appendRecord(prev, record, historyLimit));
    } catch (e) {
      // 候補が尽きた場合
      setError('抽選可能な番号はありません（上限に達しました）');
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    setResult(null);
    setError(null);
  };

  return (
    <div style={{ display: 'grid', gap: '12px', maxWidth: 520 }}>
      <button
        type="button"
        onClick={handleClick}
        aria-label="抽選ボタン"
        disabled={buildCandidates(min, max, history).length === 0}
        style={{
          padding: '10px 16px',
          fontSize: '16px',
          cursor: buildCandidates(min, max, history).length === 0 ? 'not-allowed' : 'pointer',
          borderRadius: 8,
          border: '1px solid #ccc',
          background: buildCandidates(min, max, history).length === 0 ? '#999' : '#1f6feb',
          color: '#fff',
        }}
      >
        抽選する
      </button>

      <div
        aria-live="polite"
        style={{
          minHeight: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px dashed #ddd',
          borderRadius: 8,
          fontSize: '24px',
          fontWeight: 700,
          color: result === null ? '#666' : '#111',
          background: '#fafafa',
        }}
      >
        {result === null ? '結果はまだありません' : result}
      </div>

      {error && (
        <div
          role="alert"
          style={{
            padding: '8px 10px',
            borderRadius: 6,
            background: '#fff3cd',
            color: '#664d03',
            border: '1px solid #ffe69c',
          }}
        >
          {error}
        </div>
      )}

      <section aria-label="抽選履歴">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h2 style={{ fontSize: 16, margin: 0 }}>履歴</h2>
          <button
            type="button"
            onClick={handleClearHistory}
            aria-label="履歴をクリア"
            style={{
              padding: '6px 10px',
              fontSize: 12,
              cursor: 'pointer',
              borderRadius: 6,
              border: '1px solid #ccc',
              background: '#eee',
              color: '#333',
            }}
          >
            クリア
          </button>
        </div>
        {history.length === 0 ? (
          <p style={{ color: '#666', marginTop: 8 }}>履歴はありません</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, marginTop: 8 }}>
            {history.map((rec, idx) => (
              <li
                key={rec.timestamp + '-' + idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '6px 8px',
                  borderBottom: '1px solid #eee',
                }}
              >
                <span>番号: {rec.value}</span>
                <time
                  dateTime={new Date(rec.timestamp).toISOString()}
                  style={{ color: '#666', fontSize: 12 }}
                >
                  {new Date(rec.timestamp).toLocaleString()}
                </time>
              </li>
            ))}
          </ul>
        )}
        <p style={{ color: '#666', fontSize: 12, marginTop: 6 }}>
          残り抽選可能数: {buildCandidates(min, max, history).length}
        </p>
      </section>
    </div>
  );
}
