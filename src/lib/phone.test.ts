import { describe, expect, it } from 'vitest';
import { normalizePhone } from './phone.ts';

describe('normalizePhone', () => {
  it.each([
    ['+375291234567', '+375291234567'],
    ['+375 (29) 123-45-67', '+375291234567'],
    ['375 29 1234567', '+375291234567'],
    ['8 029 123 45 67', '+375291234567'],
    ['80291234567', '+375291234567'],
    ['(29) 123-45-67', '+375291234567'],
    ['  +375 44 765 43 21 ', '+375447654321'],
    ['+375 25 000 00 00', '+375250000000'],
    ['+375 33 000 00 00', '+375330000000'],
  ])('accepts %s', (input, expected) => {
    expect(normalizePhone(input)).toBe(expected);
  });

  it.each([
    ['empty', ''],
    ['letters', '+375 29 abc 45 67'],
    ['too short', '+375 29 123 45 6'],
    ['too long', '+375 29 123 45 678'],
    ['landline code', '+375 17 123 45 67'],
    ['another country', '+48 123 456 789'],
    ['plus in the middle', '375+291234567'],
    ['8 without 0', '8 29 123 45 67'],
  ])('rejects %s', (_label, input) => {
    expect(normalizePhone(input)).toBeNull();
  });
});
