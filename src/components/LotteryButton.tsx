import { useState } from 'react';
import { drawRandomInt, appendRecord, type DrawRecord } from '../lib/draw';

type LotteryButtonProps = {
  min?: number;
  max?: number;
  historyLimit?: number;
};

export default function LotteryButton({ min = 1, max = 100, historyLimit, }: LotteryButtonProps) {
  const [result, setResult] = useState<number | null>(null);
  const [history, setHistory] = useState<DrawRecord[]>([]);

  const handleClick = () => {
    const drawn = drawRandomInt(min, max);
    setResult(drawn);
    const record: DrawRecord = { value: drawn, timestamp: Date.now() };
    setHistory((prev) => appendRecord(prev, record, historyLimit));
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  return (
    <div style={{ display: 'grid', gap: '12px', maxWidth: 480 }}>
      <button
        type="button"
        onClick={handleClick}
        aria-label="抽選ボタン"
        style={{
          padding: '10px 16px',
          fontSize: '16px',
          cursor: 'pointer',
          borderRadius: 8,
          border: '1px solid #ccc',
          background: '#1f6feb',
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
      </section>
    </div>
  );
}
