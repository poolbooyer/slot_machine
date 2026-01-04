import { useMemo, useState } from 'react';
import { appendRecord, buildCandidates, drawFromCandidates, type DrawRecord } from '../lib/draw';
import PrizeSettings, { type Prize } from './PrizeSettings';

type LotteryWithPrizesProps = {
  min?: number;
  max?: number;
  historyLimit?: number;
};

export default function LotteryWithPrizes({
  min = 1,
  max = 100,
  historyLimit = 50,
}: LotteryWithPrizesProps) {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [selectedPrizeId, setSelectedPrizeId] = useState<string | null>(null);

  const [result, setResult] = useState<number | null>(null);
  const [history, setHistory] = useState<DrawRecord[]>([]);
  const [_, setUsedNumbers] = useState<number[]>([]); // 全賞共通の使用済み番号
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [globalLimit, setGlobalLimit] = useState<number | null>(null);

  const selectedPrize = useMemo(
    () => prizes.find(p => p.id === selectedPrizeId) ?? null,
    [prizes, selectedPrizeId]
  );

  // 賞の capacity 消化数は「履歴のうち該当賞の件数」
  const consumedForSelectedPrize = useMemo(() => {
    if (!selectedPrize) return 0;
    return history.filter(h => h.prizeName === selectedPrize.name).length;
  }, [history, selectedPrize]);

  const remainingForSelectedPrize = useMemo(() => {
    if (!selectedPrize) return 0;
    const capacityLeft = Math.max(0, selectedPrize.capacity - consumedForSelectedPrize);
    return capacityLeft;
  }, [selectedPrize, consumedForSelectedPrize]);

  // 候補はグローバル使用済みを除外した min〜max
  const candidates = useMemo(
  () => buildCandidates(min, max, history, globalLimit),
  [min, max, history, globalLimit]
);

  // グローバル上限の判定
  const globalRemaining = useMemo(() => {
    if (globalLimit === null) return Infinity;
    return Math.max(0, globalLimit - history.length);
  }, [globalLimit, history.length]);

  const canDraw = !!selectedPrize && remainingForSelectedPrize > 0 && candidates.length > 0;

  const handleClick = () => {
    setError(null);
    if (!selectedPrize) {
      setError('賞が選択されていません');
      return;
    }
    if (globalRemaining <= 0) {
      setError('全体の抽選上限に達しました');
      return;
    }
    if (!canDraw) {
      if (candidates.length === 0) {
        setError('抽選可能な番号はありません（全賞で上限に達しました）');
      } else {
        setError('この賞では抽選できません（定員に達しました）');
      }
      return;
    }

    const drawn = drawFromCandidates(candidates);
    setResult(drawn);

    // グローバル使用済みに追加
    setUsedNumbers(prev => [...prev, drawn]);

    // 履歴に賞名付きで追加
    const record: DrawRecord = { value: drawn, timestamp: Date.now(), prizeName: selectedPrize.name };
    setHistory(prev => appendRecord(prev, record, historyLimit));
  };

  const handleClearHistory = () => {
    setHistory([]);
    setResult(null);
    setError(null);
    setUsedNumbers([]);
  };

  return (
    <div style={{ display: 'grid', gap: 16, maxWidth: 720 }}>
      <header style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: 20 }}>抽選（全賞重複なし）</h1>
        <button
          type="button"
          onClick={() => setShowSettings(s => !s)}
          aria-label="設定の表示切替"
          style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #ccc', background: '#eee' }}
        >
          {showSettings ? '設定を隠す' : '設定を表示'}
        </button>
      </header>

      {showSettings && (
        <PrizeSettings
          prizes={prizes}
          onChange={(next) => {
            setPrizes(next);
            if (selectedPrizeId && !next.some((p) => p.id === selectedPrizeId)) {
              setSelectedPrizeId(null);
            }
          }}
          globalLimit={globalLimit}
          onChangeGlobalLimit={setGlobalLimit}
        />
      )}

      <section aria-label="賞の選択" style={{ display: 'grid', gap: 8 }}>
        <h2 style={{ margin: 0, fontSize: 16 }}>対象の賞</h2>
        {prizes.length === 0 ? (
          <p style={{ color: '#666' }}>賞がありません。設定を開いて追加してください。</p>
        ) : (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {prizes.map((p) => {
              const consumed = history.filter(h => h.prizeName === p.name).length;
              const remaining = Math.max(0, p.capacity - consumed);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPrizeId(p.id)}
                  aria-label={`選択: ${p.name}`}
                  aria-pressed={selectedPrizeId === p.id}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: selectedPrizeId === p.id ? '2px solid #1f6feb' : '1px solid #ccc',
                    background: selectedPrizeId === p.id ? '#e7f1ff' : '#fff',
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    定員: {p.capacity} / 当選: {consumed} / 残り: {remaining}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <div style={{ display: 'grid', gap: 12 }}>
        <button
          type="button"
          onClick={handleClick}
          aria-label="抽選ボタン"
          disabled={!canDraw}
          style={{
            padding: '10px 16px',
            fontSize: '16px',
            cursor: !canDraw ? 'not-allowed' : 'pointer',
            borderRadius: 8,
            border: '1px solid #ccc',
            background: !canDraw ? '#999' : '#1f6feb',
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
            履歴をクリア
          </button>
        </div>
        <div style={{ color: '#666', fontSize: 12 }}>
          全体の上限: {globalLimit === null ? '無制限' : globalLimit} / 現在の当選総数: {history.length} / 残り:{' '}
          {globalRemaining === Infinity ? '∞' : globalRemaining}
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
                <span>
                  番号: {rec.value}
                  {rec.prizeName ? `（賞: ${rec.prizeName}）` : ''}
                </span>
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
