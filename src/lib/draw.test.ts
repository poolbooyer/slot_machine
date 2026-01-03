import {
  drawRandomInt,
  appendRecord,
  buildCandidates,
  drawFromCandidates,
  type DrawRecord,
} from './draw';

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
    for (let i = 0; i < 200; i++) {
      const n = drawRandomInt(min, max);
      expect(n).toBeGreaterThanOrEqual(min);
      expect(n).toBeLessThanOrEqual(max);
    }
  });
});

describe('buildCandidates (global used numbers)', () => {
  test('returns full range when history is empty', () => {
    expect(buildCandidates(1, 3, [])).toEqual([1, 2, 3]);
  });

  test('excludes history values', () => {
    const history: DrawRecord[] = [
      { value: 2, timestamp: 1 },
      { value: 3, timestamp: 2 },
    ];
    expect(buildCandidates(1, 3, history)).toEqual([1]);
  });

  test('validates range', () => {
    expect(() => buildCandidates(3, 1, [])).toThrow();
    expect(() => buildCandidates(1.1, 3, [])).toThrow();
  });
});

describe('drawFromCandidates', () => {
  test('selects from candidates at deterministic index', () => {
    const originalRandom = Math.random;
    Math.random = () => 0.4; // idx = floor(0.4 * 3) = 1
    const n = drawFromCandidates([10, 11, 12]);
    expect(n).toBe(11);
    Math.random = originalRandom;
  });

  test('throws when no candidates', () => {
    expect(() => drawFromCandidates([])).toThrow('No candidates left');
  });
});

describe('appendRecord (with prizeName)', () => {
  test('prepends and limits size', () => {
    const history: DrawRecord[] = [{ value: 1, timestamp: 1, prizeName: 'A' }];
    const rec: DrawRecord = { value: 2, timestamp: 2, prizeName: 'B' };
    const next = appendRecord(history, rec, 1);
    expect(next).toEqual([rec]);
  });

  test('keeps prizeName in records', () => {
    const history: DrawRecord[] = [];
    const rec: DrawRecord = { value: 7, timestamp: 123, prizeName: '金賞' };
    const next = appendRecord(history, rec);
    expect(next[0].prizeName).toBe('金賞');
  });
});
