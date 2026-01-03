import { drawRandomInt, appendRecord, type DrawRecord } from './draw';

describe('drawRandomInt', () => {
  test('returns min when range is a single value', () => {
    expect(drawRandomInt(5, 5)).toBe(5);
  });

  test('throws on non-integer inputs', () => {
    expect(() => drawRandomInt(1.2, 3)).toThrow();
    expect(() => drawRandomInt(1, 2.5)).toThrow();
  });

  test('throws when max < min', () => {
    expect(() => drawRandomInt(10, 9)).toThrow();
  });

  test('result is within inclusive range', () => {
    const min = 1;
    const max = 3;
    for (let i = 0; i < 1000; i++) {
      const n = drawRandomInt(min, max);
      expect(n).toBeGreaterThanOrEqual(min);
      expect(n).toBeLessThanOrEqual(max);
    }
  });
});

describe('appendRecord', () => {
  test('prepends a record without limit', () => {
    const history: DrawRecord[] = [
      { value: 2, timestamp: 1000 },
      { value: 3, timestamp: 900 },
    ];
    const rec: DrawRecord = { value: 7, timestamp: 1100 };
    const next = appendRecord(history, rec);
    expect(next[0]).toEqual(rec);
    expect(next).toHaveLength(3);
  });

  test('respects history limit', () => {
    const history: DrawRecord[] = [
      { value: 2, timestamp: 1000 },
      { value: 3, timestamp: 900 },
    ];
    const rec: DrawRecord = { value: 7, timestamp: 1100 };
    const next = appendRecord(history, rec, 2);
    expect(next).toHaveLength(2);
    expect(next[0]).toEqual(rec);
    expect(next[1]).toEqual(history[0]);
  });
});
