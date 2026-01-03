import { drawRandomInt } from './draw';

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
