// src/components/LotteryButton.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import LotteryButton from './LotteryButton';

describe('LotteryButton with history', () => {
  beforeEach(() => {
    // 固定された乱数でテストの再現性を確保
    jest.spyOn(global.Math, 'random').mockReturnValue(0.5);
    jest.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000); // 固定時刻
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('initially shows empty history and empty result', () => {
    render(<LotteryButton min={1} max={10} historyLimit={5} />);
    expect(screen.getByText('結果はまだありません')).toBeInTheDocument();
    expect(screen.getByText('履歴はありません')).toBeInTheDocument();
  });

  test('clicking button shows result and adds to history', () => {
    render(<LotteryButton min={1} max={10} historyLimit={5} />);
    const button = screen.getByRole('button', { name: '抽選ボタン' });

    fireEvent.click(button);

    // 0.5 * (10 - 1 + 1) = 5 -> min + 5 = 6
    expect(screen.getByText('6')).toBeInTheDocument();

    // 履歴に追加された番号が表示される
    expect(screen.getByText(/番号: 6/)).toBeInTheDocument();
  });

  test('history respects limit and can be cleared', () => {
    const seq = [0.0, 0.99, 0.5]; // 1, 10, 6 を引く
    let i = 0;
    jest.spyOn(global.Math, 'random').mockImplementation(() => seq[i++]);
    jest.spyOn(Date, 'now').mockImplementation(() => 1_700_000_000_000 + i);

    render(<LotteryButton min={1} max={10} historyLimit={2} />);
    const button = screen.getByRole('button', { name: '抽選ボタン' });

    fireEvent.click(button); // 1
    fireEvent.click(button); // 10
    fireEvent.click(button); // 6 （limit=2なので最新2件のみ保持）

    const rows = screen.getAllByText(/番号:/);
    expect(rows).toHaveLength(2);
    expect(screen.getByText(/番号: 6/)).toBeInTheDocument();
    expect(screen.getByText(/番号: 10/)).toBeInTheDocument();

    const clearBtn = screen.getByRole('button', { name: '履歴をクリア' });
    fireEvent.click(clearBtn);
    expect(screen.getByText('履歴はありません')).toBeInTheDocument();
  });
});
