import { describe, expect, it } from 'vitest';
import {
  formatPhone,
  formatPrice,
  formatPricePerKg,
  formatWeight,
  pluralize,
} from './format.ts';

describe('formatPrice', () => {
  it('formats kopecks as rubles with two decimals', () => {
    expect(formatPrice(150)).toBe('1,50 руб.');
    expect(formatPrice(5)).toBe('0,05 руб.');
    expect(formatPrice(0)).toBe('0,00 руб.');
  });

  it('groups thousands with a non-breaking space', () => {
    expect(formatPrice(123_450)).toBe('1 234,50 руб.');
  });
});

describe('formatPricePerKg', () => {
  it('adds the per-kilogram unit', () => {
    expect(formatPricePerKg(690)).toBe('6,90 руб./кг');
  });
});

describe('formatWeight', () => {
  it('shows grams as kilograms without trailing zeros', () => {
    expect(formatWeight(500)).toBe('0,5 кг');
    expect(formatWeight(1000)).toBe('1 кг');
    expect(formatWeight(1250)).toBe('1,25 кг');
  });
});

describe('pluralize', () => {
  const forms = { one: 'товар', few: 'товара', many: 'товаров' };

  it.each([
    [1, '1 товар'],
    [2, '2 товара'],
    [5, '5 товаров'],
    [11, '11 товаров'],
    [21, '21 товар'],
    [24, '24 товара'],
    [0, '0 товаров'],
  ])('%i → %s', (count, expected) => {
    expect(pluralize(count, forms)).toBe(expected);
  });
});

describe('formatPhone', () => {
  it('formats a Belarusian number', () => {
    expect(formatPhone('+375290000001')).toBe('+375 (29) 000-00-01');
  });

  it('returns unknown formats unchanged', () => {
    expect(formatPhone('+48123456789')).toBe('+48123456789');
  });
});
