import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LotteryWithPrizes from './LotteryWithPrizes';

describe('Global limit restricts candidate numbers to not exceed the limit', () => {
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('numbers greater than globalLimit are never drawn', async () => {
    const user = userEvent.setup();
    // Math.randomを0.99に固定して、範囲の最大付近を選ぶ挙動にする
    jest.spyOn(Math, 'random').mockReturnValue(0.99);

    render(<LotteryWithPrizes min={1} max={100} historyLimit={100} />);

    await user.click(screen.getByRole('button', { name: '設定の表示切替' }));

    const nameInput = screen.getByPlaceholderText('賞の名前') as HTMLInputElement;
    const capInput = screen.getByPlaceholderText('賞の人数') as HTMLInputElement;
    await user.type(nameInput, '金賞');
    await user.clear(capInput);
    await user.type(capInput, '5');
    await user.click(screen.getByRole('button', { name: '追加' }));

    const selectGold = await screen.findByRole('button', { name: '選択: 金賞' });

    // グローバル上限=50を設定
    const globalInput = screen.getByLabelText('抽選の全体上限人数') as HTMLInputElement;
    await user.clear(globalInput);
    await user.type(globalInput, '50');
    await user.click(screen.getByRole('button', { name: '抽選の全体上限を適用' }));
    expect(screen.getByText(/現在の上限: 50/)).toBeInTheDocument();

    await user.click(selectGold);
    const drawButton = screen.getByRole('button', { name: '抽選ボタン' });

    // 0.99で引いても、候補は1〜50なので50が当たる
    await user.click(drawButton);
    expect(screen.getByText('50')).toBeInTheDocument();

    // 上限より大きい番号（例: 51以上）は一切出ないことを複数回で確認
    await user.click(drawButton);
    await user.click(drawButton);
    const drawnTexts = screen.getAllByRole('listitem').map((li) => li.textContent ?? '');
    drawnTexts.forEach((t) => {
      const matched = t.match(/番号:\s*(\d+)/);
      if (matched) {
        expect(Number(matched[1])).toBeLessThanOrEqual(50);
      }
    });
  });

  test('globalLimit smaller than min yields no candidates and disables draw', async () => {
    const user = userEvent.setup();
    jest.spyOn(Math, 'random').mockReturnValue(0.0);

    render(<LotteryWithPrizes min={10} max={20} historyLimit={100} />);

    await user.click(screen.getByRole('button', { name: '設定の表示切替' }));
    const nameInput = screen.getByPlaceholderText('賞の名前') as HTMLInputElement;
    const capInput = screen.getByPlaceholderText('賞の人数') as HTMLInputElement;
    await user.type(nameInput, '銀賞');
    await user.clear(capInput);
    await user.type(capInput, '5');
    await user.click(screen.getByRole('button', { name: '追加' }));

    const selectSilver = await screen.findByRole('button', { name: '選択: 銀賞' });
    await user.click(selectSilver);

    // globalLimit=5（min=10より小さい）を適用
    const globalInput = screen.getByLabelText('抽選の全体上限人数') as HTMLInputElement;
    await user.clear(globalInput);
    await user.type(globalInput, '1');
    await user.click(screen.getByRole('button', { name: '抽選の全体上限を適用' }));

    const drawButton = screen.getByRole('button', { name: '抽選ボタン' });
    expect(drawButton).toBeDisabled();
  });
});
