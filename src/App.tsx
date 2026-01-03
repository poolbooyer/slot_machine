import LotteryButton from './components/LotteryButton';

export default function App() {
  return (
    <main style={{ padding: 24 }}>
      <h1>抽選ツール</h1>
      <p>ボタンを押すと 1〜100 の範囲でランダムな数字が表示されます。</p>
      <LotteryButton min={1} max={100} />
    </main>
  );
}
