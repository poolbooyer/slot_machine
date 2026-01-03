import { useState } from 'react';
import { drawRandomInt } from '../lib/draw';

type LotteryButtonProps = {
  min?: number;
  max?: number;
};

export default function LotteryButton({ min = 1, max = 100 }: LotteryButtonProps) {
  const [result, setResult] = useState<number | null>(null);

  const handleClick = () => {
    // 将来的に上限や人数などの設定画面とつなぐので、min/maxはpropsで受け取る
    const drawn = drawRandomInt(min, max);
    setResult(drawn);
  };

  return (
    <div style={{ display: 'grid', gap: '12px', maxWidth: 320 }}>
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
    </div>
  );
}
