import { describe, expect, it } from 'vitest';
import { SWIPE_THRESHOLD, swipeStep, wrapIndex } from './slider-state.ts';

describe('wrapIndex', () => {
  it('keeps indexes inside the range', () => {
    expect(wrapIndex(1, 3)).toBe(1);
  });

  it('wraps past the ends', () => {
    expect(wrapIndex(3, 3)).toBe(0);
    expect(wrapIndex(-1, 3)).toBe(2);
    expect(wrapIndex(-4, 3)).toBe(2);
  });

  it('returns 0 for an empty list', () => {
    expect(wrapIndex(5, 0)).toBe(0);
  });
});

describe('swipeStep', () => {
  it('swipe left goes to the next slide', () => {
    expect(swipeStep(-SWIPE_THRESHOLD)).toBe(1);
  });

  it('swipe right goes to the previous slide', () => {
    expect(swipeStep(SWIPE_THRESHOLD + 10)).toBe(-1);
  });

  it('ignores short movements', () => {
    expect(swipeStep(SWIPE_THRESHOLD - 1)).toBe(0);
    expect(swipeStep(-(SWIPE_THRESHOLD - 1))).toBe(0);
  });
});
