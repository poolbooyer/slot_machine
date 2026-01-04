import LotteryWithPrizes from './components/LotteryWithPrizes';

export default function App() {
  return (
    <main style={{ padding: 24 }}>
      <h1>抽選ツール</h1>
      <p>賞ごとの抽選を行うことができます！</p>
      <LotteryWithPrizes min={1} max={20} historyLimit={20} />
    </main>
  );
}
