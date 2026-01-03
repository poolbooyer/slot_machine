import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LotteryWithPrizes from './LotteryWithPrizes';


describe('Lottery with global non-duplicate numbers across prizes', () => {
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('can add prize, select it, draw and history shows prize name', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.0); // 最小を引く

    render(<LotteryWithPrizes min={1} max={10} historyLimit={10} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: '設定の表示切替' }));

    const nameInput = screen.getByPlaceholderText('賞の名前') as HTMLInputElement;
    const capacityInput = screen.getByPlaceholderText('賞の人数') as HTMLInputElement;
    await user.clear(nameInput);
    await user.type(nameInput, '金賞');
    await user.clear(capacityInput);
    await user.type(capacityInput, '2');

    await user.click(screen.getByRole('button', { name: '追加' }));

    const selectGold = await screen.findByRole('button', { name: '選択: 金賞' });
    await user.click(selectGold);

    const drawButton = screen.getByRole('button', { name: '抽選ボタン' });
    await user.click(drawButton);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText(/賞: 金賞/)).toBeInTheDocument();
  });

  test('numbers do not repeat across prizes; capacity is enforced per prize', async () => {
    // 1 → 2 → 3 の順に引く
    const seq = [0.0, 0.5, 0.99];
    let i = 0;
    jest.spyOn(Math, 'random').mockImplementation(() => seq[i++] ?? 0.0);

    render(<LotteryWithPrizes min={1} max={3} historyLimit={20} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: '設定の表示切替' }));

    const nameInput = screen.getByPlaceholderText('賞の名前') as HTMLInputElement;
    const capacityInput = screen.getByPlaceholderText('賞の人数') as HTMLInputElement;

    // 金賞(cap=1)
    await user.clear(nameInput);
    await user.type(nameInput, '金賞');
    await user.clear(capacityInput);
    await user.type(capacityInput, '1');
    await user.click(screen.getByRole('button', { name: '追加' }));
    const selectGold = await screen.findByRole('button', { name: '選択: 金賞' });

    // 銀賞(cap=2)
    await user.clear(nameInput);
    await user.type(nameInput, '銀賞');
    await user.clear(capacityInput);
    await user.type(capacityInput, '2');
    await user.click(screen.getByRole('button', { name: '追加' }));
    const selectSilver = await screen.findByRole('button', { name: '選択: 銀賞' });

    const drawButton = screen.getByRole('button', { name: '抽選ボタン' });
    // 金賞で1回（1）
    await user.click(selectGold);
    expect(selectGold).toBeEnabled();
    await user.click(drawButton);
    expect(screen.getByText(/賞: 金賞/)).toBeInTheDocument();
    expect(screen.getByText(/当選: 1/)).toBeInTheDocument();

    // 銀賞で2回（2, 3）→ 1 は出ない
    await user.click(selectSilver);
    await user.click(drawButton);
    expect(screen.getByText(/賞: 銀賞/)).toBeInTheDocument();
    expect(screen.getByText(/残り: 1/)).toBeInTheDocument();

    await user.click(drawButton);
    expect(screen.getByText(/残り抽選可能数（全賞共通）: 0/)).toBeInTheDocument();

    // 候補尽き → disabled
    expect(drawButton).toBeDisabled();

    // 履歴に賞名が3件
    const historyPrizeLabels = screen.getAllByText(/（賞: (金賞|銀賞)）/);
    expect(historyPrizeLabels).toHaveLength(3);
  });

  test('clearing used numbers allows drawing again globally', async () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.0);

    render(<LotteryWithPrizes min={1} max={1} historyLimit={10} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: '設定の表示切替' }));
    const nameInput = screen.getByPlaceholderText('賞の名前') as HTMLInputElement;
    const capacityInput = screen.getByPlaceholderText('賞の人数') as HTMLInputElement;
    await user.type(nameInput, '銅賞');
    await user.clear(capacityInput);
    await user.type(capacityInput, '2');
    await user.click(screen.getByRole('button', { name: '追加' }));

    const selectBronze = await screen.findByRole('button', { name: '選択: 銅賞' });
    await user.click(selectBronze);

    const drawButton = screen.getByRole('button', { name: '抽選ボタン' });
    await user.click(drawButton);
    expect(drawButton).toBeDisabled(); // 候補が尽きる（min=max=1）

    // 使用済み番号のみクリアして再び引ける
    const clearAllHistory = screen.getByRole('button', { name: '履歴をクリア' });
    await user.click(clearAllHistory);
    expect(drawButton).not.toBeDisabled();
  });

  test('prize capacity is separate from global candidates', async () => {
    // グローバル候補は十分あるが、賞のcapacityでdraw不可
    const seq = [0.0, 0.5, 0.99];
    let i = 0;
    jest.spyOn(Math, 'random').mockImplementation(() => seq[i++] ?? 0.0);

    render(<LotteryWithPrizes min={1} max={10} historyLimit={10} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: '設定の表示切替' }));

    // 賞A capacity=1
    const nameInput = screen.getByPlaceholderText('賞の名前') as HTMLInputElement;
    const capacityInput = screen.getByPlaceholderText('賞の人数') as HTMLInputElement;
    await user.clear(nameInput);
    await user.type(nameInput, '賞A');
    await user.clear(capacityInput);
    await user.type(capacityInput, '1');
    await user.click(screen.getByRole('button', { name: '追加' }));
    const selectA = await screen.findByRole('button', { name: '選択: 賞A' });

    // 賞B capacity=1
    await user.clear(nameInput);
    await user.type(nameInput, '賞B');
    await user.clear(capacityInput);
    await user.type(capacityInput, '1');
    // generateId をモックして安定化（PrizeSettingsで使用）
    jest.mock('../lib/id', () => ({
        generateId: () => 'test-id-2'
    }));
    await user.click(screen.getByRole('button', { name: '追加' }));
    const selectB = await screen.findByRole('button', { name: '選択: 賞B' });

    // 賞Aで1回抽選 → capacity到達でAでは引けない
    await user.click(selectA);
    const drawButton = screen.getByRole('button', { name: '抽選ボタン' });
    await user.click(drawButton);
    expect(drawButton).toBeDisabled();

    // 賞Bに切り替える → グローバル候補が残っているので引ける
    await user.click(selectB);
    expect(drawButton).not.toBeDisabled();
    await user.click(drawButton);
    expect(drawButton).toBeDisabled();
  });
});
