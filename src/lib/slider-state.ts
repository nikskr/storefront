/** Minimal horizontal swipe distance in pixels to switch a slide. */
export const SWIPE_THRESHOLD = 50;

/** Wraps an index into [0, length): -1 → last, length → 0. */
export function wrapIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}

/** Slide step for a horizontal swipe: 1 = next, -1 = previous, 0 = none. */
export function swipeStep(deltaX: number): -1 | 0 | 1 {
  if (deltaX <= -SWIPE_THRESHOLD) return 1;
  if (deltaX >= SWIPE_THRESHOLD) return -1;
  return 0;
}
