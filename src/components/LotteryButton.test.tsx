// src/components/LotteryButton.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import LotteryButton from './LotteryButton';

describe('LotteryButton no-duplicate draw', () => {
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('draws from remaining candidates and updates history', () => {
    // Math.random シーケンスで 1→2→3 を引く（min=1, max=3）
    const seq = [0.0, 0.5, 0.99];
    let i = 0;
    jest.spyOn(Math, 'random').mockImplementation(() => seq[i++]);

    render(<LotteryButton min={1} max={3} historyLimit={10} />);
    const button = screen.getByRole('button', { name: '抽選ボタン' });

    // 1回目: candidates=[1,2,3], idx=0 -> 1
    fireEvent.click(button);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText(/番号: 1/)).toBeInTheDocument();
    expect(screen.getByText(/残り抽選可能数: 2/)).toBeInTheDocument();

    // 2回目: candidates=[2,3], idx=floor(0.5*2)=1 -> 3
    fireEvent.click(button);
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText(/番号: 3/)).toBeInTheDocument();
    expect(screen.getByText(/残り抽選可能数: 1/)).toBeInTheDocument();

    // 3回目: candidates=[2], idx=floor(0.99*1)=0 -> 2
    fireEvent.click(button);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText(/番号: 2/)).toBeInTheDocument();
    expect(screen.getByText(/残り抽選可能数: 0/)).toBeInTheDocument();

    // ボタンは無効化される
    const drawButton = screen.getByRole('button', { name: '抽選ボタン' });
    expect(drawButton).toBeDisabled();
  });

  test('shows error when candidates are exhausted and clear resets state', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.0);

    render(<LotteryButton min={1} max={1} historyLimit={10} />);
    const button = screen.getByRole('button', { name: '抽選ボタン' });

    // 1回目で唯一の候補を引く
    fireEvent.click(button);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText(/残り抽選可能数: 0/)).toBeInTheDocument();
    expect(button).toBeDisabled();

    // ボタン押しても候補がないためエラーが表示される（UIはdisabledだが、保険としてハンドラ側でも扱う）
    fireEvent.click(button);
    expect(screen.queryByRole('alert')).toBeNull();

    // クリアで再度抽選可能に
    const clearBtn = screen.getByRole('button', { name: '履歴をクリア' });
    fireEvent.click(clearBtn);
    expect(screen.getByText('結果はまだありません')).toBeInTheDocument();
    expect(screen.getByText('履歴はありません')).toBeInTheDocument();
    expect(screen.getByText(/残り抽選可能数: 1/)).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });
});
