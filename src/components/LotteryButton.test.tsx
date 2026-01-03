import { render, screen, fireEvent } from '@testing-library/react';
import LotteryButton from './LotteryButton';

describe('LotteryButton', () => {
  test('initially shows empty result message', () => {
    render(<LotteryButton min={1} max={10} />);
    expect(screen.getByText('結果はまだありません')).toBeInTheDocument();
  });

  test('shows a number in range after clicking button', () => {
    // Math.random をモックして再現性のあるテストにする
    const originalRandom = Math.random;
    Math.random = () => 0.5; // rangeの中間相当

    render(<LotteryButton min={1} max={10} />);
    const button = screen.getByRole('button', { name: '抽選ボタン' });
    fireEvent.click(button);

    // 0.5 * (10 - 1 + 1) = 0.5 * 10 = 5 → floor=5 → min+5=6（1〜10の中央付近）
    expect(screen.getByText('6')).toBeInTheDocument();

    Math.random = originalRandom;
  });

  test('multiple clicks update the result each time', () => {
    const originalRandom = Math.random;
    const seq = [0.0, 0.99]; // 1 と 10 を引く
    let i = 0;
    Math.random = () => seq[i++];

    render(<LotteryButton min={1} max={10} />);
    const button = screen.getByRole('button', { name: '抽選ボタン' });

    fireEvent.click(button);
    expect(screen.getByText('1')).toBeInTheDocument();

    fireEvent.click(button);
    expect(screen.getByText('10')).toBeInTheDocument();

    Math.random = originalRandom;
  });
});
