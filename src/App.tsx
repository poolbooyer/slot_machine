import LotteryButton from './components/LotteryButton';

export default function App() {
  return (
    <main style={{ padding: 24 }}>
      <h1>抽選ツール</h1>
      <p>ボタンを押すと 1〜20 の範囲でランダムな数字が表示され、履歴に保存されます。</p>
      <LotteryButton min={1} max={20} historyLimit={20} />
    </main>
  );
}
