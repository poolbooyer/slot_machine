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
  globalLimit: number | null;
  onChangeGlobalLimit: (limit: number | null) => void;
};

export default function PrizeSettings({
  prizes,
  onChange, 
  globalLimit, 
  onChangeGlobalLimit
}: PrizeSettingsProps) {
  const [draftName, setDraftName] = useState('');
  const [draftCapacity, setDraftCapacity] = useState<number>(1);

  const [draftGlobalLimit, setDraftGlobalLimit] = useState<string>(
    globalLimit === null ? '' : String(globalLimit)
  );

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

  const applyGlobalLimit = () => {
    const trimmed = draftGlobalLimit.trim();
    if (trimmed === '') {
      onChangeGlobalLimit(null);
      return;
    }
    const n = Math.floor(Number(trimmed));
    onChangeGlobalLimit(n >= 0 ? n : 0);
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <h2 style={{ margin: 0, fontSize: 18 }}>賞の設定</h2>

      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ display: 'grid', gap: 8 }}>
          <div style={{ fontWeight: 700 }}>新しい賞の追加</div>
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
        </div>
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
                onChange={(e) =>
                  updatePrize(p.id, { capacity: Math.max(0, Math.floor(Number(e.target.value))) })
                }
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
      <div style={{ display: 'grid', gap: 8 }}>
          <div style={{ fontWeight: 700 }}>抽選の上限人数（全体）</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="number"
              min={0}
              step={1}
              placeholder="全体の上限人数（空欄で無制限）"
              value={draftGlobalLimit}
              onChange={(e) => setDraftGlobalLimit(e.target.value)}
              aria-label="抽選の全体上限人数"
              style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #ccc', width: 220 }}
            />
            <button
              type="button"
              onClick={applyGlobalLimit}
              aria-label="抽選の全体上限を適用"
              style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #ccc', background: '#eee' }}
            >
              上限を適用
            </button>
            <div style={{ color: '#666', fontSize: 12 }}>
              現在の上限: {globalLimit === null ? '無制限' : globalLimit}
            </div>
          </div>
        </div>
    </div>
  );
}
