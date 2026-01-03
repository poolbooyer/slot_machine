import { generateId } from '../lib/id';

// 賞モデルから drawnNumbers を削除（グローバルで管理するため）
export type Prize = {
  id: string;
  name: string;
  capacity: number; // 当選可能人数
};

import { useState } from 'react';

type PrizeSettingsProps = {
  prizes: Prize[];
  onChange: (next: Prize[]) => void;
};

export default function PrizeSettings({ prizes, onChange }: PrizeSettingsProps) {
  const [draftName, setDraftName] = useState('');
  const [draftCapacity, setDraftCapacity] = useState<number>(1);

  const addPrize = () => {
    const name = draftName.trim();
    const capacity = Math.max(0, Math.floor(draftCapacity));
    if (!name) return;
    const newPrize: Prize = {
      id: generateId(),
      name,
      capacity,
    };
    onChange([newPrize, ...prizes]);
    setDraftName('');
    setDraftCapacity(1);
  };

  const updatePrize = (id: string, patch: Partial<Prize>) => {
    const next = prizes.map(p => (p.id === id ? { ...p, ...patch } : p));
    onChange(next);
  };

  const removePrize = (id: string) => {
    onChange(prizes.filter(p => p.id !== id));
  };

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <h2 style={{ margin: 0, fontSize: 18 }}>賞の設定</h2>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="賞の名前"
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #ccc' }}
        />
        <input
          type="number"
          min={0}
          step={1}
          placeholder="賞の人数"
          value={draftCapacity}
          onChange={(e) => setDraftCapacity(Number(e.target.value))}
          style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #ccc', width: 120 }}
        />
        <button
          type="button"
          onClick={addPrize}
          aria-label="追加"
          style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #ccc', background: '#eee' }}
        >
          追加
        </button>
      </div>

      {prizes.length === 0 ? (
        <p style={{ color: '#666' }}>賞はまだありません</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {prizes.map((p) => (
            <li
              key={p.id}
              style={{
                display: 'grid',
                gap: 8,
                gridTemplateColumns: '1fr auto auto',
                alignItems: 'center',
                padding: '6px 8px',
                borderBottom: '1px solid #eee',
              }}
            >
              <input
                type="text"
                value={p.name}
                onChange={(e) => updatePrize(p.id, { name: e.target.value })}
                aria-label={`賞名: ${p.name}`}
                style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #ccc' }}
              />
              <input
                type="number"
                min={0}
                step={1}
                value={p.capacity}
                onChange={(e) => updatePrize(p.id, { capacity: Math.max(0, Math.floor(Number(e.target.value))) })}
                aria-label={`賞人数: ${p.name}`}
                style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #ccc', width: 120 }}
              />
              <button
                type="button"
                onClick={() => removePrize(p.id)}
                aria-label={`削除: ${p.name}`}
                style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #ccc', background: '#fdd' }}
              >
                削除
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
